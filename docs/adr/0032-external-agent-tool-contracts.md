ADR-0032 — External Agent and Tool Contracts (v1)

Status: Proposed — v1 boundary declared; three follow-up items deferred
Decision date: 2026-10-20
Scope: engineering-intelligence, twgt-schema-gate, twgt-bridge

1. Context

Phase E established the internal model layer (capability registry, ontology,
provenance, lineage, telemetry, external data). Phase F moves the boundary
outward: how the system talks to agents and tools at the wire, and how the
wire relates to admission, policy, and the semantic decision surface returned
to a human at Ti output.

twgt-schema-gate/schemas/v1/ defines four exchange schemas and one violation
event:

  agent-request / agent-response    agent exchange pair
  tool-invocation / tool-result     tool exchange pair
  schema-violation                  error envelope at the boundary
  common/{trace-context,policy-decision,provenance,evidence-reason-code}
                                    shared fragments

All exchange schemas declare additionalProperties: false. The contract is
closed. The consequences of that closure — and the relationship between the
wire status, the admission decision, and the semantic five-state returned to
a human — have not previously been written down as a decision. This ADR does.

2. Evidence and verification boundaries

[Session evidence]

- twgt-schema-gate/schemas/v1/{agent-request,agent-response,tool-invocation,
  tool-result,schema-violation}.json read at main.
- twgt-schema-gate/schemas/v1/common/{trace-context,policy-decision,
  provenance,evidence-reason-code}.json read at main.
- TWGT-/activation/protocols/{SOP-static-outcome-delivery,outcome-delivery}.md
  and prompts/outcome-assessor.md read.
- twgt-bridge/{bin/verify-registry.mjs, lib/admission.mjs,
  lib/reason-codes.json, lib/evidence-record.schema.json,
  pins/twgt-schema-gate.json, tests/contract/schema-gate-fixtures.test.mjs}
  read.
- ADR-0030 (telemetry model) and ADR-0031 (OSINT / archive contracts)
  reviewed for boundary alignment.
- Registry state at ae85e58: next_number 0032, 32 allocated, content_sha256
  null in all 32 entries.

3. Decisions

D1 — Five schemas define the external boundary

agent-request, agent-response, tool-invocation, tool-result are the wire
formats for runtime agent and tool exchanges. schema-violation is the fifth
boundary schema, not a sidecar: every schema rejection emits a
SchemaViolationEvent carrying payload_hash (sha256 of rejected payload),
payload_size, direction (input / output / internal), severity
(warn / error / fatal), and a violations[] array of {path, keyword, message,
params} objects. The boundary is observable on rejection as well as
acceptance. No parallel or legacy format is admitted. A v2 is a superseding
ADR, not a silent extension. additionalProperties: false is load-bearing and
must not be relaxed without a superseding ADR.

D2 — Trace at ingress; provenance at egress

Requests require trace_context; responses carry provenance (optional but
present-by-design). Responses do not carry trace_context; requests do not
carry provenance. Violation events carry trace_context (optional) and never
carry provenance. The asymmetry is structural: a rejected payload has no
legitimate provenance because it was not accepted. Provenance is a property
of accepted output, not of any claim. This anchors ADR-0028 (provenance) and
ADR-0029 (lineage) to the wire.

D3 — dry_run defaults to true

tool-invocation.dry_run defaults to true. Real execution is opt-in, declared
per invocation. This is the schema-level expression of outcome-delivery.md
§Boundary rule ("Execution occurs only inside an approved runtime boundary").
Callers must not assume dry_run is applied default-side by a dispatcher — the
schema already defaults it.

D4 — Status vocabularies are asymmetric by design and preserved

agent-response status: ok / error / partial.
tool-result status: ok / error / timeout.

partial is agent-only; timeout is tool-only. An agent can partially succeed.
A tool can hang. Flattening to a common enum would lose one of these
distinct failure modes. If a future consumer needs a unified view, it maps
at the consumer layer — the schema does not.

D5 — Three admission vocabularies are orthogonal; no code carries admission authority

Three distinct state systems coexist on the same transaction at three layers:

  Policy     allow / deny / require_approval   before ingress   gateway
  Admission  COLLECTED → VALIDATED → EVIDENCE_READY / HELD
                                                after collection bridge
  Semantic   BLOCK / REVIEW / READY / ACTION / OPPORTUNITY
                                                at Ti output     human

