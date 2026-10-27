from pathlib import Path
import json,hashlib,posixpath
r=Path('/private/tmp/openui-selectors65-evidence/presentation');rows=[]
for item in json.load(open(r/'small-build-index.json')):
 d=Path(item['out']);m=json.load(open(d/'metafile.json'));outputs=m['outputs'];entry=next(k for k in outputs if k.endswith('/stdin.js'));reached=set();static=set()
 def walk(k,target,dynamic):
  if k in target:return
  target.add(k)
  for imp in outputs[k].get('imports',[]):
   if not imp.get('external') and (dynamic or imp['kind']!='dynamic-import'):
    assert imp['path'] in outputs,imp
    walk(imp['path'],target,dynamic)
 walk(entry,reached,True);walk(entry,static,False)
 owned={}
 for k in reached:
  for name,v in outputs[k].get('inputs',{}).items():
   if '/@openuidev/react-components/dist/' in name and v['bytesInOutput']>0:owned[name]=owned.get(name,0)+v['bytesInOutput']
 css=outputs[entry].get('cssBundle');assets={k:{'bytes':outputs[k]['bytes'],'sha256':hashlib.sha256((d/Path(k).name).read_bytes()).hexdigest()}for k in reached|({css}if css else set())}
 rows.append({'arm':item['arm'],'family':item['family'],'imports':item['imports'],'entry':entry,'emittedOutputs':len(outputs),'entryReachableOutputs':len(reached),'staticReachableOutputs':len(static),'jsStaticBytes':sum(outputs[k]['bytes']for k in static if k.endswith('.js')),'jsAllReachableBytes':sum(outputs[k]['bytes']for k in reached if k.endswith('.js')),'entryCssBytes':outputs[css]['bytes']if css else 0,'ownedInputs':owned,'artifactBindings':assets})
(r/'small-graph-bindings.json').write_text(json.dumps({'notes':'Entry-reachable graph, not all emitted files. Dynamic imports listed as reachable, not claimed eagerly loaded. CSS entry linked by ordinary consumer HTML. Pruning comparison is comparative, not zero-unused guarantee.','rows':rows},indent=2)+'\n')
print(json.dumps({'rows':len(rows),'sample':[{k:v for k,v in x.items()if k not in ['ownedInputs','artifactBindings']}for x in rows if x['family']in ['Separator','Tabs','CodeBlock']]}))
