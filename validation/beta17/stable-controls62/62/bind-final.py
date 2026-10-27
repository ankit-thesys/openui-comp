import hashlib,json,pathlib,posixpath,subprocess,tarfile
root=pathlib.Path('/private/tmp/openui-selectors62-evidence');repo='/private/tmp/openui-selectors62-frozen'
archive=next((root/'candidate-final').glob('*.tgz'));tested=next((root/'candidate-controls').glob('*.tgz'))
def members(p):
 with tarfile.open(p) as t:return{m.name:t.extractfile(m).read() for m in t.getmembers() if m.isfile()}
a,b=members(tested),members(archive);diff=sorted(k for k in a.keys()|b.keys() if a.get(k)!=b.get(k));assert diff==['package/README.md'],diff
owned={}
for name,data in b.items():
 if not name.endswith('.map'):continue
 j=json.loads(data)
 for src,content in zip(j.get('sources',[]),j.get('sourcesContent',[])):
  p=posixpath.normpath(posixpath.join(posixpath.dirname(name),src))
  if p.startswith('package/src/'):
   file='packages/react-components/'+p[len('package/'):];expected=subprocess.check_output(['git','show','HEAD:'+file],cwd=repo);assert content.encode()==expected,(name,file);owned[file]=hashlib.sha256(expected).hexdigest()
report={'sourceCommit':subprocess.check_output(['git','rev-parse','HEAD'],cwd=repo,text=True).strip(),'packageTree':subprocess.check_output(['git','rev-parse','HEAD:packages/react-components'],cwd=repo,text=True).strip(),'archive':str(archive),'archiveSHA256':hashlib.sha256(archive.read_bytes()).hexdigest(),'testedControlsArchiveSHA256':hashlib.sha256(tested.read_bytes()).hexdigest(),'finalVsTestedEntryDifferences':diff,'runtimePayloadByteIdenticalToTestedControls':True,'ownedSourceCount':len(owned),'ownedSourceBindings':owned,'archiveMemberSHA256':{k:hashlib.sha256(v).hexdigest() for k,v in b.items()}}
(root/'artifact-provenance.json').write_text(json.dumps(report,indent=2)+'\n');print({k:v for k,v in report.items() if k not in ['ownedSourceBindings','archiveMemberSHA256']})
p=root/'consumer/package.json';j=json.loads(p.read_text());j['dependencies']['@openuidev/react-components']='file:'+str(archive);p.write_text(json.dumps(j,indent=2)+'\n')
