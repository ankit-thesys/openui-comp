from pathlib import Path
import json,hashlib,datetime
p=Path('/private/tmp/openui-styles-independent-verification/charts-runtime');pre=Path('/private/tmp/openui-styles-independent-verification/charts-preflight');phases=['families','shared','signed','unique','motion','small','signed-correction'];rows=[];seen=set();raw=[]
for phase in phases:
 d=json.loads((p/(phase+'-results.json')).read_text());fail=[c for c in d['checks']if not c['pass']]
 if phase=='signed':assert len(fail)==6 and all(c['name'].endswith('/area/paired-signed-geometry')for c in fail)
 else:assert not fail,(phase,fail)
 seen.update(d['seen']);raw.extend({'phase':phase,**c}for c in fail);c=json.loads((p/(phase+'-closed.json')).read_text());assert c['browserClosed']and c['serverClosed'];rows.append({'phase':phase,'validPassed':len(d['checks'])-len(fail),'invalidPreserved':len(fail),'closedAt':c['time'],'browser':d['browser']})
shared=json.loads((p/'shared-results.json').read_text());tooltip=[c['name']for c in shared['checks']if c['pass']and c['name'].endswith('/matching-.openui-chart-tooltip-root')];assert len(tooltip)==6;coverage={'enumeratedActualDOMTargets':sorted(seen),'actualTooltipPanelPositiveNonemptyMatchingProbeChecks':tooltip};confirmed=seen|{'openui-chart-tooltip-root'};ledger=json.loads(Path('/private/tmp/openui-charts-w1-evidence/conversion-ledger.json').read_text());assert confirmed=={r['hook']for r in ledger};coverage['confirmedCanonicalSites']=len(confirmed)
g=json.loads((p/'graphs-results.json').read_text());assert len(g['rows'])==20;graph=[]
for label in ['browser','shared','signed','small-button','small-condensed','small-empty','small-lazy','small-mini','small-pie','small-stacked']:
 a,b=[next(x for x in g['rows']if x['arm']==arm and x['label']==label)for arm in ['baseline','candidate']];graph.append({'fixture':label,'baselineStaticBytes':a['staticJSBytes'],'candidateStaticBytes':b['staticJSBytes'],'staticDelta':b['staticJSBytes']-a['staticJSBytes'],'reachableDelta':b['allReachableJSBytes']-a['allReachableJSBytes'],'reachableCountsUnchanged':a['allReachableOutputCount']==b['allReachableOutputCount']})
