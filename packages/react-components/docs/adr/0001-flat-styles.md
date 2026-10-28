# ADR 0001: Flat component styles and override contract

- **Status:** Accepted (2026-10-28). Not implemented yet; see the [pilot spec](../specs/flat-styles-pilot.md) and [tickets](../specs/flat-styles-pilot-tickets.md).
- **Scope:** `@openuidev/react-components` component styles. Theme token defaults are out of scope (Q5).

## Context

The component styles inherited from `@openuidev/react-ui` nest variants and parts under Goober's generated class, so most rules weigh two or more classes and a consumer's plain `.openui-x { … }` loses. The `#68`–`#72` migration additionally guards every rule behind a class on `<html>`, which leaves server-rendered CSS inert until JavaScript runs and drops all component styles when `<html class>` is rewritten. Goober's global APIs (`glob`, `createGlobalStyles`) share one replaceable slot in 2.1.19, so they cannot hold the library's styles. The decisions below were reached in a design interview and backed by browser experiments (see Evidence).

## Goal

A consumer writes one plain class and it overrides any property the library sets:

```css
.openui-button--variant-primary {
  background: red;
}
```

No `!important`, no wrapper selector, no knowledge of Goober hashes.

## Decisions

### Contract

| #        | Decision                                                                                                                                                                                                                                                                                         |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Q1       | Stable single classes are the public override API. The documented list is the contract; anything not listed is private.                                                                                                                                                                          |
| Q17      | Naming grammar (BEM, kebab-case). Root `openui-<component>`. Part `openui-<component>-<part>`. Modifier `openui-<block>--<axis>-<value>` (e.g. `openui-button--variant-primary`, `openui-button--size-small`). Boolean modifier `openui-<block>--<flag>`. No `-root` suffix.                     |
| Q18      | Runtime states are attributes, not classes: `:disabled`, `[aria-*]`, Radix `[data-state]`, `[data-orientation]`, `[data-highlighted]`. Modifier classes are only for prop-driven appearance. Consumers match states with the same (0,2,0) shape, e.g. `.openui-tabs-trigger[data-state=active]`. |
| Q19      | The component segment is the kebab-case of the exported React name (`IconButton` → `openui-icon-button`). Compound sub-components and portal content are parts of their family (`openui-tabs-trigger`, `openui-select-content`).                                                                 |
| Q13, Q20 | All existing names are renamed to the grammar. No legacy aliases. The docs ship a react-ui → react-components migration table produced from the actual renames.                                                                                                                                  |
| Q14, Q24 | Component-scoped variables are private and prefixed `--_openui-<component>-<part>-<property>`. Public surface is classes plus the global `--openui-*` theme tokens.                                                                                                                              |
| Q12      | The 10 existing `!important` declarations (MarkDownRenderer, listedSources, CodeBlock, SliderBlock) stay and are listed as contract exceptions.                                                                                                                                                  |

### Engine and selector shape

| #   | Decision                                                                                                                                                                                                                                                                                         |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Q2  | Stay on Goober 2.1.19, flat `css()` only. No `glob`, no `createGlobalStyles`.                                                                                                                                                                                                                    |
| Q7  | Root variant → part: the root modifier sets private variables, the part reads them (inheritance). A part modifier class (`--axis-value` on the part) only where the change is not a value (display, layout).                                                                                     |
| Q8  | Everything we render gets a class (markdown via renderer component overrides, our SVG/d3 elements). Content we do not render (consumer `children`, katex) keeps a descendant selector inside `:where()`, e.g. `:where(.openui-markdown) p`, weight (0,0,1). This is the only remaining `:where`. |
| Q9  | Specificity budget: base (0,1,0), ceiling (0,2,0) = one class + one state, or `.x + .x`. No chains like `:hover:not(:disabled)`; order `&:hover` then `&:disabled` inside one `css()` instead.                                                                                                   |

### Cascade and load order

