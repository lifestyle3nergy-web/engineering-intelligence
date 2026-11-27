# Archived recommendations and execution evidence

> **Historical snapshot — captured 5 November 2026.**
>
> This record was previously embedded in the Internet Engineering Evolution Atlas.
> It is preserved here for provenance, not as a statement of current repository
> status. The original record names repository head
> `595b73495b3b61470ba281099138f02035eb7e5c`. That SHA and all dated replay
> instructions are historical references. Revalidate every recommendation against
> the current target repository, base/head SHAs, policies, and raw execution output
> before relying on it. This archive does not grant admission or execution authority.

## 10. Recommendations execution and evidence report

**Record type:** Engineering-intelligence research and implementation-pattern record  
**Repository head observed:** `595b73495b3b61470ba281099138f02035eb7e5c`  
**Scope:** TWGT Merge Gates, #107, #117, #118, schema-gate #7, bridge #10, deterministic integrity evidence, security-candidate verification, and release-readiness replay.  
**Evidence status:** Research-derived implementation guidance. Repository-specific defects and fixes remain **UNVERIFIED** until exact-head repository-native execution produces evidence.

### 10.1 Evidence discipline

The recommendations are not admission evidence by themselves. External implementation patterns may identify a plausible repair, but TWGT requires the target repository to demonstrate the behavior under its own runtime, dependency graph, workflow, and contract.

Use these states consistently:

- **RESEARCH_PATTERN** — pattern observed in external technical material.
- **CANDIDATE_REPAIR** — proposed target-repository change.
- **EXECUTED** — change or command was actually run against the target repository.
- **EVIDENCE_READY** — deterministic evidence artifact exists and is bound to the exact candidate SHA.
- **PASS_CANDIDATE** — required validation completed successfully.
- **HOLD** — evidence is missing, stale, failed, inaccessible, or contradictory.
- **HUMAN_ADMISSION_REQUIRED** — technical evidence is sufficient for human evaluation; it is not itself admission.

**Rule:** `UNKNOWN != FALSE`, `INACCESSIBLE != ABSENT`, `SKIPPED != PASS`, and `VALIDATED != ADMITTED`.

### 10.2 Recommendations evidence matrix

| Workstream | Recommended implementation pattern | Required repository-native evidence | Current disposition |
|---|---|---|---|
| TWGT Merge Gates / Prisma | Explicit generation before consumers; generation must use the gate's declared package-manager/runtime environment | Clean-checkout generation, generated-client verification, lifecycle tests, exact-head CI | **HOLD / CANDIDATE_REPAIR** |
| #107 | Repair the Prisma execution prerequisite; do not weaken lifecycle tests | Lifecycle tests pass unchanged at exact candidate SHA | **HOLD** |
| #118 | Normalize timeout once: zero = default; negative = validation error naming the key; positive = explicit value | ADR, positive/zero/negative fixtures, startup validation failure for negative values | **HOLD** |
| #117 | ADR-to-lint bridge with a named CI step and deterministic violation output | ADR reference, named lint invocation, passing and failing fixtures, exact-head CI | **HOLD** |
| schema-gate #7 | Evidence is valid only for the exact PR head and base under evaluation | Fresh CI run, artifact/result containing candidate SHA, no head movement after evidence | **HOLD** |
| bridge #10 | Validate mapping against a frozen canonical schema version after schema-gate evidence is green | Canonical schema pin, mapping validation, exact-head result | **HOLD** |
| engineering-intelligence | Thin deterministic current-head integrity replay | Clean checkout, deterministic contract checks, head/base binding | **CANDIDATE_REPAIR** |
| Security candidates | Prefer repository-native focused verification before broader security analysis | Native tool output, frozen dependency state, exact candidate SHA, findings disposition | **HOLD** |
| Release readiness | Re-read head/base and invalidate stale evidence before each readiness decision | Thursday replay and independent Friday replay | **HOLD** |

### 10.3 TWGT Merge Gates: Prisma generation prerequisite

The implementation invariant is:

~~~
clean checkout
    ↓
lockfile-controlled install
    ↓
explicit Prisma generation
    ↓
verify generated client
    ↓
lint / typecheck
    ↓
lifecycle tests
    ↓
contract validation
    ↓
exact-head evidence
~~~

The gate must not depend on an inherited caller PATH, a previously generated client, or an undocumented shared cache.

