# Foundation/media browser validation — prepared, not executed

The harness is owned by Worker 2 under this directory. Candidate components always
come from a normally npm-installed packed `@openuidev/react-ui-core` public root.
The runner rejects a workspace/scratch symlink and checks every required root export
before building. It does not create an alternate implementation or add missing exports.
Worker 1 owns the integrated package, shared metadata and first browser window.

**Do not launch Chrome until Worker 1 explicitly releases the shared browser window.**
After the integrated artifact is available, `--prepare-only` can check bundles and hashes
without launching Chrome. Static checks performed so far: Node runner syntax and esbuild
TSX fixture transformation. No browser results or compatibility acceptance are claimed. A negative prepare-only
check against the prior normal overlay consumer stopped at the missing Callout export,
as intended (`results/browser-export-gate.log`); it did not launch Chrome or validate
the new integrated bundle.

## Inputs and invocation

Use the existing normal browser tooling and host-style archive from earlier slices.
Set these environment variables to actual local paths/revision:

| Variable               | Input                                                                                          |
| ---------------------- | ---------------------------------------------------------------------------------------------- |
| CORE_CONSUMER          | Normal npm consumer containing the exact integrated tarball, React/DOM19 and package-lock.json |
| CORE_BROWSER_TOOLS     | Existing package with esbuild installed                                                        |
| CORE_SASS_TOOLS        | Existing package with Sass installed, for baseline comparison only                             |
| CORE_HOST_STYLES       | Directory with frameworks/plain.css, tailwind3.css and tailwind4.css                           |
| CORE_PLAYWRIGHT        | Absolute Playwright module entry used by the prior matrices                                    |
| CORE_ARTIFACT_REVISION | Full 40-character integrated production commit                                                 |
| CORE_BROWSER_RESULTS   | Output JSON path outside production files                                                      |

```sh
node packages/react-ui-core/src/components/Sources/__tests__/foundation-media.browser.mjs --prepare-only
node packages/react-ui-core/src/components/Sources/__tests__/foundation-media.browser.mjs
```

CORE_MATRIX_FRAMEWORKS and CORE_MATRIX_CASES optionally restrict diagnostic runs.
Final coverage uses plain,tailwind3,tailwind4 and presentation,media,sources: 18 cases
(two component/host stylesheet orders per framework/family). `before` places component
styles before host CSS; `after` places component styles after host CSS. Both arms use
matching React, Radix, lucide and Zod installations, including subpath imports. Only the
baseline arm imports read-only legacy source and compiled legacy SCSS. The candidate
bundle is checked to exclude legacy production source.

## Assertions

- Five theme states: no provider, light, dark, custom light and custom dark. Nested theme
  and independent sibling scope, body portals and explicit overrides are checked.
- All Callout/TextCallout/Tag variants, all Tag sizes, TagBlock wrapping and all three
  TextContent variants. Real className overrides use existing important plain/Tailwind
  utilities. Components without styling props use ordinary consumer CSS selectors.
- Callout animation start and collapsed endpoint through standard Web Animations APIs.
  Infinite ImageBlock spinner is paused at a shared phase, without mocking layout.
- Images: actual local SVG success, HTTP404 error, delayed loading, source changes,
  all Image ratios/fit modes, responsive ImageBlock, and favicon error/16px placeholder/
  recovery. Delayed requests are held/released through Playwright's network boundary.
- Gallery: zero through six images, responsive layouts, preview opening, body portal,
  native thumbnail scroll-end events, Space/Enter selection, close/Escape/outside
  dismissal, inherited focus/body-overflow observations and unmount cleanup.
- Sources: real Carousel overflow/navigation and native disabled previous-control state;
  direct/keyboard source selection, safe popup URL/no opener, blocked executable URL;
  inline citations, pin retention beyond pointer-leave delay, hover dismissal,
  baseline-compared Escape observations, source-item selection, empty/single lists, favicon fallback
  and dynamic category fallback. No new disabled prop is invented for these families.
- Exact paired computed styles, pseudo-element styles, visible geometry and SVG contents.
  Finite animations settle at endpoints; scrolling waits for native scrollend. React
  configuration waits for the fixture's rendered state, not a fixed render delay.
- Host content stays unchanged; portals disappear on parent unmount; remount does not
  duplicate the Goober sheet; uncaught browser exceptions fail the case.

## Evidence and boundaries

The runner requires a full integrated commit and records a path/size/SHA256 manifest
for every installed dist file plus package.json (and a manifest hash). The JSON also
includes metadata/entry/consumer-lock hashes, baseline/runtime bundle
hashes and byte counts, host and baseline-CSS hashes, exact fixture/runner hashes, Chrome
version, comparisons, status and first failing expected/actual snapshot. Save the actual
packed tarball and complete dependency/tool versions with Worker 1's integration evidence.
A prepared report is never a passing browser report. On failure preserve the original
report, diagnose the difference and rerun only after a justified correction. Do not remove
assertions to make inherited bugs look like desired semantics.

Known legacy behavior is recorded separately and compared between arms: GalleryModal's
initial focus and body overflow restoration, image error/source reset observations and
Citation's unused onClick prop and Escape dismissal. A baseline-equivalent Escape
result is an observation, not a claim of successful dismissal: the current controlled
Tooltip root has no onOpenChange handler, so this must not be silently redesigned. These comparisons are not accessibility certification.
The harness intentionally does not repair legacy behavior, test SSR/hydration/streaming
or certify performance/memory. Dynamic icon cancellation races and exhaustive keyboard
focus audits remain outside this prepared matrix. Bundle byte counts describe the complete
fixture, not unused-component pruning; final package pruning checks remain with integration.

Both preview checkouts, legacy source, production components, root metadata and optional
friend-baseline directories are untouched by this harness work.
