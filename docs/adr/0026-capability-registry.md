ADR-0026 — Capability Registry, Pinning, and Runtime Enforcement

Status: Proposed — design choices confirmed; implementation and formal admission pending
Decision date: 2026-10-19
Scope: twgt-schema-gate, twgt-bridge, TWGT runtime, and the engineering-intelligence capability-candidate catalogue

1. Context

TWGT requires capability contracts to be structurally defined, traceable to verified evidence, and evaluated under explicit authority boundaries. A schema's existence is not proof that it is registered, pinned, verified, or admitted for use.

The current schema-gate registry-integrity test validates listed registry entries, including file existence and duplicate identifiers. It does not enumerate the schema directory to identify JSON schema files that are not registered.

The bridge verifies hashes for files listed in its pin manifest. Its EVIDENCE_READY result indicates that the listed files matched their expected hashes; it does not, by itself, establish registry completeness or capability admission.

This ADR defines a capability-registry design that preserves these distinctions and assigns authoritative capability enforcement to the TWGT runtime.

2. Evidence and verification boundaries

Source labels used below:

· [Session evidence] — terminal output or observations reported during this review session.
· [Open] — a matter that remains unresolved.

The labels identify provenance; they do not independently certify the completeness or correctness of an underlying inspection.

2.1 Schema-gate registry state

[Session evidence] At the time of the reported GitHub API check, lifestyle3nergy-web/twgt-schema-gate main resolved to:

574dcabdfdf1d2b804278999b6747a10ad53a199

This is a time-bounded observation. The current main head must be re-verified before implementation proceeds.

At that observed revision:

· schemas/registry.json contained 11 entries.
· The inspected schemas/v1/ tree contained 15 JSON files.
· Four files existed outside the registry listing:
  · schemas/v1/common/admission-record.json
  · schemas/v1/common/authority-matrix.json
  · schemas/v1/common/capability-record.json
  · schemas/v1/common/reason-code.json

The inspected registry-integrity runner iterates registered entries, checks their files, and detects duplicate identifiers. It does not scan the filesystem for unregistered schema files.

These observations establish a registry-completeness gap at the observed current-main revision. They do not establish that the four unregistered schemas are invalid.

2.2 Pinned schema-gate baseline

[Session evidence] The bridge pin identifies schema-gate commit:

93fcb3bcba49caea3a1f6d0558142209d8053255

At that revision:

· schemas/registry.json contained 8 entries.
· schemas/v1/ contained 8 JSON schema files: 5 at the root (agent-request.json, agent-response.json, schema-violation.json, tool-invocation.json, tool-result.json) and 3 under common/ (policy-decision.json, provenance.json, trace-context.json).
· The 8 files on disk match the 8 registry entries. No unregistered JSON schema files were identified.
· The bridge pin hash map lists 9 entries: schemas/registry.json plus the 8 schema files. All 8 schema paths match the files observed on disk.

The current-main finding in §2.1 must not be projected onto the pinned baseline. At the pinned revision, no completeness gap was observed.

2.3 Capability record

[Session evidence] schemas/v1/common/capability-record.json at current main defines a CapabilityRecord with these properties, all in required:

· record_id — string, format: uuid
· timestamp — string, format: date-time
· name — string
· source_type — string, enum: ["REPO", "TOOL", "SERVICE"]
· source_locator — string
· contract_schema — string, format: uri
· version_pin — string
· authority_grant — string

Three properties of this schema matter for D1 and D5:

· additionalProperties is not set to false. The base record permits additional fields by default. A wrapper schema may extend the record without modifying it.
· version_pin and authority_grant are unconstrained strings. No pattern, format, or enum restricts their values. A record can declare version_pin: "latest" or authority_grant: "ADMITTED" and pass structural validation.
· contract_schema is a uri format with no resolution requirement. A record can declare any well-formed URI, including one that does not resolve to a registered schema.

These properties support the VALIDATED ≠ ADMITTED boundary in §7. Structural conformance of a CapabilityRecord establishes that the required fields are present and their formats are well-formed. It does not establish that the version pin is immutable, that the authority grant is authentic, or that the contract schema URI resolves. Enforcement of those properties must come from outside the schema.

2.4 Candidate mapping

[Session evidence] engineering-intelligence/capabilities/CANDIDATES.md exists at the inspected path and was read during the session. The file size was 4,320 bytes.

The file self-identifies as:

