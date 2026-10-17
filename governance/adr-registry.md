# ADR Registry

**Evidence class:** `STATE` — the registry describes what has been allocated.
**Authority:** NONE. Presence of a number in this registry does not admit
any pull request, release, or capability. Admission is a human decision
made elsewhere.

## Purpose

TWGT owns more than one repository. Each maintains ADRs in `docs/adr/`.
Numbering is sequential across the organization, not per-repo. This file
is the single source of truth for which number belongs to which PR.

## Non-goals

- This registry does not enforce anything. Enforcement happens at
  consuming repos, using `twgt-bridge/bin/verify-adr-registry.mjs`.
- This registry does not grant authority. Per `COMMIT-RULES.md` rule 7,
  no commit may claim ADMITTED, PASS_CANDIDATE, or EVIDENCE_READY.
- This registry does not replace ADRs. The long-form decision stays in
  each repo's `docs/adr/NNNN-slug.md`.

## Rules

1. One number is allocated to at most one ADR. No exceptions.
2. Numbers are sequential. `next_number` is the smallest unallocated value.
3. A number is allocated before the ADR PR is opened, not after.
4. Renumbering is permitted only by PR to this file and the affected ADR.
5. A proposal that is withdrawn leaves the number retired. Retired numbers
   are not reused.

## Schema

See `adr-registry.schema.json`. The schema is enforced only by PR review,
not by CI. Per `COMMIT-RULES.md` rule 8, a CI check that enforces this
would itself be a self-referential claim.

## Updates

Update by PR. The change must name every file it edits (commit rule 5).
The change must declare its evidence class (commit rule 2). The change
must not cite a run ID or SHA for the head being committed (commit rule 1).

CODEOWNERS: this file and `adr-registry.schema.json` require human review.
