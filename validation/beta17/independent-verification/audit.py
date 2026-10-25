from pathlib import Path
import json, hashlib, statistics, math, os
root=Path('/private/tmp/openui-beta17-independent-verification')
evidence=Path('/Users/ankitdas/.codex/worktrees/63b2/openui/validation/beta17/performance/evidence')
manifestPath=Path('/private/tmp/beta17-consumer/handoff-v5.json');manifest=json.loads(manifestPath.read_text());manifestHash=hashlib.sha256(manifestPath.read_bytes()).hexdigest()
assert manifestHash=='58f29005e395f360e521bc8f01992d5dc5ef2c8989861010b37802e5ebdda856'
reports={k:json.loads((evidence/(k+'-v5')/'report.json').read_text()) for k in ['benchmark','soak']}
summaries={k:json.loads((evidence/(k+'-v5')/'summary.json').read_text()) for k in ['benchmark','soak']}
identities={str(evidence/(k+'-v5')/f):hashlib.sha256((evidence/(k+'-v5')/f).read_bytes()).hexdigest() for k in reports for f in ['report.json','summary.json','manifest.json']}
errors=[]
def check(value,label):
 if not value:errors.append(label)
def sha(value):return hashlib.sha256(value).hexdigest()
for name,d in reports.items():
 check(d['errors']==[],name+' recorded errors');check(d['fixtureManifestSha256']==manifestHash,name+' manifest identity');check(d['productCommit']==manifest['productCommit'],name+' product identity');check(d['chromeVersion']==manifest['browser']['version'],name+' browserversion');check(d['integrity']['before']==manifest['inputs']==d['integrity']['after'],name+' inventory endpoints');check(d['integrity']['installed']['before']==d['integrity']['installed']['after'],name+' installed endpoints');check(d['browser']==manifest['browser'],name+' browseridentity')
# Independent current file hashing, separate from runner's recorded endpoint claims.
bad=[];totalBytes=0
for filename,expected in manifest['inputs'].items():
 p=Path(filename)
 try:data=p.read_bytes();totalBytes+=len(data)
 except OSError as e:bad.append({'path':filename,'error':str(e)});continue
 if sha(data)!=expected:bad.append({'path':filename,'expected':expected,'actual':sha(data)})
check(not bad,'actual frozen input hash mismatch')
# Exact module origin and package lock records, including dependencies and canonical paths.
consumer=Path(manifest['consumer']);lock=json.loads((consumer/'package-lock.json').read_text());moduleErrors=[]
for m in manifest['moduleInventory']:
 p=Path(m['module']);canonical=Path(m['canonical']);owner=json.loads(Path(m['ownerManifest']).read_text());locked=lock['packages'].get(m['lockKey'])
 if p.resolve()!=canonical or sha(p.read_bytes())!=m['sha256'] or owner['name']!=m['package'] or owner['version']!=m['version'] or locked!=m['locked']:moduleErrors.append(str(p))
 if not canonical.is_relative_to(consumer/'node_modules'):moduleErrors.append('outside:'+str(p))
for arm,modules in manifest['moduleOrigins'].items():
 for p in modules:
  if arm=='runtime' and '/@openuidev/react-ui/' in p:moduleErrors.append('legacyinruntime:'+p)
  if arm=='baseline' and any(x in p for x in ['/@openuidev/kits/','/@openuidev/react-ui-core/']):moduleErrors.append('candidateinbaseline:'+p)
check(not moduleErrors,'module origin/lock inventory mismatch')
# Pinned browser bundle and symlinks; no escaping symlinks.
browser=manifest['browser'];bundle=Path(browser['bundlePath']);actualBrowserFiles={};links={}
for folder,dirs,files in os.walk(bundle,followlinks=False):
 for name in dirs+files:
  p=Path(folder)/name
  if p.is_symlink():
   links[str(p.relative_to(bundle))]=os.readlink(p);check(p.resolve().is_relative_to(bundle.resolve()),'browser link escapes')
  elif p.is_file():actualBrowserFiles[str(p)]=sha(p.read_bytes())
