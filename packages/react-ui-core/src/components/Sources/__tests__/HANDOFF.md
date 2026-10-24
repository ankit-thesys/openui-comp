# Worker 2 slice #12 handoff

Branch `codex/core-text-media-foundation`, based on `21819f19d`.

Apply only these bounded source commits, in order:

1. `5e8d8c78c`: icons, source context/schema/safe URLs, favicon, citations and Sources.
2. `bdf10d239`: Callout, TextCallout, Tag, TagBlock and TextContent.
3. `da6bb9656`: Image, ImageBlock, ImageGallery/GalleryModal and responsive hook.

Parent PR33 corrections `72545980e`/`217a662d4` are retained on this branch as
`9c85e5476`/`00f340b79`; do not apply them again to Worker 1's corrected branch.
Legacy diff is empty. Root exports/package metadata/lockfile were not edited.
Both preview checkouts and untracked crates remain untouched. No browser window used.

## Integration contract

Root-export Sources, Citation, SourceFaviconImage, Callout, TextCallout, Tag,
TagBlock, TextContent, Image, ImageBlock and ImageGallery, keeping their parts/types;
export IconWrapper/IconWrapperProps
from the shared icon barrel. This includes CardSourceSchema/context/provider/helpers,
CitationItem/TextContentCitation, GalleryModal/GalleryModalProps,
ImageItem/OpenUIGalleryProps, TagSize/TagVariant and each family's existing props.
No new public styling API. Supporting icon schemas/types remain available to those
existing declarations without adding new root APIs unnecessarily.

Add legacy-compatible Zod `^3.25.0 || ^4.0.0` (imports use `zod/v4`) and
`@radix-ui/react-aspect-ratio ^1.1.1`; reuse existing lucide and Radix Tooltip.
Worker 1 owns final dependency classification/ranges and root metadata.

## Validation and review

15 new public-root tests; all 68 component consumer tests pass in the scratch producer
with proposed root exports. Configured strict source typecheck, ESM/CJS declaration
build, native ESM and CJS imports, formatting and semantic lint pass. See family
READMEs and raw logs. No normal-installed, browser, performance, memory or SSR claim.
Stock Goober declaration diagnostic with skipLibCheck false is disclosed separately;
no dependency patch or relaxed project configuration was introduced.

Two independent GPT-6.1 Sol agents reviewed every bounded diff (Standards and Spec),
read-only, with no actionable findings on either axis. They explicitly excluded pending
browser/installed evidence and recognized integration-owned metadata as a prerequisite.

The code-review skill's optional repository issue-tracker configuration file
`docs/agents/issue-tracker.md` is absent in this worktree. The reviews used the supplied
issue #12 acceptance and legacy source directly; rerun setup-matt-pocock-skills to restore
that configuration if the repository should carry it. This did not block scoped review.

## Still pending

Worker 1 owns final installed-package/build/type/CI/browser integration. Parent PR33 CI
must be green before downstream acceptance. Browser/framework/theme/portal behavior,
real observers/geometry, animation phases and unused JS/CSS still need validation.
Inherited limitations are listed in family READMEs. No silent baseline fixes were made.

InlineHeader, TextBlockView, TextContentWrapper, IconTag, IconText, ImageText and
ImageTextLarge are deliberately not started: ownership comes from orchestrator after
markdown prerequisites. OptionCards remains deferred. This handoff is not issue #12
completion, migration acceptance, publication or permission to merge.
