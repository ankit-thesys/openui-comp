# Parity run (fork only)

Is the library the same as the real [open-intelligent-ui](https://github.com/thesysdev/open-intelligent-ui)
app? This is #160's parity suite, ported for ankit-thesys/openui-comp#204 under #199. It renders the
app's 45 gallery programs, which between them use all 55 components, on both sides in a real browser.

The library side is the built package from `dist`, imported through its root exports only, with the
test package host's mock Query tools (`../host/mock-tools.ts`) and network isolation
(`../harness/network.ts`). It renders `../fixtures/gallery.json`, the gallery migrated to the current
Chart signature. The source side renders `fixtures/programs.json`, which keeps PR 70's signature with
its `currency` argument, because that is what the source app takes.

## Run

From the repository root, with the library built (`pnpm --filter @openuidev/intelligent-ui-tests build:library`)
and Chromium installed (`pnpm --filter @openuidev/intelligent-ui-tests exec playwright install chromium`):

```sh
PARITY_SOURCE=/path/to/open-intelligent-ui node tests/intelligent-ui/parity/run.ts
```

`PARITY_SOURCE` is a checkout of the app at the commit in `fixtures/SOURCE.json`, with its
dependencies installed:

```sh
git init open-intelligent-ui && cd open-intelligent-ui
git remote add origin https://github.com/thesysdev/open-intelligent-ui.git
git fetch --depth 1 origin <commit from fixtures/SOURCE.json> && git checkout FETCH_HEAD
npm install --ignore-scripts
```

Without `PARITY_SOURCE` the run still compares, but the review pile has no source screenshots.
`PARITY_RUN=<name>` names the results folder (today's date by default), and `PARITY_PROGRAMS=a,b`
runs only those programs, for a quick look. It needs Node 22.18 or later, which runs the TypeScript
directly. Nothing reaches the network.

## What it compares

- **Library:** the same components, functions and actions as the app's spec.
- **Looks:** each program at 1280px light, 1280px dark and 390px, plus a bare page with no CSS reset
  and no ThemeProvider. It compares what a person sees, not the DOM: text, controls, media, surfaces
  and charts, with their sizes and colours.
- **Behaviour:** every control of every program once, and three flows: submitting a form, ticking a
  checklist, and running a timer.

The library is compared with the pinned `fixtures/source-baseline.json`, so the numbers don't move
with the app's install. The fresh source capture gives the screenshots and says how far today's
install has drifted from the baseline (`source-drift.json`).

## Results: the review pile

Every difference is a **judgement call**, never a failure: the run exits 0 whatever it finds. Each
run writes `results/<run>/`:

- `summary.md`: counts by program, kind and #160 rule, and the run's timings.
- `review-pile.json`: one item per program and screen that differs, with both screenshots, the share
  of pixels that differ, and its differences. `verdict` (`"probably fine"` or `"worth a look"`) and
  `note` (one sentence) are left empty for the sorting session.
- `differences.json`: every raw difference. Boxes and positions that follow from another change
  (`follow-on`) and a map's camera (`map-motion`) are kept here but left out of the pile.
- `shots/`: full-page screenshots of both sides, `<program>--<screen>.jpg`.
- `library-capture.json`, `source-capture.json`: the raw captures, to compare the next run with.

[known-differences.ts](./known-differences.ts) is #160's list of known differences. Here it only
labels: each difference in the pile names the rule that already described it, and whether #160 marked
it `needsFix` or `accepted`, so the sorting session can see what's new.

## Recording the baseline again

```sh
PARITY_SOURCE=/path/to/open-intelligent-ui node tests/intelligent-ui/parity/capture-source.ts
```

writes `fixtures/source-baseline.json`. `PARITY_OUT` writes somewhere else, and `PARITY_SHOTS` saves
screenshots.
