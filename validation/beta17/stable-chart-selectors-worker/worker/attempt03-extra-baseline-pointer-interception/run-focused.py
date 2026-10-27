import subprocess,json,time
from pathlib import Path
r=Path('/private/tmp/openui-charts-w1-evidence');rows=[]
for name in ['extra','signed','motion']:
 start=time.time();print('START',name,flush=True)
 with (r/(name+'-full.log')).open('w')as f:p=subprocess.run(['node',str(r/('run-'+name+'.mjs'))],stdout=f,stderr=subprocess.STDOUT)
 row={'phase':name,'exitCode':p.returncode,'seconds':time.time()-start};result=r/(name+'-results.json')
 if result.exists():
  j=json.loads(result.read_text());row.update(checks=len(j['checks']),passes=sum(x['pass']for x in j['checks']),failures=[x['name']for x in j['checks']if not x['pass']])
 rows.append(row);(r/'focused-execution.json').write_text(json.dumps(rows,indent=2)+'\n');print('DONE',row,flush=True)
 if p.returncode or row.get('failures'):raise SystemExit(1)
