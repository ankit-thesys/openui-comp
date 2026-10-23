import {Suspense} from 'react';
import {Button,Input} from './library.mjs';
export const dynamic='force-dynamic';
async function Late(){await new Promise(r=>setTimeout(r,150));return <Input data-test="late-input" placeholder="Late actual Input"/>;}
export default function Page(){return <main><Button data-test="stock-button">Actual OpenUI Button</Button><Suspense fallback={<p>Waiting for actual Input</p>}><Late/></Suspense></main>;}