The recommendation is **not** to assume that a missing/stale client is the present TWGT defect. First establish the failure with repository-native evidence. If generation is the actual prerequisite failure, repair the execution environment rather than modifying lifecycle-test assertions.

Acceptance criteria:

1. Generation is an explicit named gate step.
2. The command uses the repository's declared package manager and Prisma schema.
3. The generated client consumed by later steps is produced in the same clean job environment.
4. Lifecycle tests are unchanged.
5. A clean checkout reproduces the result.
6. The resulting evidence records the exact candidate SHA.

### 10.4 Timeout validation pattern — #118

Normative behavior:

| Input | Normalization | Result |
|---|---|---|
| negative | no defaulting | validation error naming the configuration key |
| zero | apply documented default | continue |
| positive | retain explicit value | continue |

The default belongs to normalization. A second use-time `> 0` guard must not silently convert invalid negative input into a default.

Failure-negative acceptance test:

~~~
configured timeout = -1
        ↓
startup validation
        ↓
FAIL
        ↓
error identifies timeout key
        ↓
process does not enter normal runtime
~~~

### 10.5 ADR-to-lint bridge — #117

An ADR-backed rule should have an explicit executable relationship:

~~~
ADR decision
    ↓
lint requirement
    ↓
named CI step
    ↓
deterministic violation
    ↓
fixture/test
~~~

A lint pass must not be inferred merely because another build step happened to invoke the linter. The compliance check should be discoverable as a named gate and its failure should identify the governing ADR.

### 10.6 Exact-head evidence — schema-gate #7 and bridge #10

Evidence is valid only when:

~~~
evidence.candidate_sha == current.candidate_sha
AND
evidence.base_sha == current.base_sha
AND
required_checks == PASS
AND
no required evidence is stale
~~~

If the PR head moves after evidence generation:

~~~
old evidence → STALE → HOLD
                         ↓
                    rerun validation
                         ↓
                    new evidence
~~~

Bridge validation must consume the canonical schema contract rather than reconstructing an equivalent local interpretation. The schema version/pin, candidate SHA, validation result, and provenance should be recorded together.

### 10.7 Deterministic current-head integrity pattern

The engineering-intelligence integrity harness should be deliberately small:

1. Clean checkout at the evaluated SHA.
2. Resolve the declared repository contract.
3. Replay cheap deterministic checks.
4. Record exact HEAD and BASE.
5. Record each check's conclusion.
6. Produce a stable machine-readable result.
7. Refuse to represent missing or stale evidence as success.

The harness is an **evidence producer**, not an admission authority.

### 10.8 Security-candidate verification

Repository-native verification should be layered:

~~~
candidate identification
        ↓
repository-native focused checks
        ↓
dependency / lockfile verification
        ↓
container or artifact provenance where applicable
        ↓
full required verification
        ↓
exact-head evidence
        ↓
TWGT evaluation
~~~

Examples are stack-dependent rather than mandatory global tooling:

- JS/TS: repository AST/static checks and lockfile-aware dependency auditing.
- Python: frozen dependency audit where the repository supports it.
- Containers: immutable digest and signing/provenance verification where applicable.
- Runtime-facing candidates: focused input-to-sink, process, outbound-request, redirect, and authorization-path tests where relevant.

A generic external scanner finding is not automatically a repository-native failure; conversely, absence of an external finding does not establish security.

## 11. Concurrency implementation patterns

Concurrency is treated as a constrained control problem, not simply as a request to increase worker count.

### 11.1 Bounded concurrency

Define a hard concurrency budget:

~~~
active_work <= concurrency_limit
~~~

The limit should be applied at the narrowest resource boundary that can become saturated: CPU, memory, database connections, network requests, accelerator capacity, file descriptors, or downstream API quotas.

**Failure mode:** increasing parallel workers can increase queueing, memory pressure, retry storms, downstream saturation, and tail latency.

### 11.2 Backpressure

Producers must be able to observe consumer saturation.

Required behavior:

~~~
capacity available → admit
capacity exhausted → queue / defer
queue bound exceeded → reject or shed according to policy
deadline exceeded → cancel
~~~

Backpressure must propagate instead of being hidden behind unbounded internal queues.

### 11.3 Queue discipline

Every concurrent worker pool should make these properties explicit:

