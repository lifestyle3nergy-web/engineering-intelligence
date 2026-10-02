# EPR-021 · Boundary hardening for agent-authored changes

**Status:** Open
**Opened:** 2026-10-03
**Relates to:** EPR-019, EPR-020
**Motivates:** `policy/Allowlist-policy.md`, `policy/evaluation-policy.md`

## Constraint

EPR-019 defines what shape a valid boundary contract takes. EPR-020
defines how evidence is versioned. Neither names **who may produce a
change** or **how a change is judged**.

Without a written authorization layer and a written constraint layer,
"human retains admission authority" is aspirational. It depends on
every operator remembering the rule. Memory is not a boundary.

## Historical evidence

### Historical fact

Access-control systems share one property: policy is a first-class
artifact, not a convention. Multics ring protection, SELinux policy
files, AWS IAM policy JSON. Systems that encode authority in written
policy survive operator turnover. Systems that rely on convention do
not. (Specific systems to be sourced per `wiki.md` §2.3 before this
section leaves `historical fact`.)

### Implementation evidence

`engineering-intelligence` holds EPR-019, EPR-020, the foundation
record, `governance/evidence-policy.md`, and `integrations/twgt-boundary-stack.md`.
None names an authorized actor, a writable path set, or a verdict
vocabulary.

`twgt-schema-gate` has four CI stubs (M4–M7) that fail closed by
design. There is no policy file for them to consult.

`twgt-bridge` admission semantics settled as bridge-scoped (D1 = Gen 2,
2026-10-02). The separation between bridge-scoped ADMITTED and human
admission is documented but not policy-enforced.

### Engineering inference

The absent artifact is the one that turns doctrine into a check CI can
run. Two files are load-bearing: an authorization list and an
evaluation policy. Both must be human-only writable. Both must live in
a repo the automated actor cannot push to.

## Transfer to TWGT

### 1. `policy/Allowlist-policy.md` — **this PR**
### 2. `policy/evaluation-policy.md` — **this PR**
### 3. CI reads both files, emits a verdict on every PR — not started
### 4. `twgt-schema-gate` and `twgt-bridge` cite EPR-021 — open

## Completion criteria

1. Both policy files on `main` under `policy/`.
2. `CODEOWNERS` names both files, human-only.
3. CI reads both files and produces a verdict on every PR.
4. `twgt-schema-gate` and `twgt-bridge` each cite EPR-021.
5. First agent-authored change judged by the policy, admitted by a
   human, within one sprint.

## What this EPR is not

Not a redesign. It is the materialization of Gap 1 from the 2026-10-02
blueprint: "evaluation-policy.md NOT FOUND. Allowlist-policy.md NOT
FOUND." It is the first concrete response to that gap.

## Sources

1. **Primary** — `lifestyle3nergy-web/engineering-intelligence` at
   commit `6f488b5` (2026-10-03).
2. **Related** — `twgt-schema-gate` M1–M3 merged; `twgt-bridge` Gen 2
   admission, PR #7 merged.
3. **Historical** — access-control literature; specific systems cited
   before promotion past `historical fact`.
