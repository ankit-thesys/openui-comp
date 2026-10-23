export const dynamic='force-dynamic';
export async function GET(request){if(process.env.PROTOTYPE_DIAGNOSTICS!=='1')return new Response('Not found',{status:404});const force=new URL(request.url).searchParams.get('gc')==='1';if(force){global.gc?.();global.gc?.();}return Response.json({pid:process.pid,memory:process.memoryUsage(),gcApplied:force&&!!global.gc});}
