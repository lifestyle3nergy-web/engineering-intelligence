# ADR numbering policy

**Evidence class:** `STATE` for the current rules. `RESEARCH_HYPOTHESIS`
for the mechanisms proposed to enforce them.

## Allocation

The authoritative allocation table is `governance/adr-registry.json`.

Before opening a PR that adds an ADR:

1. Read `governance/adr-registry.json` at current `main`.
2. Take `next_number`. That is the number to use.
3. Open two PRs, in this order:
   - PR to `engineering-intelligence` adding an entry with
     `status: proposed`, `evidence_class: ACTION`, `pr: <consuming-PR-number>`.
   - PR to the consuming repo adding `docs/adr/NNNN-slug.md`.
4. The engineering-intelligence PR is reviewed and merged first.
   The consuming PR then rebases onto a main that contains the entry.

Serialization is by merge order. Two PRs cannot both claim the same number
because the second one's validator run fails against the updated registry.

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
