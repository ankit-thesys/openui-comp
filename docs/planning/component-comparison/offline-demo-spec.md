# Offline component comparison demo

Status: user approved implementation on 2026-10-26 after design interview.
Owner: one worker. Additional user requirements may arrive through the orchestrator.

## Outcome

Extend the existing component-comparison example with an Offline demo mode beside
Live AI. Keep the real legacy library on the left and the migrated kits library
on the right in isolated iframe documents. Preserve the working live experience.

## Confirmed scope

- Cover every shared chat-library registry entry, with labeled sections and
  representative variants. Current generated specs contain 84 shared names:
  80 are reachable from Card; Label, Slice, SwitchGroup and SwitchItem are not.
- One curated valid chat response covers the 80 reachable names. Provide a
  separate clearly labeled direct-component section for the remaining four.
  Do not change library schemas or production exports to force reachability.
  Use existing supported component/registry boundaries; report a concrete blocker
  if a direct example cannot be exercised honestly without production changes.
- Coverage means actual rendered examples, not names merely appearing in strings.
  Nested helper entries may count through their valid parent composition; document
  this explicitly. Tabs, accordions and carousels retain normal interaction, so
  some examples are revealed through interaction rather than simultaneously visible.
- Provide Render all instantly and Stream demo using identical curated content in
  both panes. Streaming is local progressive playback, with Stop and Replay.
- Preserve shared theme, equal pane widths, response inspection and independent
  form drafts. Offline submissions and follow-up actions append submitted values
  and originating pane to a local activity log. They never generate a next turn.
- All assets are local. Offline playback and actions make zero generation/API or
  external-service requests and work without credentials. Loading local static
  assets is allowed. Do not silently substitute live or mock network generation.

## State and isolation requirements

Mode changes must stop/fence active work so late live chunks or frame actions do
not alter the new mode. Keep live conversation and offline fixture state clearly
separated, using the simplest explicit reset behavior; explain it in the UI.
Stop retains the visible partial response; Replay restarts the immutable saved
demo. Instant renders the complete content. Replay must not destroy source chunks.
Keep iframe source/origin/revision protections and scoped per-pane error display.
No API key or local environment values in fixtures, documentation or bundles.

## Implementation boundaries

Work only in examples/miscellaneous/component-comparison and its planning docs
in /Users/ankitdas/.codex/worktrees/component-comparison/openui on the existing
codex/component-comparison branch. Production packages, repository root lockfile,
other worktrees, friend directories, and frozen beta evidence are read-only.
Do not modify /Users/ankitdas/thesys/openui or user preview edits. No push, PR,
merge, release, publication or issue closure is part of this dispatch.

Use existing public styling/component APIs. No runtime patches, schema changes,
custom resolvers or newly invented product APIs. Keep inherited HorizontalBar
default-height/legend-fit instability disclosed; do not silently fix it or claim
unconditional parity. Use only one worker; do not delegate or spawn subagents.

## Validation and deliverables

1. Add a machine-readable inventory mapping all 84 names to examples and whether
   they are streamed, nested or direct. Verify against both generated registries.
2. Exercise actual parser/renderer behavior in both panes, including components
   inside tabs/accordions. Preserve real errors and document inherited limitations.
3. Verify instant and completed stream use identical content; Stop, Replay and
   mode switching fence stale work. Test offline actions log values without AI.
4. Browser test with generation endpoints blocked/counting requests and external
   network blocked. Demonstrate both panes, locally served media, themes and no
   credentials requirement. Avoid additional paid/live requests for offline tests.
5. Run focused behavior tests, type/build checks and a bounded browser pass. Keep
   evidence factual; one screenshot is not an all-component parity certificate.
6. Update README and validation notes, commit only owned files locally, leave a
   runnable demo URL and concise handoff with commit, coverage, tests and gaps.

## Research starting points

- Existing mock.mjs covers 13 registry names and demonstrates local chunking.
- .generated/legacy.json and migrated.json contain matching signatures.
- packages/kits/src/react/chat/libs/openuiChatLibrary/prompt-options/index.ts
  has five richer examples; replace remote media with local assets.
- validation/beta17/fixtures/payloads.mjs is read-only streaming reference.
- The current live example is verified with the dev API; retain its server-only
  environment configuration without reading or copying the secret into evidence.

## Pending additions

The user will describe additional requirements in this chat. Implement the above
confirmed scope now, but keep changes localized and respond to orchestrator
updates before making assumptions about new requirements.
