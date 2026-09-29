# EPR-019 · Enforce schema validation at every agent execution boundary

**Status:** Open
**Opened:** 2026-09-29
**Motivates:** `lifestyle3nergy-web/twgt-schema-gate`
**Depends on:** EPR-001 through EPR-017 (`wiki.md` §3)
**Last reviewed:** 2026-09-29

## Constraint

A governed agentic system cannot be audited from logs alone. It must be auditable from artifacts that carry their own shape. The shape of an input, an output, a refusal, and the metadata binding a decision to the agent must be declared, published, and verified at the boundary.

Without this, three things become impossible:

1. **Refusal** — an agent cannot refuse input it cannot recognize.
2. **Replay** — a recorded action cannot be re-evaluated against the contract in force when it happened.
3. **Attestation** — a downstream system cannot independently confirm what was received.

The constraint is not "add validation." It is: **make the boundary explicit enough that a third party can reconstruct, from the artifacts alone, what shape the system was obligated to accept and what shape it actually received.**

## Historical evidence

### Historical fact

Precedents are carried in `wiki.md` §3, EPR-001 through EPR-017. Boundary specifications in earlier disciplines succeeded when published as immutable versioned artifacts and failed when held as conventions.

### Implementation evidence

`lifestyle3nergy-web/twgt-schema-gate` implements this EPR:

- Canonical registry at `schemas/registry.json`, eight v1 schemas with absolute `$id`s under `https://lifestyle3nergy-web.github.io/twgt-schema-gate/schemas/v1/...`.
- Contract-test harness at `contract-tests/` running Node and Python in parallel, 16 fixtures (one valid, one invalid, per schema).
- Fail-closed admission at `contract-tests/lib/jsonschema-mini.mjs`, same verdict under either runtime.
- CI at `.github/workflows/ci.yml`, two implemented required checks: `registry-integrity` and `schema-fixtures`.
- Pin file at `twgt-bridge/pins/twgt-schema-gate.json` binding the registry to commit `93fcb3bcba49caea3a1f6d0558142209d8053255` with SHA256 hashes for every schema file.

### Measured result

- `registry-integrity` passes under both Node and Python with identical output, verified on branch `m2-schema-registry` and on `main` after merge.
- `schema-fixtures` passes 16 of 16 fixtures under Node and, on CI, under Python with the real `jsonschema` library against a local `referencing.Registry`.
- `twgt-bridge` read-only harvest verified the pinned registry against `93fcb3b` and returned `ADMITTED`. Evidence file on `evidence/auto`, commit `2a331ea`.
- `twgt-bridge` fail-closed test suite passes 22 of 22 tests.

### Engineering inference

Two independent validators implementing the same specification diverge in ways that only matter at the boundary. A pattern-narrowed hash field that Node accepted but the fixture generator could not produce was caught only because Python's `jsonschema` was strict about it. A `$ref` that resolved locally under Node resolved remotely under Python and returned 404.

These are the exact class of drift EPR-019 exists to make visible before an agent acts on it. A single-runtime validation approach would have shipped the registry and discovered the drift when an agent behaved differently in production.

### Research hypothesis

> Governed agentic systems that publish boundary contracts as immutable, versioned, machine-checkable artifacts will exhibit materially lower rates of undetected divergence in production than equivalent systems that treat validation as an implementation concern of the agent itself.

No measured outcome yet. Cannot become policy until measurement exists.

## Transfer to TWGT

### 1. Canonical registry — Closed

`schemas/registry.json` lists every schema by `$id` with absolute URL. Versioned. A breaking change produces a new `v2/`, not a mutation.

### 2. Schema publication via Pages — Committed

`.github/workflows/pages.yml` on `main`.

### 3. Contract-test harness with dual-runtime parity — Closed

Node and Python must reach the same verdict on every fixture. Fixtures generated from schemas, not hand-written.

### 4. Fail-closed CI — Closed for M2

`registry-integrity` and `schema-fixtures` implemented. Five remaining check names are M3 through M7 stubs. Every check returns HELD on failure, including network errors, missing fixtures, unknown schema versions. No "skipped = pass."

### 5. External pin — Closed

`twgt-bridge/pins/twgt-schema-gate.json`. A change to any schema at `main` without a corresponding pin update is an unverified change.

### 6. Versioned release — Open

`twgt-schema-gate` tagged `v0.1.0`, signed. Created only after this EPR is referenced from `governance/README.md`.

## Sources

1. **Primary** — `lifestyle3nergy-web/twgt-schema-gate` (implementation).
2. **Manufacturer documentation** — JSON Schema draft-07 specification.
3. **Peer review** — not yet assembled.
4. **Engineering press** — not yet assembled.
5. **Community recollection** — not yet assembled.

**Open requirement:** Before this EPR can close, every `historical fact` claim must have a source at level 1, 2, or 3.

## Completion criteria

Closed when all of:

1. Registry published at `$id` URLs without auth.
2. `registry-integrity` and `schema-fixtures` required on `main` and passing under Node and Python on every merge.
3. External pin re-verified on schedule.
4. Tag `v0.1.0` signed, public half committed under `governance/`.
5. `governance/README.md` cites this EPR by number and URL.
6. Every `historical fact` claim has a level 1–3 source.

Criteria 1, 2, 3 closed. 4, 5, 6 open.

## Revision history

- 2026-09-29 — Initial draft against `twgt-schema-gate` after M2 merged at `93fcb3b` and `twgt-bridge` created at `f588cbb`.