· Status: Wishlist. Nothing in this file is an admitted capability.
· Evidence class: RESEARCH_PATTERN.
· Authority boundary: NONE.

It lists candidate tools by category, including network reconnaissance, web application testing, wireless, password and credential testing, forensics, exploitation and social engineering, and agent or skill catalogues.

Its fail-closed rules state that the presence or absence of a candidate does not establish capability presence, approval, admission, or endorsement. They also prohibit citing entries as EXECUTED or EVIDENCE_READY.

The file therefore documents an existing advisory catalogue practice. D6 codifies and preserves its non-authoritative role; it does not create that boundary from scratch.

Some listed candidates are offensive-security tools. Any future proposal to operationalize such a candidate must undergo the applicable authorization, scope, safety, evidence, validation, and admission gates. Listing a tool is not permission to install or execute it.

2.5 Bridge pin verifier

[Session evidence] twgt-bridge/pins/twgt-schema-gate.json at current main contains:

· repo: lifestyle3nergy-web/twgt-schema-gate
· ref: refs/heads/main
· pinned_sha: 93fcb3bcba49caea3a1f6d0558142209d8053255
· pinned_at: 2026-09-29T02:35:36.616Z
· registry_sha256: 381e69934cf5d2c868975b926b0519966cb05a2ca2763d59df5ce59f908f0c8b
· schemas: a map of 9 path-to-hash entries

[Session evidence] The top-level registry_sha256 field duplicates the hash recorded for schemas/registry.json within the schemas map; both contain the same value. The verifier code does not read registry_sha256. It does not constitute an independent integrity check of the registry.

[Session evidence] twgt-bridge/bin/verify-registry.mjs performs these operations:

1. Reads the pin manifest (pins/twgt-schema-gate.json by default).
2. Fetches each path listed in pin.schemas at pin.pinned_sha via GitHub's contents API.
3. Compares each fetched file's SHA-256 against its expected hash in pin.schemas.
4. Returns EVIDENCE_READY when all listed files match, or HELD when any file fails fetch or hash verification.

The verifier's behavior includes two properties relevant to this ADR:

· It never reads registry_sha256. Only pin.schemas, pin.pinned_sha, and pin.repo are consumed.
· It never enumerates the repository or parses registry.json. schemas/registry.json is hashed like any other file. The verifier treats it as opaque bytes and does not reconcile its contents against the tree on disk.

Additionally, a fetch error does not abort verification. Each FETCH_ERROR is recorded in results and processing continues; the overall state is HELD if any file fails. This is fail-closed in aggregate but not fail-fast per file; callers receive the complete per-path result set.

Consequently, EVIDENCE_READY means the files listed in the pin matched their expected hashes. It must not be interpreted as proof that the registry is complete, that every schema is registered, or that a capability has been admitted.

3. Decisions

D1 — Introduce a capability-registry wrapper schema

Introduce a wrapper schema that references capability-record.json and provides metadata connecting an implementation with its environment, version pin, admission record, and evidence.

The intended metadata includes:

· implementation_ref
· environment
· pin
· admission_ref
· evidence_ref

The precise property definitions, required-field policy, reference formats, JSON Schema $ref structure, and authoritative file locations remain to be specified.

The wrapper must not itself imply that a capability is authorized or admitted.

The base CapabilityRecord (§2.3) does not restrict additionalProperties to false, so the wrapper can extend it without modifying the frozen contract from ADR-0023.

D2 — Place the capability-registry pin in twgt-bridge

Use twgt-bridge/pins/capability-registry.json as the designated location for the capability-registry pin.

The pin format, pinned revision semantics, required file hashes, and relationship to the existing schema-gate pin must be defined during implementation. The verification target must be stable and reproducible; verification must not silently trust a moving main branch.

This decision identifies the pin's location, not the authoritative location of the registry data or wrapper schema. That separate choice remains open under §8.

D3 — Make TWGT runtime the authoritative enforcement point

Record CI-time and SDK-time enforcement as considered alternatives rejected as the authoritative capability-enforcement point.

CI and SDK checks may provide supplementary validation and early feedback. Neither substitutes for TWGT runtime enforcement.

The runtime must evaluate the evidence and policy required for the requested capability. Schema validity and bridge verification alone do not confer admission.

D4 — Defer registry-completeness redesign

Record the limitation in the existing registry-integrity test: it validates listed entries but does not detect unregistered schema files.

A filesystem-versus-registry enumeration redesign is outside the scope of this ADR and must be considered separately.

