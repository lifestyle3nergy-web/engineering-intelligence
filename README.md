# Engineering Intelligence

Reference library for evidence-bounded engineering knowledge.

The atlas connects historical engineering constraints, implementation evidence, operational failures, and transfer hypotheses. It does not turn inference into fact.

## Active boundary stack

The current TWGT implementation is documented in:

- epr/EPR-019-schema-validation-at-agent-boundaries.md
- epr/EPR-020-evidence-as-a-contract.md
- integrations/twgt-boundary-stack.md

The stack separates execution, evidence collection, validation, and durable engineering knowledge.

## Sibling repositories

- `twgt-schema-gate` — implements EPR-019. Boundary schemas, dual-runtime contract tests, published registry.
- `twgt-bridge` — read-only evidence collector. Verifies schema-gate against pinned SHAs. Publishes evidence to its own branch, never to main.

## Evidence discipline

Every claim in this library is labelled: historical fact, implementation evidence, measured result, engineering inference, research hypothesis, unverified. A statement that is not labelled is not a claim.

See `wiki.md` §2 for the full method.
