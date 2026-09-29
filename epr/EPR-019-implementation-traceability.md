# EPR-019 implementation traceability

**Status:** Traceability plan; implementation evidence not yet independently verified.
**Source:** [EPR-019](EPR-019-schema-validation-at-agent-boundaries.md)

## Requirement-to-evidence map

| EPR-019 requirement | Intended implementation location | Verification evidence | Current status |
|---|---|---|---|
| Canonical, versioned schema registry | `twgt-schema-gate/schemas/registry.json` and `schemas/v1/` | Registry-integrity checks and pinned SHA256 manifest | Existing artifacts identified; exact-head revalidation pending |
| Valid and invalid contract fixtures | `twgt-schema-gate/contract-tests/fixtures/` | Node and Python fixture runner output | Harness exists; current run not performed here |
| Fail-closed admission on missing or invalid evidence | `twgt-bridge/lib/admission.mjs` and schema verifier integration | Negative tests for absent, malformed, stale, and mismatched evidence | Integration not yet implemented or verified |
| Immutable source binding | `twgt-bridge/pins/twgt-schema-gate.json` | SHA256 verification at pinned commit | Pin exists; refresh requires reviewed human action |
| CI exact-head validation | Each repository's CI and governance workflows | Exact SHA, workflow URLs, required checks and approval | Pending new implementation PRs and CI execution |
| Human release authority | Repository governance and code-owner review | Recorded approval for exact head | Not delegated to agents or collectors |

## Evidence classification

- **Observed:** repository files and default-branch trees were retrieved during the current inspection.
- **Not observed:** local test execution, new implementation commits, exact-head workflow results, merge approval, or deployment.
- **Decision:** do not close EPR-019 or claim release readiness until each completion criterion is supported by current evidence.

## Change control

Update this map only when the referenced implementation and test artifacts exist at a known commit. Record the commit SHA and CI run for every status transition. Inference and planned work must not be relabelled as measured results.
