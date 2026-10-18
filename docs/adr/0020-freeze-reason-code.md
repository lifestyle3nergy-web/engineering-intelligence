# ADR-0020: Freeze ReasonCode Enumeration

## Status
Proposed

## Context
We require a closed, versioned set of reason codes to represent the outcome of admission decisions, evidence validation, and capability execution. Currently, these are ad-hoc strings. This ADR freezes the enumeration to prevent schema drift and ensure machine-readable interoperability across TWGT- and the application-family repos.

## Decision
The ReasonCode enumeration is frozen as a closed set. No wildcards are permitted. The initial version is v1.0.0 and includes the following codes:
- `GATE_PASS`
- `HOLD_MISSING_EVIDENCE`
- `HOLD_INVALID_SIGNATURE`
- `HOLD_EXPIRED`
- `HOLD_QUARANTINED`
- `HOLD_UNAUTHORIZED_ACTOR`
- `REJECT_SCHEMA_MISMATCH`
- `REJECT_DIGEST_MISMATCH`
- `REJECT_INDEPENDENCE_VIOLATION`

## Consequences
Any new reason code requires a superseding ADR. `twgt-schema-gate` will enforce this enumeration in Phase C. Existing ad-hoc strings in `twgt-bridge` and `TWGT-` must be migrated to these codes.
