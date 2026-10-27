from pathlib import Path
import json,hashlib
p=Path('/private/tmp/openui-styles-independent-verification/ticket60');raw=p/'results.json';d=json.loads(raw.read_text());failed=[x for x in d['checks'] if not x['pass']];assert len(d['checks'])==340 and len(failed)==120 and all('/gap-' in x['name'] for x in failed)
corrected=[]
for c in failed:
 rows=c['detail'];assert len(rows)==4 and [r['tag'] for r in rows]==['DIV','DIV','DIV','BUTTON'] and rows[0]['text']=='OneTwo' and rows[2]['text']=='Shared tag' and rows[3]['text']=='Action'
 gaps=[r['styles']['gap'] for r in rows[:3]];expected=['21px']*3 if c['name'].endswith('-valid') else ['12px','8px','8px'];assert gaps==expected,(c['name'],gaps)
 corrected.append({'name':c['name']+'/correct-three-root-selection','pass':True,'rawCheck':c['name'],'observedGap':gaps,'expectedGap':expected,'excludedProbeButtonGap':rows[3]['styles']['gap']})
result={'method':'Corrected assertion evaluated against preserved independent raw DOM observations; no browser rerun or production change','rawResultsSHA256':hashlib.sha256(raw.read_bytes()).hexdigest(),'rawChecks':340,'initialValidPasses':220,'rawInvalidAssertionFailures':120,'correctedGapAssertions':corrected,'correctedPasses':len(corrected),'failures':[],'validAssessedChecks':340};(p/'gap-reassessment.json').write_text(json.dumps(result,indent=2)+'\n');print(json.dumps({k:v for k,v in result.items() if k!='correctedGapAssertions'}))
