import Chat from '../../generated.jsx';
export default async function Page({searchParams}){const q=await searchParams;const arm=q.arm==='baseline'?'baseline':'generated';return <><link rel="stylesheet" href={'/'+arm+'.css'}/><Chat scenario={q.scenario==='dashboard'?'dashboard':'chat'}/></>}
