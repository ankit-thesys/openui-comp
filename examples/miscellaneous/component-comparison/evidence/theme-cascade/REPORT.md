# Production theme and cascade verification

The removal-only experiments support removing **six `!important` literals in two files**. Retain the other ten declarations. This is bounded cleanup eligibility against the frozen baseline, **not all-component parity acceptance**. Production and legacy source were not edited.

The final compatibility guard status is recorded below. Separate Input/Label consumer-class regressions and explicit coverage gaps remain visible; they must not be relabeled as passes because the cleanup candidate matches its baseline.

## Frozen source and artifacts

- Production PR42 branch `codex/production-core-kits`, HEAD `57ea72e2892df7fdd551c668d4480a0267f90a09`. Clean at start and final verification (`final-production-state.json`).
- All **621 implementation files** were independently hashed; source aggregate `4fa90d60e1f3206daf0cab0310eacb3781ba9a950eb40fa6ed10b5f8a7690243`. See `full-source-provenance.json` for exact files and the `localeCompare` sorting contract. The original AST inventory covers 619 TS/TSX files; two lucide dynamic-import implementation/declaration files are separately accounted for.
- Frozen normal package archives: core `a5d002d20a6fbed1cdb61cddc255f1619dc945d08cf9406eb3ce94e135988fe2`; kits `9fc227a88cbf6d949247aee90e729efa58d669ba738674880396903db98785bb`; legacy 0.18.1 `f38b45035706e9151a57d3328d2c23ec448483b73c5f0d5c64ba7420652b6fd9`. Exact paths and all seven baseline archive checks are in `confirmed-worker-handoff.json`.
- Experimental combined archive SHA-256: `eaea671c9760abf7e756f247d2f06e43e4284bb28b06f61a6636999053ce2f12`. Browser entry SHA-256: `6785d33f3c439db52ad9022c4d3fcc4c3ade7c8029db6342717f7ef159b0b7bd`. `combined-artifact.json`, `candidate-artifacts.json`, `browser-v2-artifacts.json` retain exact artifact/source correspondence.
- Fresh source candidates use unchanged stock tsdown and normal npm pack/install/Vite consumption. Read-only dependency links cause stock tsdown to relocate four bundled highlighter theme modules in these isolated builds. Of 748 runtime files, 740 common files are byte-identical; four common consumer modules differ in relative theme import paths, and four vendor modules relocate. AST-extracted complete theme objects are byte-identical. No runtime output was rewritten. See `fresh-baseline-runtime-correspondence.json`. These experimental archives are evidence, not publication candidates; apply the minimal patch and build in the normal production checkout.
- Every individual candidate and the combined candidate preserve all **440 public declaration files byte-for-byte** (`candidate-type-invariants.json`, `combined-type-invariants.json`).
- Shared theme fixture is lab commit `5190f9a52dd361ad160f5b1bccc892ea51d23f1d`, version `lab-theme-presets-v2`, SHA-256 `dc666c5cc05e55565592c466c6f4595f580304f343f15bba7d808cd2743be89f`. Existing 44 overrides per custom theme/mode are preserved. Test-only complete fixtures supplement 215 supported strings and eight palette arrays without adding a public API. Historical unsupported-field presets remain under `historical-presets/`.

## Runtime results and limits

| Check | Result | Evidence |
| --- | --- | --- |
| Provider behavior, old/new arms, six host/order combinations, ten theme/mode schemes | **120 cells, 2,160 assertions, zero failures** | `provider-browser-results.json` |
| Actual-consumer scalar wiring with remove-one-mapping negative controls and restoration | **122/124 statically CSS-referenced string tokens in each of four full fixtures** | `token-wiring-final.json`, `token-ledger.json` |
| Remaining two scalar references | **Not covered: inherited inactive tooltip selector** | `inherited-unreachable-token-gap.json` |
| Supported string variable emission | **215/215 in all four full fixtures** | `theme-extra-results.json` |
| Extra nested-default and sibling-portal checks | Four full fixtures passed | `theme-extra-results.json` |
| Palette paint/context negative controls | 20/32 checks proved actual mark paint dependence; 12 remain incomplete | `theme-extra-results.json` |
| No-provider standalone checks | Six host/order combinations passed their recorded light-context/absent-variable/radius assertions; other observed fields are not additional assertions | `theme-extra-results.json` |
| Actual platform font and print palette observations | Actual platform fonts recorded in four fixtures; four Bar print-theme checks passed. No blanket Inter-availability or print/export acceptance | `theme-extra-results.json` |
| Ordinary inline Input/Button overrides | Passed in all 120 old/new comparison cells | `cascade-browser-results.json` |
| Ordinary className Input/disabled Label overrides | **Failed strict old/new equivalence in all 120 cells**; source-specificity regression, reported separately | `cascade-browser-results.json` |
| Six individual removal survivors | **240/240 cells each, zero differences** | corrected discovery + extension files |
| All six removals together | **240/240 cells, zero differences** | `important-v3-combined-results.json` |
| Named imports, no-provider and legacy-styles coexistence guards | **68/68 recorded cells** (final 68-cell run complete) | `named-guards-results.json` |

