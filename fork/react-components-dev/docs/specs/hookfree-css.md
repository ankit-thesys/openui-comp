# Spec: hook-free `css` and an app-wide cascade layer

Implements [ADR 0002](../adr/0002-hookfree-css.md). Parent issue: [#126](https://github.com/ankit-thesys/openui-comp/issues/126).

## Problem Statement

Every component in the component library gets its generated classes from an internal `useStyles` hook, because the cascade layer comes from the nearest `ThemeProvider cssLayer` and only a hook can read React context. As a result:

- A component library or app built on top of ours has no supported way to write a rule that lands in the same layer. It must copy our factory-and-hook pattern or call Goober directly and end up outside the layer.
- Layer mode depends on rendering inside the right provider, so import-time rules, lazy chunks and anything outside the provider tree can't take part.
- A subtree with a different layer gets a second copy of every class, although no app needs two layers.
- Our rules share Goober's `#_goober` sheet, so a host app that also uses Goober can replace or drain them.

## Solution

The component library exports `css`, `keyframes` and `configureStyles`:

- `css` and `keyframes` return plain class-name strings and can be called anywhere, including at module level and from other packages.
- `configureStyles({ layer })` sets one cascade layer for the whole app. It can run before or after any style module is imported, because the layer is applied when the sheet is written, not when a rule registers.
- All component rules, ours and our consumers', go into the component library's own `<style id="openui-styles">` sheet, which `getComponentStyles()` returns for server rendering.
- Every component is converted from factories plus `useStyles` to module-level style constants. `useStyles`, the factories and `ThemeProvider cssLayer` are deleted.

The override contract (stable classes, flat selectors, naming, public states and props) doesn't change. A user's `.openui-button--variant-primary { background: red }` keeps working exactly as before.

## User Stories

1. As an app developer using Tailwind 4, I want to call `configureStyles({ layer: "openui" })` once in my entry file, so that every component rule sits in the `openui` layer below my utilities.
2. As an app developer, I want `configureStyles` to work whether it runs before or after I import components, so that I never debug import order.
3. As an app developer, I want lazily loaded components to land in the same layer as eagerly loaded ones, so that code splitting doesn't change how styles cascade.
4. As an app developer, I want an invalid layer name to be ignored with a development warning, so that a typo doesn't silently break my styles.
5. As an app developer not using layers, I want to skip `configureStyles` entirely, so that the default is today's unlayered behaviour.
6. As an app developer, I want to switch the layer at runtime (for example in a demo or test) and have the whole sheet follow, so that I never get a half-layered sheet.
7. As an app developer using Tailwind 4, I want a two-tag head recipe (layer order, then an empty `openui-styles` tag), so that the `openui` layer is declared in the right place.
8. As an app developer, I want the component library to adopt an `openui-styles` tag that is already in the page, so that the recipe's placement and a server-rendered sheet are respected.
9. As an app developer whose app also uses Goober, I want my `glob` and `extractCss` calls to leave the component library's rules alone, so that the two never clash.
10. As an app developer, I want my Goober `extractCss` output not to contain the component library's rules, so that I don't ship them twice.
11. As an app developer rendering on the server, I want `getComponentStyles()` to return the full sheet, wrapped in my layer, on every call, so that each response can inline it.
12. As an app developer rendering on the server, I want the sheet to include every component my app imports, so that the first paint is styled even before hydration.
13. As a Next.js App Router developer, I want a documented `useServerInsertedHTML` pattern, so that streaming pages ship the component CSS in the server HTML.
14. As an app developer, I want the theme token defaults to stay in their own `openui-defaults` layer and tag, so that they never nest inside my `openui` layer.
15. As an app developer, I want `getComponentStyles()` never to return an empty string, so that the browser can adopt the tag it's inlined into.
16. As an app developer, I want my existing class overrides to keep working unchanged, so that this migration costs me nothing beyond replacing `cssLayer`.
17. As an app developer upgrading from the beta, I want the README to say exactly how to replace `ThemeProvider cssLayer` with `configureStyles`, so that the breaking change takes one minute.
18. As an author of a component library built on top, I want to import `css` from `@openuidev/react-components`, so that my rules land in the same sheet and layer as the components I extend.
19. As an author of a component library built on top, I want to import `keyframes`, so that my animations land in the same sheet and layer as my rules.
20. As an author of a component library built on top, I want `css` to work at module level without a hook or provider, so that my style modules are plain data.
21. As an author of a component library built on top, I want the `css` and `keyframes` types exported, so that my wrappers type-check.
22. As an app developer, I want unused components' styles dropped by my bundler, so that importing one component doesn't ship every rule.
23. As an app developer, I want many rules registering at once (a big lazy chunk) to cost one sheet write, so that loading stays fast.
24. As an app developer, I want running animations to keep their state when the sheet is rewritten, so that a lazy registration never restarts a spinner.
25. As a maintainer, I want a guard test that fails when any file starts using `useStyles`, factories, `StyleCss`, `StyleFactory`, `CssLayerContext` or `cssLayer`, so that the old API can't creep back.
26. As a maintainer, I want that guard to list the files still on the old API and fail when a converted file stays listed, so that the list measures progress and only shrinks.
27. As a maintainer, I want the guard to require the old API's module to be gone once the list is empty, so that "done" is checked, not claimed.
28. As a maintainer, I want only the styling infrastructure to import Goober, so that every rule goes through our sheet.
29. As a maintainer, I want a test on Goober's sheet-target shape and the exact version pin, so that a Goober update can't silently send our rules elsewhere.
30. As a maintainer, I want the contract checks to keep checking every component's rules after rules move to import time, so that the one-class-one-state contract stays enforced.
31. As a maintainer, I want the class reference and the README regenerated or updated in the same change that alters them, so that docs never drift from the code.
32. As a maintainer, I want each migration batch to run only the checks for the components it touches, and the full browser suite once at the end, so that we don't repeat 20-minute runs for mechanical edits.
33. As a maintainer, I want a final consistency pass that compares every component's rendered CSS before and after the migration, so that a mechanical conversion can't change a single declaration unnoticed.
34. As a maintainer, I want the conversion of style modules to be mechanical and repeatable, so that batches are small, reviewable and the same shape.
35. As a maintainer, I want registration-order collisions between modules found by a check, not by users, so that import-order changes can't flip an equal-weight cascade.
36. As a reviewer, I want each ticket to leave the build, unit tests and contract checks green, so that I can review and merge batches independently.

## Implementation Decisions

**New styling module (the only Goober importer besides the theme defaults).** It owns:

- A rule store. Goober writes into it through a custom target, so nothing reaches `#_goober`.
- `css`: Goober's `css` bound to our target.
- `keyframes`: Goober's `css` bound to our target with the keyframes flag. Goober's own exported `keyframes` must not be rebound, because it's already bound and drops the target silently.
- `configureStyles({ layer })`: validates the name with the existing layer-name rule, stores it, and schedules a write.
- `getComponentStyles()`: the store's text, wrapped in the layer when one is set. It's cumulative and never empty.
- A browser writer that adopts or prepends `<style id="openui-styles">` and rewrites its text at most once per microtask.

The target shape, from the prototype:

```ts
// Goober 2.1.19 getSheet(target): browser → target.querySelector("#_goober"),
// then .parentNode and .firstChild.data; server → target.data.
const sink = {
  get data() {
    return rules;
  },
  set data(next) {
    rules = next;
    scheduleWrite();
  },
};
const target = {
  querySelector: () => ({ parentNode: true, firstChild: sink }),
  get data() {
    return sink.data;
  },
  set data(v) {
    sink.data = v;
  },
};
const sheetText = () => (layer ? `@layer ${layer}{${rules}}` : rules) || " ";
```

**Public API.** The package entry exports:

- `css`, `keyframes`, `configureStyles` and `getComponentStyles`;
- types for the `css` tag and the `configureStyles` options.

`cssLayer` is removed from `ThemeProvider`'s props.

**Theme defaults.** The token defaults keep their layer-order tag and `<html>` marker. They write into their own tag, never into `openui-styles`, so `openui-defaults` doesn't nest inside the app's layer.

**Style modules.** Each `*.styles.ts` drops its factory and exports module-level objects built with the imported `css`; tree-shaking relies on `package.json` `sideEffects`. Key order and the order of `css` calls stay exactly as in the factory, so equal-weight ordering within a module is preserved. Components read the object directly instead of calling `useStyles`. Shared helpers that produced factories become plain style objects too, which the 2026 split already started.

**Sequencing (expand, migrate, contract).** The old and new forms coexist until the last batch:

1. **Prefactor, contract collection by class.** The contract checker stops collecting "CSS registered during this render". Instead it selects every rule in the full sheet whose generated class appears in the rendered markup. This holds for both registration models, so it lands first and stays green.
2. **Expand.** The new styling module and the public exports are added, and `getComponentStyles` reads the new store. `useStyles` becomes a shim that calls the factory with the new `css`, cached per factory, so unconverted components share the same sheet. `cssLayer` is removed in favour of `configureStyles`, and the layer tests move to `configureStyles`. Because class names no longer depend on the layer, per-subtree layer tests are replaced by sheet-wrapper tests.
3. **Migrate in batches.** A codemod converts style modules and their components. Batches follow the component areas: primitives and form controls; text, markdown and citations; cards and blocks; lists, tables and media; Charts. Each batch removes its files from the guard's list.
4. **Contract.** `useStyles`, the shim, the factory types and `CssLayerContext` are deleted. The guard's list is empty, so its final assertion runs. The fork README's authoring guide is rewritten for module-level styles.
5. **Final consistency check.** See Testing Decisions.

**Codemod.** A one-off fork-only script turns `export const xStyles = (css: StyleCss) => ({…})` into a module-level object. It replaces `useStyles(xStyles)` with `xStyles` and fixes imports. It's run per batch, and batches commit its output plus hand fixes for irregular modules. It's deleted in the contract ticket.

**Docs.**

- The package README replaces the `cssLayer` section with `configureStyles` and the new head recipe. It documents `css` and `keyframes` for code built on top, and updates server rendering to `openui-styles`.
- The class reference is regenerated only if stable names change; they shouldn't.

## Testing Decisions

**Good tests here check what a user observes:**

- the class names on rendered elements;
- the CSS text the sheet holds;
- computed styles in a real browser.

They don't check how the store or writer is built. The one exception is the Goober target-shape test, which guards an external dependency on purpose.

**Seams (highest first):**

1. **The built package's public entry under server rendering.** This is the existing contract-checker seam: render elements, read `getComponentStyles()`. It carries the contract checks, the sheet-wrapper and layer tests, the `css` and `keyframes` export tests, and the before/after consistency snapshot.
2. **The built package in a real browser.** This is the existing Playwright fixtures and benches. It's used for adoption of the head tag, write batching, animation continuity, Tailwind 3 and 4 cascades, and host-Goober isolation.
3. **A source scan.** These are the old-styling-api ratchet (already added) and the existing "only the infrastructure imports Goober" guard, updated to the new module.

**Efficiency rules, so we don't repeat work:**

- A migration batch is mechanical. It must pass build, typecheck, the unit suite (contract checks included) and the guard. It runs only the browser parity specs for the components it touches. It never reruns the whole browser suite.
- The full browser suite (about 5165 tests, about 21 minutes) runs twice: once after the expand ticket, because the sheet and layer behaviour change there, and once in the final check.
- **Before/after consistency snapshot.** Before the first batch, record each contract component's rendered markup and the declarations of every rule it uses, keyed by stable class rather than generated name. The final check compares against it. Any difference other than generated class names, or the layer wrapper's position, fails. One snapshot replaces re-verifying each batch by hand.
- **Registration-order check.** In the final check, for every element in the contract fixtures that carries generated classes from more than one style module, any property both modules set is reported. This is where import order could now differ from render order.

**Prior art:**

- The contract tests and their checker.
- The bench snapshot test (snapshot-against-baseline).
- `componentStyles.test.tsx` (cumulative sheet).
- `layers.test.tsx` and `layers.spec.ts` (to be rewritten for `configureStyles`).
- `import-registration.test.ts`, inverted: importing now registers rules but must not mark `<html>` or touch `#_goober`.
- `goober-imports.test.ts`.
- `package-boundary.test.ts`.
- The prototype's `server-check.mjs` and browser page for the sheet behaviours.

## Out of Scope

- Changing any stable class, modifier, data attribute or public prop of the override contract.
- Replacing Goober with our own compiler. That's the fallback only if the target-shape test breaks.
- Streaming SSR beyond the documented Next.js `useServerInsertedHTML` pattern.
- Per-subtree layers. They're removed, not reimplemented.
- A `data-layer` attribute on the head tag and a warning for a late `configureStyles` call: both declined (ADR 0002, settled questions).
- Upstreaming. The upstream PR (#1510) gets this only after the fork's review.

## Further Notes

- The ratchet guard and its list already exist on the ADR branch. 269 files are listed today: 238 in the component library and 31 in the fork's tests and docs.
- Firefox and Safari animation continuity across sheet rewrites is unchecked. Add both browsers to the one browser test that covers it.
- The upstream PR body and the package README must describe `css`, `keyframes` and `configureStyles` as the public styling API.
