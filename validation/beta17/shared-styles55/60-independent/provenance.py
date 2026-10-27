from pathlib import Path
import json,hashlib,tarfile,subprocess,posixpath,re,collections
p=Path('/private/tmp/openui-styles60-evidence');o=Path('/private/tmp/openui-styles-independent-verification/ticket60');src=Path('/private/tmp/openui-common-styles');sha=lambda b:hashlib.sha256(b).hexdigest();git=lambda *a:subprocess.check_output(['git',*a],cwd=src)
head=git('rev-parse','HEAD').decode().strip();assert head=='c1aaf994d5c0fbfb56b83685221eeea9b409e57c' and not git('status','--porcelain');assert git('diff','--name-only','67369bc07261c726cdc01f065b6e9b0fa70b3eab',head).decode().strip()=='packages/react-components/README.md'
archives={}
for arm,f,expected in [('baseline',Path('/private/tmp/openui-styles57-evidence/baseline/openuidev-react-components-0.0.0-beta.0.tgz'),'2ae11b4e46a6846bbc7403c70fe51bb8cd40b3b90d4ae39cf4f4dfe1d12a3294'),('candidate',p/'candidate/openuidev-react-components-0.0.0-beta.0.tgz','1db41852f9e5aa11ccbfe5a56cdb3d00c8ad753ad5e73cb19bdf4832e7f7b957'),('accepted59',Path('/private/tmp/openui-styles59-evidence/candidate/openuidev-react-components-0.0.0-beta.0.tgz'),'5d88d8a440a865ec7b3395a2b1888a8f4e288bb32f9efbb6b7565a4cd1b4ea9f')]:
 assert sha(f.read_bytes())==expected
 with tarfile.open(f) as tf:members={x.name:tf.extractfile(x).read() for x in tf if x.isfile()}
 archives[arm]={'path':str(f),'sha256':expected,'members':members}
new=archives['candidate']['members'];old=archives['accepted59']['members'];byteDiff=[n for n in sorted(set(new)|set(old)) if new.get(n)!=old.get(n)];assert len(byteDiff)==21
# Evidence-only logical path comparison; actual archive bytes remain untouched.
canonical=lambda n:n.replace('/openui-common-styles/node_modules/','/node_modules/')
oldNames={canonical(n):n for n in old};newNames={canonical(n):n for n in new};oldC={canonical(n):v for n,v in old.items()};newC={canonical(n):v for n,v in new.items()};assert set(oldC)==set(newC)
logical=[]
for n in oldC:
 a,b=oldC[n],newC[n]
 if a==b:continue
 if n.endswith('.map'):
  aa=json.loads(a);bb=json.loads(b);aa.pop('sources',None);bb.pop('sources',None);assert aa==bb,n
 elif n.endswith(('.mjs','.cjs')):
  def normalize(x,actualName,members):
   text=x.decode()
   text='\n'.join(line for line in text.splitlines() if not line.startswith('//#region ') and not line.startswith('//# sourceMappingURL='))
   def target(m):
    rel=m.group(2);resolved=posixpath.normpath(posixpath.join(posixpath.dirname(actualName),rel));assert resolved in members,(actualName,rel,resolved)
    return m.group(1)+'ARCHIVE:'+canonical(resolved)+m.group(1)
   return re.sub(r'([\'\"])(\.{1,2}/[^\'\"]+)\1',target,text)
  assert normalize(a,oldNames[n],old)==normalize(b,newNames[n],new),n
 else:logical.append(n)
assert logical==['package/README.md'],logical
owned={}
for n,b in new.items():
 if n.endswith('.map'):
  m=json.loads(b)
  for s,c in zip(m.get('sources',[]),m.get('sourcesContent',[])):
   rel=posixpath.normpath(posixpath.join(posixpath.dirname(n),s))
   if rel.startswith('package/src/'):
    f=rel.removeprefix('package/');assert (src/'packages/react-components'/f).read_bytes()==c.encode();owned[f]=sha(c.encode())
assert len(owned)==371
builds=[]
for arm,consumer in [('baseline',Path('/private/tmp/openui-styles57-evidence/consumer')),('candidate',p/'consumer')]:
 members=archives[arm]['members']; installed=consumer/'node_modules/@openuidev/react-components'
 for n,b in members.items():assert (installed/n.removeprefix('package/')).read_bytes()==b,n
 for label in ['browser','small-button','small-input','small-controls','small-buttons','small-form','small-tags','small-shared']:
  directory=p/(arm+'-'+label);m=json.loads((directory/'metafile.json').read_text());gs=[x for x in m['inputs'] if '/goober/dist/' in x];assert len(gs)==1,gs
  for n in m['inputs']:
   if '/@openuidev/react-components/' in n:assert (consumer/n).read_bytes()==members['package/'+n.split('/@openuidev/react-components/',1)[1]],n
  outputs={};contrib={}
  for n,x in m['outputs'].items():
   f=(consumer/n).resolve();outputs[f.name]=sha(f.read_bytes())
   if n.endswith('.js'):
    for k,v in x.get('inputs',{}).items():contrib[k]=contrib.get(k,0)+v['bytesInOutput']
  relevant=[k for k,v in contrib.items() if v>0];unrelated=[]
  if label!='browser':
   unrelated=[k for k in relevant if re.search(r'components/Charts|/d3-|/katex/|react-syntax-highlighter|components/Modal',k)];assert not unrelated
   if arm=='candidate':assert any(k.endswith('/styles/defaults.mjs') for k in relevant)
   if arm=='candidate' and label in ['small-buttons','small-form','small-tags','small-shared']:assert any(k.endswith('/styles/base.mjs') for k in relevant)
  builds.append({'arm':arm,'label':label,'singleGoober':gs,'outputs':outputs,'unrelatedJS':unrelated})
# Independently scan every tracked component source rather than relying on worker inventory.
def expressions(text):
 out=[]
 for m in re.finditer(r'var\(\s*--openui-[\w-]+\s*,',text):
  i=m.end();depth=1;quote=None
  while depth:
   c=text[i]
   if quote:
    if c=='\\':i+=2;continue
    if c==quote:quote=None
   elif c in ['"',"'"]:quote=c
   elif c=='(':depth+=1
   elif c==')':depth-=1
   i+=1
  out.append(text[m.start():i])
 return collections.Counter(out)
files=git('ls-tree','-r','--name-only',head,'packages/react-components/src').decode().splitlines();fallbacks=[]
for f in files:
 if not f.endswith(('.ts','.tsx')):continue
 current=(src/f).read_text();e=expressions(current)
 if not e:continue
 previous=git('show','d1292715028f816bd6a0dcf92766ec7dd15350f4:'+f).decode();assert expressions(previous)==e,f
 fallbacks.append({'file':f,'count':sum(e.values())})
assert len(fallbacks)==95 and sum(x['count'] for x in fallbacks)==1444
summary={'sourceHead':head,'packageTree':git('rev-parse',head+':packages/react-components').decode().strip(),'archives':{a:{'path':x['path'],'sha256':x['sha256']} for a,x in archives.items()},'byteDifferencesFrom59':byteDiff,'logicalDifference':['package/README.md'],'ownedSources':owned,'builds':builds,'fallbackFiles':fallbacks,'fallbackCount':1444,'sourceDifferenceFrom59':'README only'}
(o/'provenance.json').write_text(json.dumps(summary,indent=2)+'\n');print(json.dumps({'archiveBindings':'pass','ownedSources':371,'differing59Entries':21,'logicalDifference':'README only','frozenBuilds':16,'unchangedFallbackExpressions':1444,'fallbackFiles':95}))
