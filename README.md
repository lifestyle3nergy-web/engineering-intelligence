# Engineering Intelligence

Engineering Intelligence is the evidence and governance reference repository for
the TWGT ecosystem. It maintains the Internet Engineering Evolution Atlas,
Engineering Problem Records (EPRs), organisation-wide ADR allocation, and
cross-repository governance references.

Its purpose is to explain why engineering solutions exist, what evidence
supports them, where their assumptions fail, and what must be verified before
they are reused.

**It is not the TWGT runtime, a general-purpose agent host, or an independent
runtime-admission authority.**

## Published site

- [Engineering Intelligence home](https://lifestyle3nergy-web.github.io/engineering-intelligence/)
- [Internet Engineering Evolution Atlas](https://lifestyle3nergy-web.github.io/engineering-intelligence/atlas/)
- [Source repository](https://github.com/lifestyle3nergy-web/engineering-intelligence)

## Repository contents

- `index.md` — site landing page and responsibility map.
- `wiki.md` — historical Internet Engineering Evolution Atlas.
- `epr/` — individual Engineering Problem Records.
- `governance/adr-registry.json` — organisation-wide ADR allocation data.
- `governance/adr-registry.schema.json` — registry structure contract.
- `governance/evidence-policy.md` — record classes and evidence boundary.
- `policy/` — ADR numbering, evaluation, authorization, and preflight policy.
- `docs/adr/` — long-form decisions owned by this repository.
- `capabilities/` — capability catalogue and candidate records.
- `foundations/`, `integrations/`, and `reference/` — supporting research and boundary references.
- `assets/wiki.css` — stylesheet for the published documentation.
- `.github/workflows/pages.yml` — Pages build and deployment workflow.

## Authority and repository ownership

| Repository | Responsibility | Boundary |
| --- | --- | --- |
| [engineering-intelligence](https://github.com/lifestyle3nergy-web/engineering-intelligence) | Central ADR allocation, evidence atlas, EPRs, governance references | Does not grant runtime admission |
| [TWGT-](https://github.com/lifestyle3nergy-web/TWGT-) | Runtime and admission consumer | Owns runtime-facing execution and admission decisions |
| [twgt-schema-gate](https://github.com/lifestyle3nergy-web/twgt-schema-gate) | Shared schemas and contract validation | Validation is not authorization |
| [twgt-bridge](https://github.com/lifestyle3nergy-web/twgt-bridge) | Evidence collection and verification | Evidence-only; no merge or admission authority |
| `twgt-knowledge` (private) | Derived knowledge service | Inherits from this repository; does not independently allocate ADRs or override governance |
| [AI-OS](https://github.com/lifestyle3nergy-web/AI-OS) | Workflow orchestration | Does not own TWGT policy or admission |
| [AI-OS-CM](https://github.com/lifestyle3nergy-web/AI-OS-CM) | AI-OS management surface | Does not confer authorization |
| [twgt-git-hitl](https://github.com/lifestyle3nergy-web/twgt-git-hitl) | Human review boundary | Human decision interface; policy remains separately governed |
| [router-cli](https://github.com/lifestyle3nergy-web/router-cli) | Command routing | Dispatch only |
| [twgt-device-node](https://github.com/lifestyle3nergy-web/twgt-device-node) | Device/edge integration | Resource- and capability-bounded execution |
| [Intelligent-Nexus](https://github.com/lifestyle3nergy-web/Intelligent-Nexus) | Intelligence/inference integration | Inference is not evidence or authorization |
| [Swarm-Mind-Console](https://github.com/lifestyle3nergy-web/Swarm-Mind-Console) | Operator visibility and collaboration | Visibility is not a source of truth |

This table is the intended responsibility map. It does not certify that every
listed capability is implemented or deployed. Verify each repository's current
manifest, permissions, version, and exact commit before treating it as observed
state.

## ADR allocation and ownership

The central registry allocates organisation-wide ADR numbers and records their
repository, slug, pull request, lifecycle metadata, and provenance. The long-form
ADR belongs in the repository that owns the decision. These are separate concerns:

- Registry allocation is centralised in
  `governance/adr-registry.json`.
- The decision-owning repository maintains its long-form record under
  `docs/adr/`.
- A PR being merged does not, by itself, prove that the decision is accepted or
  that a capability is admitted.
- Number collisions, supersession, and historical renumbering require traceable
  registry changes; do not infer disposition from a filename alone.

See [ADR numbering policy](policy/ADR-numbering-policy.md).

## Evidence discipline

The repository distinguishes record classes from commit-claim classes:

- Record classes: `FACT`, `STATE`, `GATE`, `ACTION` — see
  [evidence policy](governance/evidence-policy.md).
- Commit claims: `EXECUTED`, `RESEARCH_PATTERN`,
  `ENGINEERING_INFERENCE`, `RESEARCH_HYPOTHESIS`, `UNVERIFIED` — see
  [commit rules](COMMIT-RULES.md).

Unknown, inaccessible, inferred, and unverified states remain distinct.
Evidence does not grant authority. Human review is required wherever the
governing policy requires it.

## Contributing

Preserve provenance and historical context. Do not promote a hypothesis to a
fact, a successful validation to admission, or an unmerged branch to published
state. Every change should identify its scope, source, validation evidence, and
remaining limitations.