expectedBrowserFiles={p:h for p,h in manifest['inputs'].items() if Path(p).is_relative_to(bundle)}
check(actualBrowserFiles==expectedBrowserFiles,'browser bundle files');check(links==browser['bundleSymlinks'],'browser links');check(len(actualBrowserFiles)==browser['bundleFileCount'],'browser file count');check(sha(Path(browser['archivePath']).read_bytes())==browser['archiveSha256'],'browser archive')
# Validate independent payload/schedule hashes and per-cell sample completeness/order.
for key,cell in manifest['cells'].items():
 payload=cell['expectedText'].encode();check(sha(payload)==cell['payloadSha256'],key+' payload hash')
 chunk,rate=(512,40) if key.endswith('/paced') else (64,0)
 schedule=[{'offset':i,'bytes':min(chunk,len(payload)-i),'delay':rate} for i in range(0,len(payload),chunk)]
 check(sha(json.dumps(schedule,separators=(',',':')).encode())==cell['scheduleSha256'],key+' schedule hash')
bench=reports['benchmark'];check(len(bench['runs'])==80,'benchmark80');check(len(bench['cold'])==8,'cold8')
keys=[(r['workload'],r['load'],r['pair'],r['arm']) for r in bench['runs']];check(len(keys)==len(set(keys)),'duplicatepair')
rows=[];inputs=[]
for workload in ['chat','dashboard']:
 for load in ['paced','stress']:
  cell=manifest['cells'][workload+'/'+load]
  runs=[r for r in bench['runs'] if r['workload']==workload and r['load']==load]
  expected=[(p,a) for p in range(10) for a in (['baseline','runtime'] if p%2==0 else ['runtime','baseline'])]
  check([(r['pair'],r['arm']) for r in runs]==expected,workload+'/'+load+' pair order')
  for arm in ['baseline','runtime']:check(sum(r['workload']==workload and r['load']==load and r['arm']==arm for r in bench['cold'])==1,'unique cold')
  for metric in ['elapsedMs','renderedElapsedMs']:
   stats={}
   for arm in ['baseline','runtime']:
    values=[r[metric] for r in runs if r['arm']==arm];check(len(values)==10 and all(math.isfinite(v) and v>0 for v in values),'positive timing')
    stats[arm]={'n':len(values),'median':statistics.median(values),'p95':sorted(values)[math.ceil(.95*len(values))-1]}
   row={'workload':workload,'load':load,'metric':metric,**stats,'medianChangePercent':100*(stats['runtime']['median']/stats['baseline']['median']-1),'p95ChangePercent':100*(stats['runtime']['p95']/stats['baseline']['p95']-1)};row['pass']=row['medianChangePercent']<=10 and row['p95ChangePercent']<=15;rows.append(row)
  if load=='paced':
   for arm in ['baseline','runtime']:
    values=[r['inputMs'] for r in runs if r['arm']==arm];check(len(values)==10 and all(math.isfinite(v) and v>=0 for v in values),'input values');v=sorted(values)[9];inputs.append({'workload':workload,'arm':arm,'n':10,'p95':v,'pass':v<=100})
for run in bench['runs']+bench['cold']:
 cell=manifest['cells'][run['workload']+'/'+run['load']];check(run['actualText']==cell['expectedText'] and run['actualTextSha256']==cell['payloadSha256'],'output source');check(run['status']=='idle' and run['activeAfter']==run['timersAfter']==0,'terminal streams');check(run['domCounts']=={k:p['count'] for k,p in cell['expectedDom'].items()},'expected DOM');check(run['requiredTextFound']==[True]*len(cell['requiredText']),'rendered required text');check(run['renderedElapsedMs']>=run['elapsedMs'],'DOM completion precedes message')
 if 'bars' in cell['expectedDom']:check(run['visibleBarCount']==cell['expectedDom']['bars']['count'],'painted bars')
 if run.get('inputObservation'):
  o=run['inputObservation'];check(o['activeBefore']==o['activeAfter']==1 and o['statusBefore']==o['statusAfter']=='streaming' and o['valueBefore']!=o['valueAfter'],'live input effect')
