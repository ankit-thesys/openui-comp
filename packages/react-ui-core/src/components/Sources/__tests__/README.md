# Slice #12 source/citation foundation

Source-only handoff from `21819f19d`. Shared metadata and root exports belong to Worker 1;
these tests will fail until the exports below are integrated. No browser window was used.

## Integration

Export `Sources`, `Citation`, and `SourceFaviconImage` family barrels, plus
`IconWrapper` and `IconWrapperProps` from `_shared/icons`, at the package root.
Keep all exported source contexts, helpers, schemas and types, citation parts and props.
Add the legacy-compatible Zod range `^3.25.0 || ^4.0.0` (source uses `zod/v4`).
Existing lucide-react and Radix Tooltip dependencies are reused. No headless/chat import.

The icon implementation, import normalization, fallback map and module-local cache are
copied unchanged from legacy; these are not newly invented patches. `safeUrl` is imported
through its leaf module to avoid the legacy utility barrel's chat dependency. Citation
scrollbar and slide styles are ordinary stock Goober CSS/keyframes; z-popover remains 1000.
Only CSS used by these rendered source parts is carried over; obsolete legacy
`openui-listed-sources-item` selectors have no matching elements in these implementations.

## Scope and evidence

Pre-agreed seam: consumers render/import the public built package root. Each family has
its missing-export red run, then minimal copied behavior and styles. The local scratch
producer `/private/tmp/openui-text12-producer` adds only the proposed root exports and Zod
metadata, leaving shared repository files untouched. Dependencies are symlinked to existing
stock installations for this source checkpoint; this is not normal installed-package proof.
`CORE_TEST_TOOLS` points to the integration checkout's JSDOM installation. `window.open` is
stubbed at the external navigation boundary, not at an internal collaborator.

Seven focused tests and all 60 component consumer tests pass. Build/declaration generation,
configured strict source typecheck, formatting and semantic lint pass. Raw red/green logs
are in `results/`. The separate diagnostic `skipLibCheck:false` producer run hits stock
Goober's existing TS1203 export-assignment declaration error; no dependency fix is applied.
Final normal installed ESM/CJS consumer declaration checks remain with integration.

Pending browser checks: actual dynamic icon load/fallback/racing, image natural-size
fallback and retry, nonempty source Carousel overflow/keyboard, citation pin/hover/outside
and Escape behavior, portals/nested themes, exact styles and explicit overrides across
plain CSS/Tailwind 3/4 in both host orders, unused code/styles, and remount cleanup. These
source checks do not certify those behaviors or SSR, hydration, performance or memory.

Inherited behavior: Citation's trigger does not call its public `onClick` prop. The existing
pinnable tooltip coordinates globally by default. No redesign or old-source fix is included.
