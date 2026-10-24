# Composite controls — scoped #10 work

Baseline: reviewed PR20 head `48a877064e0a2039c2c6949959168dea077a5d49`. Work is on `codex/core-composite-controls`; the prior audit/prototype branch is preserved. No legacy production, root barrel, package metadata, shared support or friend-baseline files are owned by this work.

## Integration dependencies

The component owner implements Calendar, DatePicker, Select (all existing parts), Slider/SliderBlock, Chips and OptionCards. The integration owner supplies root exports and package metadata plus shared prerequisites:

- `src/context/LayoutContext.tsx`: existing `useLayoutContext` (and existing layout provider/context if needed by its public contract).
- `src/hooks/useMultipleRefs.ts` and its `src/internalUtils/ref` dependency: existing `useMultipleRefs` and `assignRef`.
- DatePicker’s active entry delegates to Calendar. Its older IconButton-based helper module and date-picker-specific base styles are unreachable from that entry and are not extracted. No IconButton dependency is required by the active owned entry graph.
- OptionCards imports `InlineMarkdownRenderer` and `getRowConfiguration` from `../_shared/cards/smallCardBlockUtils`. The markdown graph reaches MarkDownRenderer, Citation and remark helpers; it must not be replaced by a simplified renderer merely to satisfy the build.

Runtime dependency additions from the existing implementations are `@radix-ui/react-select` (`^2.1.5`), `@radix-ui/react-slider` (`^1.2.2`), `react-day-picker` (`^9.5.1`), `@floating-ui/react-dom` (`^2.1.2`), `date-fns` (`^4.1.0`), `lodash-es` (`^4.17.21`) and `lucide-react` (`^0.562.0`). SliderBlock/Calendar need the standard `@types/lodash-es` development declarations. Exact installed/lockfile ranges remain with the integration owner; these ranges describe the unchanged legacy package.

Root integration uses each family's `index.ts`. Do not expose new component subpaths or internal contexts. Preserve all exports in those family entries, including SliderBlock and Select parts/types. The scoped packed-consumer validation below is complete. The integration owner must rerun against the combined package; this evidence does not cover changes made during integration.

## Public consumer tests

The seam remains an application importing and rendering public core components. Node tests use the existing Button consumer helper. `interactions.browser.mjs` uses real Chrome rather than layout stubs; set `CORE_CONSUMER` to the built package/installed consumer and `CORE_PLAYWRIGHT` to the installed Playwright `index.mjs`. Optional `CORE_BROWSER_TOOLS` identifies a package containing esbuild; otherwise the consumer supplies it. Select the scenario through `CORE_CASE`.

Initial TDD results: Chips and Select each failed with their public component missing, then passed after extraction. Slider and SliderBlock each failed in a real Chrome consumer before extraction. Slider passed controlled keyboard/range/discrete/disabled interactions; SliderBlock passed native input validation, debounced commit and disabled behavior. No controls or styling runtime are mocked. The independent scratch producer is temporary tooling, not a competing tracked package scaffold.

Calendar and DatePicker each failed as missing root components in Chrome, then passed selection/refs/keyboard/disabled-day and portal/callback/outside-dismissal scenarios respectively. A genuine native Node ESM failure exposed the inherited extensionless `lodash-es/debounce` import. Only the new SliderBlock and Calendar helper imports now use the ordinary public `lodash-es/debounce.js` path; the root then passed native Node ESM and CommonJS. Legacy source is unchanged.

The Calendar custom dropdown reuses the Select content/viewport classes from `Select/select.styles.ts`, because its existing private SelectContent wrapper previously relied on globally available Select SCSS. This is reuse of the same definitions, not a duplicate primitive or a styling bridge. DatePicker applies its normal generated class to its floating portal root as well as its host container, so its existing portal markup carries its own styles.

`LayoutContext` was exported by the old root. The integration owner currently plans to keep its copy internal; whether to preserve that public layout API needs an explicit integration decision. This owner does not change the root barrel. Default fullscreen behavior is tested; a hidden/private provider is not used to manufacture a public layout guarantee.

