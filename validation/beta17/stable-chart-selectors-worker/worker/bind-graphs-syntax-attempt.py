from pathlib import Path
import json,hashlib,tarfile
r=Path('/private/tmp/openui-charts-w1-evidence');pro=json.loads((r/'artifact-provenance.json').read_text());archives={}
for arm,folder in [('baseline','baseline-archive'),('candidate','candidate-final')]:
 with tarfile.open(next((r/folder).glob('*.tgz')))as t:archives[arm]={m.name:t.extractfile(m).read()for m in t.getmembers()if m.isfile()}
builds=[(x['arm'],'small-'+x['name'],Path(x['out']),'stdin.js',True)for x in json.loads((r/'small-build-index.json').read_text())]
for arm in ['baseline','candidate']:
 for label,entry in [('browser','fixture.js'),('signed','stdin.js'),('shared','shared-fixture.js')]:builds.append((arm,label,r/(arm+'-'+label),entry,False))
rows=[]
for arm,label,d,entryName,isFinal in builds:
 meta=d/'metafile.json';m=json.loads(meta.read_text());outputs=m['outputs'];entry=next(k for k in outputs if k.endswith('/'+entryName));reached=set();static=set()
 def walk(k,target,dynamic):
  if k in target:return
  target.add(k)
  for imp in outputs[k].get('imports',[]):
   if not imp.get('external')and(dynamic or imp['kind']!='dynamic-import'):
    assert imp['path']in outputs,imp
    walk(imp['path'],target,dynamic)
 walk(entry,reached,True);walk(entry,static,False)
 packageInputs={}
 for name,v in m['inputs'].items():
  marker='/@openuidev/react-components/'
  if marker not in name:continue
  member='package/'+name.split(marker,1)[1];raw=archives[arm][member];assert len(raw)==v['bytes'],(name,len(raw),v['bytes']);actual=r/(arm+'-consumer')/name
  if actual.exists():assert actual.read_bytes()==raw,name
  packageInputs[name]={'archiveMember':member,'sha256':hashlib.sha256(raw).hexdigest(),'currentlyReadable':actual.exists()}
 goober=[k for k in m['inputs']if '/node_modules/goober/'in k and k.endswith('.js')];assert len(goober)==1,(label,goober)
 css=outputs[entry].get('cssBundle');outHashes={}
 for k,v in outputs.items():
  p=d/Path(k).name;raw=p.read_bytes();assert len(raw)==v['bytes'],k;outHashes[k]={'sha256':hashlib.sha256(raw).hexdigest(),'bytes':len(raw),'entryReachable':k in reached,'staticReachable':k in static}
 rows.append({'arm':arm,'label':label,'metafileSHA256':hashlib.sha256(meta.read_bytes()).hexdigest(),'runtimeArchiveSHA256':pro['baselineArchiveSHA256']if arm=='baseline'else(pro['finalArchiveSHA256']if isFinal else pro['testedArchiveSHA256']),'candidateHistoricalRuntimeByteIdenticalToFinal':arm=='candidate'and not isFinal,'singleGooberOrigin':goober,'emittedOutputs':len(outputs),'reachableOutputs':len(reached),'staticReachableOutputs':len(static),'entry':entry,'staticJSBytes':sum(outputs[k]['bytes']for k in static if k.endswith('.js')),'allReachableJSBytes':sum(outputs[k]['bytes']for k in reached if k.endswith('.js')),'entryCSSBytes':outputs[css]['bytes']if css else0,'packageInputs':packageInputs,'outputBindings':outHashes})
(r/'graph-bindings.json').write_text(json.dumps({'scope':'20 actual fixture builds. Emission is not loading; dynamic reachability is not eager loading. Package input hashes bind archive members. Historical v1 payload identical to final exceptREADME; original paths retained, no resolver introduced.','rows':rows},indent=2)+'\n')
summary=[]
for label in sorted({x['label']for x in rows}):
 a=next(x for x in rows if x['arm']=='baseline'and x['label']==label);b=next(x for x in rows if x['arm']=='candidate'and x['label']==label);summary.append({'fixture':label,'baselineStaticJSBytes':a['staticJSBytes'],'candidateStaticJSBytes':b['staticJSBytes'],'staticDeltaBytes':b['staticJSBytes']-a['staticJSBytes'],'allReachableDeltaBytes':b['allReachableJSBytes']-a['allReachableJSBytes'],'entryCSSBytesUnchanged':a['entryCSSBytes']==b['entryCSSBytes'],'reachableOutputCountUnchanged':a['reachableOutputs']==b['reachableOutputs']})
(r/'graph-summary.json').write_text(json.dumps(summary,indent=2)+'\n');print('Bound',len(rows),'builds; singleGoober origin and archive input/output hashes PASS');print(json.dumps(summary))
