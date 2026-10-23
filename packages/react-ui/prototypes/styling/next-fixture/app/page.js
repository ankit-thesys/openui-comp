import React,{Suspense} from 'react';import Button from './button';
async function Delayed(){await new Promise(r=>setTimeout(r,80));return <div data-testid="streamed"><Button/></div>}
export default function Page(){return <main><h1>Goober without an SSR style registry</h1><Button/><Suspense fallback={<p>Loading delayed content</p>}><Delayed/></Suspense></main>}
