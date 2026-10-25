# Text, media and Table baseline evidence (#31)

Independent, read-only behavior evidence for the legacy text / presentation,
image, citation-and-source and Table families in `packages/react-ui`, prepared
for migration [#12] under parent #7.

**This is evidence, not an implementation.** Nothing in `packages/react-ui` or
`packages/react-ui-core` was modified. Observed defects are recorded, never
repaired, and no assertion was weakened to obtain a green run.

Baseline revision `433a0e31d7c54d1181a5bbf899faaa5be883077b`
(base branch `codex/integrated-baseline-corrections`, PR #30).

## Start here

| Read | For |
|---|---|
| [`docs/report.md`](docs/report.md) | Provenance, environment, exact commands, results, scope confirmation |
| [`docs/defects.md`](docs/defects.md) | The 10 findings, each with a minimal reproduction |
| [`docs/dependency-map.md`](docs/dependency-map.md) | How Table, the markdown renderers and the rest actually couple |
| [`docs/coverage-matrix.md`](docs/coverage-matrix.md) | Per-family coverage **and the 11 explicit gaps** |
| [`docs/observed-baseline.md`](docs/observed-baseline.md) | Non-defect observations, and the harness's honest limits |
| [`docs/inventory.md`](docs/inventory.md) | Generated source-linked export inventory |

## Reproduce

From the repository root, after `pnpm install --frozen-lockfile`:

```bash
# jsdom suite — 166 tests
pnpm --dir packages/react-ui exec vitest run \
  --config ../../validation/friend-text-media-baseline/vitest.config.ts

# real Chrome — 45 checks, 16 scenarios, 12 reference images
node validation/friend-text-media-baseline/browser/run.mjs

# typecheck — 0 errors
pnpm --dir packages/react-ui exec tsc --noEmit \
  -p ../../validation/friend-text-media-baseline/tsconfig.json

# regenerate the inventory and the fixture's local image assets
node validation/friend-text-media-baseline/tools/inventory.mjs
node validation/friend-text-media-baseline/tools/make-assets.mjs
```

Both suites exit non-zero on any failure. The browser runner also fails if a
scenario is missing, if the fixture does not recognise a scenario name, or if any
request escapes to the network.

## Layout

```
tools/       inventory.mjs (TypeScript-compiler-driven), make-assets.mjs (deterministic PNGs)
tests/       8 vitest files; _harness.probe.test.tsx asserts the harness itself
setup/       vitest setup + a minimal React 19 render helper
browser/     CDP runner, fixture (built by vite), serve.mjs
evidence/    browser-run.json + 12 reference images
docs/        the six documents above
```

## Three things to know before reading the results

**The suite is green by design.** Every assertion pins the baseline *as it
actually is*, including the broken parts. MD-1 is pinned by asserting that a
markdown table renders as a paragraph; MD-4 by asserting that no openui alignment
class appears. Green means "the baseline still behaves as recorded", **not**
"everything is fine". Each defect-encoding assertion says so inline and names its
finding ID.

**Findings are attributed with control groups.** Where a finding could plausibly
belong to a library rather than to openui, the same assertion is run against a
control — a hand-composed Table for MD-3, the renderer with `remarkGfm` supplied
for MD-1, `align` passed directly for MD-4, ordinary text for MD-2's blast
radius, a real `javascript:` href for SU-2. A control that shares an omission
with the case under test proves nothing, so each one is checked to actually
discriminate.

**Nothing fetches external content.** Two in-scope behaviors would
(`getFaviconUrl`'s endpoint; markdown images). The Chrome runner blocks non-local
requests *and records every attempt*, distinguishing blocked attempts — which are
evidence, see SRC-1 — from escaped ones, which fail the run. Latest run: 2
blocked, 0 escaped.

[#12]: https://github.com/ankit-thesys/openui-comp/issues/12