| #       | Decision                                                                                                                                                                                                                                                                                                               |
| ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Q3      | `#_goober` comes first in `<head>`: the library prepends an empty one on the client if none exists; SSR users put it first. Consumer CSS then wins equal-specificity ties.                                                                                                                                             |
| Q23     | Never move an existing `#_goober` (host already uses Goober); document the one-line fix.                                                                                                                                                                                                                               |
| Q4, Q10 | Component rules are unlayered by default. Verified: survives Tailwind 3.4 and 4.1 resets. Known conflict: Tailwind ≤3.3 preflight `[type='button']` clears button backgrounds. In default mode Tailwind 4 utilities lose to our rules; workaround is the stable class or the `!` modifier.                             |
| Q22a    | Opt-in `@layer openui`, matching MUI (`enableCssLayer`) and Ant Design (`StyleProvider layer`). README recipe for Tailwind 4: `@layer theme, base, openui, components, utilities;` before `@import "tailwindcss";`.                                                                                                    |
| Q27     | Opt-in mechanism: `<ThemeProvider cssLayer="openui">`. Style modules export factories; components call an internal `useStyles(factory)` that passes plain or layer-wrapping `css`, cached per factory and layer. Styles now register at render, not import, which also makes string-only style modules tree-shakeable. |
| Q28     | The library declares no layer order; only emits `@layer openui { … }`.                                                                                                                                                                                                                                                 |
| Q29     | `:root` token defaults (`styles/defaults.ts`, `@layer openui-defaults`, `<html>` marker) are unchanged in both modes.                                                                                                                                                                                                  |
| Q33     | `cssLayer?: string`, inherited by nested providers, provider-level only. A subtree with a different layer gets its own class set (documented CSS doubling).                                                                                                                                                            |
| Q34     | `useStyles` is internal, not exported.                                                                                                                                                                                                                                                                                 |

### Code conventions

| #                    | Decision                                                                                                                                                                     |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Q15 (amended by Q27) | Each `*.styles.ts` exports plain factories returning plain objects (`root`, `variants`, `sizes`, parts). TSX joins with `clsx`. `useStyles` is the single sanctioned helper. |
| Q21                  | Each styles module exports a plain `names` const with its stable classes; TSX, docs check and grammar test all use it.                                                       |
| Q31                  | Every component module carries `"use client"`; the test checks it survives into `dist`.                                                                                      |

### SSR

| #    | Decision                                                                                                                                                                                                                                                                                                                                               |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Q32a | Non-streaming SSR: render, then `getComponentStyles()`, then `<style id="_goober">` first in `<head>`. Cumulative sheet (safe across concurrent requests; superset is harmless). Pilot carries a copy of #73's change and a JS-off first-paint test.                                                                                                   |
| Q32b | Streaming (Next App Router default, React Router streaming): not in the pilot. First follow-up PR adds a per-request incremental flush function, a Next `useServerInsertedHTML` recipe and a real Next test. Documented catch: in default mode, late-flushed CSS lands after app CSS and wins ties; layer mode is the fix. Until then: FOUC, no crash. |
| Q32c | #73 stays open and unchanged on its #42 base.                                                                                                                                                                                                                                                                                                          |

### Enforcement, docs, delivery

| #            | Decision                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Q16          | Package tests (vitest; see Amendments): calls every style factory in both modes, extracts CSS, fails on any selector outside the Q9 grammar, checks `names` against Q17 and the docs, checks `"use client"` in `dist`. Browser override tests (consumer CSS before/after, Tailwind 4 with and without the recipe, JS-off SSR) for pilot components. Hand-written selector check, no new dependencies. Script and runner documented in the package. |
| Q25          | The grammar test starts with an explicit allowlist of unmigrated files; each follow-up PR shrinks it; no npm release until it is empty. Unmigrated components are documented as "always unlayered".                                                                                                                                                                                                                                                |
| Q26          | README states the contract briefly (grammar, states, load order, Tailwind notes, known conflicts, `!important` exceptions) and links to a generated, test-checked selector reference built from `names`. The hand-written selector lists are replaced. Docs-site page later.                                                                                                                                                                       |
| Q6, Q11, Q30 | #42 is never touched. New draft PR stacked on #72 (isolated checkout, pushed only on approval) piloting Button, IconButton, Tabs, MarkDownRenderer, plus the `#_goober` prepend, `useStyles`/`cssLayer`, #73 copy, tests and README. Remaining components follow in later PRs; streaming PR first.                                                                                                                                                 |

## Follow-up order

