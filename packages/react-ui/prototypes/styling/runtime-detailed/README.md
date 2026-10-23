# Throwaway detailed runtime Goober prototype

**Unaccepted experiment.** This is separate from `../runtime-investigation` and the prior static prototype. Production components are unchanged. See [the protocol](PROTOCOL.md) and the final result report in `results/DETAILED-RUNTIME-REPORT.md`.

From this directory, run `npm run check` for sequential selector, Next, browser and bounded SSR memory diagnostics. Individual commands are in package.json. Expected compatibility failures return nonzero; the aggregate runner still executes the other investigations.

`npm run demo` starts the actual OpenUI Renderer/parser/headless SSE replay at http://127.0.0.1:4226/ . Compare `?arm=baseline&scenario=chat` and `?arm=runtime&scenario=chat`; use `scenario=dashboard` for the other workload. Optional `size`, `rate` and `chunkBytes` parameters control block count and replay schedule. The console API `window.__run()` starts the instrumented stream and `window.__result` contains its final measurement. This is a developer diagnostics page, not the prior polished performance lab.

The runtime arm imports component-owned Goober descriptor objects, generates CSS during render, and delivers React19 stylesheet resources via an internal private-target adapter. It imports no baseline CSS. The baseline intentionally links the original compiled stylesheet. Existing framework styles in the Next fixture are host inputs.

Local reproduction requires the installed dependencies/assets in the adjacent original prototype (`node_modules`, `real/node_modules`, `next-fixture/node_modules`, `public/frameworks`, `.real-dist/baseline.css`). Source paths currently point to `/Users/ankitdas/thesys/openui-styling-prototype`; this is an in-repository spike, not a published installable package. Next uses port4225 and browser replay4226; existing unrelated servers must be preserved. Neither command needs consumer styling configuration.

Do not regenerate descriptors during a measured run. The frozen descriptors, source normalization checks and candidate history are in `runtime/`. `node build-shared.mjs` is prototype authoring regeneration, not a consumer setup step. Retain raw failed variants and test correction evidence.
