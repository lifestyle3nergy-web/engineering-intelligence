# Commit rules

These rules apply to every commit in this repository. They are enforced by
review, not by CI. They cannot be automated without creating a self-referential
loop, which is the failure mode they exist to prevent.

## 1. No self-referential evidence

Do not cite a run ID, a head SHA, a CI result, or an evidence artifact inside a
commit that changes the CI, test, schema, or workflow files that would produce
that result. The citation cannot be true when written: at the moment the
content is committed, the evidence it names does not yet exist for that commit.

A SHA or run ID recorded inside a file refers only to the revision that
produced it. It is `HISTORICAL` and `STALE` for every later head.

## 2. Declare the evidence class

Every factual claim in a commit message is exactly one of:

- `EXECUTED` — a command or test was actually run against the target. The
  result is bound to a source outside the commit (a PR check, a CI artifact, a
  log file, a signed record).
- `RESEARCH_PATTERN` — a reference to documented patterns, third-party
  analysis, or external repositories. Not repository-native evidence.
- `ENGINEERING_INFERENCE` — a reasoned conclusion drawn from one or more
  observations. Not a measurement.
- `RESEARCH_HYPOTHESIS` — a proposal not yet tested against the target.
- `UNVERIFIED` — asserted without a source.

A commit may not promote `RESEARCH_PATTERN`, `ENGINEERING_INFERENCE`, or
`RESEARCH_HYPOTHESIS` to `EXECUTED` without new execution on the exact head.

## 3. No claim without a source

Every claim in the `EXECUTED` class names its source: a SHA, a URL, a file path
with a line number, or an artifact identifier. Claims without a source are
`UNVERIFIED` by default, regardless of how they are written.

## 4. Stale evidence is invalid evidence

A SHA or run ID is valid only for the head it was produced for. A later commit
invalidates earlier evidence unless the referenced content is unchanged. The
correct response to a stale SHA is to re-run, not to rewrite the SHA.

## 5. Scope must match the diff

The commit message names every file changed. If the diff includes a file the
message does not name, the message is inaccurate. If the message names a file
the diff does not include, the message is inaccurate.

## 6. AI output is not `EXECUTED`

Code-search answers, large-language-model responses, and third-party repository
analysis are `RESEARCH_PATTERN` at best. They never satisfy an `EXECUTED`
requirement and they never bind to a candidate SHA.

## 7. No self-admission

A commit may not claim `ADMITTED`, `PASS_CANDIDATE`, `EVIDENCE_READY`, or any
equivalent. Those are decisions made by a reviewing authority on a head that
has been produced and observed. A commit that asserts its own admission is
misclassified regardless of its content.

## 8. Review-enforced

These rules are enforced by human review. Do not add CI checks that grep the
commit message for the rule numbers. A CI check that enforces these rules
would itself be a self-referential evidence claim.
