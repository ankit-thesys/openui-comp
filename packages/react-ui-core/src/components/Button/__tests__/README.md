# First core controls slice (#9)

This slice owns Button, Input and TextArea only. The scaffold, root exports, theme implementation and minimal existing FormControl context are integrated by the package owner. Existing `packages/react-ui` is unchanged. The source reference is commit `842a77c43` (the component implementations and SCSS at that point).

## Integration contract

Add these root exports in the scaffold:

```ts
export * from "./components/Button";
export * from "./components/Input";
export * from "./components/TextArea";
```

Retain the existing internal `src/components/FormControl/context.tsx` implementation with `useFormControlContext`, `FormControlContextValue` and its `FormControlProvider`. Input and TextArea use `hasError ?? context?.hasError ?? false` unchanged. This does not expose a new context API or migrate the full FormControl family. Inherited error behavior should also be exercised through the public FormControl when that family is migrated.

Runtime dependencies are stock `goober` 2.1.19, `clsx`, React 19 and the existing shared context. The controls do not import theme tables, old SCSS, generated CSS or prototype descriptors. Styles are hand-authored CSS objects passed to module-scope `css`; native JSX and all existing prop/ref forwarding remain intact. Existing class names, Button variants/sizes/icons, Input `styles` and native `style` precedence, and TextArea rows/error handling are preserved. There is no new styling API.

The authored light fallbacks match the existing default theme. Future token-default changes must also update these fallback literals and run the rendered parity checks. There are no responsive rules in the original three component SCSS files.

## Tests

Tests run at the agreed root package / rendered consumer boundary. Each component behavior test failed on the missing root component before its implementation was added, then passed after build. Tests do not mock the controls or Goober.

Run against an installed packed artifact, or the built package workspace:

```sh
CORE_CONSUMER=/absolute/path/to/consumer \
CORE_TEST_TOOLS=/absolute/path/to/package-with-jsdom \
CORE_BROWSER_TOOLS=/absolute/path/to/package-with-esbuild \
node --test packages/react-ui-core/src/components/*/__tests__/*.test.mjs
```

`CORE_TEST_TOOLS` can be omitted when jsdom is installed in the consumer. `CORE_BROWSER_TOOLS` can be omitted for the node bundle tests when esbuild is installed there. Include this nested test glob in the package test script; the scaffold's original `tests/*.test.mjs` glob does not discover these files.

`types.fixture.tsx` is compiled separately in a strict installed consumer with `skipLibCheck: false`. It checks public props, native refs and the deliberate absence of a new `sx` API.

The browser runner builds separate baseline and installed-runtime graphs. Runtime resolution uses the consumer normally, without aliases or old source. Only the baseline arm resolves the unchanged old React components and aligns their React peer. The baseline gets the previously captured legacy stylesheet; the runtime arm never receives it. Captured plain CSS/Tailwind 3/4 styles are test host inputs, not production dependencies.

```sh
CORE_CONSUMER=/absolute/path/to/consumer \
CORE_BROWSER_TOOLS=/absolute/path/to/package-with-esbuild \
CORE_PLAYWRIGHT=/absolute/path/to/playwright/index.mjs \
CORE_BROWSER_RESULTS=/absolute/path/to/result.json \
node packages/react-ui-core/src/components/Button/__tests__/browser.mjs
```

Optional `CORE_BASELINE` points to the unchanged legacy `src/components`; optional `CORE_STYLE_EVIDENCE` points to the captured browser CSS directory. Defaults refer to this checkout's baseline and `validation/stock-goober-followup/artifacts/browser`. The test owns its ephemeral HTTP server and Chrome contexts and closes them on completion. Like animation-disabled visual snapshots, it finishes native CSS transitions through the Web Animations API before comparing endpoint styles. This is test-only sampling, not a runtime compatibility mechanism.

The matrix covers three hosts, each with host styles before and after component styles; no provider, light, dark and two custom modes; all 24 Button combinations, Input's three sizes with/without error, and TextArea with/without error. It compares normal/disabled styles for every combination, medium Button hover/active, and every Input/TextArea hover/focus state. It also checks important overrides, native keyboard/tab/disabled behavior, text entry, host isolation and stylesheet stability after unmount/remount.

## Issues caught during extraction

- Stock Goober misserialized functional pseudo selectors followed by `:focus`/`:hover`. Equivalent standard selectors put the simple pseudo first (`:focus:not(...)`, `:hover:not(...)`). No parser patch or custom serializer is used.
- Adding the generated class to the error selector initially increased its specificity, changing disabled-plus-error border priority. `:where(.openui-input-error)` / `:where(.openui-textarea-error)` preserve the original error-class specificity. Input's focused-error rule is explicit for the same reason.
- Comparing intermediate native color transitions produced inconsistent snapshots; transition endpoint sampling and neutral pointer positions distinguish normal from hover snapshots. Component transitions remain unchanged.

This slice does not assert SSR support, full chart/chat migration, every browser, every bundler, release readiness or any new performance approval. Eager styles for retained modules are the accepted execution model; unused imports still depend on the consumer bundler's tree shaking.

## Recorded result

The final installed-artifact run passed all six plain CSS/Tailwind 3/Tailwind 4 × before/after cases: **33,600 paired style snapshots**, across five theme modes. The final runner additionally checks explicit expected custom primary color/spacing and important hover colors for Button, Input and TextArea. Native tab/disabled exclusion, Button Space activation, Input/TextArea edits, unmount/remount and captured browser-error checks passed. Chrome was 156.0.8078.47.

Five Node consumer tests passed. Strict TypeScript 6.0.3 passed Bundler/ESNext, NodeNext ESM and NodeNext CommonJS with `skipLibCheck: false`. Producer typecheck and ESM/CJS declaration build passed. The installed consumer used React 19.3.1 and stock Goober 2.1.19. Component-only esbuild output (React external) was Button 2,465 gzip bytes, Input 2,117 and TextArea 1,978; the unused-import entry retained only its 23-byte marker. These are scoped bundle observations, not a performance acceptance threshold or a guarantee for every bundler.

Machine evidence is in `results/`. The packed artifact SHA256 is recorded in `checks.json`. `component-source-integrity.json` verifies every production file in this component slice is byte-identical to the source used to build that artifact. Browser evidence records hashes of the fixture, runner and independently built baseline/runtime scripts.

Earlier observations are preserved separately. `browser-before-independent-theme-assertions.json` had no independent expected custom-token assertions. The initial review claimed it tested default dark, but checking the complete existing provider showed `userDarkTheme ?? userLightTheme`; that factual claim was withdrawn. `browser-explicit-theme-assertions.json` adds explicit dark overrides and expected-value checks. `browser-final.json` also includes explicit hover-override checks for all three controls and is the final matrix evidence. No earlier run is presented as a substitute for the final run.

The evidence uses a scratch copy of Worker1's scaffold/theme snapshot plus this exact component source, packed and installed through npm normally. It does not claim validation of a later, independently changed scaffold. The package owner should run these same public consumer tests on the final integrated tarball before accepting #9. No later migration slice, publication or deprecation was performed.
