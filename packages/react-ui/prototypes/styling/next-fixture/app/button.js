'use client';
// Host app code, deliberately using Goober's default shared sheet.
import React,{useState,useEffect} from 'react';
import {css} from 'goober';
import {Button} from '../../lib/auto-button';
export default function HostProbe(){
 const [mounted,setMounted]=useState(false);
 const className=css({backgroundColor:'rgb(12, 130, 120)'});
 useEffect(()=>{document.documentElement.dataset.hydrated='true';},[]);
 return <section><button data-testid="host-goober" className={className+' host-override'} onClick={()=>setMounted(x=>!x)}>Toggle library component</button>{mounted&&<Button late>Client mounted</Button>}</section>;
}
