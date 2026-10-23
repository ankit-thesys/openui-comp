'use client';
import React,{useEffect,useId,useState} from 'react';
import Link from 'next/link';
import {Button} from '../../../src/components/Button';
import {Renderer} from '@openuidev/react-lang';
import {ThemeProvider,useTheme} from '../../../src/components/ThemeProvider';
import {themeToCssVars} from '../../../src/components/ThemeProvider/utils';
import {benchmarkLibrary,makeResponse} from '../real/workloads';
// Library-owned prototype helper: no page-level token extraction or style ordering.
// Reads the real provider's resolved tokens; SSR and hydration render the same rule.
function Tokens({enabled,children}){const {theme}=useTheme();const id='ssr-theme-'+useId().replace(/[^a-zA-Z0-9_-]/g,'');return <div className={id}>{enabled&&<style>{`.${id}{${themeToCssVars(theme)}}`}</style>}{children}</div>}
export default function Fixture({scenario,arm,framework,accent,bridge,late=false}){const [color,setColor]=useState(accent);useEffect(()=>setColor(accent),[accent]);useEffect(()=>{document.documentElement.dataset.hydrated='true'},[]);return <ThemeProvider lightTheme={{interactiveAccentDefault:color}}><Tokens enabled={bridge}><div data-fixture={late?'late':'main'}><button data-theme-toggle onClick={()=>setColor('#127248')}>Change local theme</button><Link href={'/?scenario='+scenario+'&theme=red&arm='+arm}>Change theme route</Link><Button data-override className="consumer-override rounded-none border-0 bg-red-500 p-8 text-white hover:bg-green-500">Consumer override</Button><Renderer response={makeResponse(scenario,1)} library={benchmarkLibrary} isStreaming={false}/></div></Tokens></ThemeProvider>}