for expected in summaries['benchmark']['timing']:
 actual=next(r for r in rows if all(r[k]==expected[k] for k in ['workload','load','metric']));check(actual==expected,'independent timing summary equality')
check(inputs==summaries['benchmark']['input'],'independent input equality')
# Memory endpoints, all natural samples, schedules, cancellations; no forced-pressure substitution.
resources=[];details=[]
check(len(reports['soak']['runs'])==2,'two workloads')
for run in reports['soak']['runs']:
 w=run['workload'];check(run['durationMs']>=600000 and run['warmupCycles']==12 and run['iterations']>=10,'soak duration/warmup');check(len(run['samples'])==20,'natural20')
 check([s['targetMs'] for s in run['samples']]==list(range(30000,600001,30000)),'natural targets')
 check(all(s['targetMs']<=s['elapsedMs']<=run['durationMs'] for s in run['samples']),'natural target timing');check(all(a['elapsedMs']<b['elapsedMs'] for a,b in zip(run['samples'],run['samples'][1:])),'natural monotonic')
 for arm,a in run['arms'].items():
  warm,terminal=a['warm'],a['terminal'];samples=[warm]+[s['arms'][arm] for s in run['samples']]+[terminal]
  check(all(s['styles']==warm['styles'] for s in samples),'styles plateau');check(all(s['activeStreams']==s['activeTimers']==0 for s in samples),'checkpoint streams');check(warm['dom']==terminal['dom'],'GC endpoint DOM/listener equality')
  heap=(terminal['heapUsedBytes']-warm['heapUsedBytes'])/1048576;rss=(terminal['rss']['totalBytes']-warm['rss']['totalBytes'])/1048576
  check(all(s['rss']['totalBytes']==sum(p['bytes'] for p in s['rss']['processes']) for s in samples),'RSS sum')
  row={'workload':w,'arm':arm,'retainedHeapGrowthMiB':heap,'heapPass':heap<=5,'rssGrowthMiB':rss,'rssInvestigationRequired':rss>100};resources.append(row)
  cancellations=[c for c in run['cancellations'] if c['arm']==arm];check([c['cycle'] for c in cancellations]==list(range(9,run['iterations'],10)),'cancel cadence')
  expected=manifest['cells'][w+'/paced']['expectedText']
  for c in cancellations:check(c['activeBefore']==1 and 0<len(c['partialBefore'])<len(expected) and expected.startswith(c['partialBefore']) and c['abortError'] in ['AbortError','net::ERR_ABORTED','ERR_ABORTED'] and c['activeAfter']==c['timersAfter']==0 and c['cancelledAfter']==c['cancelledBefore']+1,'actual partial cancellation')
  details.append({'workload':w,'arm':arm,'durationMs':run['durationMs'],'cycles':run['iterations'],'naturalSamples':len(run['samples']),'cancellations':len(cancellations),'stylePlateau':all(s['styles']==warm['styles'] for s in samples),'domEndpoints':warm['dom']==terminal['dom'],'naturalHeapRangeBytes':[min(s['heapUsedBytes'] for s in samples),max(s['heapUsedBytes'] for s in samples)]})
check(resources==summaries['soak']['resources'],'independent memory equality')
result={'manifestSha256':manifestHash,'reportIdentities':identities,'currentFrozenInputs':{'files':len(manifest['inputs']),'totalBytes':totalBytes,'mismatches':bad},'moduleCount':len(manifest['moduleInventory']),'moduleErrors':moduleErrors,'browserBundleFiles':len(actualBrowserFiles),'timing':rows,'input':inputs,'resources':resources,'soakDetails':details,'errors':errors,'pass':not errors,'scope':'Independent raw recomputation/provenance audit; report commit identity still to be confirmed; no new full80/10minute independent run.'}
(root/'raw-audit.json').write_text(json.dumps(result,indent=2)+'\n');print(json.dumps({'pass':result['pass'],'errors':errors,'inputs':len(manifest['inputs']),'moduleCount':len(manifest['moduleInventory']),'timingRows':len(rows),'soakDetails':details},indent=2))
