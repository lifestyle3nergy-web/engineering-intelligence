# EPR-020 · Treat runtime evidence as a versioned contract

**Status:** Open  
**Opened:** 2026-09-29  
**Relates to:** EPR-019  
**Implements:** twgt-schema-gate + twgt-bridge integration

## Constraint

A runtime test is not independently auditable if its evidence can disappear, change shape, or be accepted without proving that the artifact matches the contract that produced the verdict.

The system therefore needs two separate boundaries:

1. the behavior boundary — the runtime test produces the observed result;
2. the evidence boundary — the result is serialized into a versioned, machine-checkable artifact and is fail-closed if that artifact cannot be validated.

A green workflow step is not a substitute for either boundary.

## Implementation

### Schema gate

lifestyle3nergy-web/twgt-schema-gate publishes the canonical evidence-batch schema under schemas/v1/evidence-batch.json and registers it in schemas/registry.json.

### Bridge

lifestyle3nergy-web/twgt-bridge pins the schema commit and SHA256 values, validates the collected evidence shape before admission, and retains its read-only source boundary.

### Engineering intelligence

This EPR records the transfer principle so future runtime tests can use the same contract instead of inventing another evidence format.

## Evidence classes

- Implementation evidence: schema and bridge code.
- Measured result: only a successful CI run that produces and validates the complete artifact.
- Engineering inference: durable evidence should be treated as a first-class interface between execution and review.
- Research hypothesis: explicit evidence contracts reduce silent divergence between runtime verdicts and reviewable artifacts.

No causal performance or reliability improvement is claimed until measured.

## Failure modes

| Failure | Required state |
|---|---|
| Missing evidence artifact | HELD |
| Schema hash mismatch | HELD |
| Evidence shape invalid | HELD |
| Runtime assertion contradicts artifact | REVIEW |
| Runtime passes and artifact validates | VALIDATED/ADMITTED according to the consuming workflow |

## Transfer rule

Never promote a workflow conclusion into a durable engineering fact without preserving the underlying artifact and its exact contract version.

## Completion criteria

1. Schema gate publishes the evidence contract.
2. Bridge pins and verifies the contract.
3. Bridge rejects malformed evidence.
4. A runtime workflow uploads the evidence artifact with if-no-files-found: error.
5. A downstream reviewer can reconstruct the verdict from the artifact alone.
