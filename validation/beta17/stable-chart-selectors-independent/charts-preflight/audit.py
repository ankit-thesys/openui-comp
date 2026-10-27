from pathlib import Path
import json,re,hashlib,tarfile,posixpath,subprocess,collections
out=Path('/private/tmp/openui-styles-independent-verification/charts-preflight');src=Path('/private/tmp/openui-charts-w1');ev=Path('/private/tmp/openui-charts-w1-evidence');head='5e09b37c04a1a3be05b9447cf8b9effaf33a331f';base='75f69041891147d52dc0f0d2c4b21a048e575aa8';sha=lambda b:hashlib.sha256(b).hexdigest();git=lambda*a:subprocess.check_output(['git',*a],cwd=src)
assert git('rev-parse','HEAD').decode().strip()==head and not git('status','--porcelain').strip();tree=git('rev-parse',head+':packages/react-components').decode().strip();assert tree=='2c31eb88b05349b48717c389deab040ec532fc7f'
def arc(p,expected):
 assert sha(p.read_bytes())==expected
 with tarfile.open(p)as t:return{x.name:t.extractfile(x).read()for x in t if x.isfile()}
final=arc(ev/'candidate-final/openuidev-react-components-0.0.0-beta.0.tgz','b09f11e6aa2809f42f7aee5eb2c23bd7bf6c58904d4a935918044f039ff7dd71');tested=arc(ev/'candidate-combined-v1/openuidev-react-components-0.0.0-beta.0.tgz','ec56caf237bcd0355e1f87cae2ac6716a2d10ad789169069a53b82ad18758431');old=arc(Path('/private/tmp/openui-selectors65-evidence/candidate-v1/openuidev-react-components-0.0.0-beta.0.tgz'),'d2a4b51255d745f41a7b51820ac0ec55ef5db8ff2b6f8d91ab43bade7766d037');assert final.keys()==tested.keys()==old.keys();delta=[n for n in final if final[n]!=tested[n]];assert delta==['package/README.md'];installed={}
for arm,m in [('candidate',final),('baseline',old)]:
 consumer=ev/(arm+'-consumer');pkg=consumer/'node_modules/@openuidev/react-components'
 for n,b in m.items():assert (pkg/n.removeprefix('package/')).read_bytes()==b,(arm,n)
 installed[arm]={'consumer':str(consumer),'resolvedPackage':str(pkg.resolve()),'members':len(m)}
assert installed['candidate']['resolvedPackage']!=installed['baseline']['resolvedPackage'];owned={}
for n,b in final.items():
 if n.endswith('.map'):
  m=json.loads(b)
  for s,c in zip(m.get('sources',[]),m.get('sourcesContent',[])):
   f=posixpath.normpath(posixpath.join(posixpath.dirname(n),s))
   if f.startswith('package/src/'):
    rel='packages/react-components/'+f.removeprefix('package/');assert git('show',head+':'+rel)==c.encode(),rel;owned[rel]=sha(c.encode())
assert len(owned)==371;decl=[n for n in final if n.endswith(('.d.ts','.d.mts','.d.cts'))];assert len(decl)==440 and all(final[n]==old[n]for n in decl)
def norm(s):
 out=[];q=None;i=0;pending=False
 while i<len(s):
  c=s[i]
  if q:
   out.append(c)
   if c=='\\'and i+1<len(s):i+=1;out.append(s[i])
   elif c==q:q=None
  elif c.isspace():pending=True
  else:
   if pending:out.append(' ');pending=False
   out.append(c)
   if c in ['"',"'"]:q=c
  i+=1
 return ''.join(out).strip()
def block(s,start):
 i=start;depth=1;q=None
 while depth:
  c=s[i]
  if q:
   if c=='\\':i+=2;continue
   if c==q:q=None
  elif c in ['"',"'"]:q=c
  elif c=='{':depth+=1
  elif c=='}':depth-=1
  i+=1
 return s[start:i-1]
