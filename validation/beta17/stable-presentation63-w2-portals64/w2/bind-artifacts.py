from pathlib import Path
import json,tarfile,hashlib,posixpath,subprocess
r=Path('/private/tmp/openui-selectors-w2-evidence');repo=Path('/private/tmp/openui-selectors-w2');base='1c3833a045c4c66de92b69413a3824eca1798fcd';commit=subprocess.check_output(['git','rev-parse','HEAD'],cwd=repo,text=True).strip();arms=[];contents={}
for arm,archive,consumer in [('baseline',Path('/private/tmp/openui-selectors61-evidence/candidate-final/openuidev-react-components-0.0.0-beta.0.tgz'),Path('/private/tmp/openui-selectors61-evidence/consumer')),('candidate',r/'candidate-v2/openuidev-react-components-0.0.0-beta.0.tgz',r/'consumer-v2')]:
 bound={};memberhash={};installed=(consumer/'node_modules/@openuidev/react-components').resolve();members={};vendor=[]
 with tarfile.open(archive) as tf:
  for m in tf.getmembers():
   if not m.isfile():continue
   data=tf.extractfile(m).read();rel=m.name.removeprefix('package/');assert (installed/rel).read_bytes()==data,(arm,rel);memberhash[rel]=hashlib.sha256(data).hexdigest();members[rel]=data
   if not m.name.endswith('.map'):continue
   sm=json.loads(data)
   for src,text in zip(sm.get('sources',[]),sm.get('sourcesContent',[])):
    if text is None:continue
    path=posixpath.normpath(posixpath.join(posixpath.dirname(m.name),sm.get('sourceRoot',''),src))
    if not path.startswith('package/src/'):
     assert 'node_modules/' in path,path
     vendor.append(path);continue
    relsrc=path.removeprefix('package/');git=commit if arm=='candidate' else base;actual=subprocess.check_output(['git','show',git+':packages/react-components/'+relsrc],cwd=repo);assert actual==text.encode(),(arm,relsrc);bound[relsrc]=hashlib.sha256(actual).hexdigest()
 contents[arm]=members;arms.append({'arm':arm,'archive':str(archive),'archiveSha256':hashlib.sha256(archive.read_bytes()).hexdigest(),'consumer':str(consumer),'installedPackage':str(installed),'installedFilesMatched':len(memberhash),'ownedEmbeddedSources':len(bound),'sourceBindings':bound,'memberHashes':memberhash,'vendorSourcePaths':sorted(set(vendor))})
changes=[p for p in contents['candidate'] if p.endswith(('.d.mts','.d.cts')) and contents['candidate'][p]!=contents['baseline'].get(p)]
(r/'artifact-provenance.json').write_text(json.dumps({'baseCommit':base,'candidateCommit':commit,'arms':arms,'changedDeclarationFiles':changes,'publicEntryDeclarationsEqual':all(contents['candidate'][p]==contents['baseline'][p] for p in ['dist/index.d.mts','dist/index.d.cts'])},indent=2)+'\n');print(json.dumps({'archives':[{'arm':x['arm'],'sha':x['archiveSha256'],'files':x['installedFilesMatched'],'ownedSources':x['ownedEmbeddedSources']}for x in arms],'changedDeclarations':len(changes),'publicEntryEqual':all(contents['candidate'][p]==contents['baseline'][p] for p in ['dist/index.d.mts','dist/index.d.cts'])},indent=2))
