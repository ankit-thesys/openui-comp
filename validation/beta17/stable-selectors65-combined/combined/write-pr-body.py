from pathlib import Path
import json,subprocess
r=Path('/private/tmp/openui-selectors65-evidence');s=json.loads((r/'SUMMARY.json').read_text());lab=subprocess.check_output(['git','rev-parse','HEAD'],cwd='/Users/ankitdas/.codex/worktrees/component-comparison/openui',text=True).strip();url='https://github.com/ankit-thesys/openui-comp/blob/'+lab+'/validation/beta17/stable-selectors65-combined/README.md'
body='''## Summary

Give controls, layouts, presentation components and portals stable targets for ordinary later, unlayered CSS. Keep existing props, aliases, behavior, theme delivery and fallback values. Stock Goober registration stays in each component module behind the accepted private zero-specificity document guard.

```text
packages/react-components/
├── README.md                 # canonical targets, selector context and limits
└── src/components/           # controls, presentation/layout and portal registrations
```

Stacked on frozen pilot #68. Related: #62, #63, #64, #65. EditableTable stays deferred; chart-owned styles and legacy react-ui are unchanged.

## Evidence

- **Before:** accepted61 provides stable Button/IconButton targets; remaining owned registrations use generated attachment classes.
  **After:** matching stable root/variant/state/part selectors apply without targeting private Goober markers. Existing appearance, interactions, aliases, theme scopes and host isolation are compared with the exact accepted61 archive.
'''
for x in s['matrices']:body+='- '+x['folder']+' / '+x['script']+': **'+str(x['passes'])+'/'+str(x['checks'])+' PASS**.\n'
body+='''- Plain CSS, Tailwind v3/v4 and before/after order; all178 W2 canonical targets observed, plus16 W1 portal targets. Counts are separate scoped worker checks, not independent acceptance.
- Build/typecheck, unchanged166 native ESM/CJS exports and440 declarations;371 embedded sources and2210 installed members bind the frozen source/archive. All1444 fallback expressions/counts retained, with formatting-only whitespace recorded.
- Sources positively matched same-element probes confirm its **retained important width/background/hover exception**. This is not a passing ordinary-override claim. Existing important declarations remain.
- Eight representative optimized family pairs preserve reachable output counts and emitted entry CSS sizes. Remount registration checks are not broad performance/memory certification. SSR remains deferred.
- Both source review axes pass. **Independent combined acceptance pending.** No CI, release or issue-closure claim.

[Exact worker evidence and preserved raw results]('''+url+'''). Frozen source `'''+s['source']+'''`; archive SHA256 `'''+s['archiveSHA256']+'''`.

## Merge Danger

**Door:** two-way

Source-only styling changes can be reverted; no data or release migration occurs here.

**Blast Radius:** styling

Consumers of the new react-components package may depend on selector precedence and portal behavior. Contextual selectors, existing vendor inline styles and Sources important declarations retain their documented limits. Independent verification remains required. PR42, PR67 and PR68 heads are unchanged.
'''
(r/'pr-body.md').write_text(body)
