#!/usr/bin/env node
import { execSync } from "node:child_process";
import fs from "node:fs";

const args = process.argv.slice(2);
const repoArg = args.find(a => a.startsWith("--repo="))?.split("=")[1];
const allowDirty = args.includes("--allow-dirty");

if (!repoArg) {
  console.error("Usage: node pipeline/p02-remediate.mjs --repo=<owner/repo> [--allow-dirty]");
  process.exit(1);
}

// ---- Helpers ----
function pollUntil(fn, maxMs = 30000, initialDelayMs = 1000) {
  const start = Date.now();
  let delay = initialDelayMs;
  let attempts = 0;
  while (Date.now() - start < maxMs) {
    attempts++;
    try {
      if (fn()) return { ok: true, attempts, elapsedMs: Date.now() - start };
    } catch (e) { /* transient error — keep polling */ }
    execSync(`sleep ${delay / 1000}`);
    delay = Math.min(delay * 2, 5000);
  }
  return { ok: false, attempts, elapsedMs: Date.now() - start };
}

function liveForkHead(fork, branch) {
  try {
    return execSync(`gh api "repos/${fork}/commits/${branch}" --jq .sha`, { encoding: "utf8" }).trim();
  } catch (e) { return null; }
}

function liveParentHead(parent, branch) {
  try {
    return execSync(`gh api "repos/${parent}/commits/${branch}" --jq .sha`, { encoding: "utf8" }).trim();
  } catch (e) { return null; }
}

// ---- 1. Verify repo in inventory ----
const inventory = JSON.parse(fs.readFileSync("registry/repositories/repository-inventory.json", "utf8"));
const target = inventory.find(r => r.full_name === repoArg);
if (!target) { console.error(`Error: ${repoArg} not found in repository-inventory.json`); process.exit(1); }
if (!target.fork) { console.error(`Error: ${repoArg} is not a fork. Nothing to sync.`); process.exit(1); }

// ---- 2. Clean worktree check ----
if (!allowDirty) {
  try {
    const status = execSync("git status --porcelain", { encoding: "utf8" }).trim();
    if (status) {
      console.error("Error: Worktree is dirty. Commit or stash changes, or pass --allow-dirty.");
      process.exit(1);
    }
  } catch (e) {
    console.error("Error checking git status:", e.message);
    process.exit(1);
  }
}

console.log(`=== Remediating: ${repoArg} ===`);

// ---- 3. Fetch current state ----
const enrichedFile = "registry/repositories/upstream-pins.enriched.json";
const enriched = JSON.parse(fs.readFileSync(enrichedFile, "utf8"));
const existing = enriched.find(e => e.full_name === repoArg);
const parent = existing?.enrichment?.parent_full_name;
const branch = target.default_branch;

if (!parent) {
  console.error(`Error: No parent info found for ${repoArg} in enriched data. Run p01-enrich-divergence.mjs first.`);
  process.exit(1);
}

const oldLocalSha = existing.head_sha;
const oldParentSha = existing.enrichment.parent_head_sha;
console.log(`Parent: ${parent}@${branch}`);
console.log(`Current Local HEAD: ${oldLocalSha}`);
console.log(`Current Parent HEAD: ${oldParentSha}`);

// ---- 4. merge-upstream API call ----
try {
  const res = execSync(`gh api --method POST "repos/${repoArg}/merge-upstream" -f branch="${branch}"`, { encoding: "utf8" });
  const parsed = JSON.parse(res);
  if (parsed.merge_type === "none") {
    console.log(`\n[SKIP] API response: ${parsed.message}`);
    console.log("No changes made to the repository.");
    process.exit(0);
  }
  console.log(`\n[OK] Merge type: ${parsed.merge_type}`);
} catch (e) {
  console.error(`\n[ERROR] merge-upstream API failed:`);
  console.error(e.stderr || e.message);
  process.exit(1);
}

// ---- 5. Poll fork HEAD == parent HEAD (L-RACE-001 fix) ----
console.log(`\nPolling fork HEAD vs parent HEAD (max 30s, exponential backoff)...`);
const poll = pollUntil(() => {
  const fh = liveForkHead(repoArg, branch);
  const ph = liveParentHead(parent, branch);
  return fh && ph && fh === ph;
}, 30000, 1000);

if (poll.ok) {
  console.log(`[OK] Fork HEAD propagated after ${poll.attempts} attempt(s), ${poll.elapsedMs}ms`);
} else {
  console.log(`[WARN] Fork HEAD did not propagate within 30s (${poll.attempts} attempts). Proceeding with enrichment — state may be stale. L-RACE-001.`);
}

// ---- 5b. Re-enrich ----
console.log(`\nRe-enriching all forks to capture new state...`);
execSync("node pipeline/p01-enrich-divergence.mjs", { stdio: "inherit" });

// ---- 6. Verify new state ----
const newEnriched = JSON.parse(fs.readFileSync(enrichedFile, "utf8"));
const newRecord = newEnriched.find(e => e.full_name === repoArg);
const newLocalSha = newRecord.head_sha;
const newParentSha = newRecord.enrichment.parent_head_sha;

console.log(`\n=== Remediation Summary: ${repoArg} ===`);
console.log(`Old Local HEAD: ${oldLocalSha}`);
console.log(`New Local HEAD: ${newLocalSha}`);
console.log(`New Parent HEAD: ${newParentSha}`);
console.log(`New Ahead/Behind: ${newRecord.enrichment.ahead_of_parent_by} / ${newRecord.enrichment.behind_parent_by}`);

const success = newLocalSha === newParentSha;
if (success) {
  console.log("Success: fork is now fully synced to parent.");
  if (oldLocalSha === newLocalSha) {
    console.log("NOTE: oldLocalSha matched newLocalSha — fork was already synced before this run.");
  }
} else {
  console.log(`WARNING: fork is not fully synced. newLocal=${newLocalSha} newParent=${newParentSha}`);
}

// ---- 7. Write remediation log ----
const log = {
  repo: repoArg,
  parent: parent,
  old_local_sha: oldLocalSha,
  old_parent_sha: oldParentSha,
  new_local_sha: newLocalSha,
  new_parent_sha: newParentSha,
  new_ahead: newRecord.enrichment.ahead_of_parent_by,
  new_behind: newRecord.enrichment.behind_parent_by,
  success: success,
  already_synced: oldLocalSha === newLocalSha && newLocalSha === newParentSha,
  poll_attempts: poll.attempts,
  poll_elapsed_ms: poll.elapsedMs,
  poll_ok: poll.ok,
  timestamp: new Date().toISOString()
};
fs.mkdirSync("reports/validation-results", { recursive: true });
fs.writeFileSync("reports/validation-results/remediation-latest.json", JSON.stringify(log, null, 2));
