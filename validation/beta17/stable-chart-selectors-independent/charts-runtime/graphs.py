from pathlib import Path
import json,hashlib,tarfile,posixpath
r=Path('/private/tmp/openui-styles-independent-verification/charts-runtime');ev=Path('/private/tmp/openui-charts-w1-evidence');sha=lambda b:hashlib.sha256(b).hexdigest();rows=[];worker=json.loads((ev/'graph-bindings.json').read_text())['rows'];assert len(worker)==20
for arm in ['baseline','candidate']:
 consumer=ev/(arm+'-consumer');arc=ev/('candidate-final'if arm=='candidate'else'baseline-archive')/'openuidev-react-components-0.0.0-beta.0.tgz'
 with tarfile.open(arc)as t:members={n.name:t.extractfile(n).read()for n in t if n.isfile()}
 for label in ['browser','shared','signed']+['small-'+k for k in ['button','condensed','empty','lazy','mini','pie','stacked']]:
  folder=ev/(arm+'-'+label);raw=(folder/'metafile.json').read_bytes();m=json.loads(raw);w=next(x for x in worker if x['arm']==arm and x['label']==label);assert sha(raw)==w['metafileSHA256'];go=[n for n in m['inputs']if '/goober/dist/'in n];assert len(go)==1;owned={}
  for n in m['inputs']:
   if '/@openuidev/react-components/'in n:
    b=(consumer/n).read_bytes();assert b==members['package/'+n.split('/@openuidev/react-components/',1)[1]],(label,n);owned[n]=sha(b)
  hashes={n:sha((consumer/n).resolve().read_bytes())for n in m['outputs']}
  for n,h in hashes.items():
   expected=w['outputBindings'][n];expected=expected['sha256']if isinstance(expected,dict)else expected;assert h==expected,(n,h,expected)
  outs=m['outputs'];entry=w['entry'];assert entry in outs
  def reachable(dynamic):
   seen=set();todo=[entry]
   while todo:
    n=todo.pop()
    if n in seen:continue
    seen.add(n)
    for i in outs[n].get('imports',[]):
     if i.get('external')or(not dynamic and i['kind']=='dynamic-import'):continue
     q=i['path']
     if q not in outs:q=posixpath.normpath(posixpath.join(posixpath.dirname(n),q))
     if q in outs:todo.append(q)
   return seen
  static=reachable(False);allg=reachable(True);sb=sum(outs[n]['bytes']for n in static if n.endswith('.js'));ab=sum(outs[n]['bytes']for n in allg if n.endswith('.js'));assert sb==w['staticJSBytes']and ab==w['allReachableJSBytes']and len(static)==w['staticReachableOutputs']and len(allg)==w['reachableOutputs'];rows.append({'arm':arm,'label':label,'metafileSHA256':sha(raw),'entry':entry,'singleGooberOrigin':go,'installedPackageInputHashes':owned,'outputHashes':hashes,'staticJSBytes':sb,'allReachableJSBytes':ab,'staticOutputCount':len(static),'allReachableOutputCount':len(allg),'emittedOutputs':len(outs)})
(r/'graphs-results.json').write_text(json.dumps({'scope':'Independent file hashes, archive input equality and graph traversal. No browser download, timing or memory inference.','rows':rows},indent=2));print('20 existing graph/input/output bindings independently verified.')
