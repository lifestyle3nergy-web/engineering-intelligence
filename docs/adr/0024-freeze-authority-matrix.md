# ADR-0024: Freeze Authority Matrix

## Status
Proposed

## Context
The ecosystem spans multiple repositories with distinct roles (first-party governance, application family, evidence collectors). We must formally define the authorization boundaries: who can write ADRs, who can emit evidence, and who holds admission authority.

## Decision
The Authority Matrix is frozen with the following rules:
- **ADR Allocation Authority**: Only `engineering-intelligence` may allocate and freeze ADR numbers.
- **Admission Authority**: Only `TWGT-` and `engineering-intelligence` may hold AdmissionRecords. Application-family repos (AI-OS, sasa, etc.) may only *request* admission.
- **Evidence Emission**: `twgt-bridge` is the only entity authorized to emit canonical EvidenceRecords. It operates in `READ_ONLY` mode and cannot merge or admit.
- **Schema Authority**: `twgt-schema-gate` owns the canonical boundary schemas. No other repo may introduce schema fields without a frozen ADR.
- **Application-Family Integration**: Application-family repos consume CapabilityRecords but never emit them.

## Consequences
This matrix will be codified into `twgt-schema-gate` as `authority-matrix.schema.json` during Phase C. Any attempt by an application-family repo to admit a capability directly must be rejected by the Phase G Admission pipeline.
