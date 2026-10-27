# Stable selector61 pilot — worker PASS, independent acceptance pending

Source `1c3833a045c4c66de92b69413a3824eca1798fcd`; package tree `50aecff579bd19b75cb6102377679d308cfc0fb6`. Final native archive SHA256 `0dad61fb4c48477f0496f819bef2f131908a3789ec184cefb7fe8de94c68d6a5`. Final archive differs from tested v3 only in README; every runtime file is byte identical. All371 owned embedded sources match frozen Git. Final archive installed for optimized/lazy and additional chart interaction tests.

## Validation

888 checks pass: 480 main browser,36 actual CSSOM and both-component hover/active,180 Calendar/Select and chart dependency,70 optimized/lazy import browser,102 actual chart/stacked control interactions,20 optimized build graph assessments. Plain CSS, Tailwind3/4; framework sheets before/after; same Goober host globals both import orders and subsequent updates;111 pilot roots including all variants/sizes/shapes, refs/native callbacks/disabled/keyboard/asChild; matching later unlayered CSS overrides base/alias/variant/size/state/icon part. Shared roots retain default border-box173px and later content-box205px. Themes none/light/dark/nested match accepted60. Calendar uses its visible month Select dropdown, not a hidden navigation button.

Horizontal/vertical chart scroll controls advance their state; DefaultLegend keyboard expansion and measured control geometry, stacked show-more and constrained standalone stacked scroll behavior match baseline. No chart source changes. Build/types pass; ESM/CJS166 exports unchanged;440 declaration files byte-identical; all1444 fallback expressions unchanged across95 files.

## Mechanism and trials

Stock nested CSS places the generated html guard entirely inside :where(), with stable openui-* targets carrying owned rules. The failed flat syntax emitted an extra generated class outside :where(), so actual ordinary overrides failed. candidate-v1/v2, attempt01/02 and stale-install attempt03 remain historical failures, not accepted evidence. MECHANISM.md documents current nested form. Source-only reviews approve, conditional on independent runtime acceptance.

Initial dependency assertions wrongly expected visible Calendar next-month navigation and Inter on all controls; both failed on baseline too. Corrected tests exercise the visible month dropdown and actual owned box-sizing/geometry while retaining full computed parity. Original observations remain in dependencies-attempt01.

Strict first-lazy-import-only-one-style checks failed. Matched rerun proves baseline and candidate both register Button and IconButton styles together when the bundler shares a retained lazy chunk. Single-entry optimized Button/Icon imports prune the other component's code/styles; no eager pilot styles before lazy loading. No workaround or promise of per-component chunk isolation. small-attempt01 preserves the failed strict assertions; current raw states include both arms' actual registration predicates.

## Size and scope

Initial uncompressed static JS graph deltas are +145bytes Button, +155bytes IconButton, +300bytes pair, +149bytes shared roots,0bytes lazy shell. These are bundle measurements, not runtime-performance claims. Total emitted assets include pre-existing unreachable math chunks; no new optimization claim is made for those.

Exactly four source files changed: Button.tsx,IconButton.tsx,styles/base.ts,README.md. All style fragments remain untouched. README and conversion-ledger.json identify2 converted,3 shared-base-only and60 deferred families plus narrow exceptions. No custom injector/serializer/selector registry/Goober patch, new dependency/tooling/CI/release, legacy/kits/chart edits. SSR/performance/memory/full migration matrix remain outside61.

Protected67 `c1aaf994d5c0fbfb56b83685221eeea9b409e57c` and42 `d1292715028f816bd6a0dcf92766ec7dd15350f4` are unchanged. #62–64 remain blocked pending independent61 acceptance.