This deferral does not make unregistered schemas authoritative contracts. The capability wrapper and registry integration must still be registered and verified through the applicable governed process.

D5 — Require a governed bridge-pin refresh

Refreshing the bridge pin to cover the approved capability-registry contract and its registry changes is a prerequisite to claiming that the new capability contract is verified by the bridge.

The refresh must be a separately traceable, governed change. It must not be performed implicitly as part of an unreviewed schema modification.

Until the required pin refresh and verification succeed, capability-registry verification remains incomplete.

D6 — Treat candidate mapping as an advisory layer

Treat candidate mapping as an advisory layer below the authoritative registry.

engineering-intelligence/capabilities/CANDIDATES.md documents candidate tools under RESEARCH_PATTERN with no admission authority. Candidate mapping may help identify and organize proposals, but it must not independently authorize a capability, override registry integrity, or bypass TWGT runtime evaluation.

Any future mapping-layer integration must preserve the catalogue's explicit restrictions. In particular, a candidate entry cannot be promoted to EXECUTED or EVIDENCE_READY without the corresponding evidence and verification process. Offensive-security candidates must also pass the applicable authorization and scope gates before any operational use.

4. Alternatives considered

CI-time enforcement

Disposition: Rejected as the authoritative enforcement point; supplementary checks remain permissible.

CI can detect defects before merge, but successful CI execution does not itself constitute runtime capability admission.

SDK-time enforcement

Disposition: Rejected as the authoritative enforcement point; supplementary checks remain permissible.

SDK validation may improve client feedback, but it cannot replace authoritative evaluation at the TWGT runtime boundary.

Fetching an unpinned registry at verification time

Disposition: Rejected in favor of a governed pin.

Fetching the latest main revision without a stable pin makes the verification target mutable and reduces reproducibility.

Expanding registry-integrity validation in this ADR

Disposition: Deferred.

The current limitation is documented, but a broader completeness check requires a separately scoped change with its own validation and admission process.

5. Consequences

Positive

· Separates capability description from registry metadata and runtime admission.
· Provides a designated location for capability-registry pinning.
· Preserves reproducibility through explicit version and integrity references.
· Prevents candidate mapping, schema validity, or bridge verification from being mistaken for admission.
· Codifies the existing non-authoritative candidate-catalogue boundary.
· Makes the registry-completeness limitation visible without silently expanding this ADR's scope.
· Documents that the frozen CapabilityRecord permits extension via additionalProperties and that its fields are structurally conformance-checked but not enforcement-checked.

Costs and risks

· The wrapper schema and pin format require additional design and tests.
· A governed pin refresh is a prerequisite for verified bridge support.
· The existing registry-integrity test will continue to miss unregistered files until a separate redesign is admitted.
· Candidate mapping remains advisory and cannot serve as proof of authoritative registration.
· The authoritative locations of the registry data and wrapper schema remain undecided.
· The relationship between the capability-registry pin and the existing schema-gate pin requires specification.
· Wrapper field names (pin, admission_ref) may overlap in meaning with base record fields (version_pin, authority_grant); disambiguation is required before the wrapper schema can be drafted.

6. Verification and implementation acceptance criteria

Implementation must not be considered complete solely because the wrapper schema exists.

At minimum, the implementation review must establish:

1. The wrapper schema is valid against the selected JSON Schema draft.
2. Its reference to capability-record.json resolves correctly.
3. Required metadata and reference formats are explicitly specified.
4. The authoritative registry data and wrapper schema locations have been decided and documented.
5. The wrapper is registered in the authoritative schema registry.
6. The capability-registry pin identifies a stable verification target and contains the required integrity data.
7. The bridge verifier validates every file required by the new pin and fails closed on missing files, fetch errors, or hash mismatches.
8. The governed bridge-pin refresh has been completed and its verification evidence is available.
9. Tests distinguish schema validity, registry registration, pinned-file integrity, runtime policy evaluation, and admission.
10. CI or SDK success cannot independently produce an admission decision.
11. Candidate mapping cannot bypass registry or runtime enforcement.
12. EVIDENCE_READY is not interpreted as proof of complete registry coverage.
13. The deferred registry-completeness limitation is documented in the relevant implementation and verification evidence.
14. Wrapper field names that overlap semantically with base record fields (pin / version_pin, admission_ref / authority_grant) are either renamed to avoid overlap or documented as distinct concepts with example values.

