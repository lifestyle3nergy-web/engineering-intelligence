ADR-0030 — Telemetry Model

Status: Proposed — design choices confirmed; implementation pending
Decision date: 2026-10-20
Scope: twgt-schema-gate, TWGT-

1. Context

The system requires a unified model for what telemetry is collected, how it is retained, and how it is exported. Currently, TWGT- has a StabilityMetrics component that displays aggregate operational data (total runs, pass/fail rates), and twgt-schema-gate has trace-context.json for execution tracing. However, there is no formal schema defining the shape of these metrics, and no explicit policy document stating the privacy boundary.

2. Evidence and verification boundaries

[Session evidence]

· TWGT-/StabilityMetrics.tsx expects an object with total, passRate, and failRate fields.
· twgt-schema-gate/schemas/v1/common/trace-context.json provides trace_id, span_id, and parent_span_id.
· twgt-schema-gate/contract-tests/privacy/run-ts.mjs is a CI gate that explicitly scans for and fails on the presence of email addresses, US Social Security Numbers, and E.164 phone numbers.

3. Decisions

D1 — Define a telemetry-record.json schema

Introduce a new schema to standardize the shape of operational metrics. It will define fields for:

· metric_name (e.g., run_total, pass_rate, latency_ms)
· value
· timestamp
· source (the component or repo generating the metric)

D2 — Enforce a strict Zero-PII Privacy Boundary

Telemetry must never contain raw Personally Identifiable Information (PII).

· Identifiers for actors (users, agents) must be represented via cryptographic hashes or pseudonyms (e.g., actor_hash: "sha256:..."), never raw email addresses or names.
· The existing privacy gate (SG-05) in twgt-schema-gate is the enforced boundary for this policy.

D3 — Differentiate Execution Tracing from Operational Metrics

· Use trace-context.json for distributed tracing (tracking the flow of a single request through multiple systems).
· Use telemetry-record.json for aggregate metrics (tracking health over time, like the StabilityMetrics dashboard).

D4 — Define Retention and Export Policies

· Retention: Raw telemetry records are retained for 30 days to allow for debugging and dashboarding. After 30 days, only aggregated rollups (e.g., daily averages) are retained.
· Export: Telemetry is exported to the central observability stack via the CLI's cloud client (cli/utils/cloud-client.js), but must conform to the telemetry-record.json schema before transmission.

4. Consequences

Positive

· Formalizes the data shape required by the StabilityMetrics dashboard.
· Explicitly defines the privacy boundary, reinforcing the SG-05 gate.
· Provides a clear retention policy for data lifecycle management.

Costs and risks

· The telemetry-record.json schema must be integrated into the CLI and the bridge.
· Any existing telemetry collection that sends raw user data will be flagged by the privacy gate once this schema is adopted.

5. Open items and explicit uncertainty

1. Schema Implementation: The exact definition of telemetry-record.json (e.g., whether value is a number or a string, how metric_name is validated) is deferred to the implementation PR.
2. Aggregation Logic: The exact mechanism for rolling up raw telemetry into daily aggregates after 30 days is an infrastructure concern not defined here.
