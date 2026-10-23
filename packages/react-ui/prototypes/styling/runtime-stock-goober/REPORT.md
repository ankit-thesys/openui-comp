# Stock Goober assessment — decision OPEN

October 24, 2026. The user does not want to maintain the experimental parser patch, generated cascade guards, private server targets or custom stylesheet-delivery bridge. This assessment removes all four. It does not select runtime Goober, revert to static CSS, authorize migration, or change package/component/ownership decisions.

**Conclusion: stock Goober meets several browser requirements, but does not meet the complete zero-setup SSR/streaming and cross-framework styling contract tested here.** The earlier patched candidate's compatibility, performance and memory results do not transfer to this candidate.

## What was actually tested

- Published **goober 2.1.19**, freshly downloaded from npm. Tarball SHA512 matches the registry integrity. Browser/server builds resolve to its unmodified `dist/goober.modern.js`; direct API controls use its unmodified CommonJS distribution. Stock distribution files are preserved with their license.
- React **19.3.1**, Chrome **156.0.8078.47**, production Next.js **16.4.2**. This is the installed test environment, not a claim about every version.
- Actual copied OpenUI components and the existing frozen component-style objects; actual Renderer/parser, AgentInterface, ChatProvider, fetchLLM and AGUI streaming. Original source plus existing SCSS is the comparison baseline. AgentInterface remains only a test subject.
- The inherited component copies retain ordinary class composition, inline theme variables, the existing ThemeProvider and its portal theme classes. These are OpenUI component/theme implementation, not features supplied automatically by Goober. Style objects were authored by the earlier prototype; this is not proof of a completed hand-reviewed SCSS migration.
- New adapter calls only stock `css(descriptor)` at component render time. A separate experiment wraps the same descriptor in standard `@layer components`. No framework detector, generated rollback rules, CSS parser fork, detached/fake target, compiled-resource cache, React style-resource bridge, consumer import scanner or consumer plugin is used.
- The buffered SSR comparison deliberately adds the **documented application integration**: render, call `extractCss()`, put the result in `<style id="_goober">`. This is explicitly not counted as zero-setup SSR.

## Requirements matrix

| Requirement | Stock-only result | Evidence and limit |
| --- | --- | --- |
| Browser components style themselves; no CSS import | **Pass, tested components** | With server CSS deliberately omitted, hydration inserted one stock `_goober` sheet and restored the actual Button styling. No legacy CSS link in runtime full chat. Server first paint was unstyled. |
| No consumer setup/plugin | **Pass for browser injection; blocked for required SSR experience** | No custom consumer build plugin in the browser/Next controls. Buffered SSR needs explicit application extraction/insertion. |
| Minimal unused JS/styles | **Partial pass** | Unused direct imports disappear. Button-only build has no chart code; Button-only render emits 7,415 CSS bytes, no chart/shell rules. Final public package barrel and npm-installed consumer matrix remain untested. |
| Preserve existing default appearance | **Pass for sampled unlayered catalog properties; incomplete overall** | All six host/order combinations preserved sampled default/control/chart/portal parity. Complex selector controls still expose parser limitations. This is not full visual or all-state certification. |
| Plain CSS + Tailwind v3/v4 defaults **and** intentional overrides, independent of order | **Blocked in tested configurations** | Unlayered output preserves sampled defaults but fails normal/hover overrides and explicit disabled cursor. Standard layered output improves overrides but loses defaults to v3 resets and to v4 when layer order is established late. |
| Actual chat/dashboard response streaming | **Pass for tested functional flow** | Both arms completed two real HTTP streams per workload; final content matched parser output; typing, theme switch, portal, sampled shell layout and cleanup passed. This is client data streaming, not automatic server CSS streaming. |
| Buffered SSR + hydration | **Pass with explicit integration** | Actual catalog CSS/class/computed Button styles remain identical before/after hydration; no hydration errors. Stock documented extraction works. |
| Automatic SSR and late streamed CSS, including Next | **Blocked** | Stock no-integration render emits classed markup without CSS. Production Next delivered initial Button and delayed Input HTML but no style tag; styling appeared after hydration. |
| Safe overlapping SSR requests | **Blocked with stock default sheet** | Two overlapping React streams share the default sheet. Request A's extraction contains both shell rule sets; request B's extraction is empty. This is stylesheet cross-contamination, not evidence that user message data leaked. |
| Isolated themes | **Partial pass through ordinary OpenUI theme code** | Actual portal received the requested accent; dark mode changed; 100 actual Button SSR themes and 1,000 API controls reused identical rules with inline variables. Full nested/sibling/concurrent theme coverage was not rerun; request-local style collection remains blocked. |
| Acceptable performance and memory | **Not established for this candidate** | Repeating chat/dashboard messages did not increase CSS; no long soak or paired pressure benchmark was repeated. Prior custom/static measurements cannot certify stock Goober. Correctness blockers prevent a production green flag. |
| Automated traceability/docs | **Not a Goober feature demonstrated here** | Frozen inputs and build manifests make this experiment traceable. A maintained source-to-doc/schema pipeline is separate package tooling and was not implemented or accepted in this test. |