The exact test commands, fixtures, expected outputs, and artifact locations must be recorded in the implementation change rather than assumed by this ADR.

7. Governance and authority boundaries

The following distinctions remain mandatory:

· Evidence ≠ Validation ≠ Admission ≠ Merge Authorization
· UNKNOWN ≠ FALSE
· INACCESSIBLE ≠ ABSENT
· SKIPPED ≠ PASS
· VALIDATED ≠ ADMITTED

The bridge produces verification evidence. Schema-gate validates registered contracts within its implemented scope. TWGT evaluates capability evidence and policy. Humans retain admission authority under the applicable governance process.

A failure, missing artifact, unverified pin, or incomplete evidence must not be converted into a positive admission result.

This ADR itself authorizes no merge, deployment, migration, or schema mutation.

8. Open items and explicit uncertainty

The following remain unresolved or require re-verification:

1. Authoritative registry and schema locations. D1 defines the wrapper's intended structure and D2 defines the pin's location. Neither decides where the capability-registry data file and its schema file reside. Candidates include:
   · engineering-intelligence/governance/
   · twgt-schema-gate/schemas/v1/
   · TWGT-/catalog/
   The choice must be made before the wrapper can be registered and the pin can identify a stable target. The exact filenames and relationship between capability-registry.json and capability-registry.schema.json must also be specified.
2. Wrapper field disambiguation. The frozen CapabilityRecord (§2.3) already contains version_pin and authority_grant. D1's proposed wrapper fields include pin and admission_ref. Whether each pair represents distinct concepts (e.g., version_pin = capability-contract version such as "1.0.0"; pin = commit SHA of the registry at which that version is verified) or is redundant must be resolved before the wrapper schema is written. Without an explicit decision, the two layers risk expressing the same information under different field names, and consumers will treat them as alternatives to be chosen between rather than complements to be used together.
3. Final wrapper schema. Property definitions, required fields, reference formats, and schema-draft details remain to be finalized.
4. Pin relationship and format. The structure of twgt-bridge/pins/capability-registry.json, its relationship to the schema-gate pin, and the required integrity checks remain to be specified.
5. Registry-completeness validation. A broader filesystem-versus-registry check is deferred to a separate change.
6. Candidate-mapping integration. The catalogue's advisory role is decided; whether and how it feeds a future mapping process remains unresolved.
7. Runtime admission interface. The exact runtime policy checks and evidence artifact paths remain to be specified.
8. Implementation and governance evidence. The implementation test plan, observed results, formal review, ADR registry entry, and final admission status remain outstanding.
9. Re-verification of moving targets. twgt-schema-gate main was observed at 574dcab… during this session. Any implementation based on this ADR must re-verify the current main head and confirm that the sections §2.1 through §2.5 remain accurate at that revision. If any observed file has changed materially, this ADR requires update before implementation proceeds.

These items must be resolved through implementation evidence and the appropriate governance process. They must not be treated as satisfied merely because this draft records the design decisions.

9. Status and change control

This document records the six design choices confirmed for drafting on 2026-10-19. It remains a proposed ADR, not evidence that implementation has occurred or that the ADR has been formally admitted.

Implementation, pin refresh, validation, review, and admission must remain separately traceable. Any future change to the authoritative enforcement point, pinning model, or candidate-mapping authority must follow the applicable change-control process.

Evidence summary

All empirical claims in §2 were established by commands run during this drafting session:

§ Claim Command source
§2.1 11 registry entries, 4 orphan files at main; main = 574dcab gh api .../schemas/registry.json, .../schemas/v1, .../schemas/v1/common, .../git/ref/heads/main
§2.2 8 entries, 8 files at pinned 93fcb3b; pin hash map matches gh api ...?ref=93fcb3b for registry, v1/, v1/common; cat twgt-bridge/pins/twgt-schema-gate.json
§2.3 CapabilityRecord field list, additionalProperties default, unconstrained string fields gh api .../capability-record.json
§2.4 CANDIDATES.md exists, self-labels RESEARCH_PATTERN / Authority: NONE ls, head -n 60 on engineering-intelligence/capabilities/CANDIDATES.md
§2.5 Pin fields, registry_sha256 duplication, verifier step list, no registry_sha256 read, no enumeration cat twgt-bridge/pins/twgt-schema-gate.json, gh api .../verify-registry.mjs

No empirical claim in this ADR rests on external inspection. §8 item 9 records that this evidence is time-bounded to the observations made during drafting and must be re-verified at implementation time.ADR-0026 — Capability Registry, Pinning, and Runtime Enforcement

