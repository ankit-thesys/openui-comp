from pathlib import Path
import json,hashlib,tarfile,posixpath
r=Path('/private/tmp/openui-styles-independent-verification/ticket65');p=Path('/private/tmp/openui-selectors65-evidence');base=Path('/private/tmp/openui-selectors61-evidence/consumer');sha=lambda x:hashlib.sha256(x).hexdigest();rows=[]
for arm in ['baseline','candidate']:
 consumer=base if arm=='baseline' else p/'consumer'
 arc=Path('/private/tmp/openui-selectors61-evidence/candidate-final/openuidev-react-components-0.0.0-beta.0.tgz') if arm=='baseline' else p/'candidate-v1/openuidev-react-components-0.0.0-beta.0.tgz'
 with tarfile.open(arc)as t:members={n.name:t.extractfile(n).read() for n in t if n.isfile()}
 for label,folder in [('boot',r/(arm+'-boot'))]+[(f,p/'presentation'/(arm+'-small-'+f))for f in ['Buttons','TagBlock','Table','CodeBlock','TextContentWrapper','Tabs','Sources','Citation']]:
  m=json.loads((folder/'metafile.json').read_text());outs=m['outputs'];entry=next(n for n,v in outs.items() if n.endswith('/stdin.js'));bound={}
  for n in m['inputs']:
   if '/@openuidev/react-components/'in n:
    b=(consumer/n).read_bytes();assert b==members['package/'+n.split('/@openuidev/react-components/',1)[1]];bound[n]=sha(b)
  def graph(dynamic):
   seen=set();pending=[entry]
   while pending:
    n=pending.pop()
    if n in seen:continue
    seen.add(n)
    for i in outs[n].get('imports',[]):
     if i.get('external')or(not dynamic and i['kind']=='dynamic-import'):continue
     q=i['path']
     if q not in outs:q=posixpath.normpath(posixpath.join(posixpath.dirname(n),q))
     if q in outs:pending.append(q)
   return seen
  static=graph(False);allg=graph(True);assert len(static)<=len(allg)<=len(outs)
  row={'arm':arm,'family':label,'entry':entry,'packageInputHashes':bound,'singleGoober':len([n for n in m['inputs'] if '/goober/dist/'in n])==1,'emittedOutputs':len(outs),'staticOutputs':len(static),'allReachableOutputs':len(allg),'staticJSBytes':sum(outs[n]['bytes']for n in static if n.endswith('.js')),'allReachableJSBytes':sum(outs[n]['bytes']for n in allg if n.endswith('.js')),'metafileSHA256':sha((folder/'metafile.json').read_bytes())}
  if label=='boot':row['outputHashes']={n:sha((consumer/n).resolve().read_bytes())for n in outs}
  rows.append(row)
(r/'independent-graphs.json').write_text(json.dumps({'scope':'Entry reachability separates dynamic from static; bytes are not download/timing/memory claims. Eager shared modules remain accepted limitation.','rows':rows},indent=2));print([(x['arm'],x['family'],x['staticJSBytes'],x['allReachableJSBytes'],x['singleGoober'])for x in rows])
