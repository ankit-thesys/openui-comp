from pathlib import Path
import json,subprocess,shutil
p=Path('/private/tmp/openui-selectors-w2-evidence');repo=Path('/private/tmp/openui-selectors-w2');head=subprocess.check_output(['git','rev-parse','HEAD'],cwd=repo,text=True).strip();tree=subprocess.check_output(['git','rev-parse','HEAD:packages/react-components'],cwd=repo,text=True).strip()
for name in ['candidate-source.json','coverage-ledger.json','SOURCE-STATUS.md','HOOKS-DRAFT.md']:
 old=p/'source-only-history'/name;old.parent.mkdir(exist_ok=True)
 if not old.exists():shutil.copyfile(p/name,old)
j=json.load(open(p/'candidate-source.json'));j.update(candidateCommit=head,packageTree=tree,clean=True,previousCandidateCommit='72699259c54c13ff806739f13c3d7bfa5f95e95f',runtimeBuildBrowser='Bounded W2 runs complete; window released. Independent integration/verifier acceptance pending.',archive='candidate-v2/openuidev-react-components-0.0.0-beta.0.tgz',archiveSha256='212170767ecbea02251b723138c45ad753471f6a3a010e3e9d1e3a9970cea903',resolvedSourceFinding='Carousel canonical legacy-alias collision; dark TextContentWrapper 8 selectors changed to ordinary compound state selectors to preserve actual emitted baseline specificity. Both source fixes reviewed.',evidence='SOURCE-STATUS.md',acceptance='Scoped worker evidence only; no issue closure or broad readiness claim.');(p/'candidate-source.json').write_text(json.dumps(j,indent=2)+'\n')
c=json.load(open(p/'coverage-ledger.json'));c.update(candidateCommit=head,archiveSha256=j['archiveSha256'],acceptedRuntime=False,acceptanceStatus='Worker scoped runs complete; integration/verifier acceptance pending.',runtimeEvidence=['runtime-results.json','small-results.json','override-results.json','extra-results.json','tabs-state-results.json','override-dispositions.md'],window='RELEASED')
for f in c['families']:
 if f['family']=='EditableTable':continue
 f['sourceStatus']='converted and committed; bounded packed-consumer checks complete; independent acceptance pending'
 f['validation']='Main six-config parity and single-family optimized first-use parity passed. Root/part/state override limits and original failures are disclosed in override-dispositions.md; no blanket all-property override guarantee.'
 if f['family']in ['TooltipWrapper','Citation','ImageGallery','Sources','ImageBlock','ContextCardBlock']:f['additionalValidation']='Actual portal/transient branches across six configs and light/dark/nested themes: extra-results.json. All 26 previously unobserved canonical targets observed.'
 if f['family']=='Tabs':f['limits']='Clear state requires matching root+clear-state+part selector; 12 fresh paired checks pass in tabs-state-results.json. Original weaker failures retained.'
 if f['family']=='Sources':f['limits']='Existing important width/background declarations retain precedence; ordinary background override on Sources Carousel item fails in baseline and candidate. Explicitly not counted as passing override.'