Status: Proposed — design choices confirmed; implementation and formal admission pending
Decision date: 2026-10-19
Scope: twgt-schema-gate, twgt-bridge, TWGT runtime, and the engineering-intelligence capability-candidate catalogue

1. Context

TWGT requires capability contracts to be structurally defined, traceable to verified evidence, and evaluated under explicit authority boundaries. A schema's existence is not proof that it is registered, pinned, verified, or admitted for use.

The current schema-gate registry-integrity test validates listed registry entries, including file existence and duplicate identifiers. It does not enumerate the schema directory to identify JSON schema files that are not registered.

The bridge verifies hashes for files listed in its pin manifest. Its EVIDENCE_READY result indicates that the listed files matched their expected hashes; it does not, by itself, establish registry completeness or capability admission.

This ADR defines a capability-registry design that preserves these distinctions and assigns authoritative capability enforcement to the TWGT runtime.

2. Evidence and verification boundaries

Source labels used below:

· [Session evidence] — terminal output or observations reported during this review session.
· [Open] — a matter that remains unresolved.

The labels identify provenance; they do not independently certify the completeness or correctness of an underlying inspection.

2.1 Schema-gate registry state

[Session evidence] At the time of the reported GitHub API check, lifestyle3nergy-web/twgt-schema-gate main resolved to:

574dcabdfdf1d2b804278999b6747a10ad53a199

This is a time-bounded observation. The current main head must be re-verified before implementation proceeds.

At that observed revision:

· schemas/registry.json contained 11 entries.
· The inspected schemas/v1/ tree contained 15 JSON files.
· Four files existed outside the registry listing:
  · schemas/v1/common/admission-record.json
  · schemas/v1/common/authority-matrix.json
  · schemas/v1/common/capability-record.json
  · schemas/v1/common/reason-code.json

The inspected registry-integrity runner iterates registered entries, checks their files, and detects duplicate identifiers. It does not scan the filesystem for unregistered schema files.

These observations establish a registry-completeness gap at the observed current-main revision. They do not establish that the four unregistered schemas are invalid.

2.2 Pinned schema-gate baseline

[Session evidence] The bridge pin identifies schema-gate commit:

93fcb3bcba49caea3a1f6d0558142209d8053255

At that revision:

· schemas/registry.json contained 8 entries.
· schemas/v1/ contained 8 JSON schema files: 5 at the root (agent-request.json, agent-response.json, schema-violation.json, tool-invocation.json, tool-result.json) and 3 under common/ (policy-decision.json, provenance.json, trace-context.json).
· The 8 files on disk match the 8 registry entries. No unregistered JSON schema files were identified.
· The bridge pin hash map lists 9 entries: schemas/registry.json plus the 8 schema files. All 8 schema paths match the files observed on disk.

The current-main finding in §2.1 must not be projected onto the pinned baseline. At the pinned revision, no completeness gap was observed.

2.3 Capability record

[Session evidence] schemas/v1/common/capability-record.json at current main defines a CapabilityRecord with these properties, all in required:

· record_id — string, format: uuid
· timestamp — string, format: date-time
· name — string
· source_type — string, enum: ["REPO", "TOOL", "SERVICE"]
· source_locator — string
· contract_schema — string, format: uri
· version_pin — string
· authority_grant — string

Three properties of this schema matter for D1 and D5:

· additionalProperties is not set to false. The base record permits additional fields by default. A wrapper schema may extend the record without modifying it.
· version_pin and authority_grant are unconstrained strings. No pattern, format, or enum restricts their values. A record can declare version_pin: "latest" or authority_grant: "ADMITTED" and pass structural validation.
· contract_schema is a uri format with no resolution requirement. A record can declare any well-formed URI, including one that does not resolve to a registered schema.

These properties support the VALIDATED ≠ ADMITTED boundary in §7. Structural conformance of a CapabilityRecord establishes that the required fields are present and their formats are well-formed. It does not establish that the version pin is immutable, that the authority grant is authentic, or that the contract schema URI resolves. Enforcement of those properties must come from outside the schema.

2.4 Candidate mapping

[Session evidence] engineering-intelligence/capabilities/CANDIDATES.md exists at the inspected path and was read during the session. The file size was 4,320 bytes.

The file self-identifies as:

· Status: Wishlist. Nothing in this file is an admitted capability.
· Evidence class: RESEARCH_PATTERN.
· Authority boundary: NONE.

