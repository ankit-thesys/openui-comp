from pathlib import Path
import json,gzip,hashlib,shutil
r=Path('/private/tmp/openui-charts-w1-evidence');d=Path('/Users/ankitdas/.codex/worktrees/component-comparison/openui/validation/beta17/stable-chart-selectors-worker');assert not d.exists();d.mkdir(parents=True);rows=[]
def cp(p,target):
 raw=p.read_bytes();compressed=p.suffix=='.json'and len(raw)>262144;data=gzip.compress(raw,mtime=0)if compressed else raw;out=d/(target+('.gz'if compressed else''));out.parent.mkdir(parents=True,exist_ok=True);out.write_bytes(data);rows.append({'originalPath':str(p),'path':str(out.relative_to(d)),'originalSHA256':hashlib.sha256(raw).hexdigest(),'storedSHA256':hashlib.sha256(data).hexdigest(),'originalBytes':len(raw),'storedBytes':len(data),'gzip':compressed})
for p in r.iterdir():
 if p.is_file():cp(p,'worker/'+p.name)
for folder in ['smoke-v1','attempt01-extra-host-alias-scoping','attempt02-positive-only-zero-line','attempt03-extra-baseline-pointer-interception','attempt04-shared-stock-glob-formatting']:
 for p in (r/folder).rglob('*'):
  if p.is_file():cp(p,'worker/'+str(p.relative_to(r)))
for p in r.glob('*/metafile.json'):cp(p,'worker/'+str(p.relative_to(r)))
for p in r.glob('*-small-*/*.tsx'):cp(p,'worker/'+str(p.relative_to(r)))
for folder in ['baseline-consumer','candidate-consumer']:
 for name in ['package.json','pnpm-lock.yaml']:cp(r/folder/name,'consumers/'+folder+'/'+name)
for folder in ['baseline-archive','candidate-area','candidate-combined-v1','candidate-final']:
 for p in (r/folder).glob('*.tgz'):cp(p,'artifacts/'+folder+'.tgz')
for p in Path('/private/tmp/openui-public-gate-consumer/frameworks').glob('*.css'):cp(p,'host-css/'+p.name)
for name in ['inventory.json','source-audit.json','candidate-source.json','spec-review.md','standards-review.md','HOOKS-DRAFT.md','keyframe-source-bindings.json','SHARED-PROBES-HANDOFF.md']:
 p=Path('/private/tmp/openui-charts-w2-evidence')/name
 if p.exists():cp(p,'w2-source/'+name)
cp(Path('/private/tmp/openui-charts-verifier-handoff.md'),'verifier-source-preparation.md');cp(Path('/private/tmp/openui-charts-verifier-inventory.json'),'verifier-source-inventory.json')
(d/'MANIFEST.json').write_text(json.dumps(rows,indent=2)+'\n');(d/'README.md').write_text((r/'REPORT.md').read_text()+'\nSee worker/REPORT.md, worker/SUMMARY.json and MANIFEST.json. Large JSON losslessly compressed; all original/stored hashes verified. Native archives unchanged. Emitted build/node_modules bulk excluded while metadata/output hashes and all raw failed/corrected fixtures are retained. Original absolute paths require restoration for replay. Historical error files remain; final phase result hashes in SUMMARY identify accepted worker runs. Independent chart gate pending.\n')
for row in rows:
 data=(d/row['path']).read_bytes();assert hashlib.sha256(data).hexdigest()==row['storedSHA256'];raw=gzip.decompress(data)if row['gzip']else data;assert hashlib.sha256(raw).hexdigest()==row['originalSHA256']
print(json.dumps({'files':len(rows)+2,'allOriginalAndStoredHashesVerified':True}))
