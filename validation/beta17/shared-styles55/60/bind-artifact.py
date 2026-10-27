import hashlib,json,pathlib,posixpath,re,subprocess,tarfile
root=pathlib.Path('/private/tmp/openui-styles60-evidence');repo='/private/tmp/openui-common-styles'
candidate=next((root/'candidate').glob('*.tgz'));previous=next(pathlib.Path('/private/tmp/openui-styles59-evidence/candidate').glob('*.tgz'))
def members(p):
 with tarfile.open(p) as t:return {f.name:t.extractfile(f).read() for f in t.getmembers() if f.isfile()}
a,b=members(previous),members(candidate)
def logical_name(name):return name.replace('dist/openui-common-styles/node_modules/','dist/node_modules/')
def comparable(name,data):
 if name.endswith('.map') and '/node_modules/' in name:
  item=json.loads(data);item.pop('sources',None);return json.dumps(item,sort_keys=True).encode()
 if name.endswith(('.mjs','.cjs')):
  text=data.decode()
  # Evidence comparison only: preserve import targets, ignoring physical relative spelling.
  def target(m):
   resolved=logical_name(posixpath.normpath(posixpath.join(posixpath.dirname(name),m[2])))
   return m[1]+resolved+m[3]
  text=re.sub(r'((?:from |require\()["\'])(\.[^"\']+)(["\'])',target,text)
  text='\n'.join(line for line in text.splitlines() if not line.startswith('//#region'))
  return text.encode()
 return data
logical_a={logical_name(k):comparable(k,v) for k,v in a.items()};logical_b={logical_name(k):comparable(k,v) for k,v in b.items()}
diffs=sorted(k for k in logical_a.keys()|logical_b.keys() if logical_a.get(k)!=logical_b.get(k));assert diffs==['package/README.md'],diffs
owned={};external=set()
for name,data in b.items():
 if not name.endswith('.map'):continue
 item=json.loads(data)
 for src,content in zip(item.get('sources',[]),item.get('sourcesContent',[])):
  normalized=posixpath.normpath(posixpath.join(posixpath.dirname(name),src))
  if normalized.startswith('package/src/'):
   file='packages/react-components/'+normalized[len('package/'):]
   expected=subprocess.check_output(['git','show','HEAD:'+file],cwd=repo);assert content.encode()==expected,(name,file)
   owned[file]=hashlib.sha256(expected).hexdigest()
  else:external.add(normalized)
report={'sourceCommit':subprocess.check_output(['git','rev-parse','HEAD'],cwd=repo,text=True).strip(),'packageTree':subprocess.check_output(['git','rev-parse','HEAD:packages/react-components'],cwd=repo,text=True).strip(),'archive':str(candidate),'archiveSHA256':hashlib.sha256(candidate.read_bytes()).hexdigest(),'previous59ArchiveSHA256':hashlib.sha256(previous.read_bytes()).hexdigest(),'byteDifferingEntriesFromAccepted59':sorted(k for k in a.keys()|b.keys() if a.get(k)!=b.get(k)),'runtimePayloadByteIdentical':False,'vendorRelocation':'Worker59 node_modules is symlinked to Worker1 store; rebuilding in Worker1 relocates two bundled syntax theme modules and referencing imports. No source/dependency change.','comparisonNormalizationForEvidenceOnly':'Resolve relative import graph targets to logical archive paths; omit generated region-path comments and vendor-map sources paths. Source contents/mappings preserved. Actual archive bytes remain untouched.','remainingLogicalDifferences':diffs,'ownedSourceCount':len(owned),'ownedSourceBindings':owned,'externalSourceCount':len(external),'archiveMemberSHA256':{k:hashlib.sha256(v).hexdigest() for k,v in b.items()}}
(root/'artifact-provenance.json').write_text(json.dumps(report,indent=2)+'\n')
print({k:v for k,v in report.items() if k not in ['ownedSourceBindings','archiveMemberSHA256','byteDifferingEntriesFromAccepted59']})
p=root/'consumer';p.mkdir(exist_ok=True)
item=json.loads(pathlib.Path('/private/tmp/openui-styles59-evidence/consumer/package.json').read_text());item['name']='openui-styles60-consumer';item['dependencies']['@openuidev/react-components']='file:'+str(candidate);(p/'package.json').write_text(json.dumps(item,indent=2))
lock=pathlib.Path('/private/tmp/openui-styles59-evidence/consumer/pnpm-lock.yaml').read_text().replace('/private/tmp/openui-styles59-evidence/candidate/','/private/tmp/openui-styles60-evidence/candidate/');(p/'pnpm-lock.yaml').write_text(lock)