It lists candidate tools by category, including network reconnaissance, web application testing, wireless, password and credential testing, forensics, exploitation and social engineering, and agent or skill catalogues.

Its fail-closed rules state that the presence or absence of a candidate does not establish capability presence, approval, admission, or endorsement. They also prohibit citing entries as EXECUTED or EVIDENCE_READY.

The file therefore documents an existing advisory catalogue practice. D6 codifies and preserves its non-authoritative role; it does not create that boundary from scratch.

Some listed candidates are offensive-security tools. Any future proposal to operationalize such a candidate must undergo the applicable authorization, scope, safety, evidence, validation, and admission gates. Listing a tool is not permission to install or execute it.

2.5 Bridge pin verifier

[Session evidence] twgt-bridge/pins/twgt-schema-gate.json at current main contains:

· repo: lifestyle3nergy-web/twgt-schema-gate
· ref: refs/heads/main
· pinned_sha: 93fcb3bcba49caea3a1f6d0558142209d8053255
· pinned_at: 2026-09-29T02:35:36.616Z
· registry_sha256: 381e69934cf5d2c868975b926b0519966cb05a2ca2763d59df5ce59f908f0c8b
· schemas: a map of 9 path-to-hash entries

[Session evidence] The top-level registry_sha256 field duplicates the hash recorded for schemas/registry.json within the schemas map; both contain the same value. The verifier code does not read registry_sha256. It does not constitute an independent integrity check of the registry.

[Session evidence] twgt-bridge/bin/verify-registry.mjs performs these operations:

1. Reads the pin manifest (pins/twgt-schema-gate.json by default).
2. Fetches each path listed in pin.schemas at pin.pinned_sha via GitHub's contents API.
3. Compares each fetched file's SHA-256 against its expected hash in pin.schemas.
4. Returns EVIDENCE_READY when all listed files match, or HELD when any file fails fetch or hash verification.

The verifier's behavior includes two properties relevant to this ADR:

· It never reads registry_sha256. Only pin.schemas, pin.pinned_sha, and pin.repo are consumed.
· It never enumerates the repository or parses registry.json. schemas/registry.json is hashed like any other file. The verifier treats it as opaque bytes and does not reconcile its contents against the tree on disk.

Additionally, a fetch error does not abort verification. Each FETCH_ERROR is recorded in results and processing continues; the overall state is HELD if any file fails. This is fail-closed in aggregate but not fail-fast per file; callers receive the complete per-path result set.

Consequently, EVIDENCE_READY means the files listed in the pin matched their expected hashes. It must not be interpreted as proof that the registry is complete, that every schema is registered, or that a capability has been admitted.

3. Decisions

D1 — Introduce a capability-registry wrapper schema

Introduce a wrapper schema that references capability-record.json and provides metadata connecting an implementation with its environment, version pin, admission record, and evidence.

The intended metadata includes:

· implementation_ref
· environment
· pin
· admission_ref
· evidence_ref

The precise property definitions, required-field policy, reference formats, JSON Schema $ref structure, and authoritative file locations remain to be specified.

The wrapper must not itself imply that a capability is authorized or admitted.

The base CapabilityRecord (§2.3) does not restrict additionalProperties to false, so the wrapper can extend it without modifying the frozen contract from ADR-0023.

D2 — Place the capability-registry pin in twgt-bridge

Use twgt-bridge/pins/capability-registry.json as the designated location for the capability-registry pin.

The pin format, pinned revision semantics, required file hashes, and relationship to the existing schema-gate pin must be defined during implementation. The verification target must be stable and reproducible; verification must not silently trust a moving main branch.

This decision identifies the pin's location, not the authoritative location of the registry data or wrapper schema. That separate choice remains open under §8.

D3 — Make TWGT runtime the authoritative enforcement point

Record CI-time and SDK-time enforcement as considered alternatives rejected as the authoritative capability-enforcement point.

CI and SDK checks may provide supplementary validation and early feedback. Neither substitutes for TWGT runtime enforcement.

The runtime must evaluate the evidence and policy required for the requested capability. Schema validity and bridge verification alone do not confer admission.

D4 — Defer registry-completeness redesign

Record the limitation in the existing registry-integrity test: it validates listed entries but does not detect unregistered schema files.

A filesystem-versus-registry enumeration redesign is outside the scope of this ADR and must be considered separately.

