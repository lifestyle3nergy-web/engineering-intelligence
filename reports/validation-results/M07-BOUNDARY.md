# M07 Boundary — 2026-11-04

## What M07 Delivers (verified, in PR #63)

- `pipeline/p02-remediate.mjs` — single-fork sync via `merge-upstream`
- `validation/acceptance/run.mjs` — G07 gate
- Two validated test cases: caddy (no-op), alacritty (real sync)
- Two new lessons: L-SYNC-COMPARE-001, L-RACE-001
- Total lessons: 11

## What M07 Does NOT Deliver (held for M07.1)

- **Race condition fix** — `p02-remediate.mjs` re-enriches immediately after `merge-upstream`, which can catch GitHub's propagation delay. M07.1 adds exponential backoff polling (max 30s).
- **Bulk sync** — single-repo only by design
- **Scheduled execution** — on invocation only
- **Retry-on-failure** — no automatic retry of failed `merge-upstream` calls

## The Three Governance Boundaries (reinforced)

1. **No UI syncs.** Use `p02-remediate.mjs --repo=<name>`, never "Sync fork" on GitHub.
2. **No bulk operations.** One fork at a time. Batch runs require explicit human orchestration.
3. **No self-approval.** Human approval still required for merge (M09).

## Known Race Condition

`merge-upstream` returns before fork HEAD fully propagates. Immediate re-enrichment may see stale state (`success: false` in log even though sync succeeded). Alacritty hit this. See L-RACE-001.

**Workaround until M07.1:** After a sync, wait 30 seconds before re-enriching, or re-run enrichment a second time.

## State at Boundary

- Branch `ei-registry-001/m07-remediation` at commit `70865b9` (signed, verified)
- PR #63 is Draft, waiting for M09 approval artifact
- Two validated fork syncs in history (caddy, alacritty)
- Gate G07 blocks commit if `success != true`