n=json.loads((p/'native-results.json').read_text());assert n[0]['esm']!=n[1]['esm']and n[0]['cjs']!=n[1]['cjs'];assert n[0]['esmExports']==n[1]['esmExports']==n[0]['cjsExports']==n[1]['cjsExports'];assert len(n[0]['esmExports'])==166
s={'scope':'Independent bounded chart selectors only; no full beta/SSR/streaming/performance/memory claim.','source':'5e09b37c04a1a3be05b9447cf8b9effaf33a331f','archiveSHA256':'b09f11e6aa2809f42f7aee5eb2c23bd7bf6c58904d4a935918044f039ff7dd71','phases':rows,'validIndependentAssertions':sum(r['validPassed']for r in rows),'invalidCompletedHarnessAssertionsPreserved':6,'coverage':coverage,'graphs':graph,'native':{'distinctActualESMandCJS':True,'exportsPerImport':166},'rawInvalidComparisons':raw};(p/'SUMMARY.json').write_text(json.dumps(s,indent=2))
phaseTable='\n'.join(f"| {r['phase']} | {r['validPassed']} | {r['invalidPreserved']} |"for r in rows);graphTable='\n'.join(f"| {r['fixture']} | {r['baselineStaticBytes']:,} | {r['candidateStaticBytes']:,} | {r['staticDelta']:+,} | {r['reachableDelta']:+,} |"for r in graph);count=s['validIndependentAssertions'];now=datetime.datetime.now(datetime.timezone.utc);ist=now.astimezone(datetime.timezone(datetime.timedelta(hours=5,minutes=30)));last=max(r['closedAt']for r in rows)
report=f'''# Independent chart stable-selector verification

**Bounded chart selector gate: PASS, with inherited limitations retained. No candidate product regression found in this scope.** This report is evidence for root review, not merge/release approval or full beta #17 acceptance.

## Frozen inputs and provenance

Source `5e09b37c04a1a3be05b9447cf8b9effaf33a331f`, detached `/private/tmp/openui-charts-w1-frozen`, package tree `2c31eb88b05349b48717c389deab040ec532fc7f`.

Final archive `/private/tmp/openui-charts-w1-evidence/candidate-final/openuidev-react-components-0.0.0-beta.0.tgz`, SHA256 `b09f11e6aa2809f42f7aee5eb2c23bd7bf6c58904d4a935918044f039ff7dd71`. Baseline is accepted PR69 `75f69041891147d52dc0f0d2c4b21a048e575aa8`, archive SHA256 `d2a4b51255d745f41a7b51820ac0ec55ef5db8ff2b6f8d91ab43bade7766d037`.

Independent source/archive preflight is in `../charts-preflight/REPORT.md` and `source-archive-results.json`: 2,210 installed members per distinct arm bound to their archives,371 owned source-map bindings to exact frozen source,440 identical declarations,25 complete registration bodies conserved, nine exact keyframes,1,444 fallbacks across95files retained. Only19 chart style modules plus README changed. Two multiline fallback-formatting differences are recorded without changing quoted bytes. Final versus originally tested `ec56caf…` archive differs only in README; all runtime bytes are identical.

No production source, worker checkout, dependency, tooling, CI, GitHub content or legacy react-ui was edited by this verifier. Existing frozen browser bundles and pinned consumers were reused; no package rebuild/install or new library was necessary. Source/import/graph checks remain separate from browser assertion counts.

## Actual independent runtime results

**{count:,} valid independent assertions passed.** These are assertion records, not {count:,} distinct scenarios. The workers'1,908 assertions remain a separate evidence set and are not included. Six invalid signed-scene comparisons are retained with a scoped correction; an early stopped unique-scene attempt is excluded, not pooled.

| Phase | Valid independent assertions | Preserved invalid completed assertions |
| --- | ---: | ---: |
{phaseTable}

Chrome156.0.8078.48,1280x900,en-US,Asia/Kolkata. Framework tests use the existing actual plain CSS, Tailwind v3 and v4 stylesheets in both before/after orders. Comparisons use distinct baseline/candidate installations and real public package components. This is one Chrome version, not a cross-browser certification.

### Families, SVG and selector ownership

All19 named public chart entries plus the diverging Heatmap scene have paired default, nested-theme and empty-state snapshots in all six framework/order configurations. Comparisons include SVG paths/geometry attributes, strict bounding dimensions, computed SVG fill/stroke/dash/opacity and HTML typography/layout. SingleStackedBar remains its existing alias; condensed and mini entries retain shared ownership.

All25 canonical rule sites are present in actual CSSOM; generated Goober names appear only inside the accepted zero-specificity private document namespace guard for these owned rules. Twenty-four canonical targets are explicitly enumerated in actual app/direct-body DOM, and the remaining inner tooltip panel is proven by six positive, nonempty actual matching radius probes. `SUMMARY.json` gives this distinction rather than silently calling all25 a single enumeration or25 complete property audits.

Representative owned-root, SVG tick, signed zero-line type/state, hover, attribute-negation and pseudo-element overrides pass with public selectors and no important rule or private name. SVG type/state specificity and equal-context consumer selectors remain meaningful; a weaker arbitrary class is not promised to win. The diverging ramp `::after` and stacked scrollbar pseudo are checked on real originating elements. Pseudo scrollbar display does not guarantee native visible scrollbars.

Signed data genuinely creates emphasized zero lines for Area/Bar/Line/Scatter. The corrected Area check isolates the real app SVG while retaining a public equal-context consumer override. Presentation attributes retain geometry and can be overridden by matching CSS; this is independently exercised on a real mini line. Existing inline Heatmap label fill keeps precedence over normal CSS. No blanket width, fill, opacity or transform override guarantee is implied.

### Real portals, themes and interactions

The existing shared public scene passes all six framework/order configurations. Real Bar hover creates a body-level tooltip outside the chart subtree; its actual text inherits nearest nested theme rgb(31,32,33), renders the five-item/view-more branch for more than ten series, and keeps pointer-events:none. Its owned panel/portal properties accept matching ordinary overrides. FloatingUI/spring inline positioning remains intact and is not falsely tested as stylesheet-owned.

Old HTML/SVG alias sentinels survive package activation and actual stock Goober global updates. Every final shared host snapshot remains isolated. The actual semicolon-terminated stock glob API supplies and updates the separate global sentinel; no handwritten style tag substitutes for that compatibility test.

Real legend expansion, hide/restore and palette identity pass. Horizontal and numeric-height vertical scroll advance through native UI. Stacked legend hover/active/hidden/restore and show-more behavior pass. Root/part/pseudo probes cover all12 shared registrations, with retained inline opacity/swatch limits. All three mini callbacks pass in their actual chart subtree. Calendar legend hover activates level1 and an equal-context attribute/negation rule overrides fill-opacity; Heatmap hover accepts the owned stroke-width override.

### Motion and print

One normal/reduced-motion actual Bar representative has the expected600ms entrance versus no CSS entrance under reduced motion. Normal animation time actually progresses; settled marks remain visible and strict paired geometry/styles agree. Existing print transition declarations are sampled on the Heatmap/Funnel scene. Nine keyframes and all motion/print source bodies are independently conserved. No general animation suppression, broad opacity/transform tolerance or physics change was used. This bounded sample is not every chart's full motion/export matrix.

### Native and optimized/lazy imports

Distinct actual ESM and CommonJS imports each expose the same166 public names (`native-results.json`). Declaration equality is separately established; native import is not SSR/hydration validation.

Six optimized public fixtures (condensed Bar+labels, MiniLine, Pie+legend, empty Bar, standalone StackedLegend, Button-only negative) pass first-use paired rendering and100 render-call registration plateaus. Button/Mini fixtures do not inject unrelated Area/Bar/tooltip rules. Both lazy orders Mini→Bar and Bar→Mini start without owned chart style markers/default prelude, style correctly at first use, and retain the registration plateau after100 render calls. This is a registration behavior check, not a heap or timing result. The accepted eager/shared-module retention limits remain.

## Graph and payload evidence

`graphs-results.json` independently verifies all20 existing metadata files, exact package input bytes against the archives, every emitted output hash, one Goober origin per graph and actual entry-reachable static/dynamic traversal. This is independently recomputed, not merely endorsement of worker graph totals. No emitted-file count is equated with a network download; dynamic reachability is not eager execution.

| Existing fixture | Baseline static JS bytes | Candidate static JS bytes | Static delta | All-reachable delta |
| --- | ---: | ---: | ---: | ---: |
{graphTable}

Large shared/runtime/syntax/theme graphs remain; this is not zero-unused-JS/CSS acceptance. The full combined fixture increases8,104 uncompressed static bytes; optimized representatives add0–3,063 bytes, with Button-only and lazy shell static bytes unchanged. Injected style-text byte observations in the small raw records are separate from emitted vendor stylesheet sizes and are not performance measurements. Accepted KaTeX/Vite/font/bare-esbuild limits remain unchanged. These existing esbuild fixtures use ordinary emitted vendor CSS in their HTML; no new claim is made for another bundler's automatic vendor integration.

## Original failures and disposition

1. `signed-results.json` retains six failed Area paired reads. The baseline public alias selector accidentally included an intentional old-alias SVG in #host; candidate canonical root matched only the real chart. Raw proof shows baseline2lines versus candidate1, including sentinel x2=30 versus chart x2=499. It is a verifier-scoping error, not a product regression. `signed-correction-results.json` scopes target observation to #app, keeps the override selector public, and passes30 focused assertions. Unchanged successful signed checks were not broadly replayed.
2. `attempt1-unique-*` retains the original stopped baseline attempt: unscoped MiniArea locator matched both old-alias sentinel and actual component, triggering Playwright strict-mode failure. No candidate verdict came from that attempt, and its three early baseline passes are excluded from the final count. Only the private interaction/line locators were scoped to #app; corrected unique45/45passes. No host sentinel was deleted, chart hidden, click forced or production code changed.
3. Worker historical attempts remain worker evidence: unscoped portal/sentinel collision, requesting zero emphasis in all-positive data, baseline HorizontalBar SVG intercepting Pie hover (plus stale sequence-summary mistake), and semicolonless stock-glob diagnostic. They were read and preserved in the worker archive, not relabelled as independent passes. Our stock API test uses ordinary terminal semicolons. The known stock parser formatting edge is not repaired here.

## Retained limitations and non-goals

HorizontalBar's prior string-height/legend-fit feedback failure and inherited click limitation remain unresolved and separately disclosed. Stable selector checks use the existing documented pinned numeric-height/legend=false/fitLegend=false shared fixture; that is explicit fixture scope, not a fix or concealment of the failing witness. No geometry hook, scale, measurement loop or callback contract was changed. The earlier pointer-interception witness remains separate.

Existing inline geometry, label fill, swatch colors/opacity, animation delay, tooltip position/transform and higher-specificity contextual rules retain their existing precedence. LabelTooltip is a separate Radix portal with no owned chart CSS registration in the baseline; no new registration or styling contract was invented. Sources' important-style limitation, EditableTable deferral and all non-chart accepted limitations remain unchanged.

No full beta acceptance, SSR/hydration, full chat/parser streaming, performance/memory/soak, release/CI or export-product certification is claimed. No merge, publication, release, deprecation or issue closure occurred.

## Completion and release

All phases close their own Chrome process and private HTTP server in finally blocks; closure JSON is retained. Last browser phase closed `{last}`. **Exclusive browser/heavybuild window RELEASED at {now.strftime('%Y-%m-%d %H:%M:%S UTC')} / {ist.strftime('%Y-%m-%d %H:%M:%S IST')}.** No further verifier runtime is scheduled. Worker1 may persist these exact reports/raw scripts/results and the source/archive preflight into the durable lab; preserve protected planning files and original failures.
'''
(p/'REPORT.md').write_text(report);release={'timeUTC':now.isoformat(),'timeIST':ist.isoformat(),'runtimeWindow':'RELEASED','browsersClosed':True,'serversClosed':True,'source':s['source'],'archiveSHA256':s['archiveSHA256'],'validIndependentAssertions':count,'boundedGate':'PASS with inherited limits; root acceptance separate'};(p/'RELEASE.json').write_text(json.dumps(release,indent=2))
with Path('/private/tmp/openui-charts-verifier-handoff.md').open('a')as f:f.write(f"\n\n## Independent chart verification COMPLETE / WINDOW RELEASED — {release['timeUTC']}\nExact frozen5e09b37c04a1a3be05b9447cf8b9effaf33a331f / archiveb09f11e6aa2809f42f7aee5eb2c23bd7bf6c58904d4a935918044f039ff7dd71 vs69 passed bounded gate: {count}valid independent assertions. Worker1908 remains separate. Six invalid signed Area host-sentinel comparisons preserved and corrected30-pass scoped follow-up; early unique baseline strict-selector error preserved/excluded, corrected45pass. No product fixes. Families408/shared348; source25bodies/9keyframes/1444fallbacks/440dts/371sources/2210members perarm; native distinctESM+CJS166;20graph/input/output bindings independently verified. All25sites actualCSSOM;24DOM-enumerated plus innerpanel positive matching probe proves25th. Inherited HorizontalBar/inline/eager-shared/stockglob formatting/KaTeX limits retained; no SSR/streaming/perf/memory/fullbeta certification. Every browser/server closed. Exclusive browser/heavybuild window RELEASED. Finalreport {p}/REPORT.md, summary {p}/SUMMARY.json, preflight {pre}/REPORT.md. W1 can retain exact verifier evidence in durablelab; no next runtime planned.\n")
print(json.dumps(release,indent=2))
