# OptionCards installed browser validation

The extracted OptionCards preserves the legacy controlled-selection contract, native button behavior and styles using stock Goober. No legacy files, package metadata, dependencies or shared helpers were changed by Worker2.

## Exact package

- Product revision: `4911a82f825ce518f073fd995637d853a38a6620` (Worker1 integrates reviewed source `ea6311ba0`).
- Tarball: `/private/tmp/core-option-cards-artifact/openuidev-react-ui-core-0.0.0-beta.0.tgz`, 498447 bytes.
- SHA256: `0a66152ad19a6c7e0a732a652175723e8bd1bcde1b5159a10e3966d835b67821`.
- Normal npm consumer: `/private/tmp/core-option-cards-consumer`.
- Each installed package file matches the verified archive. Raw reports retain the full per-file manifest, consumer lock hash, runner/fixture/bundle/host/baseline-CSS hashes and browser version. Before/after checks require installed package and lock bytes to remain unchanged.

## Result

Final image-inclusive run **PASS: 6 cases /15732 paired element snapshots** in Chrome156.0.8078.47, 2622 per framework/order case. No page/request/HTTP errors. Installed package and lock remain byte-identical. See results/browser/final.json and final.log. Chrome and the local HTTP server are closed; Worker2 releases the browser window to Worker1.

## Coverage

The same public-props fixture runs against the unchanged legacy component/SCSS and the installed public core root. Plain CSS, Tailwind v3 and Tailwind v4 each run with host CSS before and after the component stylesheet, set and verified before React mounts. This fixture placement does not implement dynamic production stylesheet recovery.

Checks cover no provider, light/dark/custom themes; nested and independent providers; host isolation; counts0–5 at450/480/481/700/768/769/900px; markdown, zero/icon/image/absent top slots; image fit and geometry; hover and keyboard focus; controlled selection without internal mutation; single/multiple parent updates; exact callback values; native click/Enter/Space/Tab; Tab skipping disabled buttons; native per-item/global disabled click suppression; root utilities and explicit descendant normal/hover/disabled overrides; live content/prop updates; refs and theme cleanup across unmount/remount. Computed styles and real geometry are compared after transitions settle. No browser DOM/geometry mocks, force clicks or custom Goober runtime patches.

## Attempts and review

`results/browser/attempt-1.json` passed6 cases /15246 paired element snapshots. The runner at commit03927d88a did not directly sample image nodes, so the selector was extended and a complete image-inclusive run is recorded separately in final.json. The first run remains historical evidence with its own runner hash.

The first installed-DOM command omitted the existing CORE_TEST_TOOLS environment and failed to resolve jsdom; installed-dom.log preserves this test-tool configuration error. Repeating with CORE_TEST_TOOLS pointing at existing integration tools passes both tests without installing or changing anything in the frozen consumer (installed-dom-with-tools.log).

Independent GPT6.1-Sol Spec and Standards source/test reviews report no remaining actionable findings. Both reviewers identified an immediate hover assertion that could sample the preserved160ms transition; it now settles before checking the expected color. Reviews were read-only and did not run Chrome.

## Limits

Native Tab/Enter/Space work in both implementations. Neither implements custom arrow-key navigation/roving focus; this inherited behavior is preserved, not redesigned. `selected` remains controlled: onToggle reports a value, and the parent owns updates.

SSR/hydration, transport/parser streaming, performance/memory, all other component families, transition-frame parity and arbitrary dynamically inserted host CSS are outside this bounded run. The existing math vendor-CSS delivery exception remains separate Vite evidence; the non-math fixture externalizes that CSS and verifies no residual math import is emitted. Final package-wide CI, exports/metadata, PR management and release remain Worker1/root responsibilities.
