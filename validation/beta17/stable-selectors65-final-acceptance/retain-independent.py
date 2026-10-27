from pathlib import Path
import json,gzip,hashlib
r=Path('/private/tmp/openui-styles-independent-verification/ticket65');d=Path('/Users/ankitdas/.codex/worktrees/component-comparison/openui/validation/beta17/stable-selectors65-independent');assert not d.exists();d.mkdir(parents=True);rows=[]
def cp(p,target):
 raw=p.read_bytes();compressed=p.suffix=='.json' and len(raw)>262144;data=gzip.compress(raw,mtime=0)if compressed else raw;out=d/(target+('.gz'if compressed else ''));out.parent.mkdir(parents=True,exist_ok=True);out.write_bytes(data);rows.append({'originalPath':str(p),'path':str(out.relative_to(d)),'originalSHA256':hashlib.sha256(raw).hexdigest(),'storedSHA256':hashlib.sha256(data).hexdigest(),'originalBytes':len(raw),'storedBytes':len(data),'gzip':compressed})
for p in r.iterdir():
 if p.is_file():cp(p,'independent/'+p.name)
omitted=[]
for folder in ['baseline-boot','candidate-boot','attempt1-baseline-boot','attempt1-candidate-boot']:
 for p in sorted((r/folder).rglob('*')):
  if not p.is_file():continue
  if p.name=='metafile.json':cp(p,'independent/'+str(p.relative_to(r)))
  else:omitted.append({'path':str(p.relative_to(r)),'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'retained':False,'reason':'emitted build bulk omitted; exact scripts/fixtures/metadata/provenance retained'})
raw=json.dumps(omitted,indent=2).encode()+b'\n';p=Path('/private/tmp/openui-selectors65-finalization/omitted-build-output-inventory.json');p.write_bytes(raw);cp(p,'omitted-build-output-inventory.json')
pro=json.loads((r/'provenance.json').read_text())
for b in pro['boundBuilds']:
 p=Path('/private/tmp/openui-selectors65-evidence')/b['fixture']/(b['arm']+'-'+b['label'])/'metafile.json';assert hashlib.sha256(p.read_bytes()).hexdigest()==b['metafileSHA256'];cp(p,'frozen-worker-graphs/'+b['fixture']+'/'+b['arm']+'-'+b['label']+'/metafile.json')
for arm,a in pro['archives'].items():
 p=Path(a['path']);assert hashlib.sha256(p.read_bytes()).hexdigest()==a['sha256'];cp(p,'artifacts/'+arm+'.tgz')
 for name in ['package.json','pnpm-lock.yaml']:cp(Path(a['consumer'])/name,'consumers/'+arm+'/'+name)
for p in Path('/private/tmp/openui-public-gate-consumer/frameworks').glob('*.css'):cp(p,'host-css/'+p.name)
(d/'MANIFEST.json').write_text(json.dumps(rows,indent=2)+'\n')
reporthash=hashlib.sha256((r/'REPORT.md').read_bytes()).hexdigest()
(d/'README.md').write_text('''# Independent final selector gate #62–65\n\nRoot accepted the exact independent report after verifier release at2026-10-27 15:03:52UTC. **2,136 valid independent assertions pass**, separate from4,591 worker checks. Assertions are not thousands of independent scenarios.\n\nSee [unaltered independent report](independent/REPORT.md), [summary](independent/SUMMARY.json), [release](independent/RELEASE.json) and MANIFEST.json for exact source/archive and original/stored hashes. Report SHA256 `'''+reporthash+'''`. Source75f69041891147d52dc0f0d2c4b21a048e575aa8; candidate archived2a4b51255d745f41a7b51820ac0ec55ef5db8ff2b6f8d91ab43bade7766d037.\n\nAll original raw failures, invalid harness assertions, corrected follow-ups, scripts, fixtures and provenance retained without relabelling. Sources important width/background/has-URL hover remains an explicit exception; inline image width keeps precedence. EditableTable and chart-owned selectors excluded. All1,444 fallbacks retained; deletion deferred.\n\nLarge JSON is losslessly compressed; verify manifest hashes after decompression. Native archives copied unchanged. Emitted build bulk/node_modules are excluded; all omitted private boot outputs have exact hash/size inventory, all four private build metadata files and24 original frozen worker metadata hashes are retained. The same graph outputs are bound by verifier provenance. Scripts preserve original absolute paths; reproduction requires restoring paths and exact dependencies. No new runtime, CI, tooling, merge, publication or issue closure occurs here. This scoped pass is not full beta, SSR/hydration, streaming, performance or memory certification.\n''')
for row in rows:
 data=(d/row['path']).read_bytes();assert hashlib.sha256(data).hexdigest()==row['storedSHA256'];raw=gzip.decompress(data)if row['gzip']else data;assert hashlib.sha256(raw).hexdigest()==row['originalSHA256']
print(json.dumps({'retainedFiles':len(rows)+2,'omittedBuildFilesHashed':len(omitted),'reportSHA256':reporthash,'allRetainedHashesVerified':True}))
