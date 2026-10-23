import React,{useContext}from'react';
import{ThemeContext}from'/Users/ankitdas/thesys/openui-styling-prototype/packages/react-ui/src/components/ThemeProvider';
import descriptors from'./boundary-descriptors.json';import metadata from './boundary-metadata.json';import shellUnits from'./shell-units.json';import{ArmContext,ownedStyle,type Unit}from'./adapter';
export const chatUnits=Object.keys(descriptors) as Unit[];
export function RuntimeBoundary({children,units}:{children:React.ReactNode;units:Unit[]}){const arm=useContext(ArmContext);const theme=useContext(ThemeContext);if(arm==='baseline')return <>{children}</>;const styles=[...new Set(units)].map(unit=>ownedStyle(unit,descriptors[unit],{boundary:true,rows:metadata[unit]}));const classes=styles.map(s=>s.className).join(' ');return <>{styles.map(s=>React.cloneElement(s.resource,{key:s.href}))}<ThemeContext.Provider value={{...theme,portalThemeClassName:[theme.portalThemeClassName,classes].filter(Boolean).join(' ')}}><div data-runtime-boundary="true" className={classes} style={{display:'contents'}}>{children}</div></ThemeContext.Provider></>;}
// Library-owned unit inventories: consumers never pass a stylesheet/layer list.
export function RuntimeChatBoundary({children}:{children:React.ReactNode}){return <RuntimeBoundary units={chatUnits}>{children}</RuntimeBoundary>}
export function RuntimeShellBoundary({children}:{children:React.ReactNode}){return <RuntimeBoundary units={shellUnits as Unit[]}>{children}</RuntimeBoundary>}
