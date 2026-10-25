import { defineConfig } from "tsdown";
export default defineConfig({entry:["src/index.ts"],format:["esm","cjs"],unbundle:true,dts:false,css:{inject:true,splitting:false,fileName:"katex.css"},copy:[{from:"node_modules/katex/dist/fonts/*",to:"dist/fonts",flatten:true}]});
