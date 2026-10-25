# Chat component extraction (#16)

Authorized correction: source commit `1a41c2c33` adds the conventional model-only
border-color reset. See [CORRECTION_HANDOFF.md](./CORRECTION_HANDOFF.md).
Corrected installed-artifact and browser validation remain pending.

Latest installed-artifact validation: [BROWSER_REPORT.md](./BROWSER_REPORT.md).
All 36 cases complete behavioral checks, but strict style parity fails on the
zero-width hover border color. Browser/server are closed and released. The three
component consumer tests and public Bundler type fixture pass against frozen
product `8405f44e0`. The initial scratch evidence below remains historical.

Owned source: `components/ModelSwitcher`, `components/FollowUpBlock`, and
`components/FollowUpItem` under `packages/kits/src/react/chat`.
Worker1 owns the package configuration, public barrels and library integration.
Legacy `packages/react-ui` remains unchanged.

## Required public exports

`@openuidev/kits/react/chat` must export:

- `ModelSwitcher`, `ModelLogo`, `ModelOption`, `ModelSwitcherProps`
- `FollowUpBlock`, `FollowUpBlockProps`
- `FollowUpItem`, `FollowUpItemProps`

Keep `groupModels`, `ModelGroup` and `useHydrated` private to their module;
the legacy family barrel does not export them. Components import Select, Tag,
useTheme and ThemeMode from the public `@openuidev/react-ui-core` root.
No `react-lang` or chat-library import is needed in this component entry.

## Public consumer tests

The test seam is React consumers importing `@openuidev/kits/react/chat`.
`KIT_CONSUMER` selects a consumer directory containing that installed package.
`KIT_TEST_TOOLS` optionally selects a separate package containing JSDOM.
Without overrides, both resolve from the kits package.

```sh
KIT_CONSUMER=/absolute/consumer \
KIT_TEST_TOOLS=/absolute/test-tools \
node --test packages/kits/src/react/chat/components/*/__tests__/*.test.mjs
```

Initial TDD cycles: each component test failed because its public component was
absent, then passed after its extraction. Initial verification used an isolated
esbuild component entry exporting only these three families, externalizing React,
ReactDOM, core, clsx and stock Goober. This is preliminary source validation,
not a claim about the final packed kits artifact or package tree shaking.
The scratch consumer used the previously packed core artifact from chart
validation. The final kits artifact needs combined verification by Worker1.

Covered: native props/ref/style/class forwarding, follow-up click and disabled
behavior, container ordering and updates, controlled model values/fallback,
empty models and light/dark logos using the core ThemeProvider.
JSDOM exposes its real APIs; no fake geometry or observer implementations.

`types.fixture.tsx` covers existing public component/type imports and ref/native
props, with negative checks for a new ModelSwitcher style prop and missing item
text. The preliminary declaration consumer passes Bundler resolution; final
NodeNext import/require checks belong to the combined package. Results and
scratch artifact hashes are in `results/source-checks.json`. Source typechecking,
semantic ESLint, formatting and all three consumer tests pass. Independent Spec
and Standards reviews of component commit `41af2765d` found no actionable issues.

## Preserved behavior and limitations

- ModelSwitcher still accepts only models, value and onValueChange. No new
  className/style/ref/disabled API is introduced.
- FollowUpItem has no default `type` and retains native submit behavior.
- Its legacy icon `size: 16px` declaration is preserved, although browsers ignore
  this nonstandard property. It has no dedicated disabled CSS rule.
- Group ordering follows first-seen order, matching the implementation. The
  inherited comment claiming ungrouped models always lead is inaccurate.
- Styles use stock Goober css/keyframes and the core theme's existing variables
  and light defaults. Portal content carries its own generated classes.
- SSR styling remains deferred; the existing useHydrated skeleton is preserved.
- Chrome computed styles and actual dropdown keyboard/pointer/focus behavior
  remain pending until Worker1 releases the browser and names the final artifact.
