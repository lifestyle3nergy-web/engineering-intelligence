# Git Reviews Reconciliation and Controlled Remediation

**As of:** 2026-11-26  
**Status:** `IN_PROGRESS` — thread inventory reconciled; message-body and run-level reconciliation remains open.  
**Evidence class:** observed connector metadata plus independently corroborated GitHub run evidence.  
**Change boundary:** research/reporting branch only; no protected branch, deployment, permission, secret, schema-gate or canonical registry mutation.

## 1. Scope and reconciliation result

Gmail label `git reviews` reports **535 threads / 662 messages**. The search endpoint's global estimate was 643+, so the global estimate is not used as an exact count. Date-partitioned searches, deduplicated by thread identity, returned **535 unique threads**, matching the label's thread count.

Thread-level subject classification (not unique workflow-run counts):

| Classification | Threads |
|---|---:|
| Workflow failure notifications | 453 |
| Workflow lifecycle notices (disabled / impending disablement) | 30 |
| Account/security notices | 28 |
| Other / unclassified | 24 |
| **Total** | **535** |

Repository attribution from subject metadata:

| Repository / bucket | Threads |
|---|---:|
| `TWGT-` | 234 |
| `all-in-one` | 61 |
| `twgt-schema-gate` | 48 |
| `deepseek-harness` | 23 |
| `litellm` | 17 |
| `twgt-bridge` | 16 |
| `opa` | 15 |
| `firefox-devtools-mcp` | 8 |
| `engineering-intelligence` | 4 |
| `opentelemetry-injector` | 4 |
| `ai` | 4 |
| `codex` | 4 |
| `sglang` | 4 |
| `temporal` | 3 |
| `scorecard-action` | 3 |
| `rootly-mcp-server` | 2 |
| `agentnotebooklm` | 2 |
| `unsloth` | 1 |
| Other / no repository in subject | 82 |
| **Total** | **535** |

**Coverage qualification:** the 535/535 result is a complete thread-identity inventory for the label snapshot. It is not yet a claim that every one of the 662 message bodies has been read, that every repeated notification has been deduplicated to a unique run, or that every GitHub state is current. Full-body extraction, per-message label membership, run/commit correlation, and open-PR state reconciliation remain explicit work items. No Gmail message IDs, thread IDs, addresses, raw bodies, or attachments are stored in this public report.

## 2. Corroborated operational findings

