import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const OWNER = "lifestyle3nergy-web";
const PUBLIC_DIR = path.resolve("registry/repositories");
const PRIVATE_DIR_INPUT = process.env.PRIVATE_INVENTORY_DIR;

function runGh(args) {
  return execFileSync("gh", args, { encoding: "utf8", maxBuffer: 100 * 1024 * 1024, stdio: ["ignore", "pipe", "pipe"] }).trim();
}
function repositoryRoot() { return execFileSync("git", ["rev-parse", "--show-toplevel"], { encoding: "utf8" }).trim(); }
function privateStorageDirectory(root) {
  if (!PRIVATE_DIR_INPUT || !path.isAbsolute(PRIVATE_DIR_INPUT)) throw new Error("E-PRIVACY-001: external private storage is not configured");
  fs.mkdirSync(PRIVATE_DIR_INPUT, { recursive: true, mode: 0o700 });
  const resolved = fs.realpathSync(PRIVATE_DIR_INPUT);
  const relative = path.relative(root, resolved);
  if (relative === "" || (!relative.startsWith("..") && !path.isAbsolute(relative))) throw new Error("E-PRIVACY-002: private storage must be outside the repository");
  fs.chmodSync(resolved, 0o700);
  return resolved;
}
function atomicWrite(directory, filename, value, mode = 0o644) {
  const target = path.join(directory, filename);
  const temporary = path.join(directory, "." + filename + "." + process.pid + ".tmp");
  fs.writeFileSync(temporary, JSON.stringify(value, null, 2) + "\n", { mode });
  fs.renameSync(temporary, target);
  fs.chmodSync(target, mode);
}
function enumerateRepositories() {
  const pages = JSON.parse(runGh(["api", "--paginate", "--slurp", "user/repos?per_page=100&affiliation=owner"]));
  if (!Array.isArray(pages)) throw new Error("E-INVENTORY-001: unexpected repository response");
  return pages.flat().filter(r => r && r.owner && r.owner.login === OWNER);
}
function classifyVisibility(repository) {
  if (repository.private === true) return "PRIVATE";
  if (repository.private === false) return "PUBLIC";
  throw new Error("E-PRIVACY-003: repository visibility is unknown; publication held");
}
function getHeadSha(fullName, branch) {
  if (!branch) throw new Error("E-INVENTORY-002: default branch is missing");
  const sha = runGh(["api", "repos/" + fullName + "/commits/" + encodeURIComponent(branch), "--jq", ".sha"]);
  if (!/^[a-f0-9]{40}$/.test(sha)) throw new Error("E-INVENTORY-003: repository head SHA is invalid");
  return sha;
}
const root = repositoryRoot();
const privateDirectory = privateStorageDirectory(root);
const repositories = enumerateRepositories();
const publicInventory = [];
const publicPins = [];
const privateInventory = [];
for (const repository of repositories) {
  const visibility = classifyVisibility(repository);
  const fullName = repository.full_name;
  const branch = repository.default_branch;
  const sha = getHeadSha(fullName, branch);
  const common = { repo_id: repository.id, full_name: fullName, visibility, publication: visibility === "PUBLIC" ? "PUBLIC" : "INTERNAL_ONLY", fork: Boolean(repository.fork), archived: Boolean(repository.archived), default_branch: branch, observed_sha: sha };
  if (visibility === "PRIVATE") { privateInventory.push({ ...common, node_id: repository.node_id ?? null }); continue; }
  const isTrailingDash = repository.name === "TWGT-";
  publicInventory.push({ ...common, name_has_trailing_dash: isTrailingDash, investigation_note: isTrailingDash ? "INV-001: trailing dash requires explicit numeric ID mapping." : null });
  publicPins.push({ repo_id: repository.id, full_name: fullName, visibility: "PUBLIC", publication: "PUBLIC", default_branch: branch, head_sha: sha, fork: Boolean(repository.fork), observed_at: new Date().toISOString() });
}
atomicWrite(privateDirectory, "repository-inventory.private.json", { schema_version: "1.0.0", classification: "RESTRICTED", records: privateInventory }, 0o600);
fs.mkdirSync(PUBLIC_DIR, { recursive: true });
atomicWrite(PUBLIC_DIR, "repository-inventory.json", publicInventory);
atomicWrite(PUBLIC_DIR, "upstream-pins.json", publicPins);
atomicWrite(PUBLIC_DIR, "inventory-reconciliation.json", { schema_version: "1.0.0", expected_historical: 47, expected_previous_snapshot: 75, requested_limit: 180, observed_public: publicInventory.length, status: "PUBLIC_SCOPE_ONLY", endpoint: "user/repos?affiliation=owner", note: "Counts describe only explicitly public repositories." });
console.log("Public inventory generated: " + publicInventory.length + " records.");
console.log("Restricted inventory written to external protected storage.");
