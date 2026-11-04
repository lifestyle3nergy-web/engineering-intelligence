#!/usr/bin/env bash
set -euo pipefail

OUT="reports/validation-results/CLOSE.md"
OUT_JSON="reports/validation-results/CLOSE.json"
mkdir -p reports/validation-results
exec > >(tee "$OUT") 2>&1

echo "# Session Close Artifact"
echo "Generated: $(date -u +%FT%TZ)"
echo ""

echo "## 1. Actual PR Chain"
python3 - <<'PY'
import subprocess

branches = [
    "ei-registry-001/m02-m05-milestones",
    "ei-registry-001/m06-divergence",
    "ei-registry-001/m07-remediation",
    "ei-registry-001/m07.1-race-fix",
    "ei-registry-001/m07.3-compare-fix",
    "ei-registry-001/m07.5-adr-lint"
]

for br in branches:
    try:
        subprocess.check_call(["git", "rev-parse", f"origin/{br}"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    except subprocess.CalledProcessError:
        print(f"- {br}: (not on remote)")
        continue

    ancestors = []
    for other in branches:
        if other == br: continue
        try:
            is_ancestor = subprocess.call(["git", "merge-base", "--is-ancestor", f"origin/{other}", f"origin/{br}"]) == 0
            if is_ancestor:
                dist = int(subprocess.check_output(["git", "rev-list", "--count", f"origin/{other}..origin/{br}"]).decode().strip())
                ancestors.append((dist, other))
        except: pass

    if not ancestors:
        print(f"- {br} → main")
    else:
        ancestors.sort()
        nearest_dist, nearest_parent = ancestors[0]
        print(f"- {br} → {nearest_parent} (distance: {nearest_dist})")
PY

echo ""
echo "## 2. Gate Count (parsed)"
node --input-type=module -e '
import fs from "node:fs";
const src = fs.readFileSync("validation/acceptance/run.mjs", "utf8");
const start = src.indexOf("const GATES = [");
const end = src.indexOf("];\n\nconst results", start);
const arrStr = src.slice(start + "const GATES = ".length, end + 1);
const GATES = new Function(`return ${arrStr}`)();
console.log(`Total Gates: ${GATES.length}`);
console.log(`IDs: ${GATES.map(g => g.id).sort().join(", ")}`);
'

echo ""
echo "## 3. Signature Verification"
python3 - <<'PY'
import subprocess, json, sys

shas = subprocess.check_output(["git", "log", "origin/main..HEAD", "--pretty=%H"]).decode().strip().split("\n")
shas = [s for s in shas if s]

print("| SHA | Verified | Reason | Subject |")
print("|---|---|---|---|")
errors = 0
for sha in shas:
    try:
        # Capture stderr to surface the actual error
        out = subprocess.check_output(
            ["gh", "api", f"repos/lifestyle3nergy-web/engineering-intelligence/commits/{sha}"],
            stderr=subprocess.PIPE
        ).decode()
        match = json.loads(out)
        v = match["commit"]["verification"]
        ver = str(v["verified"])
        reason = v.get("reason") or "none"
        subj = match["commit"]["message"].split("\n")[0][:40]
        print(f"| {sha[:7]} | {ver} | {reason} | {subj} |")
    except subprocess.CalledProcessError as e:
        err = e.stderr.decode().strip().split('\n')[0][:60]
        print(f"| {sha[:7]} | ERROR | {err} | - |")
        errors += 1

if errors > 0:
    print(f"\n**WARNING:** {errors} commits failed to fetch. See errors above.")
    # Do not exit 1 here, but surface it to the JSON
PY

echo ""
echo "## 4. R6 Conflict Magnitude"
for br in ei-registry-001/m02-m05-milestones ei-registry-001/m06-divergence ei-registry-001/m07-remediation ei-registry-001/m07.1-race-fix ei-registry-001/m07.3-compare-fix ei-registry-001/m07.5-adr-lint; do
  if ! git rev-parse "origin/$br" >/dev/null 2>&1; then continue; fi
  STAT=$(git diff --stat origin/main...origin/$br -- governance/adr-registry.json governance/adr-registry.schema.json)
  if [ -n "$STAT" ]; then
    echo "### $br"
    echo '```'
    echo "$STAT"
    echo '```'
  fi
done

# Generate CLOSE.json so we don't grep Markdown
GATE_COUNT=$(node --input-type=module -e '
import fs from "node:fs";
const src = fs.readFileSync("validation/acceptance/run.mjs", "utf8");
const start = src.indexOf("const GATES = [");
const end = src.indexOf("];\n\nconst results", start);
const arrStr = src.slice(start + "const GATES = ".length, end + 1);
const GATES = new Function(`return ${arrStr}`)();
console.log(GATES.length);
')

jq -n \
  --arg branch "$(git branch --show-current)" \
  --arg sha "$(git rev-parse HEAD)" \
  --argjson lessons "$(jq '.lessons | length' registry/lessons/index.json)" \
  --argjson gates "$GATE_COUNT" \
  --arg worktree "$(git status --porcelain | wc -l)" \
  '{branch: $branch, sha: $sha, lessons: $lessons, gates: $gates, worktree_dirty_files: $worktree}' \
  > "$OUT_JSON"
