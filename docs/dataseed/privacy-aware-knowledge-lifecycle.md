# DataSeed — privacy-aware intelligence and knowledge lifecycle

## Operating principle

Learning and validation must produce preserved, reusable knowledge without allowing information to cross a trust boundary merely because it was collected or processed. Classification precedes governance; preservation does not imply publication or operational approval.

## Unified lifecycle

### Operational intelligence

REQUEST → INGEST → CLASSIFY → GOVERN → EXECUTE → MEASURE → VALIDATE → LEARN

- REQUEST: establish purpose, audience, objectives, and authority.
- INGEST: collect source data, repository metadata, documents, events, and evidence.
- CLASSIFY: identify source, owner, sensitivity, visibility, provenance, and intended destination.
- GOVERN: evaluate permissions, policy, retention, privacy, and publication eligibility.
- EXECUTE: perform only authorized transformations and integrations.
- MEASURE: capture outcomes, completeness, quality, and operational signals.
- VALIDATE: independently verify results against contracts and acceptance criteria.
- LEARN: record findings, defects, decisions, and corrective actions.

### Knowledge preservation

ACQUIRE → PRESERVE

Acquire useful material with provenance. Preserve source, version, integrity, classification, lineage, and retention metadata. Keep restricted knowledge in its protected storage zone.

### Knowledge application

LIBRARIES → SYSTEMS → REVIEWS → REFINE → REUSE → IMPROVE

- Libraries: approved documents, schemas, research, code references, and datasets.
- Systems: controlled databases, APIs, workflows, agents, and services.
- Reviews: independent architecture, privacy, security, quality, and operational oversight.

These destinations are connected by contracts, not uncontrolled shared write authority.

## Knowledge states

| State | Meaning | Publication consequence |
| --- | --- | --- |
| DISCOVERED | Resource identified | No publication permission |
| ACQUIRED | Resource collected | No publication permission |
| PRESERVED | Source and version retained | Retention only; classification still applies |
| CLASSIFIED | Sensitivity and ownership identified | Candidate for governance |
| VALIDATED | Evidence and quality checks passed | Not automatically approved |
| APPROVED | Authorized human review completed | Only within the approved scope |
| OPERATIONAL | Approved for intended use | Subject to runtime policy |
| DEPRECATED | Superseded or no longer recommended | Retain or dispose under policy |

## Publication and trust boundaries

1. Unknown classification is not public.
2. Private or restricted data never enters public artifacts, even as an intermediate output.
3. A filename suffix such as .private.json is not an access-control mechanism.
4. Public artifacts are generated from an explicit public allowlist.
5. Restricted data is stored outside public repositories and protected by access controls.
6. G06 independently checks public artifacts against protected inventory.
7. Validation does not grant approval; approval does not grant broader scope than authorized.
8. Preserve evidence of rejected publication attempts without copying sensitive values into logs.

## DataSeed repository alignment

- 00-governance/: policies, ownership, classification and lifecycle contracts.
- 01-request-intake/ through 08-learning/: operational intelligence stages.
- 09-acquisition/ and 10-preservation/: provenance-aware knowledge capture.
- 11-libraries/: approved reusable knowledge.
- 12-systems/: controlled operational applications.
- 13-reviews/: independent architecture, security, quality, operational reviews, and lessons learned.

## Engineering Intelligence integration

The EI repository acts as an evidence and knowledge reference, not as a private-data vault or admission authority. Repository inventory publication must follow the protected private inventory contract and G06 privacy gate. TWGT remains the separate admission authority.

Target formula:

ACQUIRE → UNDERSTAND → CLASSIFY → GOVERN → APPLY → VERIFY → PRESERVE → REUSE

The learning loop improves future decisions while preserving privacy, provenance, human accountability, and explicit publication authority.
