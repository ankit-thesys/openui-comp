from pathlib import Path
import json,datetime
p=Path('/private/tmp/openui-styles-independent-verification/ticket65');s=json.loads((p/'SUMMARY.json').read_text());prov=json.loads((p/'provenance.json').read_text());rows='\n'.join(f"| {r['phase']} | {r['validPassed']} | {r['invalidHarnessAssertionsPreserved']} |"for r in s['phases']);graph='\n'.join(f"| {r['family']} | {r['baselineStaticBytes']:,} | {r['candidateStaticBytes']:,} | {r['deltaStaticBytes']:+,} | {r['deltaReachableBytes']:+,} |"for r in s['graphs']);now=datetime.datetime.now(datetime.timezone.utc);ist=now.astimezone(datetime.timezone(datetime.timedelta(hours=5,minutes=30)));closed=max(r['closed']for r in s['phases'])
report=f'''# Independent final selectors #62–65 verification

**Outcome: bounded selector runtime gate passes, with the retained Sources important-style exception. No candidate regression found within this scope.**

This is the existing independent verifier's executed evidence, separate from the workers' 4,591 checks. It is not full beta acceptance, a merge approval, or SSR/streaming/performance/memory certification. No production source, worker checkout, lab, GitHub content or legacy react-ui was modified.

## Exact inputs

- Frozen source: `75f69041891147d52dc0f0d2c4b21a048e575aa8`, `/private/tmp/openui-selectors65-frozen`.
- Candidate package tree: `{prov['packageTree']}`.
- Candidate archive SHA256: `d2a4b51255d745f41a7b51820ac0ec55ef5db8ff2b6f8d91ab43bade7766d037`.
- Accepted #61 baseline archive SHA256: `0dad61fb4c48477f0496f819bef2f131908a3789ec184cefb7fe8de94c68d6a5`.
- Both distinct installed consumers were verified against their own archive (2,210 members each). All 371 embedded owned source-map bindings match the frozen source. All 440 declaration files are byte-identical across arms.
- All 1,444 fallback expressions in 95 files are preserved. Six files have formatting-only differences. The independent comparison collapses whitespace only outside quoted strings, preserving quoted bytes, escapes and separators. Raw before/after expressions are in `fallback-formatting-six-files.json`.
- Stage #62, W1 portal and W2 production source bytes remain identical in the final package. All final changes are inside the new package. Chart, EditableTable, Button, IconButton, ThemeProvider, styles runtime and package metadata remain unchanged from #61.
- Chrome 156.0.8078.48, viewport 1280x900, en-US, Asia/Kolkata, dark system preference. Both arms use the same framework CSS and fixture inputs. Actual plain CSS, Tailwind v3 and v4 are tested before and after registration (six configurations); this is one Chrome version, not cross-browser certification.

## Executed results

**{s['validPassed']:,} valid independent assertions passed.** Counts below exclude invalid harness assertions retained for audit and include their corrected follow-ups. They are assertion records, not thousands of independent scenarios. Native source/archive/graph audits are separate from this count.

| Phase | Valid passed assertions | Preserved invalid harness assertions |
| --- | ---: | ---: |
{rows}

- **Controls:** all 17 owned sites, positive matching ordinary overrides, checked and selected parts, error and disabled states, callbacks, native-disabled suppression, Input ref/change, Slider keyboard changes, light/dark/default themes, host old aliases and stock Goober global updates. Corrected run 378/378.
- **Presentation:** 43 component families, default/dark/nested theme comparisons in all six host/order configurations. Strict geometry and computed properties are compared. All 178 canonical CSSOM hooks are present, with generated private classes only in the approved `:where(.go…:root)` namespace guard. Direct matching representative overrides, Tabs/Accordion/ListItem interactions and host isolation pass. This is not a claim that every property of every hook was overridden.
- **Animation:** Skeleton's unchanged 1200ms infinite opacity keyframe contract and valid range are checked; DotMatrixLoader actually progresses within range. Only these known phase-dependent opacity samples are excluded from strict paired static comparisons. The pending ImageBlock spinner has the same 1000ms infinite rotate-to-360deg contract. A separate standard Web Animations pause at currentTime=0 produces strict paired geometry; no production animation is patched.
- **W1 portals:** Select, Calendar, DatePicker and Modal paired nested-theme snapshots in all six configurations; all 16 canonical sites receive actual matching base/part probes. Actual Select and Calendar callbacks, month/year dropdowns, actual themed Modal Button/Input and Escape behavior pass. Additional open Select, disabled item, icon, selected Calendar day, real nested month popup, closed DatePicker hover and overlay dismissal checks pass. This is a bounded independent replay, not every historical size/range/focus scenario.
- **Transient W2 states:** pending image loading/completion, actual tooltip, keyboard citation close, gallery dialog semantics, keyboard thumbnail selection, overflow scrolling and close pass in nested themes for all six host/order combinations. All 26 transient hooks were observed. The pending spinner's different sampled rotation angles are resolved by the separate equal-time check; the original mismatch is retained.
- **Cold/lazy:** no owned UI stylesheet is present in the shell before the dynamic package import. Actual Button/Input/shared groups then style automatically without a Goober CSS import or consumer plugin. All 215 root defaults match public theme values. Existing host HTML and named layers survive. Root/container initial/unset/inherit fallback checks, valid custom tokens, host-layer override, nested actual components and a real nested portaled Modal pass. Repeated registration stays at the same style/prelude count. These are style-registration checks, not memory or startup timing measurements.
- **Native/optimized imports:** distinct-arm ESM and CommonJS native imports each expose the same 166 public names; declarations are unchanged. Eight optimized fixtures (Buttons, TagBlock, Table, CodeBlock, TextContentWrapper, Tabs, Sources, Citation) pass first-use comparison and 100 repeated renders without new stylesheet/prelude registration. Tabs' real root + clear-state + part context accepts an ordinary matching override.

## Sources: explicit retained exception

Sources is **not** an ordinary-background/width override pass. The real same-element selector matches both CarouselItem and Sources container (two items per arm). In both baseline and candidate, existing `width:180px !important` and background important declarations defeat a later normal consumer rule. An actual source with a URL activates the has-url hover branch; its important token background also defeats the normal consumer background. This is directly exercised across all six host/order configurations in `boot-results.json`. No empty-selector result, nonmatching `.openui-sources-container` selector, or no-URL hover is presented as override success. No important rule was removed or patched.

Inline styles also retain normal precedence: the two Image fixtures explicitly setting width100px keep it. An Image without inline width accepts31px, and all three accept the non-inline border-width probe. This is reported as existing CSS behavior, not a selector regression.

## Failure provenance and corrections

All original evidence remains. No production fix was used to make tests green.

1. `attempt1-controls-*`: 24 failed assertions across both arms. Host sentinels were duplicated by our HTML and the fixture (34 rather than17); an unscoped toggle locator clicked a host alias. `diagnose-controls-results.json` records the DOM proof. Scoped interaction/count correction reran the entire controls phase,378/378.
2. `attempt1-presentation-*`: initial run stopped because ListItem uses a div with role=button, not a native button. The follow-up uses the actual public markup. Completed `presentation-results.json` retains six width assertions incorrectly including two inline-width Images; their values remain100px. `image-inline-correction-results.json` passes12 correct matching probes.
3. `portals-results.json`: 12 immediate counts queried the Select popup before React committed its Escape removal. `escape-correction-results.json` waits for removal and passes12/12, recording immediate and final counts.
4. `extra-results.json`: six pending-loader snapshots compare different phases of a continuously rotating element, yielding different transformed bounding rectangles. No general tolerance is introduced. `loader-correction-results.json` verifies the real animation and strict equal-time geometry,30/30.
5. `attempt1-boot-*` and `attempt1-baseline-boot`/`attempt1-candidate-boot`: 36 harness failures. The token expectation omitted hyphens before digits, and the private modal callback attempted to assign Chrome's read-only window.closed property. Both arms show the same TypeError. The counter was renamed independentModalClosed, expectations corrected to the existing token naming convention, and both private fixtures rebuilt with the existing esbuild tool. Corrected boot288/288. Original output bundles, script, raw results and graph bindings are preserved. New outputs were rebound to unchanged installed archives.

## Bundle graph evidence and limits

`provenance.json` binds 24 frozen fixture builds and all their output hashes. `independent-graphs.json` independently traverses entry-reachable static and dynamic output graphs for16 optimized fixture builds plus the two private cold/lazy builds, binds package inputs to the exact archive, and hashes the private build outputs. All have one Goober module origin. Emitted files are not equated with browser downloads; dynamic reachability is not called eager loading.

| Fixture | Baseline static JS bytes | Candidate static JS bytes | Static delta | All-reachable JS delta |
| --- | ---: | ---: | ---: | ---: |
{graph}

These are graph byte counts, not timing or heap measurements. The accepted eager/shared-module cost remains. The selector change does not prove zero-unused CSS, and large retained shared syntax/theme/runtime graphs are not reclassified as an optimization success. The new cold/lazy shell's static bytes remain unchanged; owned styles activate on module import. Existing accepted #61 Button/IconButton lazy-registration evidence is reused only for their byte-identical unchanged runtime source; it is not a new whole-package streaming/performance result.

## Scope boundaries

- Stock Goober remains unmodified; ordinary DOM namespace markers are the approved mechanism. No custom injector/parser/pruner/resolver or new public styling API was introduced by verification.
- Accepted KaTeX vendor CSS/font delivery and its Vite/unused-emitted-font/bare-esbuild limits remain. These esbuild presentation fixtures use their ordinary emitted vendor stylesheet in the consumer HTML; this is not a new claim of automatic KaTeX integration on another bundler.
- EditableTable, charts/vendor styling and prior inherited behavior limitations are outside this selector gate and unchanged. No new result is claimed for the historical HorizontalBar instability, Modal title/focus limitations, Tooltip ref limitations or other inherited bugs.
- SSR/hydration, full chat/parser streaming, performance/memory/soak tests, CI/release checks and full beta #17 acceptance were not run here. No package publication, merge or ticket closure occurred.

## Resource release

Every phase records its own browser/server closure. The last scoped browser phase closed at `{closed}`. All bounded work and evidence synthesis are now complete. **The independent verifier RELEASES the exclusive browser/heavybuild window at {now.strftime('%Y-%m-%d %H:%M:%S UTC')} / {ist.strftime('%Y-%m-%d %H:%M:%S IST')}.** Worker1 may resume durable lab persistence. Verification artifacts are under this directory and should be copied without altering the protected root planning files.
'''
(p/'REPORT.md').write_text(report)
release={'releasedAtUTC':now.isoformat(),'releasedAtIST':ist.isoformat(),'exclusiveBrowserHeavybuildWindow':'RELEASED','browsersClosed':True,'serversClosed':True,'validIndependentAssertions':s['validPassed'],'candidateHead':prov['sourceHead'],'candidateArchiveSHA256':prov['archives']['candidate']['sha256'],'scope':'bounded selectors62-65; retained Sources important exception; no full beta acceptance'};(p/'RELEASE.json').write_text(json.dumps(release,indent=2))
with Path('/private/tmp/openui-styles-verifier-handoff.md').open('a')as f:f.write(f"\n\n## Final65 independent verification COMPLETE / RELEASED — {release['releasedAtUTC']}\nReport: {p}/REPORT.md\nFrozen75f69041891147d52dc0f0d2c4b21a048e575aa8/archive d2a4b51255d745f41a7b51820ac0ec55ef5db8ff2b6f8d91ab43bade7766d037 versus accepted61 verified. {s['validPassed']} valid independent assertions pass;24 invalid completed-run harness assertions preserved with separate corrected checks, earlier superseded controls/boot attempts preserved. Sources width/base/URL-hover!important exception explicitly retained, not an override pass. Source371/declarations440/fallbacks1444 preserved;24 frozen +18 graph builds bound; distinct ESM/CJS166 exports. No candidate regression found within bounded selector scope. No SSR/streaming/perf/memory/full-beta certification. No production edits. Every browser/server phase closed; exclusive browser/heavybuild window RELEASED. W1 can persist verifier artifact directory into durable lab, preserving protected planning files. No further browser or build work is scheduled by this verifier.\n")
print(json.dumps(release,indent=2))
