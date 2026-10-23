const backend=process.env.PROBE_BACKEND_URL||'http://127.0.0.1:4342';
export default {reactStrictMode:false,experimental:{cpus:2},typescript:{ignoreBuildErrors:true},async rewrites(){return[{source:'/api/chat',destination:backend+'/api/chat'},{source:'/api/history',destination:backend+'/api/history'},{source:'/api/expected',destination:backend+'/api/expected'}];}};
