from pathlib import Path
import subprocess,json,time
r=Path('/private/tmp/openui-selectors65-evidence');jobs=[('controls','state-parts.mjs','state-part-results.json'),('portals','run.mjs','results.json'),('portals','state-cssom.mjs','state-cssom-results.json'),('presentation','run.mjs','runtime-results.json'),('presentation','run-extra.mjs','extra-results.json'),('presentation','run-small-bounded.mjs','small-results.json'),('presentation','run-tabs-state.mjs','tabs-state-results.json'),('presentation','run-sources-matched.mjs','sources-matched-results.json')];rows=[]
for folder,script,result in jobs:
 d=r/folder;start=time.time();print('START',folder,script,flush=True)
 with (d/(script+'.log')).open('w') as f:p=subprocess.run(['node',str(d/script)],stdout=f,stderr=subprocess.STDOUT)
 row={'folder':folder,'script':script,'exitCode':p.returncode,'elapsedSeconds':time.time()-start}
 if (d/result).exists():
  j=json.loads((d/result).read_text());c=j['checks'];row.update({'checks':len(c),'passes':sum(bool(x['pass'])for x in c),'failures':[x['name']for x in c if not x['pass']]})
 else:row['missingResult']=True
 rows.append(row);(r/'execution-progress.json').write_text(json.dumps(rows,indent=2)+'\n');print('DONE',json.dumps(row),flush=True)
 if p.returncode or row.get('missingResult')or row.get('failures'):raise SystemExit(1)
(r/'execution-complete.json').write_text(json.dumps(rows,indent=2)+'\n')
