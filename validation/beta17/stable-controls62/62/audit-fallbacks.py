import collections,json,pathlib,re,subprocess,hashlib
repo='/private/tmp/openui-selectors62-frozen';root=pathlib.Path('/private/tmp/openui-selectors62-evidence');inventory=json.loads(pathlib.Path('/private/tmp/openui-common-styles-inventory/fallbacks.json').read_text());files=sorted({r['file'] for r in inventory})
def read(rev,file):return subprocess.check_output(['git','show',rev+':'+file],cwd=repo,text=True)
def fallbacks(source):
 values=[]
 for match in re.finditer(r'var\(\s*(--openui-[\w-]+)\s*,',source):
  depth=1;quote=None;end=match.end()
  while end<len(source):
   char=source[end]
   if quote:
    if char==quote and source[end-1]!='\\':quote=None
   elif char in ['"',"'"]:quote=char
   elif char=='(':depth+=1
   elif char==')':
    depth-=1
    if depth==0:break
   end+=1
  assert depth==0
  values.append(source[match.start():end+1])
 return collections.Counter(values)
records=[]
for file in files:
 before=read('d1292715028f816bd6a0dcf92766ec7dd15350f4',file);after=pathlib.Path(repo,file).read_text();a,b=fallbacks(before),fallbacks(after);assert a==b,file
 records.append({'file':file,'occurrences':sum(b.values()),'unchangedFallbackExpressions':True,'currentSHA256':hashlib.sha256(after.encode()).hexdigest()})
result={'baseline':'d1292715028f816bd6a0dcf92766ec7dd15350f4','candidate':subprocess.check_output(['git','rev-parse','HEAD'],cwd=repo,text=True).strip(),'allFallbackExpressionsUnchanged':True,'fileCount':len(files),'occurrences':sum(r['occurrences'] for r in records),'files':records}
assert result['occurrences']==1444
(root/'fallback-conservation.json').write_text(json.dumps(result,indent=2)+'\n');print({k:v for k,v in result.items() if k!='files'})
