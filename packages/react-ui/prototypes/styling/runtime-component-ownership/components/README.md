# Component-owned runtime optimization — experimental comparison, decision open

This private scratch candidate changes delivery and memoization using ordinary React component composition. It does **not** validate stock Goober for this library or accept a production migration. Original source and previous evidence remain unchanged.

## What changed

`source/src/components` contains private copies of real OpenUI components. The authoring script creates reviewable JSX composition at className-bearing elements: `OwnedElement` forwards the original element type, props, children and ref, adds the definition's generated class, and renders native React 19 style resources. It adds no DOM wrapper. Actual production genui adapters/Renderer/parser import these copied reusable components; the runtime never scans response strings or consults a workload list.

Each source module imports its own `runtime/styles/<Unit>.tsx`, descriptor and metadata. `defineStyles` closes over one lazy immutable `{className, css, href}` record. Repeated renders reuse that record. Targets, request objects, React elements, nonce and theme are not cached. Each actual owner creates fresh React resource elements; React manages document resource deduplication. Theme values remain inline inherited CSS variables. This is finite module-level memoization, not a new style registry or injection manager.

The copied baseline catalog and baseline Fixture import the **original uninstrumented** production components and registry. They do not run through no-op OwnedElement wrappers. Both arms preserve the real component behavior, parser and chart implementation.

The old outer boundary emitted every one of 47 families. It also compiled transitive shell Sass imports separately and carried both same-element and ancestor-scoped copies. This candidate has no runtime boundary or response regex. The core inventory is 34 style families, 52 assigned source modules and 223 JSX attachments. Shared legends, scroll buttons, tooltip, label/hint and control items own separate definitions. Chart-family rules attach to the actual chart root; genuine internal descendants remain descendants, rather than duplicating both selector branches. Assistant-message contextual selectors attach at their own subject under the original ancestor condition. Shell source ownership is the separate `/private/tmp/openui-runtime-owned-chat` experiment.

Style-family delivery is not rule-level laziness: rendering a Select Trigger can deliver that family's Content rules. The full genui registry also retains other implementations in JavaScript. No full-library JS tree-shaking or complete arbitrary-response style coverage is claimed. `COVERAGE.json` explicitly lists selected units, directories outside ownership and unproved paths. `ownership-inventory.json` fails when a selected family has no assigned source attachment; that static gate is not proof of every selector's live DOM match.

## SVG and resource ownership

An intermediate candidate emitted native `<style href precedence>` siblings beside SVG paths. React treats those as SVG styles, so HTML resource hoisting/deduplication did not apply: 38 in-app duplicates were observed. Class-only SVG composition is now explicit in the copied source (`$emitResources={false}`), including LineSeries's AnimatedPath inside a `<g>`. The corresponding HTML RadioItem/chart owner emits the definition's resource. The source authoring script recognizes the selected source's explicit SVG nodes/ancestor context; this is not a general namespace solver or runtime deduplication mechanism. `COVERAGE.json` records each class-only source location. The final browser gate requires zero resource styles remaining inside the app.

## Inherited experimental limitations

The engine is the existing privately patched/pinned Goober 2.1.19, with its original source/license/provenance/diff under `vendor/goober`. No new parser repair was made. The existing library-owned rollback/cursor guard serializer remains; base CSS goes through Goober, guard CSS is hand-serialized from owned declarations. These are inherited bespoke comparison limitations, not established stock-Goober functionality.

Browser compilation now uses an actual detached DOM element and public `extractCss(target)` before/after `css` to clear the initial whitespace and retrieve CSS. Its output is byte-identical to the Node record in the focused test. The server still uses the inherited implementation-dependent `{data:''}` target, which is not an Element/public target type. This candidate does not establish a fully public Goober SSR contract.

Memoization removes repeated generation of immutable CSS. Required styles are still serialized independently into each SSR document, and Goober retains its own finite-definition caches. This is not a measurement or proof of production capacity, request memory isolation generally, or browser long-run resource lifetime.

## Reproduce on this machine

Dependencies and Sass authoring inputs resolve from `/Users/ankitdas/thesys/openui-styling-prototype`; TypeScript AST authoring resolves the pinned local TypeScript 6.0.3 install. Runtime consumers receive object definitions, not Sass or the authoring compiler.

```
cd /private/tmp/openui-runtime-owned-components
node build-shared.mjs
node verify-serializers.mjs
node switch-engine-control.mjs
node check-ownership.mjs
node catalog-build.mjs
node catalog-check.mjs
node check-browser-target.mjs
```

The catalog scripts start and stop their own localhost server on port 4366 and close Chrome. Do not run them concurrently with performance measurements. Chrome may require the normal authorized execution context outside the restricted sandbox.

Exports are in `runtime/Fixture.tsx`: Fixture, makeResponse, makeExpandedResponse, runtimeLibrary, RuntimeButton, RuntimeInput, ScopedThemeProvider, ArmContext and readStyleCounters. `runtime/adapter.tsx` also exports defineStyles, useOwnedStyles, ownedElement and OwnedElement. `build-shared.mjs` exports build/buildOptions/alias, ownershipSourceRoot, prepareStyleUnit and attachModuleStyles. Source baseline and runtime paths stay separate; do not alias original production component paths wholesale onto the instrumented copies.

Counters are bounded scalars: compileCount, lookupCalls, compiledCSSBytes (UTF-8), resourceDefinitions, renderCalls, resourceEmits and compileMs. No sample arrays or theme/response keys grow in the runtime.

## Evidence and limits

- `results/ownership-cache.json`: actual Button-only SSR has Button CSS, no chart/shell CSS; one compile after 101 separate documents; frozen record contains only className/css/href. Eight concurrent distinct-theme documents each receive their own Button and Suspense-delayed actual Input resource. Only two definitions compile. A first-raw-chunk test assumption failed because large CSS splits shell into multiple transport chunks; the corrected gate asserts accumulated shell appears before the late content, and the original failure is preserved.
- `results/catalog.json`: plain/Tailwind 3/Tailwind 4, host CSS first/late, baseline/runtime. Assertions cover no-JS default parity, hydration console/page errors, control state behavior, selected option/radio, real Bar/Line/Pie geometry, ordinary/hover utility overrides, disabled cursor priorities, non-null portal styles, Modal/Tooltip resources absent before mount and present after, and selected chart internal computed styles. A separate actual non-condensed Bar fixture exercises shared internal container/grid/main layout. It is catalog-only, not a modified performance workload.
- `results/browser-target.json`: exact Node/browser Button CSS/class/href, real detached target/no live `_goober` sheet, resource in document head, zero in-app style resources. Button CSS is 13,820 UTF-8 bytes in both environments.
- `runtime/serializer-results.json`: selected-family selector counts/specificity and one generated scope per selector. `runtime/parser-regressions.json` preserves seven exact selector controls against stock/private engines.
- `results/switch-engine-control.json`: the **new** owned SwitchItem descriptor still serializes its nested state selector incorrectly under stock Goober; the inherited private parser preserves it. No stock-engine acceptance claim.

Failed launch/probe/ownership/SVG checks remain in results. In particular, adding the non-condensed Bar fixture exposed an actual root-prefix mistake (`container-inner` was incorrectly considered a container variant); exact chart root ownership fixed it. The earlier condensed geometry checks alone did not establish this style parity.

No timing benchmark or soak was run by this component-owner task. Parent agents own any later matched performance, bundle and memory evidence. Whole-library coverage, unsupported chart families/orientations, exhaustive interaction states, arbitrary markdown children and production package/types/framework compatibility remain open.