This deferral does not make unregistered schemas authoritative contracts. The capability wrapper and registry integration must still be registered and verified through the applicable governed process.

D5 — Require a governed bridge-pin refresh

Refreshing the bridge pin to cover the approved capability-registry contract and its registry changes is a prerequisite to claiming that the new capability contract is verified by the bridge.

The refresh must be a separately traceable, governed change. It must not be performed implicitly as part of an unreviewed schema modification.

Until the required pin refresh and verification succeed, capability-registry verification remains incomplete.

D6 — Treat candidate mapping as an advisory layer

Treat candidate mapping as an advisory layer below the authoritative registry.

engineering-intelligence/capabilities/CANDIDATES.md documents candidate tools under RESEARCH_PATTERN with no admission authority. Candidate mapping may help identify and organize proposals, but it must not independently authorize a capability, override registry integrity, or bypass TWGT runtime evaluation.

Any future mapping-layer integration must preserve the catalogue's explicit restrictions. In particular, a candidate entry cannot be promoted to EXECUTED or EVIDENCE_READY without the corresponding evidence and verification process. Offensive-security candidates must also pass the applicable authorization and scope gates before any operational use.

4. Alternatives considered

CI-time enforcement

Disposition: Rejected as the authoritative enforcement point; supplementary checks remain permissible.

CI can detect defects before merge, but successful CI execution does not itself constitute runtime capability admission.

SDK-time enforcement

Disposition: Rejected as the authoritative enforcement point; supplementary checks remain permissible.

SDK validation may improve client feedback, but it cannot replace authoritative evaluation at the TWGT runtime boundary.

Fetching an unpinned registry at verification time

Disposition: Rejected in favor of a governed pin.

Fetching the latest main revision without a stable pin makes the verification target mutable and reduces reproducibility.

Expanding registry-integrity validation in this ADR

Disposition: Deferred.

The current limitation is documented, but a broader completeness check requires a separately scoped change with its own validation and admission process.

5. Consequences

Positive

· Separates capability description from registry metadata and runtime admission.
· Provides a designated location for capability-registry pinning.
· Preserves reproducibility through explicit version and integrity references.
· Prevents candidate mapping, schema validity, or bridge verification from being mistaken for admission.
· Codifies the existing non-authoritative candidate-catalogue boundary.
· Makes the registry-completeness limitation visible without silently expanding this ADR's scope.
· Documents that the frozen CapabilityRecord permits extension via additionalProperties and that its fields are structurally conformance-checked but not enforcement-checked.

Costs and risks

· The wrapper schema and pin format require additional design and tests.
· A governed pin refresh is a prerequisite for verified bridge support.
· The existing registry-integrity test will continue to miss unregistered files until a separate redesign is admitted.
· Candidate mapping remains advisory and cannot serve as proof of authoritative registration.
· The authoritative locations of the registry data and wrapper schema remain undecided.
· The relationship between the capability-registry pin and the existing schema-gate pin requires specification.
· Wrapper field names (pin, admission_ref) may overlap in meaning with base record fields (version_pin, authority_grant); disambiguation is required before the wrapper schema can be drafted.

6. Verification and implementation acceptance criteria

Implementation must not be considered complete solely because the wrapper schema exists.

At minimum, the implementation review must establish:

1. The wrapper schema is valid against the selected JSON Schema draft.
2. Its reference to capability-record.json resolves correctly.
3. Required metadata and reference formats are explicitly specified.
4. The authoritative registry data and wrapper schema locations have been decided and documented.
5. The wrapper is registered in the authoritative schema registry.
6. The capability-registry pin identifies a stable verification target and contains the required integrity data.
7. The bridge verifier validates every file required by the new pin and fails closed on missing files, fetch errors, or hash mismatches.
8. The governed bridge-pin refresh has been completed and its verification evidence is available.
9. Tests distinguish schema validity, registry registration, pinned-file integrity, runtime policy evaluation, and admission.
10. CI or SDK success cannot independently produce an admission decision.
11. Candidate mapping cannot bypass registry or runtime enforcement.
12. EVIDENCE_READY is not interpreted as proof of complete registry coverage.
13. The deferred registry-completeness limitation is documented in the relevant implementation and verification evidence.
14. Wrapper field names that overlap semantically with base record fields (pin / version_pin, admission_ref / authority_grant) are either renamed to avoid overlap or documented as distinct concepts with example values.

The exact test commands, fixtures, expected outputs, and artifact locations must be recorded in the implementation change rather than assumed by this ADR.

