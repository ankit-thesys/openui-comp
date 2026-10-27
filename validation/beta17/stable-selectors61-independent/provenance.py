from pathlib import Path
import json,hashlib,tarfile,subprocess,posixpath,re
p=Path('/private/tmp/openui-selectors61-evidence');o=Path('/private/tmp/openui-styles-independent-verification/ticket61');src=Path('/private/tmp/openui-selectors61');sha=lambda b:hashlib.sha256(b).hexdigest();git=lambda *a:subprocess.check_output(['git',*a],cwd=src)
head=git('rev-parse','HEAD').decode().strip();assert head=='1c3833a045c4c66de92b69413a3824eca1798fcd' and not git('status','--porcelain');changes=git('diff','--name-only','c1aaf994d5c0fbfb56b83685221eeea9b409e57c',head).decode().splitlines();assert len(changes)==4
archives={}
for arm,f,expected in [('baseline',Path('/private/tmp/openui-styles60-evidence/candidate/openuidev-react-components-0.0.0-beta.0.tgz'),'1db41852f9e5aa11ccbfe5a56cdb3d00c8ad753ad5e73cb19bdf4832e7f7b957'),('candidate',p/'candidate-final/openuidev-react-components-0.0.0-beta.0.tgz','0dad61fb4c48477f0496f819bef2f131908a3789ec184cefb7fe8de94c68d6a5'),('testedV3',p/'candidate-v3/openuidev-react-components-0.0.0-beta.0.tgz','729d8b76864440658526cab6480260fe0ea61a2fab4bad2dab9d4622af32ca1d')]:
 assert sha(f.read_bytes())==expected
 with tarfile.open(f) as tf:members={x.name:tf.extractfile(x).read() for x in tf if x.isfile()}
 archives[arm]={'archive':str(f),'sha256':expected,'members':members}
a=archives['candidate']['members'];b=archives['testedV3']['members'];assert sorted(n for n in set(a)|set(b) if a.get(n)!=b.get(n))==['package/README.md']
owned={}
for n,b in a.items():
 if n.endswith('.map'):
  m=json.loads(b)
  for s,c in zip(m.get('sources',[]),m.get('sourcesContent',[])):
   f=posixpath.normpath(posixpath.join(posixpath.dirname(n),s))
   if f.startswith('package/src/'):
    rel=f.removeprefix('package/');assert (src/'packages/react-components'/rel).read_bytes()==c.encode();owned[rel]=sha(c.encode())
assert len(owned)==371
before=archives['baseline']['members'];decl=[n for n in a if n.endswith(('.d.ts','.d.cts','.d.mts'))];assert len(decl)==440 and all(before.get(n)==a[n] for n in decl)
# All fallback-bearing files are untouched; reuse exact expression list from independently scanned60.
f=json.loads(Path('/private/tmp/openui-styles-independent-verification/ticket60/provenance.json').read_text())['fallbackFiles'];assert len(f)==95 and sum(x['count'] for x in f)==1444
for row in f:assert git('show','c1aaf994d5c0fbfb56b83685221eeea9b409e57c:'+row['file'])==(src/row['file']).read_bytes()
builds=[]
for arm,consumer in [('baseline',Path('/private/tmp/openui-styles60-evidence/consumer')),('candidate',p/'consumer')]:
 members=archives[arm]['members'];installed=consumer/'node_modules/@openuidev/react-components'
 for n,b in members.items():assert (installed/n.removeprefix('package/')).read_bytes()==b,n
 for label in ['browser','small-button','small-icon','small-pair','small-shared','small-lazy']:
  m=json.loads((p/(arm+'-'+label)/'metafile.json').read_text());goober=[x for x in m['inputs'] if '/goober/dist/' in x];assert len(goober)==1;outputs={};positive={}; byAbs={(consumer/n).resolve():n for n in m['outputs']}; entry=next(n for n in m['outputs'] if Path(n).name=='stdin.js'); reachable=set(); pending=[entry]
  while pending:
   n=pending.pop()
   if n in reachable:continue
   reachable.add(n)
   for link in m['outputs'][n].get('imports',[]):
    if link.get('external'):continue
    target=link['path']
    if target in m['outputs']:pending.append(target)
    else:
     resolved=((consumer/n).resolve().parent/target).resolve()
     if resolved in byAbs:pending.append(byAbs[resolved])
  for n in m['inputs']:
   if '/@openuidev/react-components/' in n:
    assert (consumer/n).read_bytes()==members['package/'+n.split('/@openuidev/react-components/',1)[1]],n
  for n,x in m['outputs'].items():
   outputs[n]=sha((consumer/n).resolve().read_bytes())
   if n in reachable and n.endswith('.js'):
    for k,v in x.get('inputs',{}).items():positive[k]=positive.get(k,0)+v['bytesInOutput']
  positive={k:v for k,v in positive.items() if v>0}
  if label.startswith('small-'):
   assert not [k for k in positive if re.search(r'components/Charts|/d3-|/katex/|react-syntax-highlighter|components/Modal',k)]
   if label=='small-button':assert not [k for k in positive if '/components/IconButton/' in k]
   if label=='small-icon':assert not [k for k in positive if '/components/Button/' in k]
   if arm=='candidate' and label!='small-lazy':assert any('/styles/defaults.mjs' in k for k in positive)
   if arm=='candidate' and label=='small-shared':assert any('/styles/base.mjs' in k for k in positive)
  builds.append({'arm':arm,'label':label,'singleGoober':goober,'outputHashes':outputs,'reachableOutputs':sorted(reachable),'positiveReachableJSModules':positive,'emittedOutputCount':len(m['outputs'])})
result={'head':head,'packageTree':git('rev-parse',head+':packages/react-components').decode().strip(),'sourceChanges':changes,'archiveBindings':{k:{n:v for n,v in x.items() if n!='members'} for k,x in archives.items()},'finalVsTestedV3':['package/README.md'],'ownedSourceCount':371,'ownedSources':owned,'unchangedDeclarations':440,'unchangedFallbackExpressions':1444,'fallbackFiles':95,'builds':builds};(o/'provenance.json').write_text(json.dumps(result,indent=2)+'\n');print(json.dumps({'frozenSource':head,'archivesInstalledAndInputs':'pass','embeddedSources':371,'declarations':440,'fallbacks':1444,'boundBuilds':12,'singleImportsOtherPilotPruned':True}))
