# Composite controls — scoped #10 work

Baseline: reviewed PR20 head `48a877064e0a2039c2c6949959168dea077a5d49`. Work is on `codex/core-composite-controls`; the prior audit/prototype branch is preserved. No legacy production, root barrel, package metadata, shared support or friend-baseline files are owned by this work.

## Integration dependencies

The component owner implements Calendar, DatePicker, Select (all existing parts), Slider/SliderBlock, Chips and OptionCards. The integration owner supplies root exports and package metadata plus shared prerequisites:

- `src/context/LayoutContext.tsx`: existing `useLayoutContext` (and existing layout provider/context if needed by its public contract).
- `src/hooks/useMultipleRefs.ts` and its `src/internalUtils/ref` dependency: existing `useMultipleRefs` and `assignRef`.
- Existing IconButton implementation/styles for DatePicker helper dependencies.
- OptionCards imports `InlineMarkdownRenderer` and `getRowConfiguration` from `../_shared/cards/smallCardBlockUtils`. The markdown graph reaches MarkDownRenderer, Citation and remark helpers; it must not be replaced by a simplified renderer merely to satisfy the build.

Runtime dependency additions from the existing implementations are `@radix-ui/react-select` (`^2.1.5`), `@radix-ui/react-slider` (`^1.2.2`), `react-day-picker` (`^9.5.1`), `@floating-ui/react-dom` (`^2.1.2`), `date-fns` (`^4.1.0`), `lodash-es` (`^4.17.21`) and `lucide-react` (`^0.562.0`). SliderBlock/Calendar need the standard `@types/lodash-es` development declarations. Exact installed/lockfile ranges remain with the integration owner; these ranges describe the unchanged legacy package.

Root integration uses each family's `index.ts`. Do not expose new component subpaths or internal contexts. Preserve all exports in those family entries, including SliderBlock and Select parts/types. Full framework/theme/portal/pack/type validation remains pending until the combined package is ready; early behavior passes are not blanket acceptance.

## Public consumer tests

The seam remains an application importing and rendering public core components. Node tests use the existing Button consumer helper. `interactions.browser.mjs` uses real Chrome rather than layout stubs; set `CORE_CONSUMER` to the built package/installed consumer and `CORE_PLAYWRIGHT` to the installed Playwright `index.mjs`. Optional `CORE_BROWSER_TOOLS` identifies a package containing esbuild; otherwise the consumer supplies it. Select the scenario through `CORE_CASE`.

Initial TDD results: Chips and Select each failed with their public component missing, then passed after extraction. Slider and SliderBlock each failed in a real Chrome consumer before extraction. Slider passed controlled keyboard/range/discrete/disabled interactions; SliderBlock passed native input validation, debounced commit and disabled behavior. No controls or styling runtime are mocked. The independent scratch producer is temporary tooling, not a competing tracked package scaffold.