1. Pilot PR (above).
2. Streaming SSR PR (Q32b).
3. Component migration PRs, hardest first by the scan: TextBlock, MarkDownRenderer remainder, Tabs family, TextContentWrapper, ListItem, ContextCardBlock, Accordion, EntityList, SliderBlock; then the rest until the Q25 allowlist is empty.
4. Docs-site page (Q26).

## Evidence

The experiments ran against stock `goober@2.1.19` in Chromium (Playwright 1.56). The lab scripts are not committed; the T10 browser suite in the pilot re-creates the override and reset cases as checked-in tests.

| Experiment                                                                 | Result                                                                                                                                                                        |
| -------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Goober `glob` / `createGlobalStyles` with two modules and a host global    | Each registration replaces the previous one (`cache.g` in `src/core/hash.js`; upstream regression tests and [goober#496](https://github.com/cristianbote/goober/issues/496)). |
| `<html>` guard vs per-element class                                        | Guarded CSS is unstyled in server markup without JS and lost on `<html class>` rewrite.                                                                                       |
| Nested vs flat rules, consumer CSS after the library                       | Nested: variant and part overrides lose. Flat: all overrides win.                                                                                                             |
| Same, consumer CSS before the library                                      | Both lose; fixed by putting `#_goober` first (Q3).                                                                                                                            |
| Selector scan of #72 (1,363 selectors)                                     | 347 flat, 433 compound variant, 541 own descendant, 211 parent state → child, 120 foreign markup, 42 pseudo chains, 57 structural; 286 weigh ≥ (0,3,0).                       |
| Tailwind 3.3.7 / 3.4.17 / 4.1.11 vs flat unlayered rules first in `<head>` | 3.3 preflight `[type='button']` clears button background; 3.4 and 4.1 resets do not; 4.1 utilities lose to unlayered rules.                                                   |
| Same with `@layer openui`                                                  | 3.4 `button{}` and 4.1 `base` beat the library unless the consumer declares `@layer theme, base, openui, components, utilities;`, then everything wins as intended.           |
| `` css`@layer openui{&{…}}` ``                                             | Same single-class selectors, `&:hover` and `@media` intact, inside `@layer openui{…}`.                                                                                        |

Library survey for the opt-in layer (Q22a):

- [MUI: Tailwind CSS v4 integration](https://mui.com/material-ui/integrations/tailwindcss/tailwindcss-v4/) — opt-in `enableCssLayer`.
- [Ant Design: style compatibility](https://ant.design/docs/react/compatible-style) — opt-in `StyleProvider layer`.
- [Mantine 7.1.0 changelog](https://mantine.dev/changelog/7-1-0) — opt-in `styles.layer.css`.
- [Chakra UI: cascade layers](https://chakra-ui.com/docs/styling/cascade-layers) — layered by default, `disableLayers`.

## Amendments

Recorded while sharpening the [pilot spec](../specs/flat-styles-pilot.md) (2026-10-28).

- **Q8, narrowed for markdown prose.** Markdown prose (generated paragraphs, headings, lists, quotes, rules) is styled with zero-weight `:where(.goX) <tag>` rules instead of a part class per tag, the approach Tailwind Typography takes. Giving every generated tag a part class would need a large renderer component map and context workarounds for structure such as "paragraph inside a quote", and zero weight already guarantees any consumer rule wins. Elements the renderer replaces (code, link, code block, table) keep stable classes.
- **Q22a, recipe corrected.** Layer priority follows where a layer first appears in the document, and `#_goober` sits at the top of `<head>`. A layer statement inside the app's CSS file therefore comes too late: `openui` is declared first and loses to Tailwind's `base` (verified in Chromium against Tailwind 4.1). The layer-mode recipe is two tags first in `<head>`: `<style>@layer theme, base, openui, components, utilities;</style>` then `<style id="_goober"></style>`, which the library reuses (Q23). The library still emits no layer statement (Q28); Goober also cannot emit one.
- **Q3, placement.** The prepend lives in `styles/defaults.ts`, right after its layer-order tag, because that module registers CSS at import and would otherwise create `#_goober` at the end of `<head>` first.
- **Q16, runner.** Unit tests use vitest, the runner every sibling package uses, instead of `node --test`. Browser tests use `@playwright/test`, a new devDependency of this package, in a separate CI job; the package also gets the sibling-style `ci` script it lacked, so CI starts checking it at all.
