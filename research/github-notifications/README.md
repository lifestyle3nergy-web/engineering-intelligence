# GitHub notification audit and repository allocation

**Registry:** `EI-GITHUB-NOTIFICATION-REGISTRY-001`  
**Status:** Research snapshot — not an admission decision  
**Collection date:** 2026-11-20

## Executive result

The audit examined **533 Gmail threads containing 609 individual messages** from GitHub-origin notification senders. The machine-readable registry represents every message separately, groups messages by synthetic thread key, and excludes Gmail identifiers and private account data.

| Scope | Threads | Messages |
|---|---:|---:|
| Repository notifications | 463 | 503 |
| Repository workflow lifecycle notices | 16 | 16 |
| Account-security notifications (redacted) | 49 | 85 |
| Private Codespaces lifecycle notices (redacted) | 5 | 5 |
| **Total** | **533** | **609** |

The Gmail search covered GitHub-origin senders across searchable mail; it did **not** apply a verified `git reviews` label filter. The snapshot is therefore broader than the curated sample in [agentnotebooklm PR #3](https://github.com/lifestyle3nergy-web/agentnotebooklm/pull/3). It must not be described as an exhaustive export of that label.

## Repository activity concentration

The largest message clusters were:

| Repository | Messages | Allocated destination |
|---|---:|---|
| `TWGT-` | 258 | L2 admission/runtime consumer |
| `all-in-one` | 61 | Engineering Intelligence triage pending role verification |
| `twgt-schema-gate` | 57 | L2 schema authority |
| `twgt-bridge` | 35 | L2 read-only evidence transport |
| `litellm` | 19 | Engineering Intelligence triage pending role verification |
| `deepseek-harness` | 19 | External model integration test harness |
| `opa` | 15 | Policy-engine dependency/candidate |
| `zed` | 14 | Workflow maintenance; 14 deactivation warnings |

The full message-level classification and allocation metadata are in [registry.v1.json](./registry.v1.json) and [architecture-allocation.v1.yaml](./architecture-allocation.v1.yaml).

## Confirmed architectural allocation

- **engineering-intelligence** — canonical evidence atlas, ADR registry and research allocation owner. It records evidence; it does not grant runtime admission.
- **TWGT-** — application/admission consumer.
- **twgt-schema-gate** — canonical boundary schemas and dual-runtime contract validation.
- **twgt-bridge** — read-only evidence collection and verification.
- **twgt-git-hitl** — human review and authorization surface.
- **twgt-device-node** — local-first edge capture and extraction.
- **twgt-knowledge** — read-only knowledge consumer.
- **agentnotebooklm** — research application and candidate archive contract, not canonical TWGT governance.
- **OPA / Temporal / OpenTelemetry** — policy, orchestration and observability candidates; repository CI is not evidence of live TWGT integration.

The `twgt-persist-service` README could not be retrieved in this inspection. Its current repository contents and write authority remain **UNVERIFIED**, not absent. `twgt-relationship-types` was not inspected in this pass; retain its provisional ontology/schema allocation until its current pin and source are checked.

## Findings requiring attention

### P0 — Evidence bridge write-boundary contradiction

The [twgt-bridge README](https://github.com/lifestyle3nergy-web/twgt-bridge/blob/main/README.md) states that the bridge is read-only, does not automatically commit evidence, and has no merge authority. However, [harvest.yml](https://github.com/lifestyle3nergy-web/twgt-bridge/blob/main/.github/workflows/harvest.yml) declares `contents: write` and pushes collected evidence to `evidence/auto`.

The inspected [latest harvest run](https://github.com/lifestyle3nergy-web/twgt-bridge/actions/runs/44551062187) reports 9 checks passed and 0 failed, then fails because the remote `evidence/auto` branch contains work and rejects the non-fast-forward push. The operational failure is a branch concurrency conflict; the architectural issue is the mismatch between the declared read-only contract and the scheduled write path.

**Disposition:** HOLD the automatic publication path pending human review and an explicit authority decision. Do not quietly broaden the bridge's permissions.

### P0 — Engineering Intelligence privacy gate review

[Engineering Intelligence PR #70](https://github.com/lifestyle3nergy-web/engineering-intelligence/pull/70) has **15 unresolved review threads** (9 Devin and 6 Codex comments). The comments identify material risks around private inventory path containment, malformed protected records, nested private identifiers, common branch-name false positives, unstable generated-report digests, missing publication fields, schema reference resolution, configuration mismatch and regression coverage.

These are review findings requiring independent reproduction, not yet a declaration that every finding has been fixed or reproduced.

**Disposition:** HOLD merge and public inventory publication until the negative/positive privacy fixtures and acceptance gates pass on the exact PR head.

### P1 — TWGT dependency audit

[Run 44340894957](https://github.com/lifestyle3nergy-web/TWGT-/actions/runs/44340894957) failed at **Audit dependencies**. The job log reports 16 vulnerabilities: 8 moderate and 8 high. Prisma validation, build, tests, lint/typecheck and later checks were skipped.

**Disposition:** Inspect the full audit report and prepare a bounded dependency remediation. Do not use `npm audit fix --force` as an unreviewed repair.

### P1 — Research archive validator syntax failure

[agentnotebooklm PR #3](https://github.com/lifestyle3nergy-web/agentnotebooklm/pull/3) proposes a sanitized review archive, an event schema, capability registry and operational contract. Its [Archive Registry Validation run](https://github.com/lifestyle3nergy-web/agentnotebooklm/actions/runs/44437483866) fails before policy checks execute: Node reports a syntax error at `archive/scripts/validate-registry.mjs:13` because a literal `\\n` token appears between statements.

The PR's own README says the repository currently has no persistent Gmail OAuth worker or durable queue. The PR is a contract and sample-registry milestone, not an operational archive service.

**Disposition:** Keep as a candidate. Fix the validator, add event-schema fixtures and re-run CI before human review. Do not create a competing archive authority in the TWGT core.

### P1 — External E2E credential gate

[deepseek-harness run 44480853448](https://github.com/lifestyle3nergy-web/deepseek-harness/actions/runs/44480853448) fails because `DEEPSEEK_API_KEY_EXTERNAL` is not configured. The workflow deliberately fails instead of self-skipping and reporting a false green.

**Disposition:** Treat as an environment/secret configuration issue, not a confirmed application defect. Credential provisioning requires a separate human decision.

### P1/P2 — Open Engineering Intelligence reviews

- [PR #68](https://github.com/lifestyle3nergy-web/engineering-intelligence/pull/68): 2 unresolved findings — commit messages omit required filenames; CodeQL slugs containing periods violate the current slug schema. It proposes ADR allocations 0033–0042 while current main reports `next_number: 0033`.
- [PR #67](https://github.com/lifestyle3nergy-web/engineering-intelligence/pull/67): 2 documentation findings — GitHub-source navigation and an obsolete archive warning.
- [PR #69](https://github.com/lifestyle3nergy-web/engineering-intelligence/pull/69): no review threads returned; the PR body still requires verified fork-parent data refresh before acceptance.
- [PR #66](https://github.com/lifestyle3nergy-web/engineering-intelligence/pull/66): no review threads returned; its own disclosure says signature verification is not yet enforced by a gate (G11 deferred).

No ADR number was allocated for this research snapshot. Preserve the existing registry state and resolve the current allocation proposal before reserving another number.

## Account-security and workflow lifecycle signals

The 49 account-security threads (85 messages) were classified and redacted in the public registry. Categories include OAuth application authorizations, PAT lifecycle, MFA, SSH key events, app permission requests, passkey, password-change and sudo verification notices. The registry intentionally omits application names, token names, scopes, credential values, codes, message IDs and dates.

Review OAuth grants and PAT scopes privately in GitHub account settings. The email evidence alone does not establish that an authorization was malicious or that a token remains active.

Sixteen repository workflow lifecycle threads include 14 Zed workflow deactivation warnings and two NVDroid CodeQL lifecycle notices. Confirm ownership and recent use before re-enabling or retiring scheduled workflows.

## Classification and admission rules

Each email message is recorded as primary kind **CONTENT**. Where it requires action, **TASK** is a secondary kind. A transferable lesson becomes **INSIGHT** only after source corroboration and review. Repository names, workflow names, commit prefixes and tags are **KEYWORDS** metadata facets.

The proposed discipline taxonomy in agentnotebooklm PR #3 (CSSE, DSIE, GRRE) and its asset types should be treated as separate dimensions, not as replacements for the four record kinds.

All notification-derived claims remain `CLAIM` and `HELD` until corroborated against the exact GitHub run, PR, review or commit. A notification is not a workflow verdict, authorization, admission or merge approval.

## Source architecture

The allocation follows the existing Engineering Intelligence boundary stack:

`GitHub Actions → evidence artifact → twgt-bridge (read-only) → pinned schema verification → human review/admission → engineering-intelligence knowledge`.

Relevant existing design references:

- [Engineering Intelligence README](https://github.com/lifestyle3nergy-web/engineering-intelligence/blob/main/README.md)
- [EPR-019 — schema validation at agent boundaries](https://github.com/lifestyle3nergy-web/engineering-intelligence/blob/main/epr/EPR-019-schema-validation-at-agent-boundaries.md)
- [EPR-020 — runtime evidence as a contract](https://github.com/lifestyle3nergy-web/engineering-intelligence/blob/main/epr/EPR-020-evidence-as-a-contract.md)
- [ADR-0032 — external agent and tool contracts](https://github.com/lifestyle3nergy-web/engineering-intelligence/blob/main/docs/adr/0032-external-agent-tool-contracts.md)

## Required next actions

1. Hold the bridge's automatic write path until its permissions and README contract agree.
2. Resolve PR #70 privacy findings and run independent regression fixtures.
3. Repair the agentnotebooklm archive validator and prove the contract workflow passes.
4. Triage the TWGT dependency audit without forced bulk upgrades.
5. Resolve PR #68's slug and commit-scope findings before further ADR allocation.
6. Review GitHub OAuth grants, PATs and authentication notices privately.
7. Assign unverified repositories to a named owner only after inspecting their current README, tree, contracts and workflow state.

**No repository was merged, no workflow was changed, no permission was granted, and no credential was created or modified during this audit.**