## Final scoped validation

Five component families are implemented: Chips, Select, Slider (including SliderBlock), Calendar and DatePicker. **OptionCards is held**, rather than replaced or partially extracted: its markdown graph reaches Table, CodeBlock, citations and source helpers owned by other slices. Resolve that dependency boundary before claiming issue #10 complete.

The final normal npm-installed tarball has SHA256 `63e54797fccc88ff8f3c3a2b48ec731d6f04f299638e715c53fba7822cb9a27c`. The scratch producer adds owned family root exports and exact existing shared support solely for validation. It uses a standalone strict Bundler/Preserve tsconfig because the copied repository config refers outside that temporary directory. It is not the integration owner's final scaffold. `results/artifact.json` records source hashes, package/config inputs and installed versions.

- All 11 Node consumer/import/tree-shaking tests passed (`results/consumer-tests.tap`). Native Node ESM and CommonJS root imports are included.
- Strict TypeScript 6.0.3 consumer checks passed with `skipLibCheck: false`: ESNext/Bundler, NodeNext ESM and NodeNext CommonJS. `types.fixture.tsx` covers original props, refs, Select parts, and rejection of a new `sx` API.
- Chrome 156 passed all 36 framework/order/scenario cases, comprising 45,690 paired computed-style snapshots (`results/browser-final.json`). Plain CSS, Tailwind 3.4.19 and Tailwind 4.3.3 run both before and after runtime styling. Each case covers unthemed, light, dark, custom-light and custom-dark themes. Checks include applicable hover/focus/disabled states, overrides, narrow/wide widths, host preservation, portals and remount cleanup. DatePicker has no public disabled prop; no new one is claimed.
- Six final interaction scenarios passed with actual timers: selection and keyboard navigation; Slider refs/range/discrete behavior; SliderBlock validation/debounced commit/streaming; Calendar single/multiple/range dates; DatePicker single/range selection and outside dismissal. Logs are under `results/interactions-*.log`.

An earlier matrix used a frozen Date.now, which prevented lodash debounce from progressing. It is retained as `browser-fixed-date-superseded.json` for audit only. Final runners install an **advancing** Playwright clock and assert that time progresses. These final results supersede that earlier run. Style snapshots finish finite animations at their endpoints; the product animation code is unchanged.

The advanced Calendar caption portal test first caught a real border mismatch caused by CSS injection order. The Calendar base trigger now uses standard `:where()` specificity so Select state selectors win independently of injection order; state declarations retain ordinary explicit selectors. No Goober internals, caches or runtime patches are added.

This evidence does not establish SSR support, performance/soak results, nondefault LayoutContext contracts or full issue #10 integration. SSR remains deferred. Legacy production source and both reserved friend-baseline directories remain untouched.

## Reproduction

Use a normally installed packed consumer (`CORE_CONSUMER`), tooling with esbuild (`CORE_BROWSER_TOOLS`, also `CORE_TEST_TOOLS` for Node helpers), normal Sass 1.102 (`CORE_SASS_TOOLS`), and Playwright's absolute module path (`CORE_PLAYWRIGHT`). Extract the existing `packages/react-ui-core/evidence/browser-host-styles.tar.gz` into `CORE_HOST_STYLES`.

```sh
node --test packages/react-ui-core/src/components/*/__tests__/*.test.mjs
node packages/react-ui-core/src/components/Chips/__tests__/compatibility.browser.mjs
CORE_CASE=sliderBlock node packages/react-ui-core/src/components/Chips/__tests__/interactions.browser.mjs
```

Repeat interactions with `chips`, `select`, `slider`, `sliderBlock`, `calendar` and `datePicker`. Set `CORE_BROWSER_RESULTS` to save the matrix JSON. The baseline arm compiles the existing legacy index.scss read-only with normal Sass; the candidate imports only the installed new package and receives no legacy CSS. Copy `types.fixture.tsx` into an installed consumer and run strict no-emit tsc in the three modes above. No aliases or mocked controls are used.