- maximum queue depth;
- maximum active workers;
- work-item deadline;
- cancellation behavior;
- retry policy;
- retry budget;
- overload behavior;
- fairness policy, if multiple classes compete;
- observability for queue depth and wait time.

An unbounded queue is not a resilience strategy; it converts overload into delayed failure and memory growth.

### 11.4 Retry and concurrency coupling

Retries are additional load. The effective offered work can approximate:

~~~
effective_load = original_load × (1 + retry_fraction)
~~~

Therefore retry policy must be considered when selecting concurrency.

Use bounded retries with:

- exponential backoff where appropriate;
- jitter when many workers can retry together;
- explicit maximum attempts;
- deadline-aware cancellation;
- classification of retryable versus permanent failures.

### 11.5 Admission before execution

TWGT should evaluate whether work may enter the execution pool before consuming scarce resources.

Conceptually:

~~~
candidate
  ↓
privacy / capability / security checks
  ↓
resource admission
  ↓
concurrency budget
  ↓
execution
  ↓
observation
  ↓
validation
~~~

A worker being available does not by itself authorize the task.

### 11.6 Fairness and priority

When multiple workloads share a pool, priority must not become an implicit bypass of safety or resource limits.

Recommended ordering:

1. safety and policy eligibility;
2. hard resource limits;
3. deadline/priority among eligible work;
4. deterministic tie-break.

This preserves the admission boundary while allowing scheduling policy to optimize useful throughput.

### 11.7 Cancellation and shutdown

Cancellation must be explicit and observable. A shutdown sequence should distinguish:

~~~
accepting new work
    ↓
stop admission
    ↓
cancel/defer queued work
    ↓
allow bounded in-flight completion
    ↓
enforce shutdown deadline
    ↓
report incomplete work
~~~

This pattern directly complements #118: an invalid negative timeout must fail validation rather than being silently interpreted as an operational timeout.

### 11.8 Concurrency evidence requirements

A concurrency optimization is not accepted because throughput increased in one benchmark.

Record:

- target hardware/runtime;
- workload and request distribution;
- baseline concurrency;
- candidate concurrency;
- queue depth;
- throughput;
- mean and p95/p99 latency;
- error/retry rate;
- memory/CPU/accelerator utilization;
- energy where relevant;
- downstream saturation;
- test duration;
- warm/cold conditions;
- reproducibility procedure.

Acceptance should consider the whole operating envelope, not peak throughput alone.

## 12. Release-readiness replay protocol

### Thursday simulation

Re-read, for every release candidate:

~~~
repository
candidate PR
HEAD SHA
BASE SHA
required checks
evidence SHA
evidence age
security result
governance result
contract result
~~~

Then invalidate any evidence where HEAD or BASE has changed.

### Friday readiness

Repeat the same evaluation independently. Thursday evidence is an input to comparison, not a Friday authorization.

**Rule:** any candidate head movement between Thursday and Friday creates a new evidence requirement.

### 12.1 Evidence record shape

A release-readiness record should minimally contain:

~~~
{
  "repository": "<owner/name>",
  "candidate_sha": "<exact head>",
  "base_sha": "<exact base>",
  "checks": {},
  "evidence_state": "EVIDENCE_READY",
  "validation": "PASS_CANDIDATE",
  "admission": "HUMAN_REQUIRED"
}
~~~

The final field must not be changed to `ADMITTED` by an automated evidence collector.

## 13. Implementation boundary

This document records implementation patterns and evidence requirements. It does **not** establish that TWGT #107, #117, #118, schema-gate #7, or bridge #10 currently exhibit the described defects.

Repository-native implementation remains a separate change set. Each repair should be isolated, tested at its exact candidate SHA, independently reviewed, and only then considered for TWGT evaluation.

**Current engineering-intelligence status:** the recommendations have been incorporated as a research/evidence framework; no production admission decision is implied by this documentation change.
\n

## 14. CI/CD evidence completion and review progression

The engineering-intelligence layer supplies evidence and review structure; it does not replace repository-native CI, deployment controls, or human admission.

### 14.1 Evidence progression

```text
OBSERVE
  ↓
CLASSIFY repository / change
  ↓
CAPTURE exact HEAD + BASE
  ↓
CHECK contract + dependency/runtime state
  ↓
EXECUTE repository-native validation
  ↓
CAPTURE immutable evidence
  ↓
REVIEW independently
  ↓
TWGT evaluates
  ↓
HUMAN ADMISSION
  ↓
DEPLOY / MEASURE
  ↓
RECORD LESSON
```

