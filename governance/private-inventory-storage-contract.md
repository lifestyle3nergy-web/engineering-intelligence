# Protected private inventory storage contract

**Status:** Proposed for independent review  
**Classification:** RESTRICTED operational data  
**Owner:** Engineering Intelligence registry maintainers

## Purpose

The inventory pipeline may discover both public and private repositories. Discovery does not grant publication authority. Restricted records must be stored outside this repository's working tree and must never be committed, uploaded as a CI artifact, cached, or emitted into logs.

## Storage admission

- Provision an absolute PRIVATE_INVENTORY_DIR outside the Git checkout.
- Resolve the directory after creation and reject it if it is equal to or nested under the repository root.
- Restrict the directory to the executing account (POSIX mode 0700) and the inventory file to 0600.
- Use an encrypted, access-controlled volume or secret-backed private storage service in production.
- Do not use a public repository, public object store, GitHub Actions artifact, cache, issue, PR comment, or build log as private storage.
- If storage is unavailable, inaccessible, inside the checkout, or cannot be permissioned, stop with HOLD. Do not fall back to a tracked file.

## Record contract

The external JSON envelope contains schema_version, fixed classification RESTRICTED, and records containing private repository metadata, including identifiers and observed commit references.

The envelope is operational data, not a public schema example. Never copy real records into fixtures, documentation, telemetry, or test output. Test data must be synthetic.

## Access and lifecycle

- Only the inventory execution identity and explicitly authorized maintainers may read the store.
- Access must be auditable and reviewed periodically.
- Apply the organization's approved retention and deletion policy.
- Rotate credentials when access is suspected to be compromised.
- Restrict backups and replicas to the same access and retention controls.
- CI must not receive the production private inventory unless a separately approved protected environment is configured.

## Publication boundary

Only records explicitly classified as visibility=PUBLIC and publication=PUBLIC may enter public inventory and pin artifacts. PRIVATE, INTERNAL_ONLY, missing, malformed, or unknown classifications are not publishable.

The public pipeline emits no private counts, names, IDs, node IDs, branch names, or commit SHAs. G06 compares generated public artifacts with the protected inventory before publication.

## Acceptance

1. Private storage resolves outside the checkout.
2. Directory and file permissions are restrictive.
3. Private inventory is absent from git ls-files.
4. Public inventory and pins contain only explicitly public records.
5. G06 passes against the protected inventory.
6. Any missing prerequisite returns HOLD/FAIL; there is no permissive fallback.
