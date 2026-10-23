import React,{Suspense} from 'react';
import Link from 'next/link';
import {Button} from '../../lib/auto-button';
import HostProbe from './button';
async function Delayed(){await new Promise(r=>setTimeout(r,250));return <div data-testid="streamed"><Button late>Streamed button</Button></div>}
export default async function Page({searchParams}){
 const params=await searchParams;
 const accent=params.theme==='red'?'#b03030':params.theme==='blue'?'#3347b0':undefined;
 return <main><h1>Goober styles carried by components</h1><p>No app stylesheet import, registry, provider, or Goober SSR configuration.</p><Button accent={accent}/><Button accent={accent}/><HostProbe/><Suspense fallback={<p data-testid="loading">Loading delayed content</p>}><Delayed/></Suspense><Link href={params.theme==='red'?'/?theme=blue':'/?theme=red'} prefetch={false}>Change theme route</Link></main>;
}