c['sharedCardLayout']={'scope':c['sharedCardLayout'],'validation':'Shared scrollbar actually observed in ContextCardBlock carousel branch; paired extra-state tests pass.'}
(p/'coverage-ledger.json').write_text(json.dumps(c,indent=2)+'\n')
text='''# W2 #63 / assigned #64 implementation and evidence

The frozen candidate covers 40 presentation/layout families, TooltipWrapper, Citation, ImageGallery and the exact shared card-layout file. EditableTable remains explicitly deferred. Independent integration/verifier acceptance is still required.

- Worktree: `/private/tmp/openui-selectors-w2`
- Branch: `codex/stable-selectors-63-64`
- Accepted #61 base: `1c3833a045c4c66de92b69413a3824eca1798fcd`
- Candidate: `HEAD_VALUE`
- Package tree: `TREE_VALUE`
- Candidate archive: `candidate-v2/openuidev-react-components-0.0.0-beta.0.tgz`
- SHA-256: `212170767ecbea02251b723138c45ad753471f6a3a010e3e9d1e3a9970cea903`
- Exclusive browser/build window: **released**; all owned processes closed.

## What changed

Existing component registrations now attach stable canonical classes behind the accepted stock-Goober private zero-specificity document guard. The implementation preserves 594 fallback expressions across 178 rules in 52 files. Existing aliases, types, props, refs, markup, state and supporting vendor behavior remain. No production runtime helper, injector, parser, registry patch or new tooling was introduced. One-time source-edit and evidence scripts live only in this temporary lab.

Two real findings were corrected in source and retained in the history:

1. Carousel reused a legacy alias as a canonical target. Commit `72699259c54c13ff806739f13c3d7bfa5f95e95f` separates the canonical button target while preserving aliases.
2. A nested conditional `:where` form generated an impossible dark Markdown descendant selector. Commit `d1e8a05d035b66453d58953faf7d9fabacbaa8e8` uses eight ordinary compound state selectors with the same effective specificity as baseline Goober output. Declarations and fallbacks remain unchanged. See `dark-authoring-correction.md` and baseline CSSOM evidence.

## Measured results

These are separate check counts, not unique components or pooled acceptance totals.

| Evidence | Result | Meaning |
| --- | --- | --- |
| `runtime-results.json` | 2,424 / 2,424 | Six plain/Tailwind v3/v4 × stylesheet-order configurations; 43 family fixtures, appearance, themes, actual interactions, host isolation, aliases, CSSOM guards and loader behavior |
| `small-results.json` | 311 / 334 | All 43 optimized first-use parity, 86 registration plateaus and 86 page-error checks pass; original 23 generic override failures retained |
| `override-results.json` | 115 / 116 | Fresh own-family ordinary base overrides; clear Tabs requires a matching state selector |
| `extra-results.json` | 373 / 374 | Portal/loading branches, light/dark/nested themes, actual image completion, citation keyboard close, gallery selection/scroll/close, host/glob checks; all 26 missing canonical targets observed; insufficient two-class Tabs assertion retained |
| `tabs-state-results.json` | 12 / 12 | Correct clear-state/part selector against baseline and candidate across six CSS/order configurations |
| `override-dispositions.json` | 23 original failures diagnosed | Exact target/property, baseline behavior, emitted matching rules and same-property corrections; see `override-dispositions.md` |

All main and extra canonical observations together cover 178 targets, but observation does not mean every possible declaration/state/property was override-tested. The fresh base suite and explicit portal/state tests provide bounded customization evidence.

The 23 original override failures are disposed of individually: 18 display blockification expectations, two layout-constrained widths, one Markdown parent-context selector, one clear Tabs state selector, and one **retained important Sources background limitation**. Same-property corrections avoid changing unrelated properties to manufacture success. A bad baseline Tabs correction in the first diagnostic is retained; the fresh 12-check run uses the correct baseline legacy selector. No original failed row is relabeled.

## Artifact, build and type evidence

`artifact-provenance.json` binds both exact archives to installed consumers (2,210 files each) and 371 embedded owned source files each to Git. All 440 declaration files and public entry declarations match baseline. `native-exports.json` confirms equal 166-export ESM and CJS surfaces. Package build and final TypeScript check pass; `typecheck-final.log` is empty with successful exit.

`small-graph-bindings.json` binds 86 optimized builds by entry-reachable output hashes. Every family pair retains the same reachable output count and entry CSS size. Static JS increases range from 147 to 6,730 uncompressed bytes, reflecting the stable selectors/registrations. Emitted-but-unreachable vendor files are not counted as loaded. These are comparative bundle observations, not a zero-unused-code or performance guarantee.

## Limits and handoff

EditableTable is not converted. Vendor inline syntax themes, floating coordinates, live loader opacity, private keyframe identifiers and existing important declarations retain their specific limits. Infinite animation phase is not compared as fixed appearance; animation descriptors and actual progression are measured separately. No animation is disabled to manufacture parity.

Old react-ui, controls, charts, central registration, shared base/defaults, package metadata and README remain untouched. PR42 and PR67 code is unchanged. No broad SSR, hydration, streaming, memory, performance or release readiness claim follows from these scoped tests.

The integration owner should retain this lab evidence in the approved location, integrate `HOOKS-DRAFT.md` and `coverage-ledger.json`, and run independent verification before accepting these source commits. No issue closure, publication, merge or release was performed. Historical failed runs and source-only manifests remain under their original attempt directories and `source-only-history/`.
'''.replace('HEAD_VALUE',head).replace('TREE_VALUE',tree)
(p/'SOURCE-STATUS.md').write_text(text)
s=(p/'HOOKS-DRAFT.md').read_text().replace('Source candidate only; emitted/consumer validation pending. This draft is separate','Frozen candidate '+head+' has bounded packed-consumer evidence; independent integration acceptance remains pending. This draft is separate')
s+='''
## Validated contextual customization examples

Root defaults accept ordinary later CSS. Preserve existing selector context for nested or state-specific defaults:

```css
/* Clear Tabs has root + clear variant + part specificity. */
.openui-tabs-tabs.openui-tabs-clear .openui-tabs-list-styled {
  box-sizing: content-box;
}

/* Inline Markdown intentionally inherits from its parent. */
.openui-inline-markdown-renderer .openui-mark-down-renderer-markdown-root {
  color: rgb(1, 2, 3);
}

/* Match the gallery's active-thumbnail state. */
.openui-image-gallery-gallery-modal-thumbnail.openui-image-gallery-gallery-modal-active-thumbnail {
  border-top-color: rgb(3, 4, 5);
}
```

These examples use public component/state classes, not the private document marker, IDs, inline styles or important declarations. Clear Tabs passes six CSS/order configurations in both arms. The portal active-thumbnail example passes all six configurations and three themes.

Sources intentionally retains its existing important width/background declarations. A normal background declaration on its Carousel item cannot beat that precedence, even with added context. This batch does not change that contract or claim every property is overridable. See `override-dispositions.md` for the preserved failing probe and baseline proof.
''';(p/'HOOKS-DRAFT.md').write_text(s)
