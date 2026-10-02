# EPR-022 · Preflight boundary for repository operations

**Status:** Open
**Opened:** 2026-10-03
**Relates to:** EPR-019, EPR-020, EPR-021
**Motivates:** `policy/preflight.sh`

## Constraint

A repository can be in a state where a normal git operation makes
things worse. Cherry-pick in progress, unmerged paths, 111 commits
behind, garbage filenames from a paste accident — each is recoverable
individually, but the recovery depends on recognising the state first.

There is no automated check that runs before operations and refuses
when the state is unsound. Without one, recovery is a diagnosis, and
diagnosis requires a human who noticed something wrong.

## Historical evidence

### Implementation evidence

On 2026-10-03, `TWGT-` was found with:

- cherry-pick of `e03c053` in progress
- four unmerged paths with `DU` markers
- 111 commits behind `origin/main`
- two garbage-named untracked files: `echo` (bare command written as
  a file) and `"\001\222\016@\340\036\001@8"` (unprintable bytes)
- a `.gitignore` that did not filter any of it

Recovery required: tarball backup, `cherry-pick --abort`,
`reset --hard origin/main`, manual `find -delete`. That is four steps,
each of which a preflight script could have surfaced in one line.

### Engineering inference

Every repository operation has a precondition. If the precondition is
"repo is in a known-clean state", the check is mechanical and belongs
in a script. Only the recovery decision — abort vs finish, reset vs
stash — requires judgement.

Preflight separates them.

## Transfer to TWGT

### 1. `policy/preflight.sh` — this PR
### 2. Each repository installs a copy — open
### 3. `core.hooksPath` set to `.githooks` in each clone — open
### 4. Pre-commit hook calls preflight — open

## Completion criteria

1. `preflight.sh` on `main` under `policy/`.
2. Copy committed to `twgt-schema-gate`, `twgt-bridge`, `TWGT-`.
3. `.githooks/pre-commit` in each calls it and exits on failure.
4. First refused commit prevented by the check.

## What this EPR is not

Not a hook that deletes untracked files. Preflight reports; humans
decide. A script that removes work is worse than the problem it
solves.

## Sources

1. **Primary** — `lifestyle3nergy-web/TWGT-` recovery, 2026-10-03.
2. **Related** — EPR-019 (boundaries), EPR-021 (authority).
