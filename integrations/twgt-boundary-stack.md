# TWGT Boundary Stack

**Status:** Implementation map  
**Date:** 2026-09-29

## Flow

Source repositories
→ GitHub Actions runtime execution
→ runtime evidence artifact
→ twgt-bridge read-only collection
→ pinned schema verification
→ evidence admission
→ engineering-intelligence EPR / durable knowledge

## Responsibilities

| Component | Responsibility | Authority boundary |
|---|---|---|
| twgt-schema-gate | Publish machine-checkable boundary contracts | No runtime control |
| twgt-bridge | Collect and verify evidence | Read-only against source repos; no merge authority |
| engineering-intelligence | Preserve engineering lessons and evidence rules | Reference/knowledge layer; no automatic policy enforcement |

## State model

OBSERVED → COLLECTED → VALIDATED → ADMITTED

Any missing, stale, contradictory, or unverifiable evidence becomes HELD or REVIEW; it does not become a silent PASS.

## Current implementation references

- Schema contract: twgt-schema-gate/schemas/v1/evidence-batch.json
- Registry: twgt-schema-gate/schemas/registry.json
- Bridge admission: twgt-bridge/lib/admission.mjs
- Bridge contract guard: twgt-bridge/lib/evidence-contract.mjs
- EPR-019: schema validation at agent boundaries
- EPR-020: runtime evidence as a contract

## Boundary rule

A workflow result and its artifact are separate evidence sources. The workflow result says what the runner concluded. The artifact says what was actually recorded. Review requires both where the rubric depends on artifact content.
