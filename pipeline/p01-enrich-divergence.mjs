import { execSync } from "node:child_process";
import fs from "node:fs";

const IN_PATH = "registry/repositories/upstream-pins.json";
const OUT_PATH = "registry/repositories/upstream-pins.enriched.json";
const STATS_PATH = "registry/repositories/enrichment-stats.json";

console.log(`Reading ${IN_PATH}...`);
const pins = JSON.parse(fs.readFileSync(IN_PATH, "utf8"));
const forks = pins.filter(p => p.fork === true);
console.log(`Enriching ${forks.length} forks (skipping ${pins.length - forks.length} own repos)...`);

// Helper: run gh api and parse JSON, capture exact stderr on failure
function ghJson(cmd) {
  try {
    const out = execSync(cmd, { encoding: "utf8", maxBuffer: 10 * 1024 * 1024, stdio: ["pipe", "pipe", "pipe"] });
    return { ok: true, data: JSON.parse(out) };
  } catch (e) {
    const errMsg = (e.stderr || e.message || "").split("\n")[0].slice(0, 200);
    return { ok: false, error: errMsg };
  }
}

// Direct fetch of fork HEAD via /commits/{branch} — NOT /compare
// Fixes L-RACE-002: /compare caches fork refs much longer than /commits
function fetchForkHeadDirect(fullName, branch) {
  try {
    return execSync(
      `gh api "repos/${fullName}/commits/${branch}" --jq .sha`,
      { encoding: "utf8" }
    ).trim();
  } catch (e) {
    return null;
  }
}

const enriched = [];
let i = 0;
for (const p of pins) {
  i++;
  if (!p.fork) {
    // L-RACE-002 fix: fetch fork HEAD via /commits/{branch}, NOT /compare
  const directLocalHead = fetchForkHeadDirect(p.full_name, p.default_branch);

  enriched.push({ ...p, enrichment: { status: "NOT_A_FORK", reason: "own repository, no upstream to diverge from" } });
    continue;
  }

  process.stderr.write(`  [${i}/${pins.length}] ${p.full_name}... `);

  // 1. Fork metadata → parent info
  const meta = ghJson(`gh api "repos/${p.full_name}"`);
  if (!meta.ok) {
    enriched.push({ ...p, enrichment: { status: "ERROR", step: "metadata", error: meta.error } });
    process.stderr.write(`METADATA_ERROR\n`);
    continue;
  }
  const parent = meta.data.parent;
  if (!parent) {
    enriched.push({ ...p, enrichment: { status: "PARENT_MISSING", reason: "fork flag set but parent null" } });
    process.stderr.write(`NO_PARENT\n`);
    continue;
  }

  // 2. Parent HEAD SHA
  const parentHead = ghJson(`gh api "repos/${parent.full_name}/commits/${parent.default_branch || "HEAD"}"`);
  if (!parentHead.ok) {
    enriched.push({
      ...p,
      enrichment: {
        status: "PARENT_HEAD_UNREACHABLE",
        parent_full_name: parent.full_name,
        parent_default_branch: parent.default_branch,
        error: parentHead.error
      }
    });
    process.stderr.write(`PARENT_HEAD_ERROR\n`);
    continue;
  }
  const parentSha = parentHead.data.sha;

  // 3. Cross-repo compare: base=parent@sha, head=fork_owner:branch
  // Confirmed working syntax (tested against open-policy-agent/opa)
  const compareCmd = `gh api "repos/${parent.full_name}/compare/${parentSha}...${p.full_name.split("/")[0]}:${p.default_branch}"`;
  const cmp = ghJson(compareCmd);
  if (!cmp.ok) {
    enriched.push({
      ...p,
      enrichment: {
        status: "COMPARE_FAILED",
        parent_full_name: parent.full_name,
        parent_head_sha: parentSha,
        local_head_sha: directLocalHead || p.head_sha,
        error: cmp.error
      }
    });
    process.stderr.write(`COMPARE_ERROR: ${cmp.error}\n`);
    continue;
  }

  enriched.push({
    ...p,
    enrichment: {
      status: "ENRICHED",
      parent_full_name: parent.full_name,
      parent_id: parent.id,
      parent_default_branch: parent.default_branch,
      parent_head_sha: parentSha,
      local_head_sha: p.head_sha,
      ahead_of_parent_by: cmp.data.ahead_by,
      behind_parent_by: cmp.data.behind_by,
      total_commits_in_range: cmp.data.total_commits,
      merge_base_sha: cmp.data.merge_base_commit?.sha ?? null,
      compare_status: cmp.data.status,   // "ahead" | "behind" | "diverged" | "identical"
      enriched_at: new Date().toISOString()
    }
  });
  process.stderr.write(`OK (ahead=${cmp.data.ahead_by}, behind=${cmp.data.behind_by}, status=${cmp.data.status})\n`);
}

fs.writeFileSync(OUT_PATH, JSON.stringify(enriched, null, 2));

const byStatus = {};
for (const e of enriched) {
  const s = e.enrichment?.status ?? "UNKNOWN";
  byStatus[s] = (byStatus[s] || 0) + 1;
}

const stats = {
  total: enriched.length,
  forks: forks.length,
  status_breakdown: byStatus,
  enriched_count: byStatus.ENRICHED || 0,
  up_to_date: enriched.filter(e => e.enrichment?.status === "ENRICHED" && e.enrichment.ahead_of_parent_by === 0 && e.enrichment.behind_parent_by === 0).length,
  behind_only: enriched.filter(e => e.enrichment?.status === "ENRICHED" && e.enrichment.ahead_of_parent_by === 0 && e.enrichment.behind_parent_by > 0).length,
  ahead_only: enriched.filter(e => e.enrichment?.status === "ENRICHED" && e.enrichment.ahead_of_parent_by > 0 && e.enrichment.behind_parent_by === 0).length,
  diverged: enriched.filter(e => e.enrichment?.status === "ENRICHED" && e.enrichment.ahead_of_parent_by > 0 && e.enrichment.behind_parent_by > 0).length
};

console.log("\n=== ENRICHMENT STATS ===");
console.log(JSON.stringify(stats, null, 2));
fs.writeFileSync(STATS_PATH, JSON.stringify(stats, null, 2));
