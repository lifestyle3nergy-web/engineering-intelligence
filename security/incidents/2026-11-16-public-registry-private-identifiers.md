# Security incident: private repository metadata in public registry artifacts

**Incident ID:** EI-SEC-2026-001  
**Affected component:** Engineering Intelligence repository inventory pipeline  
**Origin:** PR #61, merged 15 November 2026  
**Review reference:** [Devin security review](https://github.com/lifestyle3nergy-web/engineering-intelligence/pull/61#pullrequestreview-5909368502)  
**Status:** Remediation proposed; historical exposure assessment remains open  
**Evidence class:** Observed repository state and implementation evidence

## Executive summary

The inventory generator enumerated repositories visible to its authenticated GitHub identity, including private repositories. It then wrote visibility metadata, repository identifiers, names, and observed commit references into public registry artifacts. It also wrote a separate private inventory file inside the public repository. The separate filename did not create an access-control boundary.

The reviewed public branch contained private records in the public inventory, upstream pin artifact, and separately named private inventory file. The remediation branch removes the tracked private artifact and rebuilds the public inventory and pins from records explicitly classified as public.

## Impact and scope

- Private repository identities and associated metadata were present in public Git-tracked artifacts.
- The affected data classes include repository names, numeric and node identifiers, branch metadata, and commit SHAs.
- The incident does not establish whether private source-code contents or credentials were exposed.
- Public Git history may retain earlier versions even after the current files are corrected.
- Copies may also exist in forks, clones, caches, indexes, downloaded artifacts, or external mirrors.

This report intentionally excludes the affected repository names, identifiers, and commit SHAs to avoid reproducing the exposure.

## Root cause

The generator treated visibility as descriptive metadata rather than an authorization constraint. It used an owner repository listing that included private repositories, serialized all records into public artifacts, and stored the purported private subset inside the public checkout.

The acceptance suite checked inventory counts and SHA formatting but did not enforce a public/private publication boundary. Its fixture traversal also failed to propagate nested validation errors. The tree digest covered filenames rather than file contents.

## Containment and corrective actions

1. Replace the inventory generator with explicit visibility classification and fail-closed handling for unknown visibility.
2. Require private storage outside the checkout; enforce restrictive filesystem permissions.
3. Generate public inventory and pins from public records only.
4. Remove the tracked private inventory artifact from the current branch.
5. Remove restricted records from current public inventory and pin artifacts.
6. Add publication classification to the repository schema.
7. Add G06 to compare public artifacts with the protected private inventory and inspect tracked paths.
8. Correct G01 to hash file contents and G04 to propagate nested fixture failures.
9. Add synthetic privacy regression tests and CI checks.
10. Require independent review and explicit human approval before merge.

## Historical exposure assessment

Current-tree cleanup does not erase earlier Git objects. A separate authorized review must inspect reachable commits, PR diffs, repository forks, Actions artifacts, caches, and known external copies. If history rewriting is considered, it requires a coordinated decision and cannot guarantee removal of already copied data.

Do not force-push, rewrite protected history, delete forks, or contact external parties as part of this remediation PR. Those actions require separate approval and an evidence-preservation plan.

## Verification and closure criteria

- No restricted records in current public inventory or pins.
- No tracked private/restricted inventory artifact.
- Private storage is outside the checkout and permission-restricted.
- G06 passes against protected inventory.
- Synthetic negative tests reject name, identifier, SHA, tracked-artifact, and unknown-visibility leaks.
- G01 and G04 regression tests pass.
- CI is green on the exact reviewed head SHA.
- Independent human security review is complete.
- Historical exposure assessment has an owner, documented evidence, and a separate closure decision.

**Incident state:** OPEN until historical exposure review and independent security approval are complete.
