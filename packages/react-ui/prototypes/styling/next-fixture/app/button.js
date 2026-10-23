'use client';
import React,{useState} from 'react';
import {css} from 'goober';
export default function Button(){const [count,setCount]=useState(0);const className=css({padding:'12px 18px',backgroundColor:'#3347b0',color:'#fff',border:'0',borderRadius:'10px'});return <button data-testid="next-button" className={className} onClick={()=>setCount(c=>c+1)}>Goober button {count}</button>}