7. Governance and authority boundaries

The following distinctions remain mandatory:

· Evidence ≠ Validation ≠ Admission ≠ Merge Authorization
· UNKNOWN ≠ FALSE
· INACCESSIBLE ≠ ABSENT
· SKIPPED ≠ PASS
· VALIDATED ≠ ADMITTED

The bridge produces verification evidence. Schema-gate validates registered contracts within its implemented scope. TWGT evaluates capability evidence and policy. Humans retain admission authority under the applicable governance process.

A failure, missing artifact, unverified pin, or incomplete evidence must not be converted into a positive admission result.

This ADR itself authorizes no merge, deployment, migration, or schema mutation.

8. Open items and explicit uncertainty

The following remain unresolved or require re-verification:

1. Authoritative registry and schema locations. D1 defines the wrapper's intended structure and D2 defines the pin's location. Neither decides where the capability-registry data file and its schema file reside. Candidates include:
   · engineering-intelligence/governance/
   · twgt-schema-gate/schemas/v1/
   · TWGT-/catalog/
   The choice must be made before the wrapper can be registered and the pin can identify a stable target. The exact filenames and relationship between capability-registry.json and capability-registry.schema.json must also be specified.
2. Wrapper field disambiguation. The frozen CapabilityRecord (§2.3) already contains version_pin and authority_grant. D1's proposed wrapper fields include pin and admission_ref. Whether each pair represents distinct concepts (e.g., version_pin = capability-contract version such as "1.0.0"; pin = commit SHA of the registry at which that version is verified) or is redundant must be resolved before the wrapper schema is written. Without an explicit decision, the two layers risk expressing the same information under different field names, and consumers will treat them as alternatives to be chosen between rather than complements to be used together.
3. Final wrapper schema. Property definitions, required fields, reference formats, and schema-draft details remain to be finalized.
4. Pin relationship and format. The structure of twgt-bridge/pins/capability-registry.json, its relationship to the schema-gate pin, and the required integrity checks remain to be specified.
5. Registry-completeness validation. A broader filesystem-versus-registry check is deferred to a separate change.
6. Candidate-mapping integration. The catalogue's advisory role is decided; whether and how it feeds a future mapping process remains unresolved.
7. Runtime admission interface. The exact runtime policy checks and evidence artifact paths remain to be specified.
8. Implementation and governance evidence. The implementation test plan, observed results, formal review, ADR registry entry, and final admission status remain outstanding.
9. Re-verification of moving targets. twgt-schema-gate main was observed at 574dcab… during this session. Any implementation based on this ADR must re-verify the current main head and confirm that the sections §2.1 through §2.5 remain accurate at that revision. If any observed file has changed materially, this ADR requires update before implementation proceeds.

These items must be resolved through implementation evidence and the appropriate governance process. They must not be treated as satisfied merely because this draft records the design decisions.

9. Status and change control

This document records the six design choices confirmed for drafting on 2026-10-19. It remains a proposed ADR, not evidence that implementation has occurred or that the ADR has been formally admitted.

Implementation, pin refresh, validation, review, and admission must remain separately traceable. Any future change to the authoritative enforcement point, pinning model, or candidate-mapping authority must follow the applicable change-control process.

Evidence summary

All empirical claims in §2 were established by commands run during this drafting session:

§ Claim Command source
§2.1 11 registry entries, 4 orphan files at main; main = 574dcab gh api .../schemas/registry.json, .../schemas/v1, .../schemas/v1/common, .../git/ref/heads/main
§2.2 8 entries, 8 files at pinned 93fcb3b; pin hash map matches gh api ...?ref=93fcb3b for registry, v1/, v1/common; cat twgt-bridge/pins/twgt-schema-gate.json
§2.3 CapabilityRecord field list, additionalProperties default, unconstrained string fields gh api .../capability-record.json
§2.4 CANDIDATES.md exists, self-labels RESEARCH_PATTERN / Authority: NONE ls, head -n 60 on engineering-intelligence/capabilities/CANDIDATES.md
§2.5 Pin fields, registry_sha256 duplication, verifier step list, no registry_sha256 read, no enumeration cat twgt-bridge/pins/twgt-schema-gate.json, gh api .../verify-registry.mjs

No empirical claim in this ADR rests on external inspection. §8 item 9 records that this evidence is time-bounded to the observations made during drafting and must be re-verified at implementation time.preserving all six confirmed decisions and resolving only evidence-backed issues?
