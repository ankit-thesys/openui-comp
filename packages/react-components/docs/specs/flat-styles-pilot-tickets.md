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

### T0 — Isolated checkout and two spikes · S

- Create the isolated checkout under `/private/tmp` and the branch off `5e09b37c`; confirm `pnpm install --frozen-lockfile && pnpm -r build` passes untouched.
- Spike A: add `"use client"` to one component and build; record whether tsdown `unbundle` keeps it in `dist/*.mjs` and `*.cjs`, and the documented option that keeps it if not.
- Spike B: confirm whether `@playwright/test` is reachable from `packages/react-components` without adding a dependency.

**Done when:** both answers are written in the PR description draft. If either needs a new dependency or custom script, stop and raise it (spec §6.7, §7).

### T1 — Enforcement tests with full allowlist · M · needs T0

- `test/selectors.test.mjs`: hand-written selector tokenizer for spec §5; runs every style factory (and, for not-yet-migrated modules, their registered CSS) and reports violations.
- `test/names.test.mjs`: §4.1 grammar, no duplicates, reference-doc match (doc check stubbed until T11), no public `--_` tokens.
- `test/directives.test.mjs`: `"use client"` first statement in built component modules.
- `test/flat-allowlist.json` listing **every** current style module; test fails if a listed file is compliant or an unlisted file is not.
- `test/README.md`: how to run, accepted grammar, how to update the allowlist. Comment block at the top of each test.
- `package.json` `test` script.

**Done when:** tests pass on the unchanged code with everything allowlisted, and fail on a deliberately broken fixture (show both in the PR).

### T2 — Bring in `getComponentStyles` from #73 · S · needs T0

- Copy `src/utils/componentStyles.ts`, its `src/index.ts` export and `test/componentStyles.test.mjs` from `dbc88701`. #73 untouched.
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

### T5 — `"use client"` on every component module · S · needs T0 (spike A), T1

- Add the directive to every module under `src/components/**` that exports a component.
- `directives.test.mjs` passes for all of them.

**Done when:** build + directive test green; existing SSR harness still renders (client components render on the server in non-RSC SSR).

### T6 — Button · M · needs T1, T3, T4

- `button.styles.ts` → `names` + `buttonStyles` factory (§6.1); `Button.tsx` uses `useStyles` and `names`; remove the `:where(&:root)` guard and `classList.add`.
- Variant, size, `tone` (destructive) axes; destructive sets private `--_openui-button-*` variables only (§10 risk).
- Icon slots wrapped in `openui-button-icon`.
- Hover/disabled ordering without `:not()`.
- Update internal references to old Button classes (`Buttons/*`, `CodeBlock`, `FoldableSection`, `EditableTable`, `Carousel`, `ScrollableTable`, `ListedSources`, `ImageGallery/*`, `CardHeader`, `TextContentWrapper` — only those that reference Button classes).
- Remove Button from the allowlist.

**Done when:** selector + names tests pass for Button; all 4 variants × 4 sizes × 2 tones render like #72 in light and dark (screenshot check in the existing harness); disabled hover shows disabled styles.

### T7 — IconButton · S · needs T6

- Same conversion; reuse Button's patterns, not its factory (separate block `openui-icon-button`).
- Update internal references; remove from allowlist.

**Done when:** as T6 for IconButton's variants/sizes.

### T8 — Tabs family · L · needs T1, T3, T4

- `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent` → one `tabs.styles.ts` factory with family parts (`openui-tabs-list`, `openui-tabs-trigger`, `openui-tabs-trigger-icon`, …).
- `TabsList` layouts → `openui-tabs-list--layout-*`; root/list variant → part via private variables, part modifier classes only for layout (Q7).
- Active/hover state via Radix `[data-state]` on the trigger itself (Q18).
- Scroll buttons use the converted IconButton/Button classes (coordinate with T6/T7 if they land first).
- Remove the `*-styled` and `openui-tabs-tabs` carrier classes; update internal references; remove from allowlist.

**Done when:** selector + names tests pass; every list layout and the active/inactive/hover/disabled triggers match #72; `.openui-tabs-trigger[data-state=active] { … }` override works.

### T9 — MarkDownRenderer · M · needs T1, T3, T4

- `react-markdown` `components` map gives every rendered tag a part class (`openui-markdown-renderer-paragraph`, `-heading-1` … `-6`, `-list`, `-list-item`, `-link`, `-code`, `-code-block`, `-table`, …); merge incoming `className`.
- `card` / `sunk` → `openui-markdown-renderer--variant-*`.
- Katex and anything not rendered by us: `:where(.goX) …` zero-weight rules only.
- Existing `!important` declarations kept and listed (Q12).
- Check `InlineMarkdownRenderer` references; update only class references.
- Remove from allowlist.

**Done when:** selector + names tests pass; a fixture with every markdown element plus math matches #72; consumer `components` overrides still work; `.openui-markdown-renderer-paragraph { color }` overrides.

### T10 — Browser override and SSR suites · M · needs T2, T4, T6–T9

- `overrides.spec`: for each pilot root/part/modifier — consumer CSS before library, after library, layer mode, Tailwind 4 with and without the recipe, Tailwind 3.4, `[data-state]` overrides, `<html class>` rewrite.
- `ssr-nojs.spec`: server HTML + collected CSS, JS off, pilot components styled, later consumer `<link>` wins.
- Reuse the Tailwind 3.4/4.1 fixture CSS approach from `goober-lab/resets.mjs`; check fixtures in as static files (no Tailwind dependency in the package).
- Hydration suite from the existing harness: no new warnings.

**Done when:** all green in Chromium; failures before the fix demonstrated on #72 for at least the "consumer CSS before library" case.

### T11 — Docs · M · needs T6–T9

- README "Styling and overrides" section replacing current lines ~92–288 (§8): grammar, states, guarantee, load order, Tailwind notes + recipe, `cssLayer`, known conflicts (Tailwind ≤3.3), `!important` exceptions, allowlisted components ("old names, always unlayered").
- `scripts/` generator → `docs/selectors.md` from all `names` exports; documented at the top of the script and in `test/README.md`; `names.test.mjs` doc check switched on.
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

Hardest first, by the selector scan: (1) TextBlock, TextContentWrapper; (2) ListItem, ContextCardBlock, EntityList; (3) Accordion, SliderBlock; (4) Select/DatePicker/Modal/Tooltip portals; (5) charts; (6) the rest. Each batch: convert, update references, shrink the allowlist, extend `overrides.spec`, regenerate `docs/selectors.md`, add migration-table rows.

### F3 — Release gate · S · after F2

Allowlist empty, `:where(&:root)` guard and `classList.add` gone from all component modules, full override suite green → unblock npm release.

### F4 — Docs site page · S · after F3 (Q26)

### Deferred decision — `/layered` entry or other layer mechanisms

Revisit only if `cssLayer` (provider) proves insufficient (Q22, Q27).
