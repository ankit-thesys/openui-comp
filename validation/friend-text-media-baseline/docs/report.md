# Delivery report — text / media / Table baseline (#31)

## Provenance

| | |
|---|---|
| Issue | ankit-thesys/openui-comp#31 (evidence for migration #12, parent #7) |
| Base branch | `codex/integrated-baseline-corrections` (PR #30) |
| Baseline revision | `433a0e31d7c54d1181a5bbf899faaa5be883077b` |
| Owned directory | `validation/friend-text-media-baseline/` — the diff touches nothing else |
| Package observed | `packages/react-ui` — **read-only, unmodified** |
| `packages/react-ui-core` | **read-only, unmodified** |

## Environment

| | |
|---|---|
| Node | v24.17.0 |
| pnpm install | `--frozen-lockfile`; lockfile unchanged |
| vitest | 4.1.10 (jsdom environment) |
| TypeScript | 5.9.3 |
| Chrome | `Chrome/156.0.8078.47`, headless, viewport 1280×900 |
| react / react-dom | 19.2.4 |
| react-markdown | 10.1.0 |
| remark-gfm / remark-breaks | 4.0.1 / 4.0.0 |
| react-syntax-highlighter | 16.1.1 |
| zod | 4.4.3 |

The react-markdown version is load-bearing: MD-4 exists **because** 10.x emits
table alignment as an inline style rather than the `align` prop its adapter
expects.

## Commands

All four run from the repository root on a fresh checkout after
`pnpm install --frozen-lockfile`.

```bash
# 1. Source-linked inventory (regenerates docs/inventory.json and docs/inventory.md)
node validation/friend-text-media-baseline/tools/inventory.mjs

# 2. Local image assets for the browser fixture (deterministic, generated not committed-opaque)
node validation/friend-text-media-baseline/tools/make-assets.mjs

# 3. jsdom suite
pnpm --dir packages/react-ui exec vitest run \
  --config ../../validation/friend-text-media-baseline/vitest.config.ts

# 4. Real-Chrome suite (builds its own fixture, captures reference images)
node validation/friend-text-media-baseline/browser/run.mjs

# Typecheck
pnpm --dir packages/react-ui exec tsc --noEmit \
  -p ../../validation/friend-text-media-baseline/tsconfig.json
```

No dependency, lockfile, `pnpm-workspace.yaml` or other shared-config change was
needed, so nothing had to be proposed on the issue.

## Results

| | |
|---|---|
| jsdom tests | **166 passed**, 0 failed, 8 files |
| Chrome checks | **45 passed**, 0 failed, 16/16 scenarios |
| Typecheck | **0 errors** |
| Reference images | 12 (6 scenarios × light/dark), byte-identical across consecutive runs |
| External requests that escaped | **0** (2 attempted and blocked — SRC-1 evidence) |
| In-scope families inventoried | 20 (80 exports: 39 values, 41 types) of 560 package-root exports |
| Inventory discrepancies | 0 |

Raw machine-readable results: [`../evidence/browser-run.json`](../evidence/browser-run.json).

## What was found

10 findings and 5 non-defect observations. Full detail in
[`defects.md`](./defects.md) and [`observed-baseline.md`](./observed-baseline.md).

**The one that matters most for #12** is **MD-2**: `InlineMarkdownRenderer`
documents that it flattens block elements "so the output stays inline", but it
does not flatten tables and it *does* enable `remarkGfm` — producing
`<span><div><table>`, which violates the HTML content model. It is rated high
rather than medium because the dependency map showed, and tests then confirmed,
that `TextBlock`, `InlineHeader`, `IconText`, `ImageText` and `ImageTextLarge`
all render through that path. Table-shaped text in an ordinary `title` prop is
enough to trigger it, and that text is typically LLM-authored.

The other markdown × Table findings (**MD-1**, **MD-3**, **MD-4**) together mean
the Table-in-markdown integration is not in the state its code suggests: the
mapping is unreachable by default, everything crossing it carries a stray `node`
attribute, and its alignment adapter never fires.

**SRC-1** is a decision rather than a bug: rendering sources discloses every
source hostname to a Google endpoint. It is listed so #12 adopts that knowingly.
**SRC-2** shows that hostname is interpolated unencoded, permitting query
parameter injection into the request — bounded, with the bound verified.

## Two corrections made to this work in progress

Recorded because both would otherwise have shipped as misleading evidence:

1. **A false pass.** The first favicon run reported the 16×16 globe fallback
   working. It was not: Vite only copies `public/`, so *both* local assets 404'd
   and both fell back. The assertion passed for entirely the wrong reason. Fixed
   by moving the assets into the Vite `publicDir`; the 64×64 case now genuinely
   decodes at 64×64.
2. **A control that proved nothing.** The SU-2 check initially used a
   React-rendered `javascript:` href as its control. React 19 refuses to render
   those — it substitutes a `throw` — so the control never executed and a
   negative result would have been meaningless. Fixed by installing both hrefs
   through the DOM; the control now demonstrably executes, which is what makes
   SU-2's negative result trustworthy.

## Scope confirmation

- Diff limited to `validation/friend-text-media-baseline/`.
- `packages/react-ui` and `packages/react-ui-core` untouched; no legacy repairs.
- No overlap with slice #11, and no `#28`/`#29` corrections reopened.
- No global installs, no publication, no merges.
- Heavy browser work is a single ~30s headless run with no timing assertions, so
  it does not contend with the workers' benchmark windows. Nothing here measures
  or claims performance.

## What this evidence does not establish

Stated so it is not over-read. Full list in
[`coverage-matrix.md`](./coverage-matrix.md#explicit-gaps):

- **No asserted visual parity.** The 12 reference images are for human
  comparison; nothing diffs them.
- **No SSR or hydration coverage** — explicitly out of #31's scope.
- **No accessibility certification.** OBS-2 records one role attribute; that is
  an observation, not an audit.
- **No performance claims.**
- `Citation`'s tooltip interaction, `ImageGallery`'s modal, and
  `ScrollableTable`'s boundary states are untested (gap-1, gap-5, gap-2).
- `EditableTable` is deliberately unclaimed and carries no evidence here, since
  #31 assigns data/card baselines elsewhere.
