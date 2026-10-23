import{build,buildOptions,probeRoot}from'./build-shared.mjs';import{execFileSync}from'node:child_process';
// Build the private test engine from the preserved source; consumers use the
// normal alias to the source directly. No network/installation step is required.
await build({...buildOptions,entryPoints:[probeRoot+'/vendor/goober/src/index.js'],outfile:probeRoot+'/vendor/goober/patched.cjs',platform:'node',format:'cjs'});
for(const file of['runtime/parser-regressions.mjs','runtime/serializer-check.mjs'])execFileSync(process.execPath,[probeRoot+'/'+file],{stdio:'inherit'});