## Exact observations

### Browser compatibility: 24 catalog runs

Two policies × three host fixtures × two actual stylesheet orders × baseline/runtime. Every run completed with no recorded JavaScript/hydration errors. Both policies used actual controls, tables, Bar/Line/Pie charts and deferred select/modal/tooltip portals.

- **Unlayered:** 12 runs; 18 failed assertions, all intentional override/cursor assertions (10 override and 8 cursor). No failures in the sampled default, changed-state, chart-internal or portal comparison assertions. In plain CSS/Tailwind v3, host CSS loaded after the Goober style fixed the normal override, but the tested hover override still lost. Tailwind v4 utilities lost to unlayered component declarations.
- **Layered:** 12 runs; 260 failed assertions (244 sampled parity and 16 cursor), with no intentional normal/hover override failures. Multiple property/phase assertions describe the same cascade conflict; these counts are not counts of independent bugs. Tailwind v3's unlayered preflight overrides layered component styles. In v4, declaring `components` before the host establishes its layer order gives the wrong default priority. Plain CSS also has sampled reset/portal effects.
- Example: the normal v3 Button is 36px high with `7px 10px` padding under unlayered styles; under the simple layered policy it becomes 24px high with zero padding and transparent background.

These are CSS ordering/layer/specificity integration failures, **not evidence that Goober cannot render alongside Tailwind at all**. The CSS standard places normal unlayered declarations above normal layered ones and establishes layer order by declaration. We have not proved that every possible stock-compatible authoring strategy is impossible; we have disproved acceptance of the two tested zero-host-setup policies. We did not add guards or alter the host's CSS to make either pass.

Raw evidence: `components/results/catalog-unlayered.json`, `components/results/catalog-layered.json`.

### Stock parser limitation, with an ordinary authoring alternative

Direct public API control, independent of the SCSS conversion tool:

```js
css({
  '&:not([data-disabled],[data-state=checked])': {
    '&:hover': { color: 'blue' }
  }
});
```

Stock output moves a `:hover` inside the selector argument list and changes the meaning. A quoted comma in an attribute selector is also incorrectly split. Merely flattening the selector did not fix the recorded examples.

This equivalent ordinary authoring form **does serialize correctly in the control**:

```js
css({
  '&:hover:not([data-disabled]):not([data-state=checked])': {
    color: 'blue'
  }
});
```

That is an authored CSS rewrite, not an engine patch. We did not change all copied components to use it or claim it solves every selector shape. A full selector/state audit would be needed for an ordinary-authoring-only migration. In particular, the direct parser results do not justify saying that maintaining a parser fork is unavoidable.

Raw evidence: `results/stock-controls.json`.

### SSR and concurrent streaming

The supported buffered integration is ordinary documented Goober usage:

```js
const html = renderToString(<App />);
const styles = `<style id="_goober">${extractCss()}</style>`;
```

The test inserts `styles` into the returned document. Without that integration, the actual Button first renders with browser-default 21px height and `1px 6px` padding; after hydration it becomes 36px high with `7px 10px` padding. Hydration itself reports no error; that does **not** mean styled SSR passed.

