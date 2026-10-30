# ADR 0002: Hook-free public `css` and an app-wide cascade layer

- **Status:** Accepted (2026-10-30). Implemented; original store design (superseded by the amendment below); see the [spec](../specs/hookfree-css.md). Tracked in [#126](https://github.com/ankit-thesys/openui-comp/issues/126).
- **Scope:** how `@openuidev/react-components` registers, layers and serves component CSS, and the styling API it offers to code built on top of it. The override contract of [ADR 0001](0001-flat-styles.md) (stable classes, flat selectors, naming grammar, public states and props) does not change.
- **Supersedes** ADR 0001 Q27, Q33 and Q34. **Changes** Q2, Q3, Q15, Q22a, Q23 and Q32a. Q28 and Q29 stand, with Q29's defaults moving to their own tag.

## Context

Today every component gets its generated classes from an internal hook:

```tsx
// button.styles.ts
export const buttonStyles = (css: StyleCss) => ({ root: css`…`, variant: { primary: css`…` } });

// Button.tsx
const styles = useStyles(buttonStyles);
```

`useStyles` exists for one reason: the cascade layer comes from the nearest `<ThemeProvider cssLayer>`, and only a hook can read React context. That choice has costs:

1. **Nothing built on top can use it.** A component library or app that extends ours has no supported way to write a rule that follows the same layer. It must copy the factory-and-hook pattern or call Goober directly and land outside the layer.
2. **Per-subtree layers double the CSS.** A subtree in another layer gets its own class set, so the same rule registers twice under different names (Q33). No real app needs two layers; an app either uses cascade layers or it doesn't.
3. **Rules register at first render**, so a server sheet holds only what rendered, and every component carries a hook call and a factory indirection.
4. **The sheet is shared with Goober.** Our rules live in `#_goober`, so a host app that also uses Goober can replace them with its own `glob` or drain them with `extractCss` (Q23 works around the placement only).

## Decision

### 1. One cascade layer for the whole app

```ts
import { configureStyles } from "@openuidev/react-components";

configureStyles({ layer: "openui" }); // once, in the app entry
```

- `configureStyles({ layer })` sets the layer for every component rule in the app. `{ layer: undefined }` (or never calling it) means unlayered, which is today's default.
- `cssLayer` leaves `ThemeProvider`. There are no per-subtree layers and no doubled class sets. This is a breaking change, accepted for the beta.
- A layer name that is not a valid cascade layer name is ignored with a development warning, as `cssLayer` does today.
- The component library still declares no layer order (Q28). The app's recipe owns the order.

### 2. The layer is applied when the sheet is written (superseded by the amendment below)

Class names never depend on the layer. Goober compiles each rule once, unlayered, into the component library's own rule store. The layer wraps the **whole** sheet each time the sheet is written:

```css
@layer openui{.go123{…}.go456{…}@keyframes go789{…}}
```

So:

- **Import order does not matter.** A `css` call that runs at import time, before `configureStyles`, still ends up in the layer: the next write wraps it.
- **A later `configureStyles` call rewrites the sheet.** Switching layer or back to unlayered is one rewrite.
- **Lazy modules land in the same layer**, keyframes included, because they join the same store.

### 3. `css` and `keyframes` are public; `useStyles` goes away

```ts
import { css, keyframes } from "@openuidev/react-components";

const pop = keyframes`from { transform: scale(.96) } to { transform: none }`;
const card = css`
  padding: 16px;
  animation: ${pop} 120ms ease-out;
`;
// card is a plain class name string: "go1a2b3c"
```

- Both return plain class-name strings and work anywhere: module level, inside a component, in another package. (superseded by the amendment below)
- Style modules define their classes at module level. A bundler drops the styles of components the app never imports because `package.json` `sideEffects` lists only the entry and the theme defaults; a `/*#__PURE__*/` mark would not help, since bundlers honour it only on calls and the `css` calls inside a style object do register rules (#139 measured a Button-only Vite bundle at 221 kB with `sideEffects`, 2.7 MB without):

  ```ts
  // button.styles.ts
  import { css } from "../../styles/css";

  export const buttonStyles = {
    root: css`…`,
    variant: { primary: css`…`, secondary: css`…` },
  };

  // Button.tsx
  className={clsx(buttonStyles.root, buttonStyles.variant[variant], names.root, …)}
  ```

- `useStyles`, `StyleFactory`, `StyleCss`, `CssLayerContext` and the per-layer cache are deleted.
- Rules register when their module is imported, not at first render. Within a module, registration order is still the order of the `css` calls, so the equal-weight ordering rules each style module documents (for example Button's root, then variant, size, tone) still hold.

### 4. The component library owns its sheet

- Goober writes through a custom target into our own store, never into `#_goober`.
- In the browser the store is rendered as `<style id="openui-styles">`. If the page already has that tag (the head recipe, or a server-rendered sheet), the component library adopts it in place and keeps its rules (the store starts from its text, so nothing the server sent is lost or duplicated); otherwise it inserts one after the theme defaults, or prepends one to `<head>` when there are none. The tag gets `window.__nonce__` when set. (superseded by the amendment below)
- A host app's Goober `glob`, `createGlobalStyles` or `extractCss` can no longer touch our rules, and our rules no longer appear in the host's `extractCss` output.
- `getComponentStyles()` returns the store's text, wrapped in the layer when one is configured. It stays cumulative and never returns an empty string.
- Theme token defaults (Q29: `:root` variables in `@layer openui-defaults`) move to their own tag, so `openui-defaults` is never nested inside `@layer openui`.

### 5. Engine constraints

| Constraint                                                                      | Why                                                                                                                                                                                                                                                                                  |
| ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Goober stays pinned at exactly `2.1.19`, with a test on its sheet-target shape  | We rely on how Goober's `getSheet(target)` treats a custom target: in the browser it calls `target.querySelector("#_goober")`, checks `.parentNode` and appends to `.firstChild.data`; on the server it appends to `target.data`. A minor Goober release could change that silently. |
| `keyframes` is `css.bind({ target, k: 1 })`, not Goober's `keyframes.bind(...)` | Goober's exported `keyframes` is already `css.bind({ k: 1 })`. A bound function cannot be rebound, so `keyframes.bind({ target })` silently drops our target and writes into `#_goober`. This mirrors how Goober builds its own `keyframes`; it is not a Goober bug.                 |
| Sheet writes are batched to one per microtask                                   | Rewriting the tag re-parses the whole sheet. (superseded by the amendment below) In the prototype, 1000 registrations took about 490 ms written one at a time and about 53 ms batched. A microtask still lands before the browser paints.                                                                                |
| Only the styling infrastructure imports Goober                                  | Unchanged from Q2's guard, with the file list updated to the new module.                                                                                                                                                                                                             |

## Usage

**Browser-only app, no layers:** nothing to do. Import components and render.

**Tailwind 4 (layer mode):**

```html
<!-- first in <head> -->
<style>
  @layer theme, base, openui, components, utilities;
</style>
<style id="openui-styles"></style>
```

```ts
configureStyles({ layer: "openui" });
```

The layer statement must come first in the document, because a layer's priority follows where it first appears (Q22a). The empty `openui-styles` tag reserves the sheet's place right after it; the component library adopts it.

**Tailwind 3 or plain CSS:** no layer. App CSS that loads after `<style id="openui-styles">` wins equal-specificity ties (Q3).

**Server rendering (non-streaming):** (superseded by the amendment below) render, then inline the sheet first in `<head>`:

```ts
const html = renderToString(<App />);
const sheet = getComponentStyles();
// <style id="openui-styles">${sheet}</style> first in <head>
```

**Next.js App Router:** (superseded by the amendment below) return `getComponentStyles()` as `<style id="openui-styles">` from `useServerInsertedHTML` in a client registry component. The fork's example apps (`fork/examples/next-tailwind3`, `fork/examples/next-tailwind4`) show this working.

**A library built on top:**

```tsx
import { css } from "@openuidev/react-components";

const card = css`
  padding: 16px;
`;
export const PriceCard = (props: React.ComponentProps<"div">) => (
  <div {...props} className={clsx(card, "acme-price-card", props.className)} />
);
```

Its rules join the same store and the same layer as ours, whatever its import order.

## Consequences

**Better:**

- One styling API for the component library and everything built on it.
- No hook calls or factories in components; style modules are plain data.
- Layer mode no longer depends on React context, so it works before the first render, in lazy chunks and outside any provider.
- No doubled CSS; a host's Goober usage cannot clash with ours.

**Worse or different:**

- **Breaking:** `ThemeProvider cssLayer` is removed; apps call `configureStyles` instead. The head recipe's tag id changes from `_goober` to `openui-styles`.
- **The server sheet holds every imported component's rules** (superseded by the amendment below), not only the ones that rendered. This is a superset, which is harmless for correctness and usually small, because apps import what they render.
- **Registration order across modules is import order**, not render order. Rules from different modules that style the same element with equal weight can resolve differently than today. The contract checks (one class, one state) keep such collisions rare; the migration must check for them.
- **We depend on a Goober internal** (the target shape), guarded by the exact pin and a test.
- **Writes must land before layout effects.** (superseded by the amendment below) During the migration, rules registered at render reached the sheet one microtask after React's commit, so components that measure in layout effects (EditableTable, Select, citations, HorizontalBarChart) measured unstyled. Pending rules are flushed in an insertion effect. Once every rule registers at import this mostly disappears, but a component module first evaluated during render (a lazy chunk resolving mid-render) can still hit the gap; the contract ticket keeps a flush for that case and tests it. (#138: each registration is inserted into the live CSSOM at once, inside the layer block in layer mode, and the text write stays batched; no React internals, no hook. `lazy-sheet.spec.ts` covers it.)

## Alternatives considered

| Alternative                                                      | Why not                                                                                                                                            |
| ---------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| Keep `useStyles` and export it                                   | Every consumer needs a hook and a provider; module-level and non-React use stay impossible; per-subtree doubling stays.                            |
| Layer applied when a rule registers (`css` reads a global layer) | Rules that register before `configureStyles` (any import-time `css`) would be unlayered. Import order would decide correctness.                    |
| Keep writing into `#_goober`                                     | A host's `glob` or `extractCss` can replace or drain our rules, and Goober's sheet cannot be wrapped in a layer as a whole.                        |
| Replace Goober with our own compiler                             | Removes the internal dependency but rewrites nesting, `&` handling and keyframes. Kept as the fallback if a Goober update breaks the target shape. |

## Evidence

Prototype on branch [`prototype/hookfree-css`](https://github.com/ankit-thesys/openui-comp/tree/prototype/hookfree-css/fork/prototypes/hookfree-css) (`fork/prototypes/hookfree-css/`), server checks in Node and browser checks with the Tailwind 4 browser build:

| Check                                                                         | Server | Browser              |
| ----------------------------------------------------------------------------- | ------ | -------------------- |
| Import-time rule is layered after a later `configureStyles`                   | Pass   | Pass                 |
| Lazily imported rule and its keyframes land in the same layer                 | Pass   | Pass                 |
| One `@layer openui{…}` wrapper for the whole sheet (superseded by the amendment below)                            | Pass   | Pass                 |
| Switching to unlayered and back rewrites the sheet (superseded by the amendment below)                            | Pass   | Pass                 |
| Preflight does not reset the components; `bg-red-500 rounded-full` beats them | n/a    | Pass                 |
| Unlayered: component rules beat the utility, as expected                      | n/a    | Pass                 |
| A host app's Goober `glob` and `extractCss` leave our sheet alone             | n/a    | Pass                 |
| Running animations keep their state across sheet rewrites                     | n/a    | Pass (Chromium only) |

## Settled questions (2026-10-30)

- **No `data-layer` on the head tag.** `configureStyles` is the only way to set the layer. (superseded by the amendment below)
- **No warning for a late `configureStyles`.** (superseded by the amendment below) A late call is safe: it rewrites the sheet. Only an invalid layer name warns.

## Open questions

- Firefox and Safari: do running animations keep their state across sheet rewrites? (superseded by the amendment below) Checked in the browser test the spec adds.

## Amendment: append-only sheet (#162)

Accepted 2026-10-31. [#162](https://github.com/ankit-thesys/openui-comp/issues/162)'s
Decisions replace the conflicting parts above and in the original spec; implementation is
tracked in [#163](https://github.com/ankit-thesys/openui-comp/issues/163).
The public override contract and Goober 2.1.19 pin are unchanged.

The whole-sheet layer rewrite made streaming complicated. It forced stream markers to tell
when a server tag was complete, a document observer to find subsequent tags, merging and
deduplication of those tags, and a CSS block parser to strip their layer wrappers. `applyLive`
inserted each rule into the CSSOM before the batched text rewrite so render-time registration
could precede layout effects. Per-response registries and `createStyleRegistry` coordinated
incremental server flushes, including a `useServerInsertedHTML` registry in every Next app.

The replacement appends only new rules to `#openui-styles`, once per microtask. Each append
gets its own `@layer x{…}` wrapper when configured; blocks with the same name share one layer.
It never rewrites old rules. The markers, observer, merging, parser, `applyLive`, registries and
`createStyleRegistry` are removed. Theme defaults retain their separate tag and layer.

`@openuidev/react-components/styles` eagerly imports every style module. Its
`getComponentStyles({ layer? })` returns the full cumulative sheet before rendering, so a server
inlines it once in the shell's head and does nothing as Suspense content streams. The entry
also exports `<ComponentStyles layer?>`, a client component whose style React hoists into the
head. In React Server Components apps this sends the sheet in HTML only, without repeating it
in the RSC payload. A fork-only `styles:entry` script generates the sorted entry; a unit guard
rejects missing, stale or duplicate style imports.

In the browser, the store seeds Goober's exact-text deduplication from server styles marked by
`data-href="openui-styles"` (React's hoisted tag), `data-openui-styles`, or `id="openui-styles"`.
The layer is read from the `@layer x{` prefix; no `data-layer` attribute is needed. Server tags
are read, never merged or removed. React's server tag stays untouched; new browser rules go
into a separate `#openui-styles` after it. A hand-written `#openui-styles` is appended to in
place. No observer watches later DOM changes.

### Framework setup

| Framework / mode | Setup |
| --- | --- |
| Vite or another browser-only app, plain CSS / Tailwind 3 | Import components normally. No layer configuration. The library prepends its sheet after token defaults, ahead of app CSS; an empty `#openui-styles` can reserve its position. |
| Browser-only app, Tailwind 4 | Put the layer-order statement first in head, then an empty `#openui-styles`. Call `configureStyles({ layer: "openui" })` once in the entry before the first browser write. |
| Next.js App Router / React Server Components, Tailwind 4 | Render `<ComponentStyles layer="openui" />` once in the root layout. Start global CSS with `@layer theme, base, openui, components, utilities;` before importing Tailwind. The browser reads the layer from the server sheet; no registry or client configure call. |
| Next.js App Router, unlayered / Tailwind 3 | Render `<ComponentStyles />` in the root layout. Import global CSS from a page or nested layout so Next places it after the component sheet; root-layout CSS imports would precede it and lose equal-weight ties. This order trick is to be pinned by the Tailwind 3 compatibility example's Playwright check (#162, Tier 1); nothing on this branch checks it yet. |
| Next.js Pages Router, React Router / Remix SSR, Gatsby or another renderer with document-head control | Import the `/styles` collector and inline its full result once before app stylesheets, before streaming begins. Pass `{ layer: "openui" }` for layer mode and put the order statement before the sheet. No incremental flush or per-response registry. |
| A component library built on our public `css` | Ship its own `/styles` entry importing all of its style modules, retaining them through bundling, then call our `getComponentStyles()`. Apps inline that shared sheet, which includes both libraries' rules. |

### Trade-offs and replaced decisions

- **Full inline server sheet.** Each response carries all component rules, about 28 KB gzipped,
  including unused components. Browser-only apps retain per-component tree-shaking. A cacheable,
  build-generated `styles.css` is follow-up [#171](https://github.com/ankit-thesys/openui-comp/issues/171).
- **Render-time timing.** Rules registered during render apply after that task, so a layout
  effect in the same task can measure unstyled content. This includes a module first evaluated
  during render. Authors using public `css` should define rules at module level and import them
  before rendering. A fork-only AST guard rejects our own `css`/`keyframes` calls in function or
  component bodies, including tagged templates and aliased imports. Existing import-time IIFEs
  are flattened while preserving declaration and dependency order.
- **Multiple package copies.** Two copies can write duplicate rules: each has its own store
  and deduplication state. Append-only writing preserves both copies' rules without coordinating
  stores or merging tags.
- **Next unlayered order.** The page/nested-layout CSS import recipe above is sensitive to
  Next's stylesheet placement, so its compatibility smoke test must keep checking the order.
  Layer mode uses the explicit layer order instead.
- **Late configuration now warns.** This replaces the original “no warning” decision.
  Changing the layer after rules were written to the page, or returned by `getComponentStyles`
  on the server, logs `console.warn` in development. Existing page rules cannot be re-wrapped;
  only future appends use the new layer. Setting the same layer again is silent, as is setting
  the layer a server sheet was read or returned in, and production logs nothing. Invalid names still warn only in development. There are no server-sheet or
  layer-order warnings; those setups are documented.
- **UTF-8 server text.** Serve server HTML and its inline sheet as UTF-8. Goober deduplicates
  against exact text; an encoding change can corrupt non-ASCII CSS and cause duplicate rules.
  Keep the emitted sheet text intact.
