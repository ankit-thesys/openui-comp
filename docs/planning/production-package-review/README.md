# Post-baseline production stage preparation

**Planning only.** The confirmed TL plan is
[production-package-tl-review.md](../production-package-tl-review.md). Production
implementation remains gated on preserved bench results and verifier completion.
No production code, build, browser or frozen artifact was changed for this audit.

Source snapshot: `ed4ada6cb56e6c25a37a15c576200e87c6fd09a7`; production reference:
`57ea72e2892df7fdd551c668d4480a0267f90a09`. The inventories include lab-only active
tests separately; production work must start from the clean production candidate.

| Stage | Ready checklist | Evidence |
| --- | --- | --- |
| Rename | [RENAME.md](RENAME.md) | [185 active/reviewable reference-bearing files](rename-inventory.json); frozen histories excluded. |
| Templates | [STYLES.md](STYLES.md) | [Source shape/line/hash inventory](style-inventory.json):139 object calls,38 identifier calls,126 existing templates; typed objects overlap those counts. |
| Public exports | [EXPORTS.md](EXPORTS.md) | [360 root symbols and actual kits consumers](export-inventory.json); no safe root removal proven yet. |

## Gate checklist before production work

- [ ] Verifier finishes and releases runtime/browser ownership.
- [ ] Preserve exact bench/verifier commits, preset/artifact identities and all
  nonpassing classifications. Full execution is not unconditional parity approval.
- [ ] Apply/retest only verifier-proven important cleanup, separately traceable,
  if the agreed safe subset is nonempty. No tentative removal.
- [ ] Record root/user disposition of baseline differences; Select's build-output
  shadow difference remains explicit, as do inherited limitations/raster reviews.
- [ ] Start isolated clean production changes: rename, then template conversion,
  then evidence-backed export cleanup, each separately reviewable. No merges or
  publishing. New validation/evidence stays in the lab PR.
- [ ] For ambiguous export removals or unavoidable kits internal dependencies,
  obtain that specific decision; no further broad plan confirmation is needed.

## Preparation checks performed

Tracked-text search plus TypeScript AST parsing/re-export tracing, without running
a typechecker, package build or browser. All360 root exports resolved through local
source; no external wildcard or unresolved export was encountered. All38
nonliteral Goober call arguments are static identifiers. JSON rows retain current
source line numbers and relevant hashes. Searches are evidence for this repository
snapshot, not proof of external API usage or runtime parity. This is a static
planning snapshot, not new production tooling or a maintained code-generation layer.
