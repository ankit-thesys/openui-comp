# Parity run 2026-11-03

The library's built package (`@openuidev/intelligent-ui-library`, from `dist` through its root
exports) against the open-intelligent-ui source app, on #160's 45 gallery programs. Part of
ankit-thesys/openui-comp#204 under #199. Every difference here is a **judgement call** for the review
pile, not an automatic failure.

- Library: `f5fb4923 refactor(intelligent-ui-library): make ThemeProvider work like the dashboard library's`
- Source app: thesysdev/open-intelligent-ui at `16ef2647`, compared through the pinned
  `fixtures/source-baseline.json`; captured again for screenshots
- Screens: `light-1280`, `dark-1280`, `light-390`, `plain-1280`, plus every control once and 3 flows
- Time: library capture 8m 5s, source capture 8m 59s, compare 0m 13s, total 17m 17s

## Counts

- Raw differences: 2782. Of these, 1477 are follow-on
  (a box or position moved by something else) and 252 are a map's camera. They're
  kept in `differences.json` but not in the pile.
- **To judge: 1053 differences in 126 review items** (one item per program and screen).
  671 match a rule #160 marked `needsFix`,
  381 match one it `accepted`, and **1 are new**.
- #160 rules that no longer match anything (probably fixed): none.
- Render errors on the library side: none.
- Components, functions and actions only in the source: components none; functions none; actions none.
  Only in the library: components none; functions none; actions none.
- Spec differences from the source's that #160 didn't expect (`spec-differences.json`): 58.
- The source app today against its pinned baseline: 110 differences that aren't follow-on (`source-drift.json`); its screenshots are today's install.

## By program

Judged differences per gallery program (its controls and flows included). A components-section
program shows the component it's named after; `review-pile.json` lists every component each item uses.

| Program | Section | To judge | New (no #160 rule) | Review items |
|---|---|---|---|---|
| `web-analytics` | composition | 57 | 0 | 4 |
| `compare-phones` | composition | 39 | 0 | 5 |
| `primitives` | composition | 22 | 0 | 5 |
| `recipe` | tools | 8 | 0 | 4 |
| `bill` | tools | 18 | 0 | 4 |
| `monty` | tools | 3 | 0 | 1 |
| `savings` | tools | 18 | 0 | 4 |
| `gdp-explained` | tools | 8 | 0 | 4 |
| `clt` | tools | 6 | 0 | 4 |
| `bicycle` | tools | 35 | 0 | 4 |
| `bike-repair` | tools | 28 | 0 | 4 |
| `route` | tools | 90 | 0 | 5 |
| `roadtrip` | tools | 65 | 0 | 5 |
| `room` | tools | 11 | 0 | 4 |
| `origami` | tools | 4 | 0 | 4 |
| `garden` | tools | 64 | 0 | 4 |
| `wardrobe` | tools | 9 | 0 | 4 |
| `drones` | tools | 71 | 0 | 4 |
| `dash-sales` | tools | 69 | 0 | 4 |
| `dash-support` | tools | 75 | 0 | 4 |
| `text` | components | 27 | 0 | 4 |
| `buttons` | components | 12 | 0 | 4 |
| `gdp` | components | 4 | 0 | 1 |
| `checklist` | components | 56 | 0 | 4 |
| `inputs` | components | 41 | 0 | 5 |
| `svg` | components | 1 | 0 | 1 |
| `chart` | components | 20 | 0 | 4 |
| `table` | components | 97 | 0 | 4 |
| `map` | components | 41 | 0 | 5 |
| `icons` | components | 1 | 1 | 1 |
| `example-list` | examples | 8 | 0 | 4 |
| `example-trip` | examples | 4 | 0 | 4 |
| `example-dashboard` | examples | 41 | 0 | 4 |

Programs with nothing to judge: `flashcards`, `game`, `answer`, `lists`, `layout`, `segmented`, `pressable`, `images`, `html`, `timer`, `heatmap`, `example-steps`.

## By kind

| Kind | Count | New |
|---|---|---|
| text-color | 230 | 0 |
| text-size | 144 | 0 |
| text-weight | 144 | 0 |
| control-fill | 85 | 0 |
| text-missing | 80 | 0 |
| chart-height | 76 | 0 |
| text-extra | 64 | 0 |
| control-extra | 52 | 0 |
| page-height | 37 | 1 |
| chart-no-currency | 32 | 0 |
| control-text-color | 27 | 0 |
| control-border | 24 | 0 |
| control-radius | 24 | 0 |
| chart-scrolls | 8 | 0 |
| control-missing | 8 | 0 |
| control-size | 8 | 0 |
| use-extra | 4 | 0 |
| use-missing | 2 | 0 |
| use-state | 2 | 0 |
| use-result | 2 | 0 |

## By #160 rule

| Rule | Status | Count |
|---|---|---|
| table-header | needsFix | 395 |
| map-vector-tiles | accepted | 172 |
| status-palette | accepted | 111 |
| chart-size | needsFix | 109 |
| native-checkbox | accepted | 56 |
| input-fill | needsFix | 52 |
| icon-button-fill | needsFix | 32 |
| chart-currency | needsFix | 32 |
| bare-host | needsFix | 31 |
| label-size | needsFix | 20 |
| date-picker | accepted | 17 |
| card-radios | accepted | 15 |
| popover-name | accepted | 10 |

## Files

- `review-pile.json`: the pile. Each item has its program, screen, components, both screenshots, the
  share of pixels that differ, and its differences with the #160 rule that already described each one.
  `verdict` and `note` are empty for the sorting session to fill.
- `differences.json`: every raw difference, classified.
- `shots/source/` and `shots/library/`: full-page screenshots, `<program>--<screen>.jpg`. The
  source has no `plain-1280`; that screen is compared with its `light-1280`.
- `library-capture.json`, `source-capture.json`: the raw captures, for comparing the next run with this one.

## Notes on this run

Written by hand after the run.

- The run completed: 45 programs on both sides, 4 screens, 307 control uses on the library side and 3 flows, in 17m 17s.
  No render errors on the library side, and the library has the same 55 components, 59 functions and
  one action as the source.
- **The one difference no #160 rule explains:** `icons` at 390px is 40px taller. The program asks for
  `Icon("no-such-icon", "lg")`; the library draws a fallback dot for the unknown name, so the row wraps
  to a second line, where the source draws nothing. Compare `shots/source/icons--light-390.jpg` with
  `shots/library/icons--light-390.jpg`. It looks deliberate, so it's a judgement call, not a bug.
- #160's rules match by value and kind, not by program, so a difference that happens to share one
  (for example a 13px to 14px text size, which `table-header` claims everywhere) is labelled with that
  rule. The sorting session should read the pile's items, not just the rule labels.
- Every one of #160's 13 rules still matches something, including the 7 it marked `needsFix`
  (`table-header`, `chart-size`, `input-fill`, `icon-button-fill`, `chart-currency`, `bare-host`,
  `label-size`). `chart-currency` is expected now: the Chart signature has no `currency` argument.
- The 58 spec differences are descriptions the library rewrote and Chart's and Histogram's
  signatures (no `currency`, and a changed argument list); none is a missing name.
- The source screenshots are today's install of the app at the pinned commit (`npm install`, since its
  lockfile is out of step with its package.json). It differs from the pinned baseline in 110 places
  that aren't follow-on, mostly radio corner radius and map clicks (`source-drift.json`), so a source
  screenshot can differ slightly from the numbers, which come from the baseline.
