# Slice #12 icon/image text composers

Branch codex/core-text-media-composers starts from committed/reviewed9d72fb860,
including TextBlockView and InlineHeader/markdown prerequisites. Prior foundation
branch and media evidence4a82625a6 are preserved. Only IconTag, IconText, ImageText,
ImageTextLarge and owned tests/styles are edited. Neither preview, legacy source,
shared exports/package metadata/lockfile nor Worker1's TextContentWrapper is changed.

## Integration

Worker1 adds these four root family barrels; no new dependencies are required:

```ts
export * from "./components/IconTag";
export * from "./components/IconText";
export * from "./components/ImageText";
export * from "./components/ImageTextLarge";
```

Preserve runtime IconTag, IconText, ImageText, ImageTextLarge, plus existing public
IconTagProps/IconTagSize/IconTagVariant, IconTextProps/IconTextIconVariant/IconTextLayout,
ImageTextProps/ImageTextLayout and ImageTextLargeProps. These reuse committed IconWrapper,
IconProps and TextBlockView. No new styling prop/API or component subpath is introduced.

All component logic is copied from legacy. Only ordinary module-scope stock Goober
styles and their classes are attached. Base/layout/size/variant/part styles keep legacy
selector specificity and CSS variables with default fallbacks. Existing className
customization, refs, optional subtitles, rich markdown, icon aliases, imageSize and
alt fallback including explicit empty alt are retained. No old SCSS import is used.

## TDD and source checkpoint

Pre-agreed seam: built public-root imports rendered through React. Each component's
missing-export test failed first, then minimal extraction passed. All red/green logs
are in results. Four new public behavior tests and all85 component-consumer tests pass.
Configured strict source typecheck, ESM/CJS declaration build, native ESM/CJS root imports,
formatting and semantic lint pass. Public consumer type examples compile with strict and
skipLibCheck:false in Bundler, NodeNext ESM and NodeNext CJS modes.

Scratch producer /private/tmp/openui-composers12-producer copies the committed base plus
these owned sources, adding only the proposed root exports in that temporary copy.
It links existing stock dependencies and expands the repository strict tsconfig. It is
not a normal installed-package/Chrome acceptance artifact. The consumer helper uses
CORE_CONSUMER for that built root and CORE_TEST_TOOLS for existing JSDOM; Table bundle
tests also require CORE_BROWSER_TOOLS for esbuild. The first broad run omitted that last
variable and failed to locate esbuild; its raw log is retained. The affected file then
passed5/5, and the complete corrected invocation passed85/85 without assertion changes.

No collaborators, geometry, observers, icon loaders or markdown renderers are mocked.
Tests exercise real TextBlockView/InlineMarkdownRenderer composition and React DOM.
The public type fixture is consumer-types.ts. Normal installed dependency/declaration,
pruning and browser checks remain for integration.

## Pending browser coverage

Worker1 holds the browser window for Markdown/math checks; no browser was launched here.
Test all icon sizes/variants and loaded/fallback SVGs, horizontal/vertical composition,
bold/default text, subtitle wrapping/markdown, default/custom imageSize, empty/explicit
alt, mobile/desktop image layout and load/error observations. Compare default/nested/
custom themes and existing explicit className overrides across plain CSS/Tailwind3/4,
both stylesheet orders. Verify TextBlockView typography cascade against these horizontal
composition selectors, real image dimensions, cleanup and unused code/styles. No SSR,
accessibility, performance/memory or final whole-slice acceptance is claimed here.