In the production Next test, the first HTML chunk contains the actual Button and a later chunk contains the actual Input after a 150ms Suspense delay. HTTP200, no component style tag in the response, no hydration errors, and styles appear in the browser after JavaScript runs. No `useServerInsertedHTML` registry was installed. Next's documented CSS-in-JS integration pattern requires a registry and insertion hook; the test did not supply one or invent a replacement.

For overlapping Node React streams, default `extractCss()` drains shared module state. After both shells render, A receives A+B shell CSS and B receives none. Extracting just once at shell readiness also misses the delayed component's rule. Waiting until all content completes could collect all CSS for one serialized response, but would not demonstrate early streamed styling or independent concurrent request collection. No internal `{data: ''}` target was used.

Raw evidence: `results/stock-controls.json`, `results/browser-controls.json`, `results/next-response.html`.

### Full chat and unused CSS

Four full-chat cases: chat/dashboard × original/runtime. Each completes two messages via actual HTTP AGUI transport and OpenUI parser. Expected final characters, partial delivery, typing during streaming, sampled shell layout, chart/table presence, portal theme, dark mode and zero live streams after unmount were observed. Runtime emitted no legacy stylesheet link. It retained one global Goober stylesheet after unmount, which is stock retention behavior, not by itself proof of a leak.

Runtime initial shell CSS: **75,666 UTF-8 bytes**. After either workload's first expanded response: **184,997 bytes**; the second response leaves that unchanged. This proves reuse for the repeated fixture, not bounded memory for arbitrary dynamic definitions.

Direct actual Button bundle: **11,386 JS bytes / 3,214 gzip**, React external, no charts/shell inputs. This is an absolute size, not a measured overhead against a matched baseline. Unused Button import reduces to a **41-byte marker-only module**. Actual Button import alone emits zero CSS; rendering emits **7,415 CSS bytes**, with identical CSS across 100 inline-theme variations. Tree shaking is bundler behavior; stock runtime generation is what delays insertion until `css()` executes. Our prototype authors call it during render, not at import time.

Raw evidence: `chat/results/stock-chat.json`, `chat/results/build.json`, `components/results/stock-bundles.json`, `components/results/stock-ownership.json`.

## What this means for the decision

Stock Goober is a working small runtime styling engine for the tested browser path, and documented buffered SSR works with integration. It is **not a green flag for our complete install-and-import, streaming SSR, request-isolation and cross-framework override requirements**.

The user has ruled out maintaining the experimental patch machinery. Preserve it only as comparison evidence. Do not reintroduce it to turn the stock failures green. The decision remains open for joint review; this report does not implicitly accept static CSS or another library.

No stock performance slowdown or memory leak is concluded here. The earlier long soak and pressure numbers belong to different candidates. A new paired benchmark and soak would be needed after choosing a candidate that meets the required correctness contract.

## Limitations and harness correction

- This is a private source-based prototype, not a published package-install test; some source style objects retain earlier authoring transformations. The direct API controls isolate engine behavior from those transformations.
- The actual full-chat initial SSR store is empty; full content arrives through the real browser-side HTTP/parser path. Actual server streaming is tested separately with React Suspense and Next Button/Input.
- No exhaustive accessibility, CSP/nonce, every component state, every browser, production load capacity or full long memory-soak claim.
- First Next fixture returned HTTP500 because the test's esbuild alias accidentally bundled a second React copy despite `external`. Fixed only test externalization, rebuilt and reran. The failed run and explanation remain in `results/browser-controls-first-failed.json` and `results/harness-correction.md`. Bundle sizes quoted above are from the corrected build. This was not a Goober defect or a runtime patch.

## Primary references

- [Goober extractCss documentation](https://goober.js.org/api/extractCss/): explicit post-render extraction/insertion and the hydration style ID.
- [Goober published source](https://github.com/cristianbote/goober): the downloaded 2.1.19 tarball is the authoritative tested source, preserved under `stock/`.
- [Next CSS-in-JS integration](https://nextjs.org/docs/app/guides/css-in-js): registry/insertion-hook integration for App Router; absence from the example list alone is not proof of impossibility.
- [CSS cascade layer ordering](https://www.w3.org/TR/css-cascade-5/#layer-order): why layering changes reset/override precedence.
