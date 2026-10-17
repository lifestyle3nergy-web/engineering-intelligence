## Scope

<!-- Every file changed must be named here. COMMIT-RULES.md rule 5. -->

Files changed:

-

## Evidence class

<!-- Every factual claim in the commit and this description must declare
     one of: EXECUTED, RESEARCH_PATTERN, ENGINEERING_INFERENCE,
     RESEARCH_HYPOTHESIS, UNVERIFIED. COMMIT-RULES.md rule 2. -->

| Claim | Class | Source |
| --- | --- | --- |
|  |  |  |

## Self-reference check

- [ ] No SHA or run ID is cited for the head being committed.
- [ ] No claim uses the word ADMITTED, PASS_CANDIDATE, or EVIDENCE_READY.
- [ ] Any historical SHA references content that this diff does not change.

## ADR check (only if this diff adds docs/adr/NNNN-*.md)

- [ ] The number matches an entry in `governance/adr-registry.json`.
- [ ] The entry's `repo` field names this repository.
- [ ] The entry's `slug` matches the filename slug.

## Reviewer traffic light

<!-- Applied by the reviewer. Not by the author. Not by CI.
     Remove after merge. -->

- [ ] 🟢 GREEN — every claim EXECUTED with source, or HISTORICAL unchanged
- [ ] 🟡 YELLOW — at least one claim is research-class, no admission claimed
- [ ] 🔴 RED — inspection required (see reason below)

Reviewer reason (one sentence):

<!-- END -->
