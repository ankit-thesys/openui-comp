# Local PR draft — not opened or pushed

Proposed title: Extract text, media, sources and tables into React UI core

Proposed base: `codex/react-ui-core-layout` ([fork PR33](https://github.com/ankit-thesys/openui-comp/pull/33)). Head: `codex/react-ui-core-text-media`. Stack above PR33; do not include parent layout work in this slice's description. Relates to fork issue12; do not close it while acceptance remains blocked.

**User acceptance recorded:** the stable lazy vendor-CSS exception and its Vite/emitted-asset/bare-esbuild limits are approved. Production integration and final independent/CI validation are in progress; open the stacked draft only after those checks pass. No experimental plugin or custom runtime patch is adopted.

## Summary

Move the approved text, media, source/citation and table families into the new core root entry, preserving existing props, behavior and class hooks. Owned styles use stock Goober; no legacy SCSS dependency or custom runtime compatibility patch.

```text
@openuidev/react-ui-core
├── Table / ScrollableTable / CodeBlock
├── Markdown / headers / TextBlockView / text wrapper
├── images / gallery / tags / callouts / icon-image text
└── source context / citations / URL helpers
```

Keep legacy react-ui read-only. Preserve source quirks as disclosed below. A conventional authored-selector correction fixes Goober serialization while retaining legacy specificity; no parser modification or runtime selector transformation is introduced.

## Evidence

- **Before:** public tests fail on missing exports. The initial installed composer browser comparison found incorrect TextBlockView typography/gaps from mid-selector `:where` serialization; raw reports and the original artifact remain archived.
  **After:** terminal `:where` selector forms preserve matching/specificity and pass the unchanged composer matrix. Native SyntaxHighlighter theme imports use supported build-time theme-data bundling with the vendor MIT notice, not resolver shims.

**Current corrected production artifact:** `88fdccf94e39a5c58e5a2a80cdf7f755eb5f7326`; normal npm installation; tarball401238 bytes; SHA256 `bee4bc79ccac342cbdc433d16538b86be213aedd4da79a1ea325f6ea22002b6f`.

- Full package CI: **97/97**, plus formatting/lint/strict producer types/build/Publint/ATTW. Final run has required install access; earlier sandbox cancellation and formatting failures remain documented.
- Affected installed component/native/pruning checks: **12/12**; strict TS5.9.3 consumer declarations with `skipLibCheck:false` pass Bundler, NodeNext ESM and NodeNext CJS.
- Owned Table/ScrollableTable/CodeBlock/Markdown/header/text/non-math wrapper browser group: **6 cases /22,296 element snapshots**, plain CSS/Tailwind3/4, both actual stylesheet orders, theme variants, clipboard/copy states, overrides and host preservation.
- Composer browser group: **6 cases /30,012 paired snapshots** on the same corrected artifact. No assertions changed between the preserved failure and corrected retest.
- Comparisons finish finite animations before measuring settled endpoints; intermediate animation frames/timing are not certified. Both source and test reviews have zero outstanding scoped findings.

**Historical evidence—different artifacts, not a combined final run:** source/presentation12 cases /22,056 snapshots at `680118396`; fixed media6 cases /8,292 snapshots at `96221894a`. The earlier normally installed package's86 consumer checks and strict modes remain archived at `e4e245bcb`. Do not relabel those results as current-artifact measurements. Unchanged foundation/media matrices were not repeated.

Evidence: `packages/react-ui-core/evidence/text-media-selectors/`, `evidence/text-media-combined/`, and source/media/composer family `__tests__/results/` directories. Exact artifacts, locks, implementation manifests, fixture/runner hashes and first failures are retained.

## Merge Danger

**Door:** two-way. The new-package additions are reversible; no old-package migration, publication or deprecation occurs in this slice.

**Blast Radius:** core. New consumers and dependent kits may render these components; review visual cascade, package contents and preserved behavior before accepting.

**Accepted styling contract:** owned component styles remain stock Goober; only unmodified KaTeX vendor CSS/fonts use the private lazy import. Default Vite6.4.2 production builds provide automatic CSS/font delivery with ordinary component imports. About1.07MB of unused font files may be emitted, with no unused math CSS/font downloads; that cost is explicitly accepted. Bare esbuild requires asset loaders and CSS linking, so arbitrary-bundler zero setup is not promised. No experimental tsdown CSS plugin, font-copy configuration, CDN, custom injector or pruning patch. Normative decision: `docs/specs/react-ui-extraction-styling.md`. Final integrated artifact and independent validation results will replace the earlier investigation-only status before opening the draft.

**Inherited limitations:** pinned Citation does not dismiss on Escape and its trigger does not invoke the public onClick callback in either arm; source-item callbacks/outside dismissal work. Gallery opening leaves focus on BODY; cleanup resets body overflow to auto rather than restoring a custom previous value. Inline GFM alignment follows legacy inline textAlign rather than the anticipated alignment classes. CodeBlock retains its existing unhandled clipboard rejection and timeout cleanup behavior. Tooltip truncation/ref and parent Modal accessibility limitations remain inherited from PR33. These are disclosed baseline behaviors, not accessibility certification or approved redesigns.

SSR/hydration/streaming delivery, concurrent server isolation, final migration performance/memory and universal accessibility are outside this evidence. The scoped vendor-style exception is accepted; final integrated validation is still pending. No upstream writes, merge, release, legacy edit or preview change is authorized here.