No vocabulary translates into another losslessly. In particular,
EVIDENCE_READY is not READY. This is the schema-gate's own stated intent,
quoted from schemas/v1/common/evidence-reason-code.json:

  "No code in this enum carries admission authority. A code that reads as
   positive means only that a specific check passed on a specific head, not
   that the underlying change is admitted."

A consumer that reads EVIDENCE_READY and treats it as authorisation is
violating this ADR.

D6 — policy_decision presence is enforced at ingress, not on the wire

agent-request.policy_decision is optional at the wire. Whether a request is
required to carry one is enforced by the ingress gateway as a matter of
admission policy — specifically, requests whose source is not in the
trusted-runtime allowlist must carry a policy_decision with
decision ∈ {allow, require_approval}. The allowlist is maintained outside v1
schemas. Binding it into the schema would couple the wire format to the
allowlist's evolution.

D7 — tool-invocation.tool binds to a capability at admission, not on the wire

tool-invocation.tool is a free string (minLength: 1). Binding to a registry
capability (ADR-0026) is enforced before dispatch of a dry_run: false
invocation, not by the schema. Schema-encoding capability IDs would couple
the wire format to registry taxonomy and force a wire revision whenever
ADR-0026 evolves. The wire is stable; the binding is a layer.

D8 — twgt-bridge is adjacent, not in-scope

twgt-bridge emits evidence-record (its own schema), not tool-invocation
envelopes. Its tests/contract/schema-gate-fixtures.test.mjs validates
evidence-record.schema.json, not the four exchange schemas. The bridge is
invoked by humans and CI, not by an agent protocol peer. It does not need to
emit envelopes, and this ADR does not require it to.

The bridge is still within reach: when a verification-type tool is later
exposed to an agent, the bridge's evidence-record document is the natural
content of tool-result.output. That mapping is a follow-up decision, not a
v1 requirement. The bridge's own schema explicitly disclaims admission
authority: "This is the shape a downstream consumer reads. It is not an
admission decision."

4. Consequences

Positive

- The five-schema boundary (four exchanges plus one violation event) is
  named and closed. additionalProperties: false is a stated invariant.
- Orthogonality of policy / admission / semantic vocabularies is documented
  from the schemas' own text, ending the temptation to lossy-map
  EVIDENCE_READY to READY.
- The bridge is correctly placed outside the agent/tool boundary, sparing it
  a rewrite it would never need.
- ADR-0028 (provenance) and ADR-0029 (lineage) gain a wire-level anchor: D2
  is the schema-level proof that provenance is a property of accepted
  output, not of any claim.

Costs and risks

- D5 requires consumers who want a single "admitted?" boolean to build the
  map themselves from policy + admission + human authorisation, and accept
  that no single layer's output is that boolean.
- Three follow-up items in §5 remain deferred to bridge-scoped or future
  ADRs. The wire boundary is complete; the bridge pin manifest and one
  schema's $id divergence remain open.

5. Open items and explicit uncertainty

1. twgt-bridge pin reconciliation. pins/twgt-schema-gate.json is stale
   (93fcb3bc… vs schema-gate head 574dcab…) and the schemas map is missing
   common/evidence-reason-code.json, common/evidence-record.json, and
   common/evaluation-record.json — all of which are $ref'd or vendored by
   bridge code. A refresh that only advances the SHA without reconciling the
   manifest leaves the drift guard tests/contract/reason-codes.test.mjs
   unverifiable against the pin. This is a bridge-scoped change requiring its
   own ADR.

2. evidence-record.schema.json's $id. The schema declares
   $id: .../twgt-schema-gate/schemas/v1/common/evidence-record.json but is
   served from twgt-bridge/lib/. Either the schema is a future-migration
   template or the $id is a bug. Do not fix in Phase F — bridge-scoped
   follow-up.

3. provenance.signatures is v1-declared but undefined. The signatures array
   is reserved in common/provenance.json but has no algorithm,
   key-distribution, or verification semantics in v1. Consumers must not
   treat the presence of signatures as evidence of anything in v1. Signature
   semantics are a v2 or follow-up decision.

4. Governance backlog not addressed here (recorded, not resolved):
   C18 ruleset divergence in twgt-schema-gate; registry entries 0016 / 0017 /
   0018 marked proposed with open PRs 93 / 90 / 92 requiring PR-state
   verification; Dependabot backlog as Phase G admission candidates;
   OPEN-0025 (missing ADR 0025 in the sequence); OPEN-UPDATED-AT
   (governance/adr-registry.json updated_at appears frozen at
   2026-10-17T00:00:00Z through six merges since).
