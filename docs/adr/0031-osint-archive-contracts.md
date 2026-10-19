ADR-0031 — OSINT / Archive Contracts

Status: Proposed — design choices confirmed; implementation pending
Decision date: 2026-10-20
Scope: engineering-intelligence, twgt-bridge

1. Context

Engineering-intelligence frequently references external data (CI/CD documentation, OSINT tools, archived web pages). Currently, these references are stored in Markdown files (like reference/github-cicd/sources.md) and CANDIDATES.md. These files explicitly self-identify as RESEARCH_PATTERN with no authority.

However, there is no formal contract for how to transition an external URL or archive into an admitted evidence artifact. External data is volatile—URLs change, pages go down, and content is mutated. Without a strict intake contract, citing a URL is an assertion, not evidence.

This ADR defines the OSINT / Archive contract, ensuring that external data is admitted only by verifiable evidence (hashing, timestamps, immutable snapshots) and never by mere assertion.

2. Evidence and verification boundaries

[Session evidence]

· reference/github-cicd/sources.md lists external URLs under RESEARCH_PATTERN.
· foundations/TWGT_Engineering_Foundation_Research_Record.md contains internal research notes.
· docs/adr/0015 (residing in TWGT-) defines the baseline for provenance intake and admission.
· The existing provenance.json schema (ADR-0028) requires artifact_hash, produced_at, and producer.

3. Decisions

D1 — URLs are assertions; Artifacts are evidence

A raw URL or a citation in a Markdown file is classified as RESEARCH_PATTERN. It is an assertion. To become evidence (EXECUTED), an external source must be ingested as a cryptographic artifact.

D2 — The OSINT Intake Pipeline

When external data (an API payload, a web page, an archive) is ingested, the intake process must produce a Provenance record that includes:

· artifact_hash: The SHA-256 hash of the exact bytes retrieved.
· produced_at: The exact UTC timestamp of retrieval.
· producer: A strict identifier (e.g., bridge:osint-fetcher).
· source_locator: The exact URL or external identifier.

D3 — Archives must be immutable (Append-Only)

If an external source changes (e.g., a webpage is updated, or a live API returns different data), the new retrieval must generate a new artifact with a new hash. Overwriting or mutating a previously ingested archive is strictly forbidden. The system must maintain an append-only ledger of external data snapshots.

D4 — Admission by Evidence

Ingesting external data does not make it "True." Once ingested, the artifact is evaluated by the exact same evaluate() process as internal code. It can be marked EVIDENCE_READY or HELD. However, EVIDENCE_READY for OSINT only means the data was successfully captured and hashed—it does not confer authority or automatic admission.

D5 — The sources.md boundary remains

The existing sources.md file remains a RESEARCH_PATTERN reference catalogue. It does not become an evidence database. If a specific source from that list is used to justify a capability, it must be fetched through the OSINT pipeline (D2), hashed, and stored as a new evidence artifact.

4. Consequences

Positive

· Eliminates "link rot" as an evidence failure mode (the hash captures the state at the time of retrieval).
· Prevents the conflation of an assertion (a URL) with actual evidence (a hashed, timestamped artifact).
· Aligns external data intake with the existing provenance.json and evidence-record.json standards.

Costs and risks

· Requires the implementation of an OSINT fetcher in twgt-bridge or the surrounding tooling.
· Requires storage space for immutable snapshots.

5. Open items and explicit uncertainty

1. Storage Strategy: Where are the immutable snapshots stored? (e.g., an archives/ directory in a repo, an S3 bucket, or a release artifact).
2. Legal/Compliance: The policies for retaining and redistributing copyrighted external web pages (e.g., scraper limits, robots.txt) are out of scope for this ADR.
