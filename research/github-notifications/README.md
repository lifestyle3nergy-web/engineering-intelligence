# GitHub notification audit and repository allocation

**Registry:** `EI-GIT-REVIEWS-LABEL-REGISTRY-001`  
**Status:** Research snapshot — not an admission decision  
**Collection date:** 2026-11-20

## Primary source: Gmail `git reviews` label

The exact user label was resolved through Gmail label metadata and verified against the label membership on returned messages.

- **511 labelled threads** were retrieved across all pages.
- **574 labelled message summaries** were retrieved and recorded individually.
- Gmail label metadata reports **626 messages**, leaving a **52-message reconciliation gap**. The search was repeated with `in:anywhere` and trash inclusion; it still returned 574 messages. The missing 52 messages remain **UNKNOWN**, not silently counted as inspected.
- Every returned message record has a synthetic event ID and synthetic thread-group key. Raw Gmail message/thread IDs are not published.

| Classification | Retrieved messages |
|---|---:|
| GitHub workflow-run notifications | 266 |
| GitHub pull-request check notifications | 213 |
| Workflow lifecycle notices | 16 |
| Preview deployment notifications | 5 |
| Private account / external identity notices (redacted) | 69 |
| Non-GitHub technical newsletters | 5 |
| **Retrieved total** | **574** |
| **Unreconciled against Gmail label metadata** | **52** |

The exact label registry is [git-reviews-registry.v1.json](./git-reviews-registry.v1.json).

## Repository activity concentration — exact label

| Repository | Messages | Allocated destination |
|---|---:|---|
| `TWGT-` | 234 | L2 admission/runtime consumer |
| `all-in-one` | 61 | Engineering Intelligence triage pending role verification |
| `twgt-schema-gate` | 57 | L2 schema authority |
| `twgt-bridge` | 35 | L2 read-only evidence transport |
| `litellm` | 19 | Engineering Intelligence triage pending role verification |
| `deepseek-harness` | 19 | External model integration test harness |
| `opa` | 15 | Policy-engine dependency/candidate |
| `zed` | 14 | Workflow maintenance; 14 deactivation warnings |
| `firefox-devtools-mcp` | 8 | Engineering Intelligence triage pending role verification |
| `agentnotebooklm` | 7 | Research/archive candidate; 2 CI messages and 5 preview messages |

The label also contains account-security notices, external identity notifications and newsletters. These are classified, but are not treated as repository evidence.

## Supplementary broad GitHub-sender audit

A separate broader sender search captured **533 threads / 609 message summaries**. It is preserved in [registry.v1.json](./registry.v1.json) as a supplementary audit snapshot, not as a substitute for the exact label registry. Its search scope is broader and its population differs from the `git reviews` label.

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

The inspected [latest harvest run](https://github.com/lifestyle3nergy-web/twgt-bridge/actions/runs/44551062187) reports 9 checks passed and 0 failed, then fails because the remote `evidence/auto` branch rejects a non-fast-forward push. The operational failure is a branch concurrency conflict; the architectural issue is the mismatch between the declared read-only contract and the scheduled write path.

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
- [PR #69](https://github.com/lifestyle3nergy-web/engineering-intelligence/pull/69): no review threads returned; the PR itself requires authenticated regeneration and inspection of 164 fork-parent records before acceptance.
- [PR #66](https://github.com/lifestyle3nergy-web/engineering-intelligence/pull/66): no review threads returned; its own disclosure says signature verification is not yet enforced by a gate (G11 deferred).

No ADR number was allocated for this research snapshot. Preserve the existing registry state and resolve the current allocation proposal before reserving another number.

## Account-security and workflow lifecycle signals

The exact label registry redacts **69 private account/external identity messages**. Categories include OAuth authorization, PAT lifecycle, MFA, SSH keys, permission requests, passkeys, password changes, external account logins, verification notices and service onboarding. Application names, token names, scopes, codes, IP addresses, email addresses and private identifiers are excluded.

Review OAuth grants and PAT scopes privately in GitHub account settings. The email evidence alone does not establish that an authorization was malicious or that a token remains active.

Sixteen repository workflow lifecycle messages include 14 Zed workflow deactivation warnings and two NVDroid CodeQL lifecycle notices. Confirm ownership and recent use before re-enabling or retiring scheduled workflows.

## Classification and admission rules

Each email message is recorded as primary kind **CONTENT**. Where it requires action, **TASK** is a secondary kind. A transferable lesson becomes **INSIGHT** only after source corroboration and review. Repository names, workflow names, commit prefixes and tags are **KEYWORDS** metadata facets.

The discipline taxonomy proposed in agentnotebooklm PR #3 (CSSE, DSIE, GRRE) and its asset types should be treated as separate dimensions, not as replacements for the four record kinds.

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
8. Reconcile the 52-message difference between Gmail label metadata and retrievable message summaries.

**No repository was merged, no workflow was changed, no permission was granted, and no credential was created or modified during this audit.**
