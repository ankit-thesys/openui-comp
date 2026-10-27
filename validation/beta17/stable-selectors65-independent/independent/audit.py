from pathlib import Path
import json,hashlib,tarfile,subprocess,posixpath,re,collections
p=Path('/private/tmp/openui-selectors65-evidence');o=Path('/private/tmp/openui-styles-independent-verification/ticket65');src=Path('/private/tmp/openui-selectors65-frozen');base='1c3833a045c4c66de92b69413a3824eca1798fcd';head='75f69041891147d52dc0f0d2c4b21a048e575aa8';git=lambda *a:subprocess.check_output(['git',*a],cwd=src);sha=lambda b:hashlib.sha256(b).hexdigest();assert git('rev-parse','HEAD').decode().strip()==head and not git('status','--porcelain')
archives={}
for arm,f,expected,consumer in [('baseline',Path('/private/tmp/openui-selectors61-evidence/candidate-final/openuidev-react-components-0.0.0-beta.0.tgz'),'0dad61fb4c48477f0496f819bef2f131908a3789ec184cefb7fe8de94c68d6a5',Path('/private/tmp/openui-selectors61-evidence/consumer')),('candidate',p/'candidate-v1/openuidev-react-components-0.0.0-beta.0.tgz','d2a4b51255d745f41a7b51820ac0ec55ef5db8ff2b6f8d91ab43bade7766d037',p/'consumer')]:
 assert sha(f.read_bytes())==expected
 with tarfile.open(f) as tf:m={x.name:tf.extractfile(x).read() for x in tf if x.isfile()}
 for n,b in m.items():assert (consumer/'node_modules/@openuidev/react-components'/n.removeprefix('package/')).read_bytes()==b,n
 archives[arm]={'path':str(f),'sha256':expected,'consumer':consumer,'members':m,'installedFiles':len(m)}
owned={}
for n,b in archives['candidate']['members'].items():
 if n.endswith('.map'):
  m=json.loads(b)
  for s,c in zip(m.get('sources',[]),m.get('sourcesContent',[])):
   rel=posixpath.normpath(posixpath.join(posixpath.dirname(n),s))
   if rel.startswith('package/src/'):
    f=rel.removeprefix('package/');assert (src/'packages/react-components'/f).read_bytes()==c.encode();owned[f]=sha(c.encode())
assert len(owned)==371
m=archives['candidate']['members'];decl=[n for n in m if n.endswith(('.d.ts','.d.cts','.d.mts'))];assert len(decl)==440 and all(m[n]==archives['baseline']['members'].get(n) for n in decl)
def exprs(text):
 out=[]
 for m in re.finditer(r'var\(\s*--openui-[\w-]+\s*,',text):
  i=m.end();depth=1;q=None
  while depth:
   c=text[i]
   if q:
    if c=='\\':i+=2;continue
    if c==q:q=None
   elif c in ['"',"'"]:q=c
   elif c=='(':depth+=1
   elif c==')':depth-=1
   i+=1
  out.append(text[m.start():i])
 return out
def normal(s):
 out=[];q=None;i=0;pending=False
 while i<len(s):
  c=s[i]
  if q:
   out.append(c)
   if c=='\\' and i+1<len(s):i+=1;out.append(s[i])
   elif c==q:q=None
  elif c.isspace():pending=True
  else:
   if pending:out.append(' ');pending=False
   out.append(c)
   if c in ['"',"'"]:q=c
  i+=1
 return ''.join(out).strip()
files=git('ls-tree','-r','--name-only',base,'packages/react-components/src').decode().splitlines();fb=[];rawdif=[]
for f in files:
 if not f.endswith(('.ts','.tsx')):continue
 old=git('show',base+':'+f).decode();new=(src/f).read_text();a,b=exprs(old),exprs(new);assert collections.Counter(map(normal,a))==collections.Counter(map(normal,b)),f
 if a:
  fb.append({'file':f,'count':len(b),'rawEqual':collections.Counter(a)==collections.Counter(b)})
  if collections.Counter(a)!=collections.Counter(b):rawdif.append({'file':f,'before':a,'after':b})
