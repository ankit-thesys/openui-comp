# Spec: flat styles pilot for `@openuidev/react-components`

Status: draft, not started. Source of every decision: [ADR 0001](../adr/0001-flat-styles.md) (Q-numbers below refer to it).
Base: fork branch `codex/react-components-chart-selectors` (#72, head `5e09b37c`). Delivered as one new draft PR stacked on #72.

## 1. Problem

Consumers cannot reliably override component styles with a plain class. In the current stack:

- In #42, 1,135 of 1,368 selectors carry the Goober hash plus at least one more class; in #72, 286 of 1,363 weigh (0,3,0) or more. A consumer's `.openui-x { … }` loses to all of them.
- Goober's sheet is appended at the end of `<head>`, so consumer CSS loaded earlier loses even equal-weight ties.
- #68–#72 guard every rule behind a class on `<html>`: server-rendered CSS is inert until JS runs, and rewriting `<html class>` removes all component styles.
- Stable class names are inconsistent (`openui-button-root`, `openui-button-base-secondary`, `openui-tabs-list--icon-title`, `openui-tabs-trigger-styled`).

## 2. Goal

For the four pilot components, a consumer writes one documented class (plus the same state shape we use) and it overrides any property we set, with no `!important`, regardless of whether their CSS loads before or after the library, in client rendering and in non-streaming SSR. The pilot proves the convention, the enforcement test and the opt-in layer so the remaining components can follow mechanically.

## 3. Scope

In:

- Components: `Button`, `IconButton`, `Tabs` family (`Tabs`, `TabsList`, `TabsTrigger`, `TabsContent`), `MarkDownRenderer`.
- Infrastructure: `#_goober` prepend, internal `useStyles`, `ThemeProvider` `cssLayer` prop, copy of #73 `getComponentStyles`, `"use client"` on every component module, grammar/name/directive test with allowlist, browser override tests, README contract, generated selector reference, migration table for pilot renames.
- Internal callers of renamed classes (see §6.6).

Out (later PRs):

- Streaming SSR flush and Next App Router recipe (Q32b, next PR).
- All other components (stay on the Q25 allowlist, keep their `:where(&:root)` guard, always unlayered).
- Docs site page (Q26).
- Token defaults in `styles/defaults.ts` (Q5, Q29): unchanged.
- The 10 `!important` declarations (Q12): unchanged.
- #42, #67–#72 branches and #73: not modified.

## 4. Public contract (what the README promises)

### 4.1 Class grammar (Q17, Q19)

| Kind             | Pattern                          | Example                                                       |
| ---------------- | -------------------------------- | ------------------------------------------------------------- |
| Root             | `openui-<component>`             | `openui-button`                                               |
| Part             | `openui-<component>-<part>`      | `openui-button-icon`, `openui-tabs-trigger`                   |
| Modifier         | `openui-<block>--<axis>-<value>` | `openui-button--variant-primary`, `openui-button--size-small` |
| Boolean modifier | `openui-<block>--<flag>`         | `openui-tabs-list--with-icon`                                 |

- `<component>` is the kebab-case of the exported React name; sub-components and portal content are family parts.
- Regex the test enforces: `^openui(-[a-z0-9]+)+(--[a-z0-9]+(-[a-z0-9]+)*)?$`, and the block before `--` must itself be a documented root or part name.

### 4.2 States (Q18)

Runtime state uses existing attributes; no state classes. Consumers write e.g. `.openui-tabs-trigger[data-state=active]`, `.openui-button:disabled`.

### 4.3 Override guarantee

- Default mode: library rules are unlayered and weigh (0,1,0) (base) or (0,2,0) (one state). `#_goober` is first in `<head>`, so any consumer rule of equal or greater weight wins.
- Layer mode (`<ThemeProvider cssLayer="openui">`): rules sit in `@layer openui`; any unlayered consumer CSS wins regardless of weight or order.
- Exceptions: listed `!important` declarations; components on the allowlist (§8).

### 4.4 Tailwind (Q10, Q22a)

- Tailwind 3.4 / 4.x resets do not affect pilot components (verified).
- Known conflict: Tailwind ≤3.3 preflight `[type='button'] { background-color: transparent }` clears button backgrounds.
- Default mode + Tailwind 4: utilities on our elements need `!` (e.g. `!bg-red-500`) or the stable class.
- Layer mode + Tailwind 4 recipe, utilities win normally:

  ```css
  @layer theme, base, openui, components, utilities;
  @import "tailwindcss";
  ```

### 4.5 Private surface (Q14, Q24, Q34)

`--_openui-*` variables, Goober `go*` classes, style factories and `useStyles` are not public and may change.

## 5. Selector rules for library code (Q7, Q8, Q9)

Every rule a pilot style factory emits must be one of:

1. `.goX` (0,1,0).
2. `.goX` + exactly one of: pseudo-class (`:hover`, `:focus-visible`, `:active`, `:disabled`, `:first-child`, `:last-child`, `:checked`, `:placeholder-shown`, `:focus-within`), attribute selector (`[data-state=…]`, `[aria-…]`, `[data-orientation=…]`, `[data-highlighted]`), or pseudo-element (`::before`, `::after`, `::placeholder`) — weight at most (0,2,0) (pseudo-elements add (0,0,1)).
3. `.goX + .goX` (sibling spacing).
4. Zero-weight foreign-content rule: `:where(.goX) <type selectors or combinators>` — only for content we do not render.
5. Any of the above inside `@media`, `@container` or `@keyframes` (keyframe bodies exempt).

Patterns and how to convert them:

| Current shape                                        | Pilot shape                                                                                                                                                            |
| ---------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `&.openui-button-base-primary { … }`                 | separate `variants.primary` factory entry, applied with `names.variant.primary`                                                                                        |
| `.root .part { … }`                                  | `parts.part` entry on the part element                                                                                                                                 |
| `.root.variant .part { color }`                      | root variant sets `--_openui-<c>-<part>-color`; part reads `color: var(--_openui-<c>-<part>-color, <default>)`                                                         |
| `.root.variant .part { display/layout }`             | part modifier class `openui-<c>-<part>--<axis>-<value>` set in TSX                                                                                                     |
| `&:hover:not(:disabled)`                             | `&:hover {…}` then `&:disabled {…}` in the same entry; disabled restates the resting values it must win on                                                             |
| `& svg { … }` on consumer icons                      | wrap icon slot in our own `<span class="openui-button-icon">`; `svg` gets `width:1em;height:1em` via `:where(.goX) svg` only if the slot cannot do it with `font-size` |
| markdown `p`, `h1`–`h6`, `li`, `a`, `code`, `table`… | `react-markdown` `components` map renders each with its own part class (`openui-markdown-renderer-paragraph`, …)                                                       |
| `.katex …`, consumer children                        | `:where(.goX) …` zero-weight                                                                                                                                           |

## 6. Design

### 6.1 Style module shape (Q15 amended, Q21)

```ts
// button.styles.ts
import type { StyleCss } from "../../styles/useStyles";

export const names = {
  root: "openui-button",
  icon: "openui-button-icon",
  variant: {
    primary: "openui-button--variant-primary",
    secondary: "openui-button--variant-secondary",
    tertiary: "openui-button--variant-tertiary",
  },
  size: { "extra-small": "openui-button--size-extra-small" /* … */ },
  tone: { destructive: "openui-button--tone-destructive" },
} as const;

export const buttonStyles = (css: StyleCss) => ({
  root: css`box-sizing: border-box; display: flex; … &:focus-visible { … }`,
  variant: {
    primary: css`background-color: var(--_openui-button-bg, var(--openui-interactive-accent-default)); … &:hover { … } &:disabled { … }`,
    // …
  },
  size: {/* … */},
  tone: { destructive: css`--_openui-button-bg: var(--openui-interactive-destructive-default); …` },
  icon: css`
    display: inline-flex;
    width: 1em;
    height: 1em;
  `,
});
```

- Plain factory, plain object; no logic beyond template literals and shared string fragments.
- `names` is the only place class strings are written.

### 6.2 `useStyles` (Q27, Q33, Q34) — the one new helper

File `src/styles/useStyles.ts`, internal, not exported from `src/index.ts`:

```ts
"use client";
import { css as gooberCss } from "goober";
import { useContext } from "react";

export type StyleCss = (strings: TemplateStringsArray, ...values: unknown[]) => string;

const cache = new Map<string | undefined, WeakMap<Function, unknown>>();

const layered =
  (layer: string): StyleCss =>
  (strings, ...values) =>
    gooberCss`@layer ${layer}{&{${String.raw({ raw: strings }, ...values)}}}`;

export function useStyles<T>(factory: (css: StyleCss) => T): T {
  const layer = useContext(CssLayerContext); // string | undefined, from ThemeProvider
  let byFactory = cache.get(layer);
  if (!byFactory) cache.set(layer, (byFactory = new WeakMap()));
  let result = byFactory.get(factory) as T | undefined;
  if (!result) {
    result = factory(layer ? layered(layer) : (gooberCss as StyleCss));
    byFactory.set(factory, result);
  }
  return result;
}
```

- Verified in the lab: `` css`@layer openui{&{…}}` `` emits the same single-class selectors inside `@layer openui{…}`, including `&:hover` and `@media`.
- Cache is module-level and keyed by layer then factory; a factory runs at most once per layer per process.
- Server: cache persists across requests; this is correct because Goober's server registration is also per process and #73's sheet is cumulative.

### 6.3 `ThemeProvider` (Q27, Q33)

- New prop `cssLayer?: string` documented next to `cssSelector`.
- New internal `CssLayerContext`; a nested provider without `cssLayer` inherits the parent value; with it, overrides.
- No change to `mode`, theme props, `cssSelector` or token injection.

### 6.4 `#_goober` prepend (Q3, Q23)

In `src/index.ts` (already in `sideEffects`), before any style registration:

```ts
if (typeof document !== "undefined" && !document.getElementById("_goober")) {
  const sheet = document.createElement("style");
  sheet.id = "_goober";
  document.head.prepend(sheet);
}
```

- Never moves an existing `#_goober`.
- Must stay after the existing `defaults.ts` layer-order tag so `@layer openui-defaults;` is still the first layer declaration. Verify ordering in the browser test.

### 6.5 SSR (Q32a, Q32c)

- Copy `src/utils/componentStyles.ts`, its export, the `test` script and `test/componentStyles.test.mjs` from #73 (`dbc88701`). #73 itself is untouched.
- Update the test and README for render-time registration: render first, then `getComponentStyles()`, then `<style id="_goober">` first in `<head>`.
- Streaming stays uncertified; README states FOUC (no crash) and points to the upcoming streaming PR.

### 6.6 Renames and internal callers (Q13, Q20)

Pilot renames (final names decided while converting; the table in the README is generated from `names`):

| Old                                                                                                       | New                                                              |
| --------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| `openui-button-root`                                                                                      | `openui-button`                                                  |
| `openui-button-base-{primary,secondary,tertiary}`                                                         | `openui-button--variant-{…}`                                     |
| `openui-button-base-destructive-{…}`                                                                      | `openui-button--variant-{…}` + `openui-button--tone-destructive` |
| `openui-button-base-{extra-small,small,medium,large}`                                                     | `openui-button--size-{…}`                                        |
| `openui-tabs-tabs`, `openui-tabs-trigger-styled`, `openui-tabs-list-styled`, `openui-tabs-content-styled` | removed (were Goober-class carriers)                             |
| `openui-tabs-list--title` etc.                                                                            | `openui-tabs-list--layout-title`, `--layout-icon-title`, …       |
| `openui-markdown-renderer-card`, `-card-sunk`                                                             | `openui-markdown-renderer--variant-card`, `--variant-sunk`       |

Internal files that reference pilot classes or components and must be updated in the same PR: `Buttons/Buttons.tsx`, `Buttons/buttons.styles.ts`, `CodeBlock/CodeBlock.tsx`, `SectionBlock/FoldableSection.tsx`, `EditableTable/EditableTable.tsx`, `Carousel/Carousel.tsx`, `InlineMarkdownRenderer/*`, `Table/ScrollableTable.tsx`, `Sources/ListedSources.tsx`, `ImageGallery/*`, `TextContentWrapper/TextContentWrapper.tsx`, `CardHeader/CardHeader.tsx`. Changes there are limited to class-name references; their own styles stay as they are (allowlisted).

The chat kit (#54) is checked for references to renamed classes and rebuilt; it is not modified in this PR.

### 6.7 `"use client"` (Q31)

- Add the directive to every module under `src/components/**` that exports a component, plus `useStyles.ts`.
- tsdown/rolldown may drop module directives in `unbundle` mode; the test asserts the first statement of each built component module in `dist/**/*.mjs` and `*.cjs` is `"use client"`. If the bundler strips it, fix through tsdown's documented options only; no custom post-processing script without raising it first.

## 7. Tests (Q16, Q25, Q32a)

All under `packages/react-components/test/`, run by `pnpm --filter @openuidev/react-components test` after build. No new dependencies; Playwright is already a workspace dev dependency — confirm before use, otherwise raise it.

| Test                       | Checks                                                                                                                                                                                                                                                           |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `selectors.test.mjs`       | Imports every style factory from `dist`, runs it with plain `css` and with the layered `css`, extracts CSS, parses each selector with a small hand-written tokenizer and fails on anything outside §5. Allowlisted modules are skipped and listed in the output. |
| `names.test.mjs`           | Every `names` value matches §4.1; no duplicates across modules; every name appears in the generated selector reference; no public token in `defaults.ts` starts with `--_`.                                                                                      |
| `directives.test.mjs`      | `"use client"` is the first statement of every built component module.                                                                                                                                                                                           |
| `componentStyles.test.mjs` | From #73, updated: render, then collect; output is stable across calls; every `go*` class in markup is in the sheet.                                                                                                                                             |
| `overrides.spec` (browser) | For each pilot component and part: consumer CSS before the library, after the library, in layer mode, Tailwind 4 with and without the recipe; `[data-state]` overrides on Tabs; markdown parts; `<html class>` rewrite leaves styles intact.                     |
| `ssr-nojs.spec` (browser)  | Server HTML + collected CSS, JS disabled: pilot components styled; consumer override in a later `<link>` wins.                                                                                                                                                   |

Allowlist: `test/flat-allowlist.json`, an array of source paths not yet migrated. The test fails if a listed file is already compliant (forces removal) or if an unlisted file is non-compliant. Release gate: empty list (Q25).

Every test file starts with a comment block explaining what it guards, how to run it, and how to update the allowlist; `test/README.md` documents the runner and the tokenizer's accepted grammar.

## 8. Documentation (Q26)

`packages/react-components/README.md`:

- Replace "Stable selectors" … "Selector conversion status" (current lines ~92–288) with a short "Styling and overrides" section: grammar, states, override guarantee, load order and `#_goober`, Tailwind notes and recipe, `cssLayer`, known conflicts, `!important` exceptions, components still on the allowlist ("always unlayered, old names").
- Link to `docs/selectors.md` (generated from `names` by a script under `scripts/`, checked by `names.test.mjs`; the script is documented at its top and in `test/README.md`).
- Update "Server-rendered styles" for render-then-collect and the streaming caveat.
- Add the pilot rows of the react-ui migration table.

## 9. Acceptance criteria

- [ ] `pnpm install --frozen-lockfile && pnpm -r build && pnpm -r run ci` pass.
- [ ] All tests in §7 pass; allowlist contains every non-pilot style module and nothing else.
- [ ] For each pilot component, every documented class overrides `color`, `background-color`, `padding`, `border-color` with consumer CSS before and after the library, and in layer mode.
- [ ] No pilot rule exceeds (0,2,0) except zero-weight `:where()` foreign-content rules.
- [ ] No pilot module calls `document.documentElement.classList.add` or registers CSS at import.
- [ ] Rewriting `<html class>` leaves pilot components styled.
- [ ] JS-off SSR render of pilot components is styled.
- [ ] Visual parity: pilot components render identically to #72 in light and dark (screenshot diff in the existing browser harness), except intentional changes listed in the PR.
- [ ] README and generated reference match `names`.
- [ ] #42, #67–#72 and #73 heads unchanged.

## 10. Risks and open points

| Risk / question                                                                                                          | Plan                                                                                                                                 |
| ------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------ |
| `destructive × variant` is a compound today (`.base-destructive-primary`).                                               | Model `buttonType` as a `tone` axis that only sets private variables the variant entries read; verify all six combinations visually. |
| Disabled must beat hover without `:not()`.                                                                               | Order `&:disabled` after `&:hover` in the same entry and restate overridden values; test hover on a disabled button.                 |
| Some Tabs part rules may depend on Radix-generated DOM we do not class.                                                  | Prefer Radix `data-*` attributes on the element itself; fall back to a part modifier class.                                          |
| Markdown via `react-markdown` component map changes DOM props for consumers using `MarkDownRenderer` children overrides. | Merge our `className` with any incoming one; test custom component overrides still work.                                             |
| `"use client"` stripped by tsdown in unbundle mode.                                                                      | Check first; if stripped, use tsdown's documented banner/directive handling; otherwise raise before adding a script.                 |
| `#_goober` prepend vs `defaults.ts` layer-order tag ordering.                                                            | Browser test asserts `@layer openui-defaults;` is first and `#_goober` precedes app CSS.                                             |
| Render-time registration inserts CSS during render (React 19 concurrent rendering).                                      | Same model as Goober `styled`; verify no hydration warnings in the existing hydration suite.                                         |
| Playwright availability in the package.                                                                                  | Confirm workspace dev dependency; if absent, run browser tests from the existing scratch harness and raise adding it.                |

## 11. Delivery

- Isolated checkout under `/private/tmp`, branch `codex/react-components-flat-styles-pilot` off `5e09b37c`.
- One draft PR to `ankit-thesys/openui-comp`, base `codex/react-components-chart-selectors`, pushed only after approval.
- Next PR: streaming SSR (Q32b). Then component migration PRs in the order from the decision record.
