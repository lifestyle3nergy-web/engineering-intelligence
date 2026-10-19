ADR-0028 — Provenance Model

Status: Proposed — design choices confirmed; implementation pending
Decision date: 2026-10-20
Scope: twgt-schema-gate

1. Context

The twgt-schema-gate repository defines provenance.json as a structural record of how an artifact was generated. However, the current schema relies on a loosely constrained producer field (any string) and lacks a formal mechanism to classify the epistemic origin of the artifact (e.g., whether it is a measured execution or an inferred pattern).

Per the handover doctrine and COMMIT-RULES.md, provenance must not be free-text, and the distinction between EXECUTED and RESEARCH_PATTERN is essential to prevent fabricated evidence. This ADR formally defines the Provenance model, extending the existing schema to constrain both the producer identity and the epistemic class.

2. Evidence and verification boundaries

[Session evidence] The current schemas/v1/common/provenance.json defines:

· artifact_hash: string, pattern: ^sha256:[0-9a-f]{64}$
· produced_at: string, format: date-time
· producer: string, minLength: 1
· source_commit: string, pattern: ^[0-9a-f]{40}$ (optional)
· signatures: array of string (optional)

The producer field permits arbitrary free-text. The schema contains no field to declare the evidence class of the provenance.

3. Decisions

D1 — Preserve structural invariants

The existing structural fields (artifact_hash, produced_at, source_commit, signatures) are sound and will remain unchanged. The artifact_hash must always be a SHA-256 hash of the payload, preserving tamper-evidence.

D2 — Constrain the producer field

To prevent free-text, the producer field will be constrained to a strict URI format or a known namespace pattern (e.g., agent:twgt-bridge, ci:github-actions, human:lifestyle3nergy-web). This ensures that the source of the artifact is unambiguously identifiable.

D3 — Introduce explicit epistemic_class

A new required field, epistemic_class, will be added to provenance.json. It will use the established evidence classes:

· EXECUTED
· RESEARCH_PATTERN
· ENGINEERING_INFERENCE
· RESEARCH_HYPOTHESIS
· UNVERIFIED

This prevents an artifact from claiming structural legitimacy (artifact_hash is valid) while carrying an unstated epistemic class.

D4 — Explicit linkage in record schemas

To ensure that a record's origin is explicit and non-optional, schemas that reference provenance (such as evidence-record.json and capability-record.json) must be updated to explicitly reference the provenance.json schema, ensuring that every record can be traced back to a constrained origin.

D5 — Version bump

Because this adds a required field (epistemic_class) and constrains producer, this is a breaking change to the provenance.json schema. The $id version will advance from v1 to v2 or the $schema content will be treated as a major version bump, requiring consumers to explicitly upgrade.

4. Consequences

Positive

· Eliminates free-text provenance by constraining producer and forcing epistemic_class.
· Directly aligns the schema with COMMIT-RULES.md rule 2.
· Makes the EI Ontology (ADR-0027) link between Structural and Organizational domains concrete.

Costs and risks

· Existing records using provenance.json will become invalid until they include epistemic_class.
· Consumers of provenance must adapt to the new producer format.

5. Open items and explicit uncertainty

1. producer Format: The exact URI scheme or regex pattern for producer (e.g., ^agent:[a-z0-9-]+$) needs to be finalized in the implementation PR.
2. Provenance Linkage: Whether evidence-record.json should embed a $ref to provenance.json directly or reference a separate artifact hash needs to be tested against the existing fixture generation.
