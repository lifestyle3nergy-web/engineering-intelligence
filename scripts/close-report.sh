#!/usr/bin/env bash
set -euo pipefail

OUT="reports/validation-results/CLOSE.md"
mkdir -p reports/validation-results
exec > >(tee -a "$OUT") 2>&1

echo "# Session Close Artifact"
echo "Generated: $(date -u +%FT%TZ)"
echo ""

echo "## 1. Actual PR Chain (merge-base derived)"
python3 - <<'PY'
import subprocess, json

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
                # Calculate distance
                dist = int(subprocess.check_output(["git", "rev-list", "--count", f"origin/{other}..origin/{br}"]).decode().strip())
                ancestors.append((dist, other))
        except: pass

    if not ancestors:
        print(f"- {br} → main")
    else:
        # Sort by distance (smallest distance = nearest parent)
        ancestors.sort()
        nearest_dist, nearest_parent = ancestors[0]
        print(f"- {br} → {nearest_parent} (distance: {nearest_dist})")
PY

echo ""
echo "## 2. Gate Count (parsed, not grepped)"
node --input-type=module -e '
import fs from "node:fs";
import path from "node:path";

const p = "validation/acceptance/run.mjs";
const src = fs.readFileSync(p, "utf8");

// Extract the GATES array string block safely
const start = src.indexOf("const GATES = [");
const end = src.indexOf("];\n\nconst results", start);
if (start === -1 || end === -1) {
  console.error("Could not parse GATES array");
  process.exit(1);
}

// Extract the array content and evaluate it safely
const arrStr = src.slice(start + "const GATES = ".length, end + 1);
// Use a Function to safely eval only the array literal
const GATES = new Function(`return ${arrStr}`)();
const ids = GATES.map(g => g.id).sort();
console.log(`Total Gates: ${GATES.length}`);
console.log(`IDs: ${ids.join(", ")}`);
'

echo ""
echo "## 3. Signature Verification (batched)"
python3 - <<'PY'
import subprocess, json, sys

shas = subprocess.check_output(["git", "log", "origin/main..HEAD", "--pretty=%H"]).decode().strip().split("\n")
shas = [s for s in shas if s]

# One batch API call
cmd = ["gh", "api", "repos/lifestyle3nergy-web/engineering-intelligence/commits?per_page=100"]
try:
    commits = json.loads(subprocess.check_output(cmd).decode())
except Exception as e:
    print(f"ERROR: Failed to fetch commits: {e}")
    sys.exit(1)

print("| SHA | Verified | Reason | Subject |")
print("|---|---|---|---|")
for sha in shas:
    match = next((c for c in commits if c["sha"] == sha), None)
    if not match:
        print(f"| {sha[:7]} | error | not_found | - |")
        continue
    v = match["commit"]["verification"]
    ver = str(v["verified"])
    reason = v.get("reason") or "none"
    subj = match["commit"]["message"].split("\n")[0][:40]
    print(f"| {sha[:7]} | {ver} | {reason} | {subj} |")
PY

echo ""
echo "## 4. R6 Conflict Magnitude (empirical)"
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
