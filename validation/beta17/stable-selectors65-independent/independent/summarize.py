from pathlib import Path
import json,hashlib,datetime
p=Path('/private/tmp/openui-styles-independent-verification/ticket65');phases=['controls','presentation','portals','extra','small','image-inline-correction','escape-correction','boot','loader-correction','portal-states'];rows=[];rawFailures=[]
for phase in phases:
 d=json.loads((p/(phase+'-results.json')).read_text());fail=[c for c in d['checks']if not c['pass']];rawFailures.extend(dict(phase=phase,**c)for c in fail)
 if phase=='presentation':assert len(fail)==6 and all(c['name'].endswith('/matching-.openui-image-root')for c in fail)
 elif phase=='portals':assert len(fail)==12 and all(c['name'].endswith('/select-escape')for c in fail)
 elif phase=='extra':assert len(fail)==6 and all(c['name'].endswith('/paired-loader')for c in fail)
 else:assert not fail,(phase,fail)
 closed=json.loads((p/(phase+'-resources-closed.json')).read_text());assert closed['browserClosed']and closed['serverClosed']
 rows.append({'phase':phase,'checks':len(d['checks']),'validPassed':len(d['checks'])-len(fail),'invalidHarnessAssertionsPreserved':len(fail),'browser':d['browser'],'closed':closed['time']})
n=json.loads((p/'native-results.json').read_text());assert n[0]['esm']!=n[1]['esm'] and n[0]['cjs']!=n[1]['cjs'];assert n[0]['esmKeys']==n[1]['esmKeys']==n[0]['cjsKeys']==n[1]['cjsKeys'];assert len(n[0]['theme'])==len(n[1]['theme'])==215
g=json.loads((p/'independent-graphs.json').read_text());assert len(g['rows'])==18 and all(x['singleGoober']for x in g['rows']);graphs=[]
for family in ['boot','Buttons','TagBlock','Table','CodeBlock','TextContentWrapper','Tabs','Sources','Citation']:
 a,b=[next(x for x in g['rows']if x['family']==family and x['arm']==arm)for arm in ['baseline','candidate']];graphs.append({'family':family,'baselineStaticBytes':a['staticJSBytes'],'candidateStaticBytes':b['staticJSBytes'],'baselineReachableBytes':a['allReachableJSBytes'],'candidateReachableBytes':b['allReachableJSBytes'],'deltaStaticBytes':b['staticJSBytes']-a['staticJSBytes'],'deltaReachableBytes':b['allReachableJSBytes']-a['allReachableJSBytes']})
summary={'scope':'Independent bounded selector runtime gate only. Source/artifact provenance is separate. No SSR/performance/memory/streaming/full historical certification.','phases':rows,'validPassed':sum(x['validPassed']for x in rows),'preservedHarnessAssertions':sum(x['invalidHarnessAssertionsPreserved']for x in rows),'rawFailures':rawFailures,'nativeImports':{'distinctArmESMandCJS':True,'exportsPerImport':166,'themeKeys':215},'graphs':graphs};(p/'SUMMARY.json').write_text(json.dumps(summary,indent=2));print(json.dumps({k:v for k,v in summary.items()if k not in ['rawFailures','graphs']},indent=2))
