import { execSync } from "node:child_process";
import fs from "node:fs";

// /user/repos?affiliation=owner includes PRIVATE repos for the authed owner
console.log("Enumerating via REST (user/repos?affiliation=owner)...");
const raw = execSync(
  "gh api 'user/repos?per_page=100&affiliation=owner' --paginate",
  { encoding: "utf8", maxBuffer: 1024 * 1024 * 100 }
);
const chunks = JSON.parse(`[${raw.replace(/\]\s*\[/g, ",")}]`).flat()
  .filter(r => r.owner.login === "lifestyle3nergy-web");

const privateCount = chunks.filter(r => r.private).length;
console.log(`Enumerated ${chunks.length} repos owned by lifestyle3nergy-web (${privateCount} private).`);

const inventory = [];
const pins = [];

for (const r of chunks) {
  const full = r.full_name;
  const branch = r.default_branch;
  let sha = "UNRESOLVED";
  if (branch) {
    try {
      sha = execSync(
        `gh api 'repos/${full}/commits/${branch}' --jq .sha`,
        { encoding: "utf8" }
      ).trim();
    } catch (e) {
      console.error(`  WARN sha ${full}: ${e.message.split("\n")[0]}`);
    }
  }

  const isTrailingDash = r.name === "TWGT-";
  inventory.push({
    repo_id: r.id,
    node_id: r.node_id,
    full_name: full,
    visibility: r.private ? "PRIVATE" : "PUBLIC",
    fork: r.fork,
    archived: r.archived,
    default_branch: branch,
    observed_sha: sha,
    name_has_trailing_dash: isTrailingDash,
    investigation_note: isTrailingDash ? "INV-001: Trailing dash requires explicit numeric ID mapping." : null
  });

  pins.push({
    repo_id: r.id,
    full_name: full,
    visibility: r.private ? "PRIVATE" : "PUBLIC",
    default_branch: branch,
    head_sha: sha,
    fork: r.fork,
    parent_full_name: r.parent?.full_name ?? null,
    parent_id: r.parent?.id ?? null,
    observed_at: new Date().toISOString()
  });
}

const observedCount = inventory.length;
const reconciliation = {
  expected_historical: 47,
  expected_previous_snapshot: 75,
  requested_limit: 180,
  observed_now: observedCount,
  private_observed: privateCount,
  status: observedCount >= 180 ? "AT_OR_ABOVE_LIMIT" : "BOUNDED_LIMIT_NOT_REACHED",
  endpoint: "user/repos?affiliation=owner",
  note: observedCount < 180
    ? "Account currently has fewer repos than the requested limit of 180."
    : "Account has reached or exceeded the requested limit of 180."
};

fs.mkdirSync("registry/repositories", { recursive: true });
fs.writeFileSync("registry/repositories/repository-inventory.json", JSON.stringify(inventory, null, 2));
fs.writeFileSync("registry/repositories/upstream-pins.json", JSON.stringify(pins, null, 2));
fs.writeFileSync("registry/repositories/inventory-reconciliation.json", JSON.stringify(reconciliation, null, 2));

// Private repos get their own file — this is what P07 checks for leaks
fs.writeFileSync(
  "registry/repositories/repository-inventory.private.json",
  JSON.stringify(inventory.filter(r => r.visibility === "PRIVATE"), null, 2)
);

const unresolved = inventory.filter(r => r.observed_sha === "UNRESOLVED");
console.log(`Populated ${observedCount} (${privateCount} private). Unresolved: ${unresolved.length}.`);
if (unresolved.length) unresolved.forEach(r => console.log(`  UNRESOLVED: ${r.full_name}`));
