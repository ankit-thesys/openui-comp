# Independent verification — ticket #57

Verdict: **PASS within the ticket #57 scope. Eligible to unblock #58 and #59 for their own implementation and acceptance checks.** This is not approval of fallback deletion or shared-base extraction.

## Artifact binding

- Clean source commit: `50df8768157c5e76abda45bf39098ec4b87fa702`.
- Package tree: `f06811c5e7e3324829f552a153ff36e9e7b6df5c`, identical to original candidate `f17dae57d0b1d482d6702ddd09bea94cdc6a671a`. The follow-up removes release scaffolding only.
- Final packed archive SHA-256: `a7c562a0f284d8f290f414ce4bee2fae632c601470677d71046800a021e808e4`.
- Baseline archive SHA-256: `2ae11b4e46a6846bbc7403c70fe51bb8cd40b3b90d4ae39cf4f4dfe1d12a3294`.
- Final and retained tested archive differ only in README; runtime and package metadata members match. All 370 unique embedded source-map files match candidate Git content.
- Protected PR #42 checkout remains at `d1292715028f816bd6a0dcf92766ec7dd15350f4`.

## Independent results

The initial run recorded 522 checks: 458 passed and 64 failed. All original results are preserved. Of those failures, 56 were invalid host-global test controls missing declaration semicolons in Goober input; 8 compared portal geometry before finite entrance animations finished. Correcting only these fixture controls and waiting for natural animation completion produced **170/170 passing affected checks**. This gives 628 passing assessment records, not 628 distinct components. No failed record was relabeled or discarded; no production patch or disabled animation was used.

Fourteen fresh configurations per arm cover plain CSS, Tailwind v3 and v4, host styles before/after, named-layer and unlayered root overrides, and provider-free controls. Checks include:

- All 215 canonical root token strings, layer order/CSSOM, initial import-only registration, and unchanged host sentinels.
- Same-instance stock Goober host globals before/after registration and subsequent updates, with positive controls.
- Representative controls in rest, hover, focus, disabled/error and keyboard/callback states; container overrides and explicit root themes.
- Light/dark changes, provider removal, nested/sibling themes, and Modal, Select, Tooltip and DatePicker portal scope and settled geometry.
- Optimized public Button-only, Input-only and combined imports retain automatic defaults, with stable style/prelude counts over 100 rerenders.
- Native ESM/CJS imports preserve all 166 public exports; strict public consumer typechecks pass in both arms. Existing React typings were linked at normal private `node_modules/@types` paths; no product dependency or resolver changes.

Build metadata confirms one Goober origin per build and no unrelated chart, KaTeX, syntax-highlighter or Modal JavaScript contribution in the three optimized small imports. Vendor CSS remains exactly 24,235 bytes and byte-identical between baseline and candidate; existing accepted vendor asset limits are unchanged.

## Limits and next gates

This verifies emitted defaults and representative active consumers, not every consumer of every token. #58 must validate the consumers whose fallbacks are removed, including override validity and exceptions. #59 must independently validate its three shared-class roots and supported overrides. #60 remains the combined acceptance gate.

No SSR/hydration, historical full-matrix, performance, memory or duplicate/multiple-Goober-version certification is claimed. Historical failures remain unresolved. Browser used Chrome 156.0.8078.48; older evidence used a different patch version. No production code or reserved lab files were changed by this verifier.

## Window release

Browser and private HTTP server closed at 2026-10-27T10:07:21.116Z. Exclusive browser/build window is released. Lab port 4188 was untouched.

Raw evidence: `independent-results.json`, `corrected-results.json`, their partial/progress files and logs. Artifact and build bindings: `artifact-provenance.json`, `build-provenance.json`, `build-corrected-provenance.json`. Machine-readable conclusion: `VERDICT.json`.
