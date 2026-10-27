# Independent #61 corrected stable-selector pilot acceptance

**PASS within the Button/IconButton pilot scope. Root may automatically dispatch source-disjoint #62–64 with their scoped validation gates.** No new user decision is needed solely because a private generated root namespace remains. This does not certify later families, broad migration parity, release readiness, merging or publication.

## Frozen source and actual artifact

- Clean source `1c3833a045c4c66de92b69413a3824eca1798fcd`; package tree `50aecff579bd19b75cb6102377679d308cfc0fb6`.
- Final archive `/private/tmp/openui-selectors61-evidence/candidate-final/openuidev-react-components-0.0.0-beta.0.tgz`, SHA-256 **`0dad61fb4c48477f0496f819bef2f131908a3789ec184cefb7fe8de94c68d6a5`**.
- Accepted #60 baseline archive SHA-256 `1db41852f9e5aa11ccbfe5a56cdb3d00c8ad753ad5e73cb19bdf4832e7f7b957`.
- Independently hashed final, baseline and tested-v3 archives. Final versus tested-v3 differs only in README; every runtime member is byte-identical. All 371 unique owned embedded source-map files bind to frozen source. Every package file in each installed consumer matches its archive; all package inputs and outputs in 12 frozen build graphs were independently bound/hashed. Two additional verifier-owned public Modal/Button/IconButton fixtures were built using existing esbuild and separately bound to the same archives.
- Exactly four source files differ from #60: Button.tsx, IconButton.tsx, styles/base.ts and README. All 440 declaration files are byte-identical. All 95 previously independently scanned fallback-bearing files remain byte-identical, preserving all 1,444 expressions. No chart, legacy, kit, dependency, CI or release edits.
- Fresh native ESM/CJS imports from distinct baseline and candidate consumers preserve all 166 public exports and light-theme objects. Protected #67 remains `c1aaf994d5c0fbfb56b83685221eeea9b409e57c`; protected #42 remains `d1292715028f816bd6a0dcf92766ec7dd15350f4`.

## Independent runtime results

**259/259 independent checks pass** in the corrected complete run. The verifier used actual frozen public-import bundles with a separately authored server, DOM/computed-style/geometry extraction, CSSOM assertions, consumer stylesheet rules and interaction logic. Worker verdicts were not the runtime oracle. The independent real-Modal fixture uses public imports, not cloned nodes or a simulated portal.

Six fresh framework/order configurations cover actual plain CSS, Tailwind v3/v4 and before/after stylesheet placement, with same-instance host glob registration before/after library registration and subsequent updates. Each arm renders **111 pilot roots and 80 icon parts**, covering all fixture variants/sizes/shapes plus disabled instances and the asChild anchor. Default computed appearance, geometry, parts, three shared roots and host observations match #60.

### Actual emitted selector ownership and overrides

For each configuration I inspected 76 matching owned CSSOM selectors. They all begin with `:where(.go<digits>:root)` and contain no generated class outside :where. Actual pilot elements carry no generated Goober styling class. Stable canonical root/variant/state/part selectors carry the owned declarations; old aliases remain on component elements.

Actual ordinary, later, unlayered consumer rules without important successfully override:

- Canonical Button/IconButton base borders, and the preserved old aliases' base borders.
- Matching primary variant backgrounds, medium-size padding/dimensions and disabled background/cursor.
- Hover and active background on both component types.
- IconButton's intentional rooted icon-part display and gap.
- Shared root box-sizing: default 173px border-box becomes the expected 205px content-box via a later `.shared-root` rule.

Selectors in the independent override CSS do not add IDs or the private guard to force precedence. Matching variant/state/part specificity is deliberate and documented. Base rules are not claimed to override every variant/state. Button still has direct caller-provided children; no fictional text/left/right wrapper hooks are promised.

Unrelated host elements—including old-hook-only button, icon and shared-root sentinels—retain pre-mount/import styling and match the baseline after consumer override cleanup. Same-instance host glob values and later updates survive. Actual keyboard Enter callbacks, disabled native click suppression, ref target tags and IconButton's anchor asChild behavior pass. No page errors occur.

### Themes, real portals and bounded dependencies