Required distinction:

`IMPLEMENTATION != EXECUTION != EVIDENCE != VALIDATION != ADMISSION != MERGE != POST-MERGE MEASUREMENT`.

### 14.2 CI evidence minimum

Every candidate intended for TWGT evaluation should identify:

- repository and candidate SHA;
- base SHA;
- package manager and lockfile state;
- runtime/toolchain versions;
- required workflow checks;
- security/dependency results;
- contract/schema results;
- test/build results;
- skipped or unavailable checks;
- evidence timestamp and provenance.

A green job is evidence for that job and revision. It is not evidence that an unrelated check was executed.

### 14.3 CD evidence minimum

Release readiness requires a traceable path from artifact to environment:

```text
exact candidate SHA
  ↓
reproducible build
  ↓
artifact identity / provenance
  ↓
staging deployment
  ↓
authenticated health + smoke checks
  ↓
migration validation
  ↓
rollback readiness
  ↓
human production approval
  ↓
production deployment
  ↓
post-deployment measurement
```

If a repository only creates a release artifact and does not deploy, deployment readiness remains **UNVERIFIED**.

### 14.4 Review progression

Reviews should progress from evidence completeness to technical correctness to admission:

1. Evidence reviewer checks provenance, exact-head binding, freshness, and missing checks.
2. Technical reviewer checks implementation behavior, contracts, failure modes, and resource limits.
3. Security reviewer checks dependency/runtime/security implications where applicable.
4. Human authority decides admission, hold, rejection, or promotion.

Automated review is advisory unless explicitly designated as a repository gate.

## 15. Environmental performance and sustainability measurement

Engineering changes should be evaluated for useful work, latency, resource pressure, reliability, and energy rather than throughput alone.

### 15.1 Required measurement dimensions

| Dimension | Minimum observation | Why it matters |
|---|---|---|
| Throughput | useful work/time | capacity |
| Tail latency | p95/p99 | user and control-plane responsiveness |
| Queueing | wait time/depth | saturation and backpressure |
| CPU | steady/peak utilisation | compute efficiency |
| Memory | steady/peak footprint | edge feasibility and OOM risk |
| Accelerator | utilisation/memory where relevant | hardware efficiency |
| Energy | Wh or device-native energy measure | environmental/thermal/battery cost |
| Reliability | error/retry/cancel rate | useful output, not raw work |
| Network | bytes, connection count, transfer time | transport cost and bottlenecks |

Derived measures should include energy per successful work item and useful work per Wh where energy measurement is available.

### 15.2 Measurement integrity

Every measured result must identify target hardware, operating system, runtime, workload, baseline, candidate SHA, concurrency, duration, warm/cold state, repetitions, instrumentation, and known limitations.

Do not transfer cloud or workstation results to mobile/edge hardware without reproduction. Record thermal throttling, power mode, battery state, memory constraints, and network conditions when material.

An energy estimate must be labelled as an estimate. Wall-clock time is not an energy measurement.

### 15.3 Concurrency environmental envelope

Use controlled concurrency sweeps. Stop increasing concurrency when any hard budget is breached or material degradation appears in p99 latency, memory, errors/retries, downstream saturation, or energy per successful task.

Select the operating point from the surviving candidates rather than selecting the highest raw throughput.

## 16. Future target scorecard

The future research horizon should convert broad targets into measurable engineering hypotheses.

| Target | Constraint | Candidate measure | Evidence needed |
|---|---|---|---|
| Autonomous resource coordination | CPU/memory/network/energy limits | useful work per resource unit | controlled workload + resource trace |
| Resilient distributed intelligence | disconnection/failure | recovery time, completed work, data integrity | fault-injection + replay |
| Energy-constrained computing | battery/thermal/power budget | useful work/Wh and thermal stability | target-device measurement |
| Long-lived knowledge | format/toolchain drift | successful replay after environment change | reproducible archive + migration test |
| Agent orchestration | queue/tail-latency pressure | p95/p99, fairness, admission rate | deterministic workload replay |
| Evidence automation | stale/missing evidence | false-pass and false-hold rate | adversarial fixtures |

These are research targets, not claims of achieved capability.

### 16.1 Target-selection rule

