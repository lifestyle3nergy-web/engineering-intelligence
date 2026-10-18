# ADR-0023: Freeze CapabilityRecord

## Status
Proposed

## Context
Capabilities (tools, external services, or internal components) must be formally registered before they can be admitted into the system. This ADR freezes the CapabilityRecord structure to ensure that every capability is traceable to a specific source, constrained by a contract, and pinned to an immutable version.

## Decision
The CapabilityRecord structure is frozen with the following required fields:
- `record_id` (string, UUIDv4, required): Unique identifier for the record.
- `timestamp` (string, ISO8601, required): Time of registration.
- `name` (string, required): Human-readable name of the capability.
- `source_type` (enum, required): One of `REPO`, `TOOL`, `SERVICE`.
- `source_locator` (string, URI, required): The location of the capability (e.g., GitHub repo URL, Docker image, API endpoint).
- `contract_schema` (string, URI, required): Reference to the schema that defines the capability's inputs and outputs.
- `version_pin` (string, required): The exact version, commit SHA, or digest of the capability.
- `authority_grant` (string, required): The scope of authority granted to this capability (e.g., `READ_ONLY`, `WRITE_EVIDENCE`).

Optional fields:
- `description` (string): Detailed explanation of the capability.
- `supersedes` (string): ID of a previous CapabilityRecord this replaces.

## Consequences
The CapabilityRecord schema will be codified in `twgt-schema-gate` during Phase C. All external integrations (Phase F) must generate a CapabilityRecord. Any changes to the capability's contract or authority require a superseding record.
