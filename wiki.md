# Internet Engineering Evolution Atlas

**Status:** Reference-library proposal
**Coverage:** 1980–2026 historical; 2027–2080 research horizon

> Preserve problem-first engineering knowledge. Connect real engineering constraints and failures to the design changes, protocols, algorithms, source artefacts and validation practices that addressed them.

## 1. Executive summary

Internet-scale systems advanced when engineers identified a limiting constraint and introduced a focused change that allowed independent systems to interoperate, scale, recover, or be operated more reliably.

An **Engineering Problem Record (EPR)** captures the problem, the bottleneck, the change, the evidence, the limits, the transfer potential, and the reproduction requirements. The guiding question: what was the smallest verified change that removed a limiting constraint, what new constraints did it introduce, and what evidence would demonstrate that the same principle can improve the target system?

## 2. Research and evidence method

### 2.1 Source hierarchy

1. Primary technical specifications — RFCs, standards, design proposals.
2. Original research — papers, reports, theses.
3. Implementation evidence — source, tests, releases, benchmarks.
4. Operational evidence — incident reports, postmortems, measured production data.
5. Historical archives — Internet Archive, manuals, proceedings.
6. Retrospectives — discovery only; verify against primary evidence.

### 2.2 Internet Archive investigation

For each capture record: original URL, archived capture URL/date, title, author, publication date, completeness, related RFC or release, supported claims, unverified claims.

An archived page proves a representation was captured. It does not alone prove a system was deployed or behaved as described.

### 2.3 Evidence labels

- **Historical fact** — cited primary or reliable historical source.
- **Implementation evidence** — source, tests, release, reproducible execution.
- **Measured result** — workload, hardware, baseline, method, result.
- **Engineering inference** — reasoned transfer, explicitly labelled.
- **Research hypothesis** — open question, proposed direction.
- **Unverified** — insufficient evidence.

## 3. Historical EPR atlas

### EPR-001 — Separate internetworking from the underlying network

**Period:** 1970s–1983
**Problem:** Networks used different technologies; a protocol coupled to one network could not connect heterogeneous networks.
**Change:** TCP/IP separated internetworking from host-to-host transport.
**Bottleneck:** Network-specific coupling.
**Lesson:** Separate stable interfaces from implementation-specific infrastructure.
**TWGT transfer:** Stable contracts between gateway, runtime, policy engine, tool adapters, execution workers.
**Sources:** RFC 801.

### EPR-002 — Plan protocol migration across a live system

**Period:** 1981–1983
**Change:** Documented transition plan with responsibilities, compatibility boundaries, coordinated migration.
**Lesson:** Migration is a system-wide operational process, not a code change.
**TWGT transfer:** Versioned contracts, compatibility matrices, staged upgrades, rollback criteria.
**Sources:** RFC 801.

### EPR-003 — Replace central host tables with distributed naming

**Period:** 1983 onward
**Change:** DNS — hierarchical naming, distributed authority, caching, expiry.
**Bottleneck:** Centralised updates, name collisions.
**Lesson:** Scale discovery by distributing authority.
**TWGT transfer:** Distributed registries with ownership, authoritative sources, cache expiry, provenance.
**Sources:** RFC 883; Computer History Museum.

### EPR-004 — Exchange reachability between independently operated networks

**Period:** 1989 onward
**Change:** Inter-domain routing between autonomous systems.
**Lesson:** Discovery and reachability are distinct from trust and permission.
**TWGT transfer:** Discoverable does not mean trusted. Separate registry lookup from policy admission.
**Sources:** RFC 1105.

### EPR-005 — Respond to congestion with feedback

**Period:** 1980s onward
**Bottleneck:** Queue overflow, packet loss, retransmission, collapse in useful throughput.
**Change:** Congestion-control adapts transmission to feedback.
**Lesson:** Adding workers can worsen performance when a shared downstream dependency is saturated.
**TWGT transfer:** Feedback-driven admission, bounded concurrency, backpressure, load shedding.
**Sources:** RFC 896; RFC 1254.