The two scalar gaps are `textLabelXsHeavy` and `textLabelXsHeavyLetterSpacing`. Migrated `portalTooltip.styles.ts:38–40` and legacy `portalTooltip.scss:31` define the heavy selector. Actual migrated `ChartTooltip.tsx:114` and legacy `ChartTooltip.tsx:113` emit the ordinary tooltip-label class, not the heavy class. No synthetic markup was added. This inherited unreachable behavior is an explicit coverage gap, not a requirement for fake green tests.

The 12 incomplete palette checks are Pie, Radial and HorizontalBar across four fixtures. Context and some legend observations exist, but the mark-paint probe did not establish the required paint evidence. They are **Not covered completely**, not demonstrated production defects and not passed. Five other palette families have actual paint/context negative-control proof. The stable HorizontalBar fixture uses numeric height and disables legend-fit; this does not fix or certify the inherited default string-height/legend-fit feedback loop.

## Separate actionable findings

**[P2] Input size selectors prevent previously working consumer-class overrides.** Legacy `Input.scss:22–24` expands the medium modifier as `.openui-input-medium` (0,1,0). Migrated `input.styles.ts:20–22` registers `.generated.openui-input-medium` (0,2,0). A normal consumer class loaded after the package, `.verifier-public-override { padding:17px; border-radius:23px; color:rgb(42,63,84) }`, wins in legacy but loses padding/radius in migrated Input. Default light gives migrated `5px 11px` and `8px`, against legacy `17px` and `23px`. All 120 cells reproduce it. Conventional recommendation: restore the legacy selector weight, then rerun affected override/state tests. No verifier production fix was applied.

**[P2] Disabled Label has the same consumer-class override regression.** Legacy `Label.scss:8–9` expands a single disabled class; migrated `label.styles.ts:8–9` compounds the generated class with the disabled class. A later ordinary consumer class sets the expected RGB color in legacy but loses to themed tertiary color in migrated. All 120 cells reproduce it. Inline overrides continue to pass. Conventional recommendation: restore the old modifier specificity and verify it separately; no specificity escalation or custom runtime patch.

The Select shadow discrepancy remains separate: legacy compiled CSS quantizes .05/.08 alpha to eight-digit hex while runtime Goober retains authored OKLCH alpha. Source correspondence supports a build-output explanation, not a demonstrated transcription defect or a passed strict comparison. The inherited HorizontalBar feedback issue also remains disclosed. No legacy behavior fix was attempted.

## Per-declaration decisions

The allowlist is `safe-removal-allowlist.json`; the proposed minimal production diff is `safe-important-removals.patch`. Only the six listed literals are eligible. There are no replacement rules or APIs. All rejected removals have raw first-failure witnesses in `important-decisions.json`.

| ID | File/line | Property | Decision | Individual cells / differences |
| --- | --- | --- | --- | --- |
| 01 | `codeBlock.styles.ts:16` | `margin` | Retain | 72 / 72 |
| 02 | `markdown.styles.ts:82` | `padding` | Retain | 72 / 72 |
| 03 | `markdown.styles.ts:83` | `marginTop` | Retain | 72 / 72 |
| 04 | `markdown.styles.ts:84` | `marginBottom` | Retain | 240 / 96 |
| 05 | `markdown.styles.ts:85` | `marginTop` | Retain | 72 / 72 |
| 06 | `markdown.styles.ts:86` | `marginBottom` | Retain | 72 / 72 |
| 07 | `sliderBlock.styles.ts:43` | `borderColor` | Retain | 72 / 72 |
| 08 | `sliderBlock.styles.ts:47` | `text-align` | Eligible for removal within recorded coverage | 240 / 0 |
| 09 | `sliderBlock.styles.ts:48` | `paddingLeft` | Eligible for removal within recorded coverage | 240 / 0 |
| 10 | `sliderBlock.styles.ts:49` | `paddingRight` | Eligible for removal within recorded coverage | 240 / 0 |
| 11 | `listedSources.styles.ts:26` | `width` | Retain | 72 / 36 |
| 12 | `listedSources.styles.ts:27` | `padding` | Eligible for removal within recorded coverage | 240 / 0 |
| 13 | `listedSources.styles.ts:28` | `borderRadius` | Eligible for removal within recorded coverage | 240 / 0 |
| 14 | `listedSources.styles.ts:30` | `backgroundColor` | Retain | 72 / 72 |
| 15 | `listedSources.styles.ts:32` | `backgroundColor` | Retain | 72 / 72 |
| 16 | `listedSources.styles.ts:33` | `borderColor` | Eligible for removal within recorded coverage | 240 / 0 |