Prioritise targets by:

1. hard safety and privacy constraints;
2. capability gap;
3. measurable bottleneck;
4. expected environmental/resource impact;
5. reproducibility;
6. implementation cost;
7. reversibility and rollback.

Do not optimise a metric that is not connected to a demonstrated bottleneck.

## 17. Supporting reproduction specification

The reusable environmental measurement protocol is maintained at `reproduction/environmental-performance.md`. It defines the minimum experiment record, environmental metrics, edge-device validation, concurrency sweeps, and evidence classifications.

### 17.1 Current evidence boundary

PR #14 exact head `63cf3d9b0cc68f289ecc85d722fef1b6cc28f0a7` has a successful `ci` workflow run (`37412305420`). That proves the repository's current CI workflow passed for that exact PR head; it does not prove TWGT admission, production deployment, or the truth of external repository-specific defect claims.

Engineering-intelligence therefore remains an evidence producer and review aid. Production admission stays with the consuming repository's gates and human authority.

**Status:** documentation/research enhancement; no production admission implied.

## 18. Evidence boundary rules

This section states the rules that govern evidence in this repository. They
apply to every commit, every pull request description, and every review. They
formalise the boundary already implicit in §10.1, §14, and §17.

### 18.1 Current evidence boundary

CI evidence for any change is recorded on the pull request's checks for its
**current head SHA**, not inside any document in the repository. A SHA, run ID,
or artifact reference written into a file cannot refer to the commit that
contains it and is stale by construction.

A passing CI workflow proves only that the repository's CI workflow passed for
that exact head. It does not prove admission, deployment, or the truth of any
external claim.

Engineering-intelligence remains an evidence producer and review aid. Admission
stays with the consuming repository's gates and human authority.

### 18.2 No self-referential CI evidence

**Rule:** This document, and any file committed to this repository, must not
record CI evidence for its own revision.

Evidence for a candidate is valid only where it is bound to the current
candidate SHA and base SHA **outside** the candidate's content — in pull request
checks, CI artifacts, or an external log. Any SHA or run ID written into a file
is `HISTORICAL` and `STALE` for every later head. The correct response to a
stale reference is to re-run, not to rewrite the reference.

`CI_PASS(head) != ADMISSION`.

### 18.3 Evidence classes

Every claim carries exactly one class. The taxonomy extends the method in §2.3
for use in review and in commit messages.

| Class | Meaning |
|---|---|
| `EXECUTED` | A command, test, or probe actually ran against the target. Bound to a source outside the commit. |
| `RESEARCH_PATTERN` | Documented patterns, third-party analysis, or external repositories. Not repository-native. |
| `ENGINEERING_INFERENCE` | A reasoned conclusion drawn from observations. Not a measurement. |
| `RESEARCH_HYPOTHESIS` | A proposal not yet tested against the target. |
| `UNVERIFIED` | Asserted without a source. |

`EXECUTED` requires a change or command to actually run against the target
repository. A commit, review comment, or analysis tool cannot move a claim to
`EXECUTED`. It can point to candidate repairs or suggest where to look. It
cannot promote anything to `EVIDENCE_READY` or `PASS_CANDIDATE`.

### 18.4 AI code-search and analysis tools

AI code-search or Q&A tools (for example DeepWiki or any assistant that
answers questions about a repository) are `RESEARCH_PATTERN` sources only.
Their output is not `EXECUTED` evidence and is not bound to a candidate SHA.
It may be cited as a pointer, never as proof.

### 18.5 PR description scope

The pull request description must name every file the diff changes. A scope
that omits a file included in the diff is inaccurate and must be corrected
before review proceeds. §17 records the environmental performance specification
created in the same pull request as this section — if the two are split, the
reference in §17 breaks on the base branch.

### 18.6 No self-admission in commits

A commit message may not claim `ADMITTED`, `PASS_CANDIDATE`, `EVIDENCE_READY`,
or any equivalent. Those are decisions made by a reviewing authority on a head
that has been produced and observed. A commit that asserts its own admission is
misclassified regardless of its content.

### 18.7 Commit rules

The commit-message form of these rules is in `COMMIT-RULES.md` at the
repository root. That document is normative for commit messages; this section
is normative for documents, PR descriptions, and reviews. Both say the same
thing: evidence is bound to a head outside itself, and admission is a human
act.
