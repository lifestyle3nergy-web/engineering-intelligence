#!/usr/bin/env bash
# preflight.sh — refuse to operate on an unsound repository state.
# Runs before any git operation. Exit 1 = stop. Exit 0 = safe to proceed.
# See EPR-022 for the doctrine this enforces.

set -uo pipefail
R="${1:-.}"
cd "$R" || { echo "FAIL: cannot cd to $R"; exit 2; }

fail=0
note() { printf '  %s\n' "$*"; }
bad()  { printf '🔴 %s\n' "$*"; fail=1; }
good() { printf '🟢 %s\n' "$*"; }
warn() { printf '🟠 %s\n' "$*"; }

echo "preflight: $R"

# 1. mid-operation states
for state in MERGE_HEAD REBASE_HEAD CHERRY_PICK_HEAD REVERT_HEAD; do
  if [ -f ".git/$state" ]; then
    bad "in-progress: $state present — finish or abort first"
  fi
done
for dir in rebase-merge rebase-apply; do
  if [ -d ".git/$dir" ]; then
    bad "in-progress: .git/$dir present"
  fi
done

# 2. detached HEAD
if ! git symbolic-ref -q HEAD >/dev/null; then
  bad "detached HEAD"
fi

# 3. unmerged paths
if git ls-files -u | grep -q .; then
  bad "unmerged paths in index:"
  git ls-files -u | awk '{print "      "$4}' | sort -u
fi

# 4. behind origin
br="$(git branch --show-current)"
if [ -n "$br" ]; then
  git fetch origin --quiet 2>/dev/null
  behind="$(git rev-list --count "HEAD..origin/$br" 2>/dev/null || echo 0)"
  ahead="$(git rev-list --count "origin/$br..HEAD" 2>/dev/null || echo 0)"
  [ "$behind" -gt 0 ] && warn "behind origin/$br by $behind commits"
  [ "$ahead"  -gt 0 ] && note "ahead of origin/$br by $ahead commits"
fi

# 5. untracked files — warn only, never delete
u="$(git ls-files --others --exclude-standard | wc -l)"
[ "$u" -gt 0 ] && warn "$u untracked file(s) — review before committing"

# 6. garbage-named files (non-printable in name)
if git ls-files --others --exclude-standard -z | tr '\0' '\n' | LC_ALL=C grep -qP '[^\x20-\x7E/]'; then
  bad "filename(s) contain non-printable characters:"
  git ls-files --others --exclude-standard | LC_ALL=C grep -P '[^\x20-\x7E]' | sed 's/^/      /'
fi

# 7. suspected paste artifacts (bare commands as filenames)
for f in echo cat ls git cd pwd; do
  if [ -e "./$f" ] && [ ! -d "./$f" ]; then
    warn "suspicious file: ./$f (paste artifact?)"
  fi
done

echo ""
if [ "$fail" -eq 0 ]; then
  good "preflight OK"
  exit 0
else
  bad "preflight FAILED — do not proceed"
  exit 1
fi
