---
policy: allowlist
version: 1.0.0
effective: 2026-10-03
owner: lifestyle3nergy-web
authority: human-only
companion: policy/evaluation-policy.md
---

# Allowlist Policy

Authorization layer. Defines **who may touch what**. The constraint
layer — **how a change is judged** — is `evaluation-policy.md`.
Enforcement is CI, not convention.

## Actors

| Actor | Class | May write | May not write |
|---|---|---|---|
| human:@lifestyle3nergy | human | any tracked path | — |
| agent:bridge-harvest | scheduled | `evidence/**` on non-main branches | main, policy/, epr/ |
| agent:schema-verify | scheduled | read-only | any |
| agent:unknown | any | nothing | everything |

Unregistered actors default to `deny`. There is no default-allow.

## Paths

### Frozen — human-only, never writable by any agent


### Driftable — writable by named agents within budget


### Forbidden — never writable by anyone through CI


## Budget

Per single authorized change:

| Limit | Value |
|---|---|
| max_files_changed | 5 |
| max_lines_added | 200 |
| max_lines_deleted | 50 |
| max_interface_fields_changed | 0 |

Budget is measured on the diff against merge-base, not HEAD^.

## Expiry

Every authorization is bound to a single commit SHA. Nothing is
perpetual. A change from an actor without an authorization record for
that SHA fails closed.

## Prohibitions

An actor may never:

- edit this file
- edit `evaluation-policy.md`
- set `confirmed_by` on its own record
- merge its own PR
- push to `main` without a PR
- rewrite git history
- delete an evidence file
- create a new policy file
- add itself to any allowlist

## Amendment

This file changes only through a human-authored PR with:

1. an updated `version` field
2. a dated entry in `policy/CHANGELOG.md`
3. a note explaining what the previous version permitted that the new
   one does not

An amendment that widens the surface without removing something is
HOLD by default until reviewed.
