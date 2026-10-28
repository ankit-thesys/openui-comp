# Tickets: flat styles pilot

Source: [flat-styles-pilot.md](flat-styles-pilot.md) (§ references) and [ADR 0001](../adr/0001-flat-styles.md) (Q references).
All pilot tickets land as commits on one branch, `codex/react-components-flat-styles-pilot`, off #72 (`5e09b37c`), delivered as one draft PR. Follow-up tickets are separate PRs.

Size: S ≤ half a day, M ≈ a day, L > a day.

## Dependency graph

```
T0 ─┬─ T1 ─┬─ T5
    │      └──────────────┐
    ├─ T2 ────────────────┤
    ├─ T3 ─┬─ T6 ─ T7     │
    │      ├─ T8          ├─ T10 ─ T11 ─ T12
    │      └─ T9          │
    └─ T4 ────────────────┘
(T6–T9 also need T1 and T4)
```

---

## Pilot PR

### T0 — Isolated checkout and test tooling · S

- Create the isolated checkout under `/private/tmp` and the branch off `5e09b37c`; confirm `pnpm install --frozen-lockfile && pnpm -r build` passes untouched.
- Add `@playwright/test` (1.56 line) as a devDependency of `packages/react-components`, a package `playwright.config.ts` (Chromium only) and a `test:browser` script; update the lockfile.
- Already verified, no spike needed: `"use client"` survives tsdown 0.21.10 into `.mjs` and `.cjs`.

**Done when:** `pnpm --filter @openuidev/react-components exec playwright test --list` runs with an empty suite.

### T1 — Enforcement tests with full allowlist · M · needs T0

- `test/selectors.test.ts`: hand-written selector tokenizer for spec §5; runs every style factory (and, for not-yet-migrated modules, their registered CSS) and reports violations.
- `test/names.test.ts`: §4.1 grammar, no duplicates, reference-doc match (doc check stubbed until T11), no public `--_` tokens.
- `test/directives.test.ts`: `"use client"` first statement in built component modules.
- `test/flat-allowlist.json` listing **every** current style module; test fails if a listed file is compliant or an unlisted file is not.
- `test/README.md`: how to run, accepted grammar, how to update the allowlist. Comment block at the top of each test.
- `package.json` scripts matching the sibling packages: `test` (`vitest run`), `test:browser` (Playwright) and `ci` (`typecheck && test && lint:check && format:check`), so the existing `build-js.yml` `run ci` step covers the package.
- `build-js.yml`: one separate job that builds, installs Chromium and runs `pnpm --filter @openuidev/react-components test:browser`.

**Done when:** tests pass on the unchanged code with everything allowlisted, and fail on a deliberately broken fixture (show both in the PR).

### T2 — Bring in `getComponentStyles` from #73 · S · needs T0

- Copy `src/utils/componentStyles.ts`, its `src/index.ts` export and `test/componentStyles.test.ts` from `dbc88701`, porting the test from `node --test` to vitest. #73 untouched.
- Adjust the test to render first, then collect.

**Done when:** test passes; `git log` shows the copy credited to #73 in the commit message.

### T3 — `useStyles` and `cssLayer` · M · needs T0

- `src/styles/useStyles.ts` (spec §6.2): `StyleCss` type, layered `css`, cache keyed by layer then factory, `"use client"`. Not exported from `src/index.ts`.
- `CssLayerContext` and `ThemeProvider` `cssLayer?: string` with inheritance (§6.3); JSDoc next to `cssSelector`.
- Node test: a sample factory produces single-class rules unlayered and inside `@layer openui{…}`; same factory twice returns the cached object; nested provider override/inherit.

**Done when:** tests pass; no existing component changed yet.

### T4 — `#_goober` prepend · S · needs T0

- Prepend in `src/index.ts` (§6.4); never move an existing `#_goober`.
- Browser check: `@layer openui-defaults;` stays the first layer declaration; `#_goober` precedes app `<link>`/`<style>`; host-owned `#_goober` left in place.

**Done when:** check passes in Chromium.

### T5 — `"use client"` on every component module · S · needs T0, T1

- Add the directive to every module under `src/components/**` that exports a component.
- `directives.test.ts` passes for all of them.

**Done when:** build + directive test green; existing SSR harness still renders (client components render on the server in non-RSC SSR).

### T6 — Button · M · needs T1, T3, T4

- `button.styles.ts` → `names` + `buttonStyles` factory (§6.1); `Button.tsx` uses `useStyles` and `names`; remove the `:where(&:root)` guard and `classList.add`.
- Rename prop `buttonType` (`normal | destructive`) to `tone` (`default | destructive`) and record it in the migration table. Variant, size and tone axes; destructive sets private `--_openui-button-*` variables only (§10 risk).
- Icon slots wrapped in `openui-button-icon`.
- Hover/disabled ordering without `:not()`.
- Update internal references to old Button classes (`Buttons/*`, `CodeBlock`, `FoldableSection`, `EditableTable`, `Carousel`, `ScrollableTable`, `ListedSources`, `ImageGallery/*`, `CardHeader`, `TextContentWrapper` — only those that reference Button classes).
- Remove Button from the allowlist.

**Done when:** selector + names tests pass for Button; all 4 variants × 4 sizes × 2 tones match #72 in light and dark under the computed-style gate; disabled hover shows disabled styles.

### T7 — IconButton · S · needs T6

- Same conversion; reuse Button's patterns, not its factory (separate block `openui-icon-button`). Rename prop `appearance` (`normal | destructive`) to `tone` (`default | destructive`).
- Size → icon part and shape × size radius via private variables; `3-extra-small` sets `radius-s` explicitly.
- Update internal references; remove from allowlist.

