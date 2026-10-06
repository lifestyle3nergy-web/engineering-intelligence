# GitHub CI/CD reference sources

**Purpose:** Citation catalogue for CI/CD evidence claims in engineering-intelligence.
**Evidence class:** `RESEARCH_PATTERN`. Documentation pages and schemas, not executed evidence.
**Authority boundary:** reference only. Nothing in this file authorises admission, deployment, or a capability grant.

## 1. Actions documentation

Workflow syntax, reuse, deployment environments, hosted and self-hosted runners.

- https://docs.github.com/en/actions
- https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions
- https://docs.github.com/en/actions/using-workflows/reusing-workflows
- https://docs.github.com/en/actions/deployment/about-deployments
- https://docs.github.com/en/actions/deployment/targeting-different-environments
- https://docs.github.com/en/actions/deployment/targeting-different-environments/using-environments-for-deployment
- https://docs.github.com/en/actions/using-github-hosted-runners/about-github-hosted-runners
- https://docs.github.com/en/actions/using-github-hosted-runners/about-larger-runners
- https://docs.github.com/en/actions/hosting-your-own-runners

## 2. Monitoring and troubleshooting

How a workflow run is observed after the fact.

- https://docs.github.com/en/actions/monitoring-and-troubleshooting-workflows
- https://docs.github.com/en/actions/monitoring-and-troubleshooting-workflows/monitoring-workflows
- https://docs.github.com/en/actions/monitoring-and-troubleshooting-workflows/viewing-workflow-run-history
- https://docs.github.com/en/actions/monitoring-and-troubleshooting-workflows/using-the-visualization-graph

## 3. REST API

What data can be collected programmatically and how it is shaped.
This is the API `twgt-bridge` already calls.

- https://docs.github.com/en/rest/actions/workflow-runs
- https://docs.github.com/en/rest/actions/workflows
- https://docs.github.com/en/rest/actions/jobs
- https://docs.github.com/en/rest/actions/artifacts
- https://docs.github.com/en/rest/actions/cache
- https://docs.github.com/en/rest/actions/self-hosted-runners
- https://docs.github.com/en/rest/actions/permissions
- https://docs.github.com/en/rest/actions/secrets
- https://docs.github.com/en/rest/actions/variables
- https://docs.github.com/en/rest/repos/repos
- https://docs.github.com/en/rest/commits/commits
- https://docs.github.com/en/rest/pulls/pulls
- https://docs.github.com/en/rest/pulls/reviews
- https://docs.github.com/en/rest/deployments
- https://docs.github.com/en/rest/deployments/statuses

## 4. Webhooks

Near-real-time event data. Payload schemas are the authoritative shape of
what GitHub emits.

- https://docs.github.com/en/webhooks/webhook-events-and-payloads
- https://docs.github.com/en/webhooks/webhook-events-and-payloads#workflow_run
- https://docs.github.com/en/webhooks/webhook-events-and-payloads#workflow_job
- https://docs.github.com/en/webhooks/webhook-events-and-payloads#deployment
- https://docs.github.com/en/webhooks/webhook-events-and-payloads#deployment_status
- https://docs.github.com/en/webhooks/webhook-events-and-payloads#pull_request
- https://docs.github.com/en/webhooks/webhook-events-and-payloads#pull_request_review
- https://docs.github.com/en/webhooks/webhook-events-and-payloads#push

## 5. Machine-readable schemas

The API shapes themselves, as opposed to the prose documentation in §3 and §4.

- https://github.com/github/rest-api-description
- https://github.com/github/rest-api-description/tree/main/descriptions/api.github.com
- https://raw.githubusercontent.com/github/rest-api-description/main/descriptions/api.github.com/api.github.com.yaml
- https://docs.github.com/en/graphql
- https://docs.github.com/en/graphql/overview/public-schema
- https://docs.github.com/en/graphql/overview/resource-limitations

## 6. Security, supply-chain, and provenance

Attestation, OIDC, dependency review, build provenance.

- https://docs.github.com/en/actions/security-for-github-actions/security-guides/security-hardening-for-github-actions
- https://docs.github.com/en/actions/security-for-github-actions/security-guides/using-openid-connect-with-reusable-workflows
- https://docs.github.com/en/actions/security-for-github-actions/using-artifact-attestations
- https://docs.github.com/en/actions/security-for-github-actions/using-artifact-attestations/using-artifact-attestations-to-establish-provenance-for-builds
- https://docs.github.com/en/code-security/supply-chain-security/understanding-your-software-supply-chain/about-dependency-review
- https://docs.github.com/en/rest/dependency-graph

## 7. DORA-style metric source signals

Two layers:

- Aggregated Actions metrics at organization and repository level
  - URL: TODO — not supplied with a stable URL in the session that
    created this catalogue. Verify before citing.
  - What it covers: Actions metrics exposed at organization and
    repository scope. The exact page title and path have changed
    between GitHub documentation revisions.
  - Rule: do not cite from memory. Confirm the URL resolves, capture
    the title, then add it here with the date it was verified.
- Raw signals from which lead time, deployment frequency, change-failure
  rate, and recovery time can be calculated:
  - workflow run completion — §3 `workflow-runs`
  - deployment records and statuses — §3 `deployments`, `deployments/statuses`
  - pull request merge time — §3 `pulls`
  - commit history — §3 `commits`

## Revision history

- 2026-10-07 — Initial catalogue. URLs reported, not independently fetched in
  the session that wrote this file. Evidence class `RESEARCH_PATTERN`.
