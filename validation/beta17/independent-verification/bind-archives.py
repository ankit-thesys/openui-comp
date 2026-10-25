from pathlib import Path
import subprocess,hashlib,tarfile,io,json
root=Path('/private/tmp/openui-beta17-independent-verification');worker='/Users/ankitdas/.codex/worktrees/63b2/openui';commit='8b32d559888b5c59ff4814973253a93e94f0e77b';old=json.loads((root/'raw-audit.json').read_text());records=[]
for name,expected in [('benchmark','fd0445769fe69b2a4cebef7eeb3f52b4e448b44afe415f622bb42c1203f98382'),('soak','c0ca2a9ba53c7f81af2110315ecb06c4e052fbac7ef92e3f9c01f52b0a6d01fc')]:
 path='validation/beta17/performance/evidence/v5-'+name+'.tgz';blob=subprocess.check_output(['git','show',commit+':'+path],cwd=worker);digest=hashlib.sha256(blob).hexdigest();assert digest==expected;assert Path(worker,path).read_bytes()==blob
 with tarfile.open(fileobj=io.BytesIO(blob),mode='r:gz') as t:
  memberHashes={m.name:hashlib.sha256(t.extractfile(m).read()).hexdigest() for m in t if m.isfile()}
  prefix=name+'-v5/'
  for file in ['report.json','summary.json','manifest.json']:
   source=str(Path(worker)/'validation/beta17/performance/evidence'/(name+'-v5')/file);assert memberHashes[prefix+file]==old['reportIdentities'][source]
  runner=[]
  for member,h in memberHashes.items():
   if '/runner/' in member:
    filename=member.split('/runner/')[1];actual=Path(worker)/'validation/beta17/performance'/filename;assert hashlib.sha256(actual.read_bytes()).hexdigest()==h;runner.append(filename)
 records.append({'commit':commit,'path':path,'sha256':digest,'bytes':len(blob),'auditedReportSummaryManifestMatch':True,'auditedRunnerFilesMatch':runner,'memberHashes':memberHashes})
(root/'committed-archive-proof.json').write_text(json.dumps(records,indent=2)+'\n');print(json.dumps([{k:v for k,v in r.items() if k!='memberHashes'} for r in records],indent=2))
