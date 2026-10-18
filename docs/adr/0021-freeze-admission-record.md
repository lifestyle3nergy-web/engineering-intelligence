# ADR-0021: Freeze AdmissionRecord

## Status
Proposed

## Context
Admission decisions must be recorded in a machine-readable, immutable format. Currently, the structure of these records is not standardized, leading to inconsistencies across pipelines. This ADR freezes the AdmissionRecord structure to ensure interoperability, auditability, and machine validation.

## Decision
The AdmissionRecord structure is frozen with the following required fields:
- `record_id` (string, UUIDv4, required): Unique identifier for the record.
- `timestamp` (string, ISO8601, required): Time of admission decision.
- `actor` (string, required): The authorized identity making the decision.
- `capability` (CapabilityRecord, required): The capability being admitted.
- `boundary` (string, required): The repository or system boundary the capability is entering.
- `decision` (ReasonCode, required): The outcome from the frozen ReasonCode set.
- `evidence_ids` (array of strings, required): References to EvidenceRecords used in the decision.
- `signature` (string, required): Cryptographic signature of the actor over the record.

Optional fields:
- `comments` (string): Human-readable justification.
- `supersedes` (string): ID of a previous AdmissionRecord this replaces.

## Consequences
The AdmissionRecord schema will be codified in `twgt-schema-gate` during Phase C. The `twgt-bridge` and `TWGT-` must conform to this schema when emitting or consuming admission records. Any additions require a superseding ADR.
