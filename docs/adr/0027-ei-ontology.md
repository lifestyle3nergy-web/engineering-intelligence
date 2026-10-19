# ADR-0027 — Engineering-Intelligence Ontology

**Status:** Proposed — design choices confirmed; implementation and formal admission pending
**Decision date:** 2026-10-19
**Scope:** `engineering-intelligence` and `twgt-schema-gate`

## 1. Context

TWGT currently maintains two separate conceptual universes. The `twgt-schema-gate` repository defines ten structural Phase B schemas (records, matrices, and codes) that govern machine-readable evidence. The `engineering-intelligence` repository holds organizational artifacts (ADRs, EPRs, candidates) that document decisions and proposals. 

There is no formal ontology bridging these domains. The relationships between an organizational decision and a structural record (for example, an ADR that defines a schema, or a candidate that proposes a capability) are currently implicit in prose. This ambiguity risks conflating proposals with authority, or assuming a record reference confers admission.

ADR-0027 establishes a descriptive ontology to define the named entity types across both domains and the precise semantics of their relationships. It is a conceptual design; it does not implement validation, nor does it confer admission authority.

## 2. Evidence and verification boundaries

Source labels used below:
- **[Session evidence]** — terminal output or observations reported during this review session.
- **[Open]** — a matter that remains unresolved.

### 2.1 Structural entities
**[Session evidence]** `twgt-schema-gate/schemas/v1/common/` contains the following 10 schema files:
- `admission-record.json`
- `authority-matrix.json`
- `capability-record.json`
- `evaluation-record.json`
- `evidence-reason-code.json`
- `evidence-record.json`
- `policy-decision.json`
- `provenance.json`
- `reason-code.json`
- `trace-context.json`

These represent the structural entities of the system.

### 2.2 Organizational entities
**[Session evidence]** `engineering-intelligence` contains:
- `docs/adr/` (Architecture Decision Records, e.g., ADR-0026)
- `epr/` (Engineering Pattern Records, e.g., EPR-019)
- `capabilities/CANDIDATES.md` (Capability candidates)

### 2.3 Prior ontological work
**[Session evidence]** A grep for "ontology", "entity", and "relationship" across both repositories returned no existing formal ontology files. The concepts are scattered across governance documents but not formally unified.

## 3. Decisions

### D1 — Adopt a two-domain model
The ontology is divided into two domains:
- **Structural:** The 10 Phase B record types.
- **Organizational:** ADRs, EPRs, and CapabilityCandidates.

The ontology defines the concepts and their relationships. It does not duplicate the JSON schemas themselves.

### D2 — Classify entity types accurately
The ontology will not assume every schema-defined file is an independently identifiable real-world entity. Entities are classified as:
- **Records:** `AdmissionRecord`, `CapabilityRecord`, `EvaluationRecord`, `EvidenceRecord`, `PolicyDecision`, `TraceContext`, `Provenance`, `AuthorityMatrix`.
- **Controlled Vocabularies:** `ReasonCode`, `EvidenceReasonCode` are classification values used *by* records, not standalone real-world entities.
- **Organizational Artifacts:** `ADR`, `EPR`, `CapabilityCandidate`.

### D3 — Distinguish relationship semantics
Every relationship in the ontology must declare its precise semantic category:
1. **Structural Reference:** A record points to another record (e.g., `AdmissionRecord` cites `EvidenceRecord`).
2. **Governance Definition:** An ADR documents or freezes a schema contract.
3. **Proposal/Mapping:** A `CapabilityCandidate` proposes a `CapabilityRecord`.

### D4 — Separate proposal mapping from admission authority
A relationship from `CapabilityCandidate` to `CapabilityRecord` means *only* that the candidate proposes or maps to the capability. It does **not** imply admission, activation, or authorization. 

Similarly, an `AdmissionRecord` referencing a `CapabilityRecord` does not create the authority to admit it. The ontology describes the structural links; it does not grant authority that the underlying governance rules (e.g., ADR-0024 Authority Matrix) do not provide.

### D5 — Defer machine-readable implementation
This ADR freezes the conceptual design and relationship definitions in Markdown. The implementation of a machine-readable ontology (e.g., `ontology.json` with deterministic mappings to the actual Phase B schemas) is deferred to a follow-up PR.

## 4. Consequences

### Positive
- Provides a shared vocabulary for structural records and organizational artifacts.
- Prevents the conflation of a candidate mapping with actual admission authority.
- Clarifies that controlled vocabularies (ReasonCodes) are distinct from record entities.
- Establishes a foundation for future machine-readable graph validation.

### Costs and risks
- The Markdown representation is descriptive and not machine-enforceable until the follow-up implementation.
- Maintaining the ontology requires discipline; new schemas or artifacts must be added to the conceptual map.

## 5. Open items and explicit uncertainty

1. **Machine-readable representation:** The exact schema for `ontology.json`, its validation rules, and how it maps to the Phase B schemas remain undefined.
2. **Versioning:** How changes to the ontology (e.g., adding a new record type) are versioned and governed.
3. **Verification tooling:** Whether a script will eventually verify that every schema file has a corresponding ontology entry, or that relationships conform to semantic categories.
