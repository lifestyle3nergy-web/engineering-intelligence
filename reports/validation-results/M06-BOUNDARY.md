# M06 Boundary — 2026-11-04

## What M06 Delivers (verified, in PR #62)

- `registry/repositories/upstream-pins.enriched.json` — 183 repos, 162 forks ENRICHED
- `registry/repositories/enrichment-stats.json` — machine-readable coverage metrics
- `pipeline/p01-enrich-divergence.mjs` — the enrichment script (idempotent, rerunnable)
- `validation/acceptance/run.mjs` — G06 gate (three-state classification)
- `registry/lessons/index.json` — 9 lessons including L-TRANSIENT-001 and L-STALE-001
- `registry/manifest.json` — upstream_pins section with retry history

## What M06 Does NOT Deliver (held for M07+)

- **Remediation pipeline** — no script syncs forks automatically
- **Bulk sync endpoint** — no `POST /repos/.../merge-upstream` loop exists
- **Real semantic provider** — `semantic: false` still true; M08 needed
- **Human approval artifact** — no `human-approval.json` exists; M09 needed
- **Fixture execution** — G03/G04 validate shapes, not runs; M07+ needed

## The Three Governance Boundaries

1. **No UI syncs.** Do not click "Update branch" or "Sync fork" on GitHub. Every fork sync must go through the M07 pipeline (not yet built).
2. **No blind bulk operations.** Any operation touching >1 repo requires a scoped branch, an evidence record, and a re-enrichment step.
3. **No self-approval.** The pipeline cannot write `human-approval.json`. That is a human action bound to a specific SHA.

## What's Next (in dependency order)

- **M07** — Remediation pipeline: script that syncs one fork at a time via `merge-upstream` API, then re-runs `p01-enrich-divergence.mjs`, then commits
- **M08** — Real semantic provider: requires human decision (JEPA vs HF vs OpenAI) + acceptance criteria definition
- **M09** — Human approval: requires a human with signing capability to write `human-approval.json` bound to `TARGET_SHA`

## State at Boundary

- Branch `ei-registry-001/m06-divergence` at commit `2657ef4` (signed, verified)
- PR #62 is Draft, waiting for M09 approval artifact
- PR #61 is Draft, also waiting for M09 (same human approval can cover both if desired)
