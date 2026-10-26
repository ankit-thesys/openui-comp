# Ticket 46 — spec-axis review

**Verdict: functional scope satisfied; one small evidence-recording gap. No implementation blocker found.**

Verified HEAD `15d47db5c30fb85464830cf490064d6c20e20c41`; `git diff cf1a8a88123b9a577c9cb43ae69d857ea6242f11...HEAD` is nonempty (5 files,33 additions/19 deletions), and `git log --oneline cf1a8a88123b9a577c9cb43ae69d857ea6242f11..HEAD` contains exactly the ticket46 commit.

## Requirements

- **Satisfied:** “Workspace and release discovery support nested packages using the existing workspace model, without a chat-only hard-coded exception.” `pnpm-workspace.yaml:3` registers the kits grouping; `scripts/workspace-packages.mjs:7–16` uses the existing `./packages/**` pnpm selector. Peer and changeset checks share that helper. This is organizational grouping, not a chat-package exception.
- **Satisfied:** “Existing first-level packages remain discovered exactly once; organizational directories without manifests are not treated as publishable packages.” Fixture assertion `/private/tmp/ticket46-workspace.test.mjs:18–21` verifies exact discovery excluding manifestless kits parent. Independent read-only `pnpm --filter './packages/**' list --depth -1 --json` at the reviewed HEAD returned19 current first-level packages, without duplicate names/paths.
- **Satisfied by supplied evidence:** “A temporary nonpublishing nested fixture is discovered by build and peer checks; an intentionally incompatible peer window is rejected.” Tests:18–29 exercise actual pnpm build selection and peer guard; tests:36–51 cover release discovery and nested peer-manifest paths. Supplied full.log reports5/5pass.
- **Satisfied:** “No dashboard package, old-package alias, public API change, or release is introduced.” None is in the five-file diff. Keeping the existing kits package until the subsequent migration is appropriate for this bounded prefactor.

## Partial / unrequested

**Evidence-only:** “evidence records exact commands and source revision.” `/private/tmp/ticket46-full.log:1` begins directly with TAP; the test file:6 allows mutable TICKET46_SOURCE/default checkout. Neither supplied file records the tested git SHA or invocation. Add a short validation record binding the command, reviewed SHA and test/log hashes; no rerun is required if the executor can confirm that provenance.

No unrequested production feature found. pnpm setup in `.github/workflows/changeset-check.yml:19–21` supplies the new discovery prerequisite. No browser/build executed by this reviewer; no standards-axis assessment duplicated.