**Done when:** as T6 for IconButton's variants/sizes.

### T8 — Tabs family · L · needs T1, T3, T4

- `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent` → one `tabs.styles.ts` factory with family parts (`openui-tabs-list`, `openui-tabs-trigger`, `openui-tabs-trigger-icon`, …).
- `TabsList` variants → `openui-tabs-list--variant-*`; root/list variant → part via private variables, part modifier classes only for layout (Q7).
- Active/hover state via Radix `[data-state]` on the trigger itself (Q18).
- Scroll buttons use the converted IconButton/Button classes (coordinate with T6/T7 if they land first).
- Fold the `clear` root variant's rules into each part's base styles; still emit `openui-tabs--variant-clear`.
- The tablist is the TabsList root (it receives `className`/`style`/`ref`); the wrapper becomes part `openui-tabs-list-container`.
- Drop the scroll buttons' dead `left/right: 2px`; list the indicator's inline geometry as a contract exception.
- Remove the `*-styled` and `openui-tabs-tabs` carrier classes; update internal references; remove from allowlist.

**Done when:** selector + names tests pass; every list layout and the active/inactive/hover/disabled triggers match #72; `.openui-tabs-trigger[data-state=active] { … }` override works.

### T9 — MarkDownRenderer · M · needs T1, T3, T4

- Prose (`p`, headings, lists, quotes, `hr`, `strong`, and their structural rules) moves to zero-weight `:where(.goX) <tag>` rules; elements the renderer replaces (code, link, code block, table) keep stable part classes.
- `card` / `sunk` → `openui-markdown-renderer--variant-*`; `variant` defaults to `clear` (emits `--variant-clear`).
- Drop the dead `.openui-code-block-syntax-highlighter:first-child { margin-top: 0 !important }`.
- Third-party output (syntax highlighter tokens) and consumer children: `:where(.goX) …` zero-weight rules only. MarkDownRenderer has no math; KaTeX stays with TextContentWrapper (not in the pilot).
- Existing `!important` declarations kept and listed (Q12).
- Check `InlineMarkdownRenderer` references; update only class references.
- Remove from allowlist.

**Done when:** selector + names tests pass; a fixture with every markdown element matches #72 under the computed-style gate; consumer `components` overrides still work; `.openui-markdown-renderer p { color }` overrides at any load position.

### T10 — Browser override and SSR suites · M · needs T2, T4, T6–T9

- `overrides.spec`: for each pilot root/part/modifier — consumer CSS before library, after library, layer mode, Tailwind 4 with and without the recipe, Tailwind 3.4, `[data-state]` overrides, `<html class>` rewrite.
- `ssr-nojs.spec`: server HTML + collected CSS, JS off, pilot components styled, later consumer `<link>` wins.
- Reuse the Tailwind 3.4/4.1 fixture CSS approach from `goober-lab/resets.mjs`; check fixtures in as static files (no Tailwind dependency in the package).
- Hydration suite from the existing harness: no new warnings.

**Done when:** all green in Chromium; failures before the fix demonstrated on #72 for at least the "consumer CSS before library" case.

### T11 — Docs · M · needs T6–T9

- README "Styling and overrides" section replacing current lines ~92–288 (§8): grammar, states, guarantee, load order, Tailwind notes + recipe, `cssLayer`, known conflicts (Tailwind ≤3.3), `!important` exceptions, allowlisted components ("old names, always unlayered").
- `scripts/` generator → `docs/reference/selectors.md` from all `names` exports; documented at the top of the script and in `test/README.md`; `names.test.ts` doc check switched on.
- "Server-rendered styles": render, then collect, `#_goober` first; streaming FOUC caveat.
- Migration table rows for pilot renames.

**Done when:** names test passes the doc check; README renders cleanly; every code sample in it is exercised by a test or the harness.

### T12 — Acceptance and draft PR · S · needs T10, T11

- Run the full CI chain (`pnpm install --frozen-lockfile`, `pnpm -r build`, `pnpm -r run ci`) and package tests.
- Tick spec §9 checklist in the PR description, with intentional visual changes listed.
- Rebuild chat kit (#54) against the branch and report any references to renamed classes (no edits to #54).
- Confirm #42, #67–#72, #73 heads unchanged.
- Push and open the **draft** PR only after approval.

**Done when:** draft PR open against `codex/react-components-chart-selectors`, CI green.

---

## Follow-up PRs (not in the pilot)

### F1 — Streaming SSR · M · after pilot (Q32b)

Per-request incremental flush function over the cumulative sheet, Next App Router `useServerInsertedHTML` recipe, real Next app test, documented default-mode ordering catch with layer mode as the fix.

### F2 — Component migration batches · L each · after F1 (Q25)

Hardest first, by the selector scan: (1) TextBlock, TextContentWrapper; (2) ListItem, ContextCardBlock, EntityList; (3) Accordion, SliderBlock; (4) Select/DatePicker/Modal/Tooltip portals; (5) charts; (6) the rest. Each batch: convert, update references, shrink the allowlist, extend `overrides.spec`, regenerate `docs/reference/selectors.md`, add migration-table rows.

### F3 — Release gate · S · after F2

Allowlist empty, `:where(&:root)` guard and `classList.add` gone from all component modules, full override suite green → unblock npm release.

### F4 — Docs site page · S · after F3 (Q26)

### Deferred decision — `/layered` entry or other layer mechanisms

Revisit only if `cssLayer` (provider) proves insufficient (Q22, Q27).
