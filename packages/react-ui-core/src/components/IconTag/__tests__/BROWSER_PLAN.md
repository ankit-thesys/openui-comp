# Composer-only browser matrix — prepared, not executed

Worker2 owns IconTag, IconText, ImageText and ImageTextLarge. This fixture extends the
existing foundation/media driver through an explicit composers-only case. It does not
repeat completed foundation scenarios or change their strict style/geometry assertions.
The prior raw evidence remains pinned to its executed runner/artifact hashes.

**Worker1 owns the browser window. Do not launch Chrome until it explicitly releases
that window and provides a new immutable normal-installed integrated artifact.**

## Invocation and artifact boundary

Use the same CORE_CONSUMER, CORE_BROWSER_TOOLS, CORE_SASS_TOOLS, CORE_HOST_STYLES,
CORE_PLAYWRIGHT, CORE_ARTIFACT_REVISION and CORE_BROWSER_RESULTS inputs documented in
Sources/**tests**/BROWSER_PLAN.md. CORE_ARTIFACT_REVISION requires the full integrated
commit. Candidate root imports come only from the normal npm-installed package, never
shadow component implementations or a changing worktree dist. The runner rejects a
workspace/scratch symlink and verifies all six required public root exports.

```sh
CORE_MATRIX_CASES=composers node packages/react-ui-core/src/components/Sources/__tests__/foundation-media.browser.mjs --prepare-only
CORE_MATRIX_CASES=composers node packages/react-ui-core/src/components/Sources/__tests__/foundation-media.browser.mjs
```

The composer mode must run separately from foundation cases. Its baseline imports the
unchanged four legacy components, ThemeProvider and CardSourceProvider; the candidate
uses their normal package-root exports. Actual TextBlockView/markdown/citation/icon
support is reached through those public compositions. React/Radix/lucide/Zod versions
are aligned between arms through the existing test-only resolution setup. No production
patch, new styling API, layout mock, stylesheet bridge or import scanner is introduced.

## Meaningful coverage

Six cases: plain CSS/Tailwind3/Tailwind4, each component stylesheet before and after host.
Within each case:

- Five theme states, with default, all six semantic variants and all five badge sizes.
  Horizontal/vertical and bold/default composition plus filled/soft icon aliases.
- Default, zero,48px and72px imageSize through public React updates. One independent
  48px image geometry assertion accompanies baseline computed-style/visible comparisons.
- Actual markdown bold text and links, then updated title/citation markers. Sources
  resolve through CardSourceProvider. The updated citation must show the second source
  and navigate to its URL with no opener. This exercises a new composition interaction
  instead of repeating the independent source matrix.
- All four root refs and existing className overrides, normal and hover, including
  independent/nested/custom theme scopes. Hover targets root padding so incidental
  child citation hover does not hide a component override failure.
- Subtitle removal, default/explicit/decorative image labels, actual local image404
  and recovery, real icon changes, category fallback and empty-icon omission.
- Responsive mobile layout, host preservation, parent unmount/portal cleanup and
  remount without duplicate Goober styles. No owned disabled API is invented.

The common sampler compares actual computed CSS, pseudo styles where relevant,
SVG contents and visible geometry. It settles finite animations through Web Animations,
waits for React's committed config and actual image completion, and explicitly waits
for the requested dynamic SVG before sampling. It does not use fake DOM geometry,
ResizeObserver or internal renderer mocks. No performance timing claims are made.

## Preparation and remaining gates

Node runner syntax, esbuild fixture TSX transformation, strict fixture typechecking
against the built public declaration surface (skipLibCheck:false) and formatting pass.
The existing old-artifact presentation preparation still bundles successfully with the
conditional extension. The old installed package correctly rejects composer mode at
missing IconTag; this negative check is not successful integrated preparation.
Raw preparation logs are in results. No Chrome or composer compatibility pass is claimed.

After receiving the frozen artifact, run prepare-only first. Preserve first failures and
full installed manifest/bundle/host/runner/fixture hashes; classify actual extraction
regressions separately from baseline or sampler issues. Do not weaken comparisons or
rewrite historical evidence. New composer styles must pass the installed matrix before
final whole-slice acceptance. SSR/hydration/streaming, icon cancellation races, exhaustive
focus/accessibility and performance/memory certification remain outside this matrix.

## Reviewed handoff

Prepared harness commit c66fbd526. Independent GPT-6.1 Sol Standards and Spec reviewers
found no actionable scoped issues. Both reviews were static/read-only; neither executed
tests or Chrome. Old-artifact preparation preserves the exact prior foundation fixture,
baseline/runtime bundles, baseline CSS, host hashes and installed implementation manifest;
results/browser-preparation/unchanged-foundation-inputs.json records that comparison.
This is evidence that the conditional mode leaves those inputs unchanged, not a new
browser pass. Composer execution still needs Worker1's frozen integrated artifact and
explicit browser-window release. Production code/shared metadata and previews are untouched.