### EPR-006 — Make distributed information addressable and linkable

**Period:** 1989–1993
**Change:** URLs, HTTP, HTML combined into hypertext architecture.
**Lesson:** Stable identifiers and simple shared protocols enable independent systems to connect.
**TWGT transfer:** Canonical source identifiers, cross-linked evidence records, resolvable provenance.
**Sources:** Tim Berners-Lee's original Web proposal.

### EPR-007 — Improve useful throughput under congestion

**Period:** 1988–1997
**Change:** TCP congestion windows, slow start, congestion avoidance, fast recovery.
**Lesson:** Adaptation needs explicit signals, bounded response, measurable outcomes.
**TWGT transfer:** Dynamic throttling, bounded retries, deadline budgets, backpressure propagation.
**Sources:** RFC 2001.

### EPR-008 — Standardise extensible client-server interactions

**Period:** 1990s onward
**Change:** HTTP methods, headers, status codes, extensible semantics.
**Lesson:** Explicit protocol contracts reduce integration assumptions.
**TWGT transfer:** Stable API schemas and structured errors across mock and production.
**Sources:** RFC 1945.

### EPR-009 — Automate infrastructure provisioning and reconciliation

**Period:** 2000s–2010s
**Change:** Declarative infrastructure, configuration management, reproducible images, orchestration.
**Lesson:** Define desired state separately from observed state; reconcile through controlled operations.
**TWGT transfer:** Git as desired-state catalogue; runtime observations as actual state; drift detection.
**Sources:** Configuration-management design papers; orchestration controller source.

### EPR-010 — Isolate workloads and improve resource utilisation

**Period:** 2000s–2010s
**Change:** VMs, containers, orchestration.
**Lesson:** Isolation boundaries reduce blast radius and enable independent lifecycle management.
**TWGT transfer:** Per-agent CPU, memory, execution-time, network budgets.
**Sources:** Container runtime specs; kernel isolation mechanisms; scheduler source.

### EPR-011 — Automate secure connection lifecycle management

**Period:** 2000s–2010s onward
**Change:** Standardised TLS and automated certificate lifecycle.
**Lesson:** Trust material has a lifecycle and must be managed as such.
**TWGT transfer:** Automated expiry monitoring, renewal, fail closed when trust unmet.
**Sources:** TLS standards; CA incident reports.

### EPR-012 — Reduce connection setup and transport blocking

**Period:** 2010s–2020s
**Change:** QUIC — encrypted multiplexed streams, lower latency.
**Lesson:** Transport choice is a performance parameter, not a constant.
**TWGT transfer:** Benchmark complete tool-call latency including setup, TLS, transport, loss.
**Sources:** Google Research on QUIC.

### EPR-013 — Treat AI inference as a distributed-systems problem

**Period:** 2020s onward
**Bottlenecks:** GPU memory capacity and bandwidth, interconnect traffic, queueing, tail latency, accelerator utilisation.
**Responses:** Model/pipeline parallelism, KV-cache management, continuous batching, quantisation, heterogeneous execution.
**Lesson:** Inference at scale is subject to the same queueing, memory, scheduling constraints as any distributed system.
**Critical limitation:** A result measured on a large GPU cluster cannot be assumed to transfer to a low-memory Android, Termux or edge device.
**TWGT transfer:** Measure TTFT, token throughput, p95/p99 latency, memory pressure, energy, cost per task.
**Validation requirement:** Record target hardware, model, precision, workload, batch size, concurrency, baseline, methodology.

## 4. Future research horizon: 2027–2080

The following are research hypotheses, not predictions.

### EPR-014 — Autonomous resource coordination

Can infrastructure continuously optimise workloads across cloud, edge, mobile, accelerators under hard security, energy, cost, latency constraints?

### EPR-015 — Resilient distributed intelligence

How can systems operate through disconnected networks, hardware failures, regional outages, intermittent compute?

### EPR-016 — Energy-constrained computing

How can systems optimise useful computation per unit energy while maintaining service quality?

