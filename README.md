# Engineering Intelligence

Reference library for evidence-bounded engineering knowledge.

The atlas connects historical engineering constraints, implementation
evidence, operational failures, and transfer hypotheses. It does not turn
inference into fact.

**Evidence class:** `STATE` for what exists in this repository. `ACTION`
for what this repository proposes. Not `EXECUTED`. Not `ADMITTED`.

## Contents

1. [Active boundary stack](#active-boundary-stack)
2. [Governance family](#governance-family)
3. [Application family](#application-family)
4. [Integration family](#integration-family)
5. [ADR collision elimination](#adr-collision-elimination)
6. [Traffic-light review protocol](#traffic-light-review-protocol)
7. [Evidence discipline](#evidence-discipline)
8. [Sibling repositories](#sibling-repositories)
9. [Index](#index)

## Active boundary stack

The current TWGT implementation is documented in:

- `epr/EPR-019-schema-validation-at-agent-boundaries.md`
- `epr/EPR-020-evidence-as-a-contract.md`
- `integrations/twgt-boundary-stack.md`

The stack separates execution, evidence collection, validation, and
durable engineering knowledge. Each layer is a distinct surface with
distinct authority.

## Governance family

Repositories whose purpose is evidence, schemas, and admission boundaries.

| Repository | Role | Registry |
| --- | --- | --- |
| [TWGT-](https://github.com/lifestyle3nergy-web/TWGT-) | Application and admission consumer | Not a registry |
| [twgt-bridge](https://github.com/lifestyle3nergy-web/twgt-bridge) | Read-only evidence collector and verifier | Pins registry by SHA |
| [twgt-schema-gate](https://github.com/lifestyle3nergy-web/twgt-schema-gate) | Boundary schemas and dual-runtime contract tests | Not a registry |
| [engineering-intelligence](https://github.com/lifestyle3nergy-web/engineering-intelligence) | This repository. Evidence atlas and ADR registry | **The registry** |

The registry lives at `governance/adr-registry.json`. The policy that
governs it lives at `policy/ADR-numbering-policy.md`.

## Application family

Repositories whose purpose is execution, interfaces, or research
instruments. They consume governance. They do not define it.

| Repository | Role |
| --- | --- |
| [sasa](https://github.com/lifestyle3nergy-web/sasa) | Kotlin Android aggregator, Material Design 3 |
| [AI-OS](https://github.com/lifestyle3nergy-web/AI-OS) | Replit-hosted AI operating environment |
| [Swarm-Mind-Console](https://github.com/lifestyle3nergy-web/Swarm-Mind-Console) | Console application |
| [Intelligent-Nexus](https://github.com/lifestyle3nergy-web/Intelligent-Nexus) | Replit-hosted application |

Application repositories do not hold ADRs. Boundary decisions that affect
them live in TWGT- or in this repository. See
[ADR collision elimination](#adr-collision-elimination).

## Integration family

Repositories consumed as tools, references, or upstream libraries. They
carry their own governance upstream. This organization pins them, it
does not govern them.

| Repository | Role |
| --- | --- |
| [mcpadapt](https://github.com/lifestyle3nergy-web/mcpadapt) | MCP adapter library |
| [trivy](https://github.com/lifestyle3nergy-web/trivy) | Vulnerability scanner (upstream fork) |

## ADR collision elimination

Two ADRs cannot share a number. Before 2026-10-17, that rule was enforced
by human convention alone. It failed. Three collision sub-cases were
observed in open pull requests:

- **Sub-case A — pre-existing.** A PR picked a number that `main` already
  owned. Detected only after review.
- **Sub-case B — merge-order.** `main` advanced after the PR branched and
  took the number. Detected only at merge time.
- **Sub-case C — two-PR.** Two open PRs picked the same free number.
  Detected only when the second tried to merge.

The elimination design has four parts. Each is independent. All four are
required for full elimination.

### 1. Allocate centrally

One file, one writer path: `governance/adr-registry.json`.

A number is allocated before a PR is opened, not after. See
`policy/ADR-numbering-policy.md` for the allocation procedure.

### 2. Verify mechanically

Consuming repositories verify their `docs/adr/NNNN-*.md` files against the
registry using `twgt-bridge/bin/verify-adr-registry.mjs`. The verifier is
GET-only, hash-checked, and fail-closed. Any error returns `HELD`.

### 3. Enforce org-wide

A GitHub organization ruleset on the governance family requires:

- The repository governance status check to pass.
- Branches to be up to date before merging.

The ruleset is a GitHub setting, not a workflow file. Same pattern
Microsoft applies with org-level rulesets rather than per-repo branch
protection.

### 4. Federate content

The long-form ADR stays in the consuming repository's `docs/adr/`. The
registry holds only the mapping `number → repo/slug/PR/status/hash`. This
mirrors Google's "decisions close to the code" convention while keeping
allocation centralized.

### Why all four are needed

| Sub-case | Caught by |
| --- | --- |
| A — pre-existing | Registry check at authoring time |
| B — merge-order | Org ruleset: branches must be up to date |
| C — two-PR | Registry: single allocator per number |

No static check catches all three. The registry catches A and C. The
ruleset catches B. Neither is optional.

## Traffic-light review protocol

Reviewing a pull request should be a single decision: merge as-is, or
inspect further. The protocol below reduces that decision to a color.

**Authority note.** The traffic light is a *reviewer annotation*. It is
not a commit claim, not a CI badge, and not a file content. Per
`COMMIT-RULES.md` rule 7, no commit may assert `ADMITTED`,
`PASS_CANDIDATE`, or `EVIDENCE_READY`. The light sits on the PR, applied
by the reviewer, and is removed when the PR merges.

### Colors

| Color | Meaning | Reviewer action |
| --- | --- | --- |
| 🟢 **GREEN** | Every claim is `EXECUTED` with a source, or `HISTORICAL` with an unchanged reference. Scope matches diff. No stale SHA. No self-admission. | Merge permitted. |
| 🟡 **YELLOW** | Claim classes are declared but at least one is `RESEARCH_PATTERN`, `ENGINEERING_INFERENCE`, or `RESEARCH_HYPOTHESIS`. No admission claim. No collision. | Merge permitted as research. Not admission. |
| 🔴 **RED** | Any of: undeclared evidence class, missing source for `EXECUTED`, stale SHA, scope/diff mismatch, ADR number collision, self-admission, or rule 1 violation. | Do not merge. Inspect. |

### How to apply

1. Read the commit messages. Every factual claim must carry an evidence
   class (`COMMIT-RULES.md` rule 2).
2. Read the diff. Every file changed must be named in the message
   (rule 5).
3. Check for self-reference. The commit must not cite a SHA or run ID for
   the head being committed (rule 1).
4. Check the ADR registry if the diff adds `docs/adr/NNNN-*.md`. The
   number must match an entry whose `repo` field names this repository.
5. Apply one label: `review:green`, `review:yellow`, or `review:red`.
6. Post one comment beginning with the color. State the reason in one
   sentence. Do not restate the commit.

### What the colors do not do

- They do not bypass CODEOWNERS.
- They do not authorize merges to protected branches.
- They do not record admission. Admission remains a human decision made
  after the light is applied.
- They are not enforced by CI. Per `COMMIT-RULES.md` rule 8, a CI check
  that enforces this protocol would itself be a self-referential claim.

The PR template at `.github/pull_request_template.md` includes the
protocol as a checklist.

## Evidence discipline

Every claim in this library is labelled: historical fact, implementation
evidence, measured result, engineering inference, research hypothesis,
unverified. A statement that is not labelled is not a claim.

See `wiki.md` §2 for the full method. See `governance/evidence-policy.md`
for the FACT/STATE/GATE/ACTION taxonomy.

## Sibling repositories

- `twgt-schema-gate` — implements EPR-019. Boundary schemas, dual-runtime
  contract tests, published registry.
- `twgt-bridge` — read-only evidence collector. Verifies schema-gate
  against pinned SHAs. Publishes evidence to its own branch, never to
  `main`. Hosts the ADR registry verifier.

## Index

The atlas in [`wiki.md`](./wiki.md) is the index for this repository. It
links every EPR, every capability candidate, every foundation document,
and every governance policy.

When a section in the atlas grows past what it can hold, the long form
moves into the corresponding directory (`epr/`, `governance/`, `policy/`,
`capabilities/`, `foundations/`) and the atlas keeps a one-line summary
with a link.
