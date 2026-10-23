# Expanded runtime styling investigation — decision open

This is a separate experimental candidate. Production and previous evidence remain unchanged. No migration or maintenance fork is accepted.

The foundation is frozen in `FINAL-SOURCE-SHA256.json`. Runtime CSS uses **a private experimentally patched Goober2.1.19 for base declarations**, plus **a library-owned ownership-guard serializer**. It is not stock Goober and not all CSS is serialized by Goober. `vendor/goober/UPSTREAM.json`, license, minimal patch and exact failing/passing examples preserve that distinction.

Stock Goober's selector regex corrupts nested `:not(:has(...))`, comma lists inside functional selectors, and escaped/quoted syntax. Raw CSS goes through the same parser; its global API has process-global replacement state and is unsafe as a request-private workaround. The private patch uses balanced selector lists and nesting substitution. Seven exact regression cases pass; all seven fail stock. All47 selected descriptor units,1749 source selectors pass structural selector count/specificity/scope checks. This is not a complete CSS parser certification.

## API

`runtime/Fixture.tsx` exports `Fixture`, `makeResponse`, `makeExpandedResponse`, `runtimeLibrary`, `ArmContext`, `ScopedThemeProvider`, `RuntimeBoundary`, `RuntimeChatBoundary` and `RuntimeShellBoundary`. Fixture accepts the previous response/scenario/size/arm/theme/isStreaming/optional accent/mode props. `scenario="expanded"` exercises actual Input/Select/Checkbox/Switch/Radio, Tabs/Accordion, markdown/table and Bar/Line/Pie charts. Pass the exact same generated response to both arms for matched comparisons; the preserved baseline generator knows only its original scenarios.

`RuntimeChatBoundary` owns its internal47-unit inventory. Consumers do not configure units or layers. The underlying AgentInterface and OpenUI components remain unchanged. The adapter adds a display:contents wrapper and propagates generated unit classes through the actual ThemeContext portal class channel. These are integration costs and must remain visible. Full-chat emission includes unused/transitively duplicated styles; it is not on-demand full-library styling.

`runtime/Button.tsx` imports only its own descriptor and metadata. The initial aggregate-metadata retention failure is preserved by the parent audit and `runtime/history/adapter-aggregate-metadata-failed.tsx`. Boundary/Fixture still retain broad inventory dictionaries; no broad package-root tree-shaking claim follows.

`build-shared.mjs` exports build/buildOptions/alias/prepareRuntime/paths. Honor its `alias.goober`, pointing at the private source. Next builds must continue using their own React singleton. Descriptor generation uses production Sass once for this spike; runtime consumers receive object descriptors/ownership metadata and do not run Sass or import a component stylesheet.

## Cascade and cursor contract

Base component rules live in the components layer. Unlayered per-owned-property `revert-layer` guards use low type specificity, scoped to the original selector subject and conditions, revealing component defaults or layered utilities while shielding standard unlayered preflight. Descendant declarations remain on descendants; SVG width/height are not promoted to Button ownership.

Disabled cursor guards shield standard disabled resets. A library-owned utilities-layer disabled cursor declaration has specificity between an ordinary cursor class and an explicit disabled modifier. This corrects the previous TW3/TW4 difference: ordinary cursor classes leave disabled controls not-allowed, while explicit disabled:cursor-wait wins in both frameworks and both tested CSS orders.

The standard theme/base/components/utilities layer order is a library contract, not a universal guarantee for an arbitrary already-established layer order or reset stylesheet. No host CSS mutation, blanket important flag, framework detection or consumer layer flag is used.

## Correctness evidence

From this directory, run `node verify-serializers.mjs` for exact parser and structural checks, then `node catalog-build.mjs` and `node catalog-check.mjs` for the browser catalog. Optional `node build-shared.mjs` regenerates checked-in descriptor/metadata inputs from the recorded production Sass; do not run it while another test build is in progress. `expand-generator.py` is retained one-off authoring history, not the reproduction entrypoint. The bounded actual Chrome catalog uses port4266 and stops it. `results/catalog.json` records12 configurations: plain/TW3/TW4 × actual host CSS before/after × baseline/runtime. All pass.

Gates include no-JS default style parity, uniform cursor priority, hydrated default/error/disabled/checked/selected/open states, exact consumer normal/hover utility results, actual radio and Select state changes, non-null Select/Modal/Tooltip portal styles, nonzero hydrated Bar/Line/Pie path geometry and console hydration errors. Full-chat, Next navigation/lazy resources, performance and memory are separate agents' evidence.

The initial catalog attempts are retained: two fixture API mistakes used children instead of the components' required text prop; a later attempt compared different baseline payloads, included an unhandled favicon request, and sampled portal animations before settling. These failures were corrected in the harness, not hidden by weakening component gates. The final matched payload and non-null/geometry gates pass.

`COVERAGE.json` separates descriptor inclusion, actual catalog initial/state/portal coverage, and untested families. Other chart families, exhaustive control variants, keyboard/focus/active behavior, chart tooltip portals and no-JS chart geometry remain unproved. This evidence does not establish production readiness, production capacity or a complete runtime port.

## Raw files and source reproduction

- `results/catalog.json`: final12-configuration browser result, zero failures.
- `results/catalog-first-harness-tab-prop.json`, `catalog-second-harness-accordion-prop.json`, `catalog-third-payload-favicon-animation-harness.json`: preserved attempts, never substituted for the final result.
- `runtime/parser-regressions.mjs` and `.json`: seven exact stock/private output comparisons and public-API alternatives.
- `runtime/serializer-check.mjs` and `runtime/serializer-results.json`:1749 selected source selector checks. `runtime/history/stock-serializer-results.json` preserves stock failures.
- `build-shared.mjs`, `runtime/selector-normalize.mjs`, `runtime/workloads.ts`, descriptor/metadata JSON and per-unit inputs: complete generation/runtime inputs.
- `vendor/goober/parse.upstream.js`, `src/core/parse.js`, `PRIVATE-PATCH.diff`, `UPSTREAM.json`, `LICENSE`, `upstream-package.json`: pinned private-engine provenance and maintenance cost.
- `catalog.tsx`, client/server/SSR/build/check scripts: actual component fixture and executable browser gates. Framework assets are pinned existing local generated Tailwind3.4.19/Tailwind4.3.3 sources in the earlier independent cascade scratch; no host framework declarations are rewritten by the adapter.

The existing local dependency runtime and unchanged production component source paths are explicit in build-shared.mjs. This scratch does not install dependencies or fetch a remote package. The final13-input manifest identifies runtime candidate inputs; the broader reproduction source manifest lists all retained authoring/test/vendor sources.
