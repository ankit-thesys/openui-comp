for(const phase of['signed','unique','motion','small']){console.log('START',phase,new Date().toISOString());await import('./'+phase+'.mjs');console.log('END',phase,new Date().toISOString());}
