from pathlib import Path
import json,hashlib,tarfile,shutil
r=Path('/private/tmp/ticket49-release-verification');out=r/'handoff';p=Path('/private/tmp/ticket47-final-provenance.json');prov=json.loads(p.read_text()); assert prov['sourceCommit']=='9006a2066f93359c991eeafcf9d812db3ae78450'
checks={}
for file,want in prov['files'].items():
 got=hashlib.sha256(Path(file).read_bytes()).hexdigest();assert got==want,(file,got,want);checks[file]=got
archives=[(Path(prov['archivePath']),prov['files'][prov['archivePath']]),(Path('/private/tmp/ticket47-artifacts/openuidev-react-components-0.0.0-beta.0.tgz'),prov['coreSha256'])];results=[]
for archive,want in archives:
 assert hashlib.sha256(archive.read_bytes()).hexdigest()==want
 with tarfile.open(archive) as t:
  names=t.getnames();manifest=json.load(t.extractfile('package/package.json'))
  for scope in ['dependencies','devDependencies','peerDependencies','optionalDependencies']:
   assert all(not v.startswith(('workspace:','catalog:')) for v in manifest.get(scope,{}).values()),scope
  assert not any('/evidence/' in n or '/.test-results/' in n for n in names)
  if manifest['name']=='@openuidev/chat-kit':
   assert not any('/node_modules/' in n for n in names)
   assert set(manifest['exports'])=={'.','./libs'};assert manifest['peerDependencies']['@openuidev/react-components']=='0.0.0-beta.0';assert '@openuidev/react-components' not in manifest.get('dependencies',{})
   assert not manifest.get('peerDependenciesMeta',{}).get('@openuidev/react-components',{}).get('optional',False)
   for entry in manifest['exports'].values():
    for condition in ['import','require']:
     for v in entry[condition].values():assert 'package/'+v.removeprefix('./') in names,v
   assert all(n.startswith('package/dist/') or n in ['package/package.json','package/README.md','package/LICENSE'] for n in names)
  results.append({'archive':str(archive),'sha256':want,'manifest':manifest,'fileCount':len(names),'files':names})
(out/'packed-artifact-inspection.json').write_text(json.dumps(results,indent=2));(out/'ticket47-evidence-hashes-verified.json').write_text(json.dumps(checks,indent=2));shutil.copyfile(p,out/p.name)
for name in ['ticket47-resume-packed.log','ticket47-packed-types.log','ticket47-bundle-results.json','ticket47-browser-results.json','ticket47-registry-schema.json']:
 shutil.copyfile(Path('/private/tmp')/name,out/name)
plan=json.loads((out/'release-plan.json').read_text());assert len(plan['releases'])==1 and plan['releases'][0]['name']=='@openuidev/chat-kit';assert plan['releases'][0]['oldVersion']=='0.0.0-beta.0';assert plan['releases'][0]['newVersion']=='0.0.0'
print('PASS: final native archives, all worker evidence hashes, native manifest/export/file-set contracts, existing independent release plan.')