| System | Evidence | Observed outcome | Disposition |
|---|---|---|---|
| `agentnotebooklm` PR #3 | [Actions run 45729432719](https://github.com/lifestyle3nergy-web/agentnotebooklm/actions/runs/45729432719) | Archive registry validator passed: 7 repository records, 8 agent categories, schema 1.0.0. | Syntax defect repaired in isolated PR branch; full Actions validator now passes. PR remains draft / human review pending. |
| `agentnotebooklm` | [Repair commit 4a51a316](https://github.com/lifestyle3nergy-web/agentnotebooklm/commit/4a51a3165b53728ab03316115619cadc1a24b392) | Two literal backslash-n sequences in JavaScript source caused Node to fail parsing the validator. | Root cause reproduced; syntax regression test added; local RED→GREEN reproduction and fresh Actions validator pass. The workflow does not yet invoke the new standalone test file; wire it into CI before calling the regression test CI-enforced. |
| `twgt-bridge` | [Actions run 45528742883](https://github.com/lifestyle3nergy-web/twgt-bridge/actions/runs/45528742883) | Read-only evidence collection and pinned-registry verification passed; publication to `evidence/auto` failed at push. Workflow token had `contents: write`. | Keep automated publication HELD. Default harvest should remain read-only; if publication is separately approved, use a serialized outbox/CAS writer with expected-head checks and bounded retry. Never force-push. |
| `TWGT-` | [Actions run 44340894957](https://github.com/lifestyle3nergy-web/TWGT-/actions/runs/44340894957) | Repository Governance and Prisma migration passed; dependency audit failed with 16 findings (8 moderate, 8 high); build, tests, lint/typecheck and later checks were skipped. | Security remediation required; skipped checks are UNKNOWN, not PASS. Re-run the complete suite only after the dependency tree is repaired. |
| `deepseek-harness` | [Actions run 44879893496](https://github.com/lifestyle3nergy-web/deepseek-harness/actions/runs/44879893496) | E2E preflight failed because `DEEPSEEK_API_KEY` was unavailable to the run; build/E2E were not established. | Verify secret presence, scope and environment binding without exposing the value. Treat as configuration admission, not a code pass. |
| `engineering-intelligence` PR #70 | [PR #70](https://github.com/lifestyle3nergy-web/engineering-intelligence/pull/70) | 15 inline review threads remain unresolved in the privacy-publication remediation. | Security HOLD until every critical privacy-path finding is addressed and protected-inventory acceptance is independently run. |
| Workflow lifecycle | Gmail label inventory | 30 lifecycle notices: 14 disabled notices and 16 impending-disablement notices in the earlier notice breakdown. | Do not bulk-enable. Map each workflow to an owner, business purpose, trigger, permissions and current replacement before any restoration. |

### Important archive-contract mismatch

The current archive source registry advertises status values including `AUTHORIZED` and `ADMITTED`, while the archive event schema defines a different event lifecycle and the validator locally accepts only `OBSERVED`, `VERIFIED`, `HELD`, and `UNKNOWN` for repository observations. This is a contract mismatch. It also risks conflating a machine-observed state with human authorization. Resolve it under the archive/schema owner with explicit negative tests; do not infer admission from validation or use machine-generated `ADMITTED`.

## 3. Source-of-truth and authority map

| Layer | Canonical responsibility | Must not do |
|---|---|---|
| Engineering Intelligence | Evidence atlas, EPR/ADR records, repository catalogue, provenance and cross-repository allocation. Canonical ADR registry: `governance/adr-registry.json`. | Become runtime admission authority or treat an inference as a fact. |
| `twgt-schema-gate` | Versioned boundary schemas and contract/compatibility tests. | Allocate ADRs or admit production actions. |
| `TWGT-` | Runtime policy/admission consumer and execution boundary. | Redefine registry ownership or self-authorize. |
| `twgt-bridge` | Read-only evidence collection, pinned-registry verification and evidence transport. | Mutate evidence branches by default or turn evidence into approval. |
| `twgt-knowledge` | Read-only knowledge/reference surface. | Become a writer or admission authority. |
| `agentnotebooklm` archive | Sanitized, provenance-bearing review/evidence archive and asynchronous intake contract. | Store raw Gmail content/identifiers publicly or grant runtime permissions merely by describing roles. |

**Decision invariants:** Evidence ≠ Validation ≠ Admission ≠ Merge Authorization. `UNKNOWN ≠ FALSE`; `INACCESSIBLE ≠ ABSENT`; `SKIPPED ≠ PASS`; `VALIDATED ≠ ADMITTED`. Keep the sequence `HOLD → EXECUTE → OBSERVE → VALIDATE → ADMIT`, with human authorization at the admission boundary and exact-head SHA binding.

## 4. Controlled evidence and remediation path

1. **Capture (read-only):** Gmail label selector, durable cursor/checkpoint, bounded pagination, per-message provenance, immutable source timestamp, collector version and payload digest. Do not persist raw email bodies or private Gmail identifiers in public repositories.
2. **Normalize and deduplicate:** stable idempotency key derived from provider + source message identity (kept in protected storage) + event type; correlate GitHub repository, workflow, run ID, attempt, PR number and exact commit SHA. Repeated notifications for the same run are updates to one event, not independent failures.
3. **Corroborate:** re-fetch the GitHub run, jobs, annotations, PR head and required checks. Record source URL, observation time, exact SHA, conclusion and freshness. A stale cached compare result is not a live ref.
4. **Validate:** validate the event envelope against the schema owned by `twgt-schema-gate`; validate source/visibility/privacy constraints; run policy tests; record positive and negative fixtures. A parser pass alone is not a registry pass.
5. **Persist safely:** PostgreSQL transaction for normalized event + outbox record; worker delivery is at-least-once with idempotent consumers. No claim of exactly-once delivery across Gmail, GitHub and storage.
6. **Authorize and execute:** human approval binds repository, action, branch, base SHA, candidate SHA, scope, expiry and approver. Only then may a least-privilege executor write to an isolated branch. No direct protected-branch writes, auto-merge or deployment under HOLD.
7. **Verify and learn:** exact-head CI, security, schema, privacy, review and provenance evidence; record deployment outcome only after deployment telemetry exists; append lessons without rewriting historical observations.

## 5. Repair priorities and acceptance gates

| Priority | Work item | Acceptance evidence |
|---|---|---|
| P0 | Complete full-body / per-message Gmail reconciliation and deduplicate repeated workflow notifications. | 662/662 label messages accounted for; no raw identifiers in public artifacts; 535-thread denominator retained; unresolved records explicitly UNKNOWN. |
| P0 | Resolve PR #70 private-storage, visibility, nested identifier, deterministic digest and schema-reference review findings. | All critical review threads resolved; negative privacy fixtures pass; protected inventory acceptance run in authorized environment; public artifact scan clean. |
| P1 | Repair `TWGT-` dependency audit. | Audit reports zero unaccepted high/critical findings; `npm ci`, lint, build, tests, format, source-boundary and diff checks all execute and pass on the same SHA. |
| P1 | Remove implicit evidence-branch writer from bridge harvest. | Read-only default; publication isolated behind separate explicit policy; concurrency/CAS prevents non-fast-forward loss; failure is visible and retryable. |
| P1 | Complete archive validator regression gate and align status vocabulary. | CI runs `node --test archive/scripts/validate-registry-syntax.test.mjs` plus full registry validator; schema/registry enum contract tests reject machine `ADMITTED`. |
| P2 | Repair DeepSeek E2E secret/environment binding. | Secret presence and scope verified without value disclosure; E2E runs against exact head; external provider errors classified separately. |
| P2 | Selectively restore disabled workflows. | Owner, purpose, trigger, permissions, secrets, runner and replacement reviewed; only approved workflows restored. |

## 6. Three-stage clean-merge sequestration

**Stage 1 — Sequester:** freeze automated writes and deployments; reconcile message bodies and run identities; preserve exact source refs and SHA; classify FACT / CLAIM / INFERENCE / UNKNOWN; maintain a restricted evidence store for protected identifiers.

**Stage 2 — Remediate in isolated branches:** fix privacy, dependency, bridge, archive and integration defects one bounded change at a time. Tests first; reproduce RED, apply the minimal repair, observe GREEN; no schema/pin changes outside the owning repository and its approval path.

**Stage 3 — Validate and authorize:** fetch/rebase the exact base; run `npm ci`, lint, build, tests, format check, repository-contract validation and `git diff --check` where the repository defines them; require security, schema, privacy, provenance, CI and human review on the exact candidate SHA. Merge and deploy remain separate approvals.

**Dependency order:** Engineering Intelligence allocation/policy → schema-gate contract → bridge evidence transport → TWGT runtime consumer → archive and other integrations. PR #68 allocations must be merged before consumers pin proposed ADR allocations; no consumer is to claim validation against unmerged registry entries.

## 7. Development verification protocol

For each JavaScript/TypeScript repository, use its actual package scripts and toolchain; do not assume all repositories share one package manifest. For `TWGT-`, the required acceptance sequence is:

```bash
git fetch origin
git rebase origin/main
npm ci
npm run lint
npm run build
npm test
npm run format:check
node scripts/validate-repository-contract.mjs
git diff --check
```

Any non-zero result is STOP / HOLD / no push. Record command, exit code, log reference, candidate SHA and test count. If a repository does not define a command, mark it NOT_APPLICABLE with a reason; never manufacture a pass.

## 8. External technical references

- [Google Gmail API — Synchronize clients with Gmail](https://developers.google.com/workspace/gmail/api/guides/sync): full sync, partial sync and history-based reconciliation; use paginated full sync as the recovery path when the incremental checkpoint is no longer usable.
- [GitHub Actions — Secure use reference](https://docs.github.com/en/actions/reference/security/secure-use): least privilege, minimum `GITHUB_TOKEN` permissions and secret-handling guidance.
- [GitHub Actions — Use GITHUB_TOKEN for authentication](https://docs.github.com/en/actions/tutorials/authenticate-with-github_token): scope permissions at workflow/job level.
- [JSON Schema Draft 2020-12](https://json-schema.org/draft/2020-12): versioned schema vocabulary and validation specification.
- [Open Policy Agent — Policy testing](https://www.openpolicyagent.org/docs/policy-testing): executable positive/negative tests for authorization policy.
- [AWS Prescriptive Guidance — Transactional outbox pattern](https://docs.aws.amazon.com/prescriptive-guidance/latest/cloud-design-patterns/transactional-outbox.html): reference architecture for atomically recording state and outbound event intent.
- [GitHub Actions — Concurrency](https://docs.github.com/en/actions/concepts/workflows-and-actions/concurrency): serialize conflicting jobs; use queueing rather than the default pending-run replacement when every publication attempt must be retained.
- [GitHub Actions — Deployments and environments](https://docs.github.com/en/actions/reference/workflows-and-actions/deployments-and-environments): environment protection rules, required reviewers and environment-secret gating.
- [GitHub — About rulesets](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/about-rulesets): protect branch/tag interactions and define bypass controls.

## 9. Deployment and approval state

- **Deployment outcome:** none verified for this reconciliation work. Existing CI outcomes above are not deployment outcomes.
- **Protected-branch merge:** HOLD.
- **Production deployment:** HOLD.
- **Permission/secret changes:** HOLD pending separate authorization.
- **Canonical schema/ADR registry mutation:** HOLD pending owner review and exact change proposal.
- **Isolated archive validator repair:** commit `4a51a3165b53728ab03316115619cadc1a24b392`; Actions run `45729432719` passed the full registry validator; PR #3 remains draft and awaits human review.

This report is a sanitized evidence index and execution plan. It is not an admission record, merge authorization, deployment attestation, or claim that all 662 message bodies have been individually reviewed.