Light/dark/nested computed pilot control/part states match the baseline. Visible Calendar month Select opens with 12 options and selecting November changes the displayed month. Bounded chart tests exercise DefaultLegend keyboard expansion plus horizontal and vertical scroll advances; control geometry/state agrees with #60. These are consumer checks with chart source unchanged, not chart migration or a rerun of known unstable configurations.

The additional independent public fixture places Button and IconButton inside a real themed Modal portal in all three host CSS environments. Both inherit the expected custom theme token, default appearance/geometry agrees with the baseline, and ordinary canonical root border overrides remain effective in the portal. This establishes actual descendant matching and theme delivery beyond a source-only claim about document scope.

## Optimized imports and lazy limitation

Static single Button/IconButton imports prune the other pilot component's contributing JavaScript and registered styles. Pair/shared entries retain their required registration. Four optimized import scenarios per arm match baseline appearance; repeated mounts do not grow style/prelude counts.

Both lazy load orders start with no eager pilot styles, render the requested component, survive subsequent host globals and match baseline registration/appearance. **The first lazy import registers both pilot styles in both arms when esbuild retains them in a shared lazy chunk.** There is no guarantee of one-style-per-first-lazy-import and no workaround was introduced. This limitation is explicitly preserved; the worker's failed strict one-style assertions remain historical evidence.

Build provenance distinguishes entry-reachable JavaScript from every emitted file. Initial provenance logic incorrectly treated unreachable emitted vendor chunks as loaded/contributing; the preserved first script is not the accepted graph assessment. The corrected traversal follows actual emitted import edges from stdin.js, including dynamic edges, and hashes all outputs separately. Unreachable pre-existing math/vendor chunks and assets remain emitted. No claim that all unused emitted assets vanish is made. These are graph/registration observations, not runtime performance results.

## Failed attempts and fixture corrections remain visible

Worker flat-syntax attempts emitted extra generated specificity and failed ordinary overrides. They are rejected and remain under worker attempt01/02/candidate-v1/v2; the corrected nested source and final archive are the only accepted implementation. The earlier source review's intended-shape expectation is not runtime proof for those failed forms. Worker stale-install, dependency-control and strict lazy-isolation failures remain separately classified; no previous failure is relabeled as passing here.

The verifier's first bounded runner stopped at an intentionally empty lazy shell because its readiness check wrongly required a rendered child. Its script, log, progress and release are preserved in `attempt01-lazy-readiness`; it produced no complete raw acceptance and is not counted. The corrected complete run allows ready-only at that empty shell and records raw checkpoints. Production/bundles were unchanged. A copied initial native-comparison script accidentally selected the candidate for both arms; those script/results are preserved as `native-same-arm-v1.*` and excluded. The final native run records distinct consumer directories and verifies both actual archives. No product patch, relaxed visual tolerance, disabled animation or synthetic pass was used.

## Scope and handoff

This is stable public targeting with a private zero-specificity document namespace; it is not generation-free CSS or unconditional styling independent of automatic registration. Stock Goober is unchanged; no custom injector, parser, serializer, selector registry, new dependency/tooling or runtime patch was added.

The ledger must continue to call only Button and IconButton fully converted. Buttons/FormControl/TagBlock have shared-base-only conversion; remaining owned generated rules are not silently certified. Later #62–64 must preserve the accepted token/fallback behavior, use the proven nested pattern, maintain disjoint shared-file ownership, and pass their own root/part/variant/state, portal, registration/pruning and indirect-consumer checks. Preserve Calendar/Select atomic dependencies and historical chart classifications. Broad #58 deletion remains deferred.

No expanded SSR/hydration, performance, memory soak, duplicate/multiple-Goober, full historical matrix or release readiness is certified. Existing known limitations remain unresolved.

Browser, private server and exclusive browser/heavy-build window released **2026-10-27T11:44:46.872Z (17:14:46 Asia/Kolkata)**. No verifier runtime/build process remains. Root/Worker1 can dispatch the next scoped work without waiting for another user decision.

Worker1 should persist this directory's report, exact scripts/provenance/native output, raw/corrected-run results, failed-attempt records and hashes in established lab #41 evidence alongside `validation/beta17/stable-selectors61`. Portal fixture source/build script and both metafiles/provenance permit exact reproduction with the retained native archives. The verifier does not write the lab branch. Worker 888 checks remain separate from the independent 259 checks.
