# engineering-intelligence

The TWGT knowledge pillar. Home of the **Internet Engineering Evolution Atlas** and the **Engineering Problem Records** (EPRs) that motivate every TWGT system.

This repository is the reason every other TWGT repository exists. No code here. No schemas. No agents. Just the source-graded, evidence-disciplined record of engineering problems, the historical evidence that constrains them, and the governance path that carries them into implementation.

## What lives here

- `wiki.md` — the Internet Engineering Evolution Atlas. Source hierarchy, evidence labels, EPR-001 through EPR-017, transfer-governance path.
- `epr/` — individual Engineering Problem Records in their own files, one per record, cross-referenced from the atlas.
- `assets/wiki.css` — the stylesheet for the rendered atlas.
- Pages renders the atlas at `https://lifestyle3nergy-web.github.io/engineering-intelligence/`.

## Three-repository architecture

`engineering-intelligence` defines **why**; `twgt-schema-gate` defines **what**; `twgt-bridge` independently verifies **prove**. See `governance/three-repository-architecture.md`.

## Sibling repositories

- `twgt-schema-gate` — implements EPR-019, schema validation at every agent execution boundary.
- `twgt-bridge` — read-only evidence collector. Verifies the schema-gate against pinned SHAs. Publishes evidence to its own branch, never to main.

## Evidence discipline

Every claim in this library is labelled. Historical fact. Implementation evidence. Measured result. Engineering inference. Research hypothesis. Unverified. A statement that is not labelled is not a claim — it is a placeholder, and it must be resolved before anything downstream depends on it.

An inference does not become a policy. A hypothesis does not become an architecture. Both may motivate work; neither may substitute for it.

## Contributing

Every EPR is a file. Every file has a source list. Every source list has a hierarchy: primary instrument, manufacturer documentation, peer review, engineering press, community recollection. Where the hierarchy is thin, the evidence label says so.

See `wiki.md` §2 for the full method.