assert len(fb)==95 and sum(x['count'] for x in fb)==1444 and len(rawdif)==6
(o/'fallback-formatting-six-files.json').write_text(json.dumps(rawdif,indent=2)+'\n')
# Stage production bytes remain identical in final integration.
stages=[('controls','659b495700998b5170e0eca4413a6cdae5a2d966','1c3833a045c4c66de92b69413a3824eca1798fcd'),('W1portals','1031e915c368c6f041dcded03fe5c41dd2f073c1','659b495700998b5170e0eca4413a6cdae5a2d966'),('W2','d1e8a05d035b66453d58953faf7d9fabacbaa8e8','1c3833a045c4c66de92b69413a3824eca1798fcd')];stageBindings=[]
for name,rev,parent in stages:
 changed=git('diff','--name-only',parent,rev,'--','packages/react-components/src').decode().splitlines()
 for f in changed:assert git('show',rev+':'+f)==(src/f).read_bytes(),(name,f)
 stageBindings.append({'stage':name,'head':rev,'files':changed,'sourceBytesIdenticalInFinal':True})
changes=git('diff','--name-only',base,head).decode().splitlines();assert all(f.startswith('packages/react-components/') for f in changes)
for prefix in ['src/components/Charts','src/components/EditableTable','src/components/Button','src/components/IconButton','src/components/ThemeProvider','src/styles','package.json']:
 assert not git('diff','--name-only',base,head,'--','packages/react-components/'+prefix).strip(),prefix
# Bind all fixture package inputs plus frozen outputs. Reuse cache to avoid re-reading identical package files.
cache={};builds=[]
for fixture,label in [('controls','browser'),('portals','browser'),('presentation','browser'),('presentation','extra')]+[('presentation','small-'+n) for n in ['Buttons','TagBlock','Table','CodeBlock','TextContentWrapper','Tabs','Sources','Citation']]:
 for arm in ['baseline','candidate']:
  folder=p/fixture/(arm+'-'+label);raw=(folder/'metafile.json').read_bytes();meta=json.loads(raw);consumer=archives[arm]['consumer'];members=archives[arm]['members'];goober=[x for x in meta['inputs'] if '/goober/dist/' in x];assert len(goober)==1
  for n in meta['inputs']:
   if '/@openuidev/react-components/' in n:
    if (arm,n) not in cache:
     b=(consumer/n).read_bytes();assert b==members['package/'+n.split('/@openuidev/react-components/',1)[1]],n;cache[(arm,n)]=sha(b)
  outputs={n:sha((consumer/n).resolve().read_bytes()) for n in meta['outputs']}
  builds.append({'fixture':fixture,'label':label,'arm':arm,'metafileSHA256':sha(raw),'singleGoober':goober,'outputHashes':outputs})
result={'sourceHead':head,'packageTree':git('rev-parse',head+':packages/react-components').decode().strip(),'archives':{a:{k:str(v) if isinstance(v,Path) else v for k,v in x.items() if k!='members'} for a,x in archives.items()},'ownedSources':owned,'declarationsUnchanged':440,'fallbackExpressions':1444,'fallbackFiles':fb,'formattingOnlyFiles':[x['file'] for x in rawdif],'normalization':'Collapse formatting whitespace outside quoted CSS strings only; preserve quoted bytes/escapes and space-separated values','stageBindings':stageBindings,'changedFiles':changes,'boundBuilds':builds};(o/'provenance.json').write_text(json.dumps(result,indent=2)+'\n');print(json.dumps({'source':head,'installedFiles':{a:x['installedFiles'] for a,x in archives.items()},'ownedSources':371,'declarations':440,'fallbacks':1444,'formattingOnlyFiles':len(rawdif),'stageBindings':'byte-identical','boundBuilds':len(builds)}))
