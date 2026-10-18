# ADR-0022: Freeze EvidenceRecord

## Status
Proposed

## Context
Admission decisions must be backed by verifiable evidence. Currently, evidence is cited ad-hoc. This ADR freezes the EvidenceRecord structure to ensure that every claim can be traced to a source, verified by a cryptographic digest, and attributed to a reviewer.

## Decision
The EvidenceRecord structure is frozen with the following required fields:
- `record_id` (string, UUIDv4, required): Unique identifier for the record.
- `timestamp` (string, ISO8601, required): Time the evidence was collected.
- `source` (string, URI, required): The origin of the evidence (e.g., git commit, CI run URL, external API).
- `digest` (string, required): Cryptographic hash (SHA-256) of the evidence payload.
- `provenance` (string, required): How the evidence was generated (e.g., 'tool:grype', 'human:review').
- `reviewer` (string, required): The identity of the person or system that verified the evidence.

Optional fields:
- `payload` (object): The actual evidence content, if small enough to inline (otherwise referenced by URI).
- `signature` (string): Cryptographic signature of the reviewer.

## Consequences
The EvidenceRecord schema will be codified in `twgt-schema-gate` during Phase C. `twgt-bridge` must emit this structure. AdmissionRecords will reference these via `evidence_ids`. Any additions require a superseding ADR.
