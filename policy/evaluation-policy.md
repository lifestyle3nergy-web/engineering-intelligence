---
policy: evaluation
version: 1.0.0
effective: 2026-10-03
owner: lifestyle3nergy-web
authority: human-only
depends_on: policy/Allowlist-policy.md
---

# Evaluation Policy

Constraint layer. Defines **how an authorized change is judged**.
Authorization is `Allowlist-policy.md`. Enforcement is CI.

## Checks

Every PR is scored on:

| Check | Pass condition | Fail → verdict |
|---|---|---|
| scope | all changed paths within driftable | BLOCK |
| budget | within Allowlist budget | BLOCK |
| interface-drift | UNCHANGED or ADDITIVE | BREAKING/INVALID → BLOCK |
| frozen | no frozen path touched | BLOCK |
| evidence | change declares evidence_class | HOLD |
| provenance | change declares source | HOLD |
| tests | all required checks pass | HOLD |

**Critical** (fail → BLOCK): scope, budget, interface-drift, frozen.
**Non-critical** (fail → HOLD): evidence, provenance, tests.

## Verdicts

| Verdict | Meaning | Next |
|---|---|---|
| CLEAN | all checks pass, evidence present | human admission |
| HOLD | non-critical check fails, actionable | back to actor |
| BLOCK | critical check fails, or frozen touched | stop |

`CLEAN` is not `ADMITTED`. Only a human may change a verdict to
`ADMITTED` and merge.

## Interface drift

Uses the M3 taxonomy from `twgt-schema-gate/contract-tests/differential`:

- `UNCHANGED` — output shape identical to parent
- `ADDITIVE` — new optional fields only; no removals, no type changes
- `BREAKING` — required field removed, type changed, enum narrowed
- `INVALID` — schema does not parse

`ADDITIVE` is subject to a rolling window: maximum 3 additive fields
per 30-day period across all merged PRs. Exceeding the window budget
downgrades `ADDITIVE` to `BREAKING` for the current PR.

Parent comparison uses `git merge-base HEAD origin/main`, not `HEAD^`.

## Timestamp

Every verdict records:


A decision is evaluated against the policy in force at decision time,
not the policy that exists when the verdict is read. Retroactive
re-evaluation is not permitted.

## Prohibitions

An actor may never:

- edit this file
- propose a change that weakens a check
- mark its own verdict CLEAN
- suppress a BLOCK by proposing a HOLD

## Authority

Only a human may:

- add, remove, or modify a check
- change a verdict from BLOCK to HOLD
- add an Allowlist entry
- admit a change from CLEAN to merged
- amend this file
