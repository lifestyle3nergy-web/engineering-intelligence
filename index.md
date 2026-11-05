# Engineering Intelligence

**Evidence-bounded engineering knowledge for the TWGT ecosystem.**

Engineering Intelligence preserves the reasons behind engineering decisions:
the constraints that existed, the evidence for a response, the assumptions that
limit transfer, and the verification needed before a capability becomes an
operational dependency.

[Read the Internet Engineering Evolution Atlas](/engineering-intelligence/atlas/)

## Mission

Turn historical engineering knowledge, repository evidence, and measured
operational learning into reusable, traceable engineering guidance—without
converting inference into fact or evidence into authority.

## Start here

- [Internet Engineering Evolution Atlas](/engineering-intelligence/atlas/) — historical engineering constraints, lessons, transfer questions, and reproduction criteria.
- [EPR directory](https://github.com/lifestyle3nergy-web/engineering-intelligence/tree/main/epr) — individual Engineering Problem Records.
- [ADR registry](https://github.com/lifestyle3nergy-web/engineering-intelligence/blob/main/governance/adr-registry.md) — organisation-wide allocation catalogue.
- [ADR registry data](https://github.com/lifestyle3nergy-web/engineering-intelligence/blob/main/governance/adr-registry.json) — machine-readable allocation records.
- [ADR numbering policy](https://github.com/lifestyle3nergy-web/engineering-intelligence/blob/main/policy/ADR-numbering-policy.md) — allocation and renumbering rules.
- [Evidence policy](https://github.com/lifestyle3nergy-web/engineering-intelligence/blob/main/governance/evidence-policy.md) — record classification and authority boundary.
- [Evaluation policy](https://github.com/lifestyle3nergy-web/engineering-intelligence/blob/main/policy/evaluation-policy.md) — evaluation and hold conditions.
- [Allowlist policy](https://github.com/lifestyle3nergy-web/engineering-intelligence/blob/main/policy/Allowlist-policy.md) — human-controlled authorization.
- [Capability candidates](https://github.com/lifestyle3nergy-web/engineering-intelligence/blob/main/capabilities/CANDIDATES.md) — proposals, not admitted capabilities.
- [Integration boundary stack](https://github.com/lifestyle3nergy-web/engineering-intelligence/blob/main/integrations/twgt-boundary-stack.md) — cross-repository boundary reference.

## Operating model

The knowledge lifecycle is:

`Sources → Ingestion → Normalization → Knowledge → Skills → Tools → Agents → Workflows → Verification → Results → Durable Memory → Refresh`

Each transition requires traceable source lineage and an explicit status. A result
is not promoted merely because it is plausible, a workflow is green, or a tool
returns a successful response.

## Authority boundaries

The repository map below distinguishes governance and evidence ownership from
execution and human decision authority.

| System | Responsibility | Boundary |
| --- | --- | --- |
| `engineering-intelligence` | Evidence atlas, EPRs, ADR allocation, governance references, provenance and capability catalogue | Does not grant runtime admission or replace a consuming repository's implementation authority |
| `twgt-schema-gate` | Canonical schemas and contract validation | Validates shape and compatibility; does not authorize execution |
| `twgt-bridge` | Evidence collection and verification | Evidence-only; collection is not admission or merge authority |
| `TWGT-` | Runtime policy and admission boundary | Consumes verified governance and requires the applicable human authorization |
| `twgt-knowledge` | Derived/contextual knowledge service | Inherits curated knowledge from Engineering Intelligence; does not become a second governance authority |
| `AI-OS` / `AI-OS-CM` | Workflow orchestration and its management surface | Orchestration and management do not override TWGT policy |
| `twgt-git-hitl` | Human review and decision boundary | Presents decisions; does not independently define policy |
| `router-cli` | Command routing and dispatch | Navigation only; no policy or admission decision |
| `twgt-device-node` | Edge/device integration | Must operate within device, identity, capability, and resource limits |
| `Intelligent-Nexus` | Intelligence/inference integration | Inference is not evidence or authorization |
| `Swarm-Mind-Console` | Operator visibility and collaboration | Visibility is not a source of truth |

This is the target responsibility model. A repository name, design document, or
branch does not prove that a capability is deployed. Confirm implementation,
version, permissions, and exact revision before treating a row as observed state.

## Evidence and decision vocabulary

Do not collapse evidence classes, lifecycle states, and decisions into one status.

- **Repository record classes:** `FACT`, `STATE`, `GATE`, `ACTION` — see the [evidence policy](https://github.com/lifestyle3nergy-web/engineering-intelligence/blob/main/governance/evidence-policy.md).
- **Commit claim classes:** `EXECUTED`, `RESEARCH_PATTERN`, `ENGINEERING_INFERENCE`, `RESEARCH_HYPOTHESIS`, `UNVERIFIED` — see [commit rules](https://github.com/lifestyle3nergy-web/engineering-intelligence/blob/main/COMMIT-RULES.md).
- **Operational outcomes:** validation, evidence readiness, hold, and human admission are separate decisions. A passing check does not grant admission.

Use `UNKNOWN` for unknown information. Do not treat inaccessible as absent,
skipped as passed, validated as admitted, or a stale SHA as current evidence.

## Resilience principles

- Prefer durable improvements over short-lived throughput gains.
- Measure more than one dimension: correctness, provenance, compatibility,
  recoverability, resource use, and operational cost.
- Apply hard holds for unauthorized actions, identity mismatches, invalid
  contracts, provenance failures, or missing required human approval.
- Preserve historical records; correct them through traceable revisions rather
  than silently rewriting the past.
- Revalidate after changes to the source, contract, dependency, or target revision.

## Research horizon

The atlas separates historical evidence from the 2027–2080 research horizon.
Future scenarios are hypotheses, not forecasts or implementation commitments.

## Publication and freshness

This site is built from the repository's `main` branch. Unmerged branches and
draft pull requests are proposals, not published state. Every operational claim
must be checked against its source repository and exact revision.

[Open the source repository](https://github.com/lifestyle3nergy-web/engineering-intelligence)