changed=git('diff','--name-only',base,head).decode().splitlines();assert len(changed)==20;assert all(f=='packages/react-components/README.md'or(f.startswith('packages/react-components/src/components/Charts/')and f.endswith('.styles.ts'))for f in changed)
files=git('ls-tree','-r','--name-only',base,'packages/react-components/src').decode().splitlines();sites=[];keys=[];fb=[];raw=[];newhooks=[]
for f in files:
 if not f.endswith(('.ts','.tsx')):continue
 a=git('show',base+':'+f).decode();b=git('show',head+':'+f).decode()
 def exprs(s):
  result=[]
  for m in re.finditer(r'var\(\s*--openui-[\w-]+\s*,',s):
   i=m.end();depth=1;q=None
   while depth:
    c=s[i]
    if q:
     if c=='\\':i+=2;continue
     if c==q:q=None
    elif c in ['"',"'"]:q=c
    elif c=='(':depth+=1
    elif c==')':depth-=1
    i+=1
   result.append(s[m.start():i])
  return result
 x,y=exprs(a),exprs(b);assert collections.Counter(map(norm,x))==collections.Counter(map(norm,y)),f
 if x:
  fb.append({'file':f,'count':len(x),'rawEqual':collections.Counter(x)==collections.Counter(y)})
  if collections.Counter(x)!=collections.Counter(y):raw.append({'file':f,'before':x,'after':y})
 if '/Charts/'not in f:continue
 for m in re.finditer(r'(?:export\s+)?const\s+(\w+)\s*=\s*(css|keyframes)`((?:\\.|[^`])*)`',a,re.S):
  symbol,kind,body=m.groups()
  if kind=='keyframes':
   n=re.search(r'const\s+'+symbol+r'\s*=\s*keyframes`((?:\\.|[^`])*)`',b,re.S);assert n and body==n[1],(f,symbol);keys.append({'file':f,'symbol':symbol,'bodySHA256':sha(body.encode())});continue
  n=re.search(r'export const\s+'+symbol+r'\s*=\s*"(openui-[\w-]+)"',b);assert n,(f,symbol);hook=n[1];newhooks.append(hook);rule=re.search(r'\.'+re.escape(hook)+r'\s*\{',b);assert rule,(f,hook);actual=block(b,rule.end());assert norm(body)==norm(actual),(f,symbol);sites.append({'file':f,'symbol':symbol,'hook':hook,'bodyConserved':True,'beforeBodySHA256':sha(body.encode()),'afterRawBodySHA256':sha(actual.encode())})
assert len(sites)==25 and len(keys)==9 and len(set(newhooks))==25;assert len(fb)==95 and sum(x['count']for x in fb)==1444
workerledger=json.loads((ev/'conversion-ledger.json').read_text());assert {(x['file'],x['symbol'],x['hook'])for x in sites}=={(x['file'],x['symbol'],x['hook'])for x in workerledger}
# Baseline canonical literal collision scan; does not claim a complete dynamic alias evaluation.
collision=[]
for f in files:
 if not f.endswith(('.ts','.tsx')):continue
 a=git('show',base+':'+f).decode()
 for h in newhooks:
  if re.search(r'["\']'+re.escape(h)+r'["\']',a):collision.append({'file':f,'hook':h})
assert not collision,collision
result={'scope':'Read-only source/archive/installed-file preflight. No imports/install/build/browser execution. Runtime pending W1 release.','head':head,'baseline':base,'packageTree':tree,'finalArchiveSHA256':'b09f11e6aa2809f42f7aee5eb2c23bd7bf6c58904d4a935918044f039ff7dd71','testedArchiveSHA256':'ec56caf237bcd0355e1f87cae2ac6716a2d10ad789169069a53b82ad18758431','finalVsTestedDiff':delta,'installed':installed,'ownedSources':owned,'declarationsIdentical':440,'canonicalSites':sites,'keyframes':keys,'fallbackFiles':fb,'fallbackExpressions':1444,'formattingOnlyFallbackFiles':[x['file']for x in raw],'changedFiles':changed,'canonicalLiteralCollisions':collision}
(out/'source-archive-results.json').write_text(json.dumps(result,indent=2));(out/'fallback-formatting-raw.json').write_text(json.dumps(raw,indent=2));print(json.dumps({k:v for k,v in result.items()if k not in ['ownedSources','canonicalSites','keyframes','fallbackFiles','changedFiles']},indent=2))