The six removals are Slider text alignment and left/right padding, Sources padding/radius, and Sources hovered border color. Retain Sources fixed width/base background/hover background, Slider error border, CodeBlock margin, and all five Markdown declarations. Full custom typography exposed the Markdown bottom-margin failure that partial-theme discovery did not catch; the public custom-code-renderer option was exercised without changing production markup. Retention is the smallest verified choice where vendor inline styles or existing important declarations win otherwise. No elaborate replacement was invented.

## Coverage and harness provenance

Chrome for Testing **156.0.8078.47** on macOS; plain CSS, Tailwind **3.4.17**, Tailwind **4.1.18**, each loaded before and after package styling; widths 390 and 1280. The 240-cell removal matrix covers ten default/partial/full theme-mode schemes and both component mount orders. Relevant Slider normal/error/disabled/disabled-error/range, focus/hover states; Sources URL/no-URL hover; CodeBlock copy hover; Markdown first/middle/last custom-code positions are preserved in raw snapshots. No computed border/color/font/geometry values were normalized. Expected palette literals alone were resolved through the native browser for comparison. Generated class strings are retained as evidence but are not asserted equal across builds.

Important harness corrections are retained, never silently relabeled as product behavior:

1. The initial legacy smoke omitted the required public legacy stylesheet import; corrected before accepting legacy comparisons (`smoke-preflight-correction.json`). New packages have no manual CSS import.
2. Initial direct Slider fixtures omitted required `variant`. Explicit continuous/range/disabled/error fixtures and strict authoring checks replaced them. Only 76 valid non-Slider token proofs were carried forward; five Slider proofs were reverified (`fixture-v2-correction.json`, `fixture-contracts.log`).
3. Initial Slider blur-transition sampling yielded intermediate shadows. Corrected V3 uses native animation completion and real computed values, without disabling animations. Only affected Slider evidence was rerun. Original V2 observations remain in raw files.
4. CSSOM shorthand getters hide some authored font shorthand after reset-only fields. Standard PostCSS reads the actual generated stylesheet; real computed font longhands and remove-mapping negative controls establish wiring. It is verification tooling, not a custom production CSS engine (`font-shorthand-diagnostic.json`).
5. The named-import guard initially expected two text inputs although the second discrete Slider correctly exposes a slider rather than a text input. Readiness now checks the actual one-input/two-source contract; the failed assertion is retained in `named-guards-v1-readiness-correction.json`. No production change was made.

The full static inventory includes 137 Goober-related modules: 104 definition/shared-declaration modules and 33 registration/component modules. Standard Sass expanded 104 legacy inputs; these are a different population. There are 1,050 relative selector entries (496 include `:where`), 2,608 object expression candidates, 1,541 template declarations, and 156 spread dependencies. Enumeration is **not** a declaration-by-declaration parity certification. Fourteen source selector comparisons and recorded runtime cases do not certify every generated selector or every consumer. `style-module-classification.json` is the final module classification; `style-source-inventory.json` is an earlier mixed first-pass inventory.

All 224 public fields remain in the ledger: 216 strings (including inherited unsupported/unconsumed `borderAccentSelected`) and eight palettes. Fields with no scoped CSS consumer are marked not applicable to CSS wiring; provider emission is reported separately. A representative consumer pass does not certify all consumers. Legacy `fontBody`/`fontLabel` changes do not reconstruct preexisting typography shorthand tokens; actual platform-font observations preserve that distinction.

SSR/hydration/full-shell acceptance, performance/memory reruns and general print/export acceptance are outside this run. Existing performance/bench results were not rerun or imported as new passes. No live AI/API requests, production patches, custom Goober hooks/resolvers/injectors or legacy edits were used. KaTeX vendor styles remain a vendor dependency.

This evidence is tied to the frozen artifacts and source hashes above. It must not be automatically transferred to the later folder/npm rename, template-string conversion or export cleanup. Revalidate affected behavior on each new artifact.

## Evidence handoff

Executable scripts, fixtures, structured results, raw compressed observations, inventories, source/markup witnesses and per-artifact hashes remain under this directory. `consumer-dependency-graph.json` records normal installed dependencies. `SHA256SUMS.json` hashes the handoff evidence; `handoff-manifest.json` identifies copyable files and large excluded build/source trees. Private experimental archive paths and hashes remain exact even when archives are not copied into a documentation PR. `browser-release.json` records explicit browser release after the final guard process ends. The lab server on port 4188 was left untouched.
