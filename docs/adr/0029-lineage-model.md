ADR-0029 — Lineage Model

Status: Proposed — design choices confirmed; implementation pending
Decision date: 2026-10-20
Scope: twgt-schema-gate

1. Context

The Phase B schemas are designed to be immutable. While trace-context.json models execution lineage via parent_span_id, the system lacks a formal model for data lineage—how one record derives from another. Without this, we cannot verify that an EvaluationRecord was generated using the correct inputs, nor can we ensure that the graph of evidence remains acyclic.

2. Evidence and verification boundaries

[Session evidence]

· trace-context.json defines trace_id, span_id, and optional parent_span_id for execution tracing.
· evidence-record.json binds its batch and decision using payload_hash (SHA-256), but does not link to external records.
· A grep for "lineage", "derive", or "dag" returned no existing schema definitions.

3. Decisions

D1 — Distinguish Execution from Data Lineage

Execution lineage (tracing the flow of a process) is already satisfied by trace-context.json. Data lineage (tracing the derivation of an artifact) requires a separate mechanism.

D2 — Implement Data Lineage as a separate schema

Introduce lineage-record.json as a new schema. It will not modify the frozen Phase B schemas. Instead, it will act as a wrapping manifest that references the hashes of the parent and child artifacts.

D3 — Use Cryptographic Hashing to Enforce a Cycle-Free DAG

The lineage record will use the artifact_hash (SHA-256) to link parent and child records. A Directed Acyclic Graph (DAG) is guaranteed by the properties of cryptographic hashing:

· If Record B is derived from Record A, Record B's lineage manifest will include A's hash.
· A cycle would require Record A to be finalized and hashed before Record B, while simultaneously requiring Record B to be finalized and hashed before Record A. This is computationally infeasible without a SHA-256 collision.

D4 — Lineage Structure

The lineage-record.json will define:

· artifact_hash: The hash of the current record.
· derived_from: An array of parent artifact_hash values.
· derivation_type: An enum (e.g., EVALUATION, AGGREGATION, TRANSFORMATION).

4. Consequences

Positive

· Formalizes data lineage without breaking existing schema versions.
· Cryptographically enforces the DAG (cycle-free) requirement.
· Allows consumers to verify the exact provenance of an evaluation.

Costs and risks

· The lineage-record.json must be generated alongside the EvidenceRecord by twgt-bridge.
· Verifying the full graph requires tooling that can traverse the hashes.

5. Open items and explicit uncertainty

1. Aggregation: How will lineage-record.json handle a merge (where one child derives from multiple parents)? The derived_from array supports this, but the tooling to verify it needs to be built.
2. Storage: Where are lineage records stored? Alongside the evidence/*.json files, or in a separate lineage/*.json directory?
