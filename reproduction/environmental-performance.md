# Environmental performance evidence

**Status:** Measurement specification  
**Authority:** Engineering-intelligence research guidance; not a production admission gate by itself.

## Purpose

Quantify engineering changes against the complete operating envelope rather than peak throughput alone. A performance result is **MEASURED_RESULT** only when the workload, environment, baseline, candidate, method, and raw observations are reproducible.

## Required experiment record

Use a stable record containing: experiment ID, repository, exact candidate and base SHAs, target hardware/OS/runtime/package manager, workload, baseline revision, candidate revision, metrics, repetitions, warm/cold condition, instrumentation, and result state.

## Core environmental metrics

Measure only metrics meaningful for the target workload.

### Performance
- throughput: completed useful work per unit time;
- p50/p95/p99 latency;
- queue wait time;
- time to first result where applicable;
- deadline-miss rate.

### Resource
- CPU utilisation;
- peak and steady-state memory;
- accelerator utilisation and memory where applicable;
- file descriptors, network connections, or database pool occupancy where relevant.

### Energy
Prefer direct device or host measurement. If unavailable, label estimates explicitly.

Recommended derived measures:

- energy_per_success = total_energy / successful_work_items
- useful_work_per_wh = successful_work_items / total_energy_wh

Do not substitute wall-clock time for energy.

### Reliability
- error rate;
- retry rate;
- cancellation rate;
- dropped/shed work;
- recovery time after injected saturation or dependency failure.

## Comparison rules

A candidate is not considered an improvement solely because throughput rises.

Report throughput delta, p95/p99 latency delta, memory delta, energy-per-success delta, and error/retry delta.

A candidate that improves throughput while materially worsening tail latency, reliability, memory pressure, or energy efficiency is a **trade-off**, not an unconditional improvement.

## Low-resource and edge validation

Cloud or workstation measurements must not be transferred to mobile/edge targets without reproduction.

At minimum, compare reference hardware, target hardware, constrained-memory condition, representative concurrency, and warm/cold starts where startup matters.

Record throttling, thermal constraints, battery state, power mode, and network conditions when they can affect results.

## Concurrency experiment

Test a small controlled sweep rather than an unbounded increase. Increase concurrency until a hard limit or material degradation is observed: p99 latency budget exceeded, memory budget exceeded, error/retry threshold exceeded, downstream saturation observed, or energy efficiency materially degrades.

The selected operating point must remain inside all hard safety and resource limits.

## Evidence classification

- **MEASURED_RESULT:** reproducible measurements with complete environment and baseline.
- **ENGINEERING_INFERENCE:** reasoned conclusion from measurements.
- **RESEARCH_HYPOTHESIS:** proposed future target without sufficient measurements.
- **UNVERIFIED:** missing or contradictory evidence.

No measurement record grants runtime admission.