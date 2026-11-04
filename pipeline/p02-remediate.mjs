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

// 1. Verify repo exists in the inventory
const inventory = JSON.parse(fs.readFileSync("registry/repositories/repository-inventory.json", "utf8"));
const target = inventory.find(r => r.full_name === repoArg);
if (!target) {
  console.error(`Error: ${repoArg} not found in repository-inventory.json`);
  process.exit(1);
}
if (!target.fork) {
  console.error(`Error: ${repoArg} is not a fork. Nothing to sync.`);
  process.exit(1);
}

// 2. Check for clean worktree
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

// 3. Fetch current state from enriched file
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

// 4. Attempt merge-upstream via GitHub API
try {
  const res = execSync(`gh api --method POST "repos/${repoArg}/merge-upstream" -f branch="${branch}"`, { encoding: "utf8" });
  const parsed = JSON.parse(res);

  if (parsed.merge_type === "none") {
    console.log(`\n[SKIP] API response: ${parsed.message}`);
    console.log("No changes made to the repository.");
    process.exit(0);
  }

  console.log(`\n[OK] Merge type: ${parsed.merge_type}`);
  console.log(`New HEAD: ${parsed.base_branch ? parsed.base_branch.sha : "unknown"}`);
} catch (e) {
  console.error(`\n[ERROR] merge-upstream API failed:`);
  console.error(e.stderr || e.message);
  process.exit(1);
}

// 5. Re-run enrichment immediately to capture the new state
console.log("\nRe-enriching all forks to capture new state...");
execSync("node pipeline/p01-enrich-divergence.mjs", { stdio: "inherit" });

// 6. Verify the new state
const newEnriched = JSON.parse(fs.readFileSync(enrichedFile, "utf8"));
const newRecord = newEnriched.find(e => e.full_name === repoArg);
const newLocalSha = newRecord.head_sha;

console.log(`\n=== Remediation Summary: ${repoArg} ===`);
console.log(`Old Local HEAD: ${oldLocalSha}`);
console.log(`New Local HEAD: ${newLocalSha}`);
console.log(`New Ahead/Behind: ${newRecord.enrichment.ahead_of_parent_by} / ${newRecord.enrichment.behind_parent_by}`);

// Success criteria: new local HEAD should equal the parent HEAD (fully synced)
const newParentSha = newRecord.enrichment.parent_head_sha;
if (newLocalSha === newParentSha) {
  console.log("Success: fork is now fully synced to parent.");
  if (oldLocalSha === newLocalSha) {
    console.log("NOTE: oldLocalSha matched newLocalSha — fork was already synced before this run.");
  }
} else {
  console.log("WARNING: fork is not fully synced. newLocal=" + newLocalSha + " newParent=" + newParentSha);
}

// 7. Write remediation log for G07
const log = {
  repo: repoArg,
  parent: parent,
  old_local_sha: oldLocalSha,
  old_parent_sha: oldParentSha,
  new_local_sha: newLocalSha,
  new_parent_sha: newParentSha,
  new_ahead: newRecord.enrichment.ahead_of_parent_by,
  new_behind: newRecord.enrichment.behind_parent_by,
  success: newLocalSha === newParentSha,
  already_synced: oldLocalSha === newLocalSha && newLocalSha === newParentSha,
  timestamp: new Date().toISOString()
};
fs.mkdirSync("reports/validation-results", { recursive: true });
fs.writeFileSync("reports/validation-results/remediation-latest.json", JSON.stringify(log, null, 2));