### EPR-017 — Long-lived knowledge and autonomous maintenance

How can software, documentation, identity, archives, and execution environments remain recoverable across generations?

## 5. Transfer historical lessons into TWGT governance

A historical EPR should not become a production dependency or policy merely because the underlying technology succeeded elsewhere.
|
vHistorical source / research paper / incident

Engineering Problem Record

Identify bottleneck and assumptions

Source code / test fixtures / benchmark harness

Reproduce baseline and reported behaviour

Compare with TWGT workload and target hardware

Propose contract, algorithm or configuration

Unit + integration + fault-injection tests

Exact-head CI and independent review

Human approval before runtime admission

Measure outcomes and record lessons

Before adopting a solution: does the original problem exist in the target workload? What evidence demonstrates the bottleneck? Which assumptions matter? What is the baseline? What new failure modes appear? Can it be reproduced? Can it be validated on target runtime? What approval and rollback conditions apply?

## 6. Mock servers and runtime validation

| Historical lesson | Mock or integration test |
|---|---|
| Protocol separation | Substitute compatible implementations; consumer tests still pass |
| Planned migration | Old/new contract compatibility, rollback |
| Distributed naming | Stale caches, expiry, authority failure, recovery |
| Congestion control | Inject latency, loss, constrained throughput; verify backpressure |
| Stable web contracts | Request schemas, status codes, structured errors |
| Automated reconciliation | Introduce drift; verify detection, reporting, recovery |
| Secure connection lifecycle | Expired, revoked, mismatched, unavailable trust material |
| Distributed inference | Queueing, memory, throughput, tail latency on target hardware |

A green test suite proves configured tests passed on the tested revision. It does not prove the mock accurately represents production behaviour.

## 7. Proposed reference-library structure

engineering-intelligence/
|-- wiki.md
|-- historical-atlas/
|   |-- 1980-1989/
|   |-- 1990-1999/
|   |-- 2000-2009/
|   |-- 2010-2019/
|   |-- 2020-2026/
|   -- 2027-2080-scenarios/
|-- epr/
|-- foundations/
|-- archive-manifests/
|-- reproduction/
|-- transfer-to-twgt/
-- governance/

This is a proposal. No repository or governance configuration is changed by this document.



This is a proposal. No repository or governance configuration is changed by this document.

## 8. Source catalogue

### 8.1 Internal sources

- `foundations/TWGT_Engineering_Foundation_Research_Record.md` — networking and cybersecurity foundation, dated 2026-09-11. Authority boundary: intrusive activity is authorized only inside owned or explicitly permitted ethical-hacking labs. Cited by EPRs that draw on network scope, topology, transport, or trust-zone claims.

### 8.2 External sources

- RFC Editor — primary technical specifications.
- RFC 2235 Hobbes' Internet Timeline — historical timeline and discovery pointers.
- Computer History Museum — historical context, interviews, and technical milestones.
- Internet Archive — archived documents, books, and software snapshots.
- Wayback Machine — historical website captures and version comparisons.
- MementoWeb — time-travel aggregation across archives.
- Wayback API — programmatic capture lookup.

### 8.3 Reference catalogues

- `reference/github-cicd/sources.md` — CI/CD evidence sources for GitHub Actions, REST API, webhooks, and machine-readable schemas. Evidence class `RESEARCH_PATTERN`.
- `capabilities/CANDIDATES.md` — capability wishlist. Nothing listed there is admitted or validated.

## 9. EPR completion criteria

An EPR is ready for adoption review only when it contains:

- Specific problem and operating conditions.
- Primary evidence and source provenance.
- Relevant implementation, algorithm, or specification.
- Known assumptions, constraints, limitations.
- Reproduction or benchmark methodology.
- A clearly labelled TWGT transfer hypothesis.
- Proposed tests and acceptance criteria.
- Human review and explicit approval status.

**Core principle:** TWGT should not become a collection of other people's repositories. It should become a system that understands why engineering solutions exist, when they work, where they fail, and how that knowledge can be transformed into verified capabilities of its own.
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
