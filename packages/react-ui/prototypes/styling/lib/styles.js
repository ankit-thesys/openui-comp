// PROTOTYPE: representative UI, not an extraction of production components.
export const rules={
 button:{appearance:'none',display:'inline-flex',alignItems:'center',justifyContent:'center',gap:'8px',border:'1px solid transparent',borderRadius:'10px',padding:'12px 18px',fontFamily:'system-ui,sans-serif',fontSize:'14px',lineHeight:'20px',fontWeight:600,color:'var(--openui-fg, #ffffff)',backgroundColor:'var(--openui-accent, #3347b0)',cursor:'pointer',transition:'background-color 120ms ease',':hover':{backgroundColor:'var(--openui-hover, #25358c)'},':focus-visible':{outline:'3px solid #8ca3ff',outlineOffset:'3px'}},
 panel:{fontFamily:'system-ui,sans-serif',backgroundColor:'var(--openui-surface, #ffffff)',color:'var(--openui-text, #172344)',border:'1px solid var(--openui-border, #d9deec)',borderRadius:'12px',padding:'16px',boxShadow:'0 10px 30px #17234418'},
 bar:{fill:'var(--openui-accent, #3347b0)',transition:'height 160ms ease,y 160ms ease'},
};
export const labels={button:'OpenUIButton',panel:'OpenUIPortal',bar:'OpenUIChartBar'};
export function cssRule(rule){const result={};for(const [key,value]of Object.entries(rule)){result[key.startsWith(':')?'&'+key:key]=value;}return result;}
export function mode(policy,framework){return policy==='layered'||(policy==='adapted'&&framework==='tailwind4')?'layered':'unlayered';}
export const layerOrder='@layer theme,base,components,utilities;';
export function prepare(policy,framework){
 if(typeof document==='undefined')return;
 if(mode(policy,framework)==='layered'&&!document.querySelector('[data-openui-layer-order]')){const tag=document.createElement('style');tag.dataset.openuiLayerOrder='true';tag.textContent=layerOrder;document.head.prepend(tag);}
}
export const metadata={components:['Button','PortalPanel','AnimatedBarChart'],note:'Representative fixtures; production components have not been migrated.'};
