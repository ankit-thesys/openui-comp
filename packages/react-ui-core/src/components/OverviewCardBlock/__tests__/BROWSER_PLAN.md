# Slice13 A/C browser parity — prepared, execution pending

Owner Worker2. Source batches670b14b70 and a3908845a. Root assigned only test/evidence paths here; Worker1 owns the integrated public root, metadata, other cards and first browser window. **No Chrome or local HTTP server has run for this harness.** Exact integrated artifact handoff and explicit window release are required before execution. The previous source/unit results are not browser acceptance.

## Public seams and matrix

Two fixture groups, each with plain CSS/Tailwind3/Tailwind4 and component stylesheet before/after host:12 total cases. Host order is set and asserted before the test-only mount function runs, matching the initial-order contract; no recovery after later host stylesheet changes is claimed. Both arms mount real React components; baseline imports committed legacy components and compiles unchanged official legacy SCSS, candidate imports only the normal installed public root. No fake observers, geometry, renderer or tooltip. Both public props and existing className/style customization are used; no new loading/disabled/sx API.

Leaves: actual metric variants; default/compact EntityList with markdown/numeric rows; standalone and composed lists with number/icon/image indicators. Check none/light/dark/custom-light/custom-dark themes, live updates, item counts0–5, image completion, subtitle/action omission, refs and callbacks. Clickable ListItem's missing keyboard activation and negative trend formatting are compared and reported as inherited behavior, not silently fixed.

Cards: Overview and Snippet grid counts0–5; container widths900/700/450 independent of viewport; responsive=false; gap0/8/2rem; clickable and static styles across themes, roles/tab stops and static callback suppression. Click/Enter/Space callbacks preserve original item identity/index. Real hover/focus, Overview carousel start/middle/end masks, container resize and item mutation use native scrolling/ResizeObserver/MutationObserver. No substitute public Carousel. Shared medium layout is validated through Worker1's composed-card public families; no private-layout test alias.

Snippet: assert actual text overflow before hover; both LHS/RHS tooltips appear in body portals under nested custom theme, compare real placement/styles, close via Escape/pointer leave, omit tooltip for untruncated LHS text. Unmount while tooltip open, refs detach, resize after unmount, remount and verify theme styles do not accumulate. Cleanup is observed through public DOM/errors, not private observer instrumentation.

All groups test nested/independent themes, explicit host overrides and hover, unrelated host sentinel, one Goober style tag and unchanged consumer/lock. Snapshots compare settled computed styles, visible geometry, stable class hooks and SVG. Finite animations are finished using the browser's standard API; transition-frame timing is not certified.

## Artifact and comparison integrity

Mandatory full40hex CORE_ARTIFACT_REVISION, exact tarball path and64hex SHA. Runner checks tarball bytes, normal installed directory and complete installed-file equality against the verified archive, records implementation manifest/lock/fixture/runner/bundle/host/legacy-CSS/image hashes and verifies consumer/lock immutability afterward. It only creates temporary extraction files outside the consumer.

Legacy/candidate graphs are separate and the candidate cannot import legacy source. Esbuild externalizes the already accepted KaTeX CSS path for these non-math fixtures, then asserts the browser bundle contains no residual math CSS import. This is JS/Goober parity only; it neither validates nor changes the accepted separate Vite math delivery contract.

Preparation does not require or start Chrome. With an exact normal artifact provided, use the runner's `--prepare-only` first. Persist each stdout/stderr and JSON under a new evidence attempt; never overwrite/relabel a failed attempt or weaken comparisons to obtain green. Browser/server/context cleanup is in finally. Stop on first mismatch, distinguish baseline/test/extraction cause and report. Worker1 must not run Chrome while this worker owns a released window.

## Execution prerequisites

Set these only from the frozen integration handoff:

- CORE_CONSUMER: normal installed consumer directory, immutable package and package-lock.
- CORE_ARTIFACT_PATH / CORE_ARTIFACT_SHA256 / CORE_ARTIFACT_REVISION: exact tarball/hash/full committed production revision.
- CORE_BROWSER_TOOLS: installed core tooling directory with esbuild and maintained Playwright; current Worker1 core directory is suitable.
- CORE_SASS_TOOLS: standard Sass tooling directory, currently /private/tmp/openui-controls2-tools.
- CORE_HOST_STYLES: plain/TW3/TW4 host stylesheet directory, currently /private/tmp/core-forms-host.
- CORE_BROWSER_RESULTS: new absolute output JSON path for each attempt.

Run `node packages/react-ui-core/src/components/OverviewCardBlock/__tests__/data-cards.browser.mjs --prepare-only` for bundle/provenance preparation. After explicit browser release, run without the flag. These commands refer to the repository root; all package-consumer paths come from the handoff, not changing workspace dist.

## Current source checks and reviews

Node syntax check, stock esbuild TSX transformation and strict TS5.9.3 NodeNext fixture consumer check with skipLibCheck:false pass. Typechecking uses staged scratch-package declarations so it does not claim final installed-package acceptance. Raw check evidence is recorded separately. No actual matched integrated bundle or browser result exists yet.

Independent Standards review: zero actionable static findings. Spec review found static-card coverage missing; added per-theme static comparisons, absent role/tabIndex and click-callback suppression, then reviewer confirmed resolution. Additional distinct hover/focus and RHS-tooltip/mask-settling checks strengthen preparation. Static review does not establish runtime reliability; first actual run may expose a test assumption or product mismatch and must be preserved.

SSR/hydration/streaming, performance/memory, full accessibility, error recovery and whole-migration completion are outside this matrix. Do not repeat unchanged slice12 or other workers' matrices.
