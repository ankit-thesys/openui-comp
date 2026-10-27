for(const phase of['boot','loader-correction','portal-states']){console.log('START',phase,new Date().toISOString());await import('./'+phase+'.mjs');console.log('END',phase,new Date().toISOString());}
