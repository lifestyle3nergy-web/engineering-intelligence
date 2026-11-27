# ADR numbering policy

**Evidence class:** `STATE` for the current rules. `RESEARCH_HYPOTHESIS`
for the mechanisms proposed to enforce them.

## Allocation

The authoritative allocation table is `governance/adr-registry.json`.

### Required sequence

An ADR number is not available to a consuming repository merely because it
appears in an unmerged registry proposal. The allocation PR must be reviewed
and merged before the consuming ADR PR is opened.

1. Read `governance/adr-registry.json` from the current
   `engineering-intelligence/main`.
2. Use the current `next_number`; do not allocate from a stale branch or
   from an unmerged proposal.
3. Open an Engineering Intelligence registry PR first. Add the allocation
   with `status: proposed`, `evidence_class: ACTION`, and the consuming
   repository and PR reference.
4. Have the registry PR reviewed by an independent human reviewer and merged
   to `engineering-intelligence/main`.
5. Re-read the registry from the resulting `main`. Confirm the allocation
   exists, its number and slug match the intended decision, and
   `next_number` has advanced.
6. Only then open the consuming repository PR containing
   `docs/adr/NNNN-slug.md`. Rebase that branch onto the consuming
   repository's current `main` and verify against the merged registry.
7. Record fresh exact-head CI and security evidence, then request independent
   human review. Merge authorization remains separate.

### Pending allocations and holds

- An open or draft registry PR is a proposal, not an authoritative
  allocation on `main`.
- Do not create, pin, or claim a consuming ADR against an unmerged proposal.
- Do not update a consumer's registry pin to a proposal branch or commit.
- While a registry allocation PR is pending, treat its proposed numbers as
  reserved for coordination but not yet consumable. Do not issue competing
  allocations from the unchanged `main`; reconcile against the pending PR
  and serialize the next allocation after it is resolved.
- If the registry PR is rejected or withdrawn, retain an auditable
  `withdrawn` record if the number was committed to the authoritative
  registry. Never silently reuse a published number.
- A proposed registry entry does not prove the consuming change was
  implemented, validated, admitted, or merged.

Serialization is by registry merge order. The registry is the single
allocation authority; consuming repositories validate against the registry
state on `main`, not against an unmerged branch.

## Renumbering

A number is renumbered only by PR to `adr-registry.json` that:

1. Changes the entry's `number` field.
2. Provides the new number (which must equal current `next_number`).
3. Advances `next_number`.
4. Names the consuming repo's PR in the commit message.
5. Is followed by the consuming repo renaming its ADR file.

Renumbering is a `STATE` change. It does not invalidate the ADR's content.

## Retired numbers

A withdrawn proposal does not free its number. The entry remains with
`status: withdrawn`. Numbers are not reused. This is the same discipline
as the EPR series.

## Validator integration

Consuming repos verify their ADRs against the registry using
`twgt-bridge/bin/verify-adr-registry.mjs`. See that file for the
verification contract.

The registry itself is not verified by CI. Per `COMMIT-RULES.md` rule 8,
a CI check enforcing this policy would be a self-referential claim.
