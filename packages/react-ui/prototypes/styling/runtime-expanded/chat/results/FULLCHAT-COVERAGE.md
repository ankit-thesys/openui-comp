# Expanded runtime full-chat evidence — decision open

Frozen candidate: `FINAL-SOURCE-BUILD-SHA256.json`. This records 235 source/build
files and checks critical copied foundation hashes. The implementation uses the
explicit private Goober parser patch, not unmodified npm Goober. Production source
was not changed. No performance or memory conclusions are made by these correctness
checks; those measurements are a separate exclusive run.

## Actual execution

Both arms use actual AgentInterface, internal ChatProvider/Zustand state, fetchLLM,
AG-UI HTTP parsing, production GenUI renderer and openuiChatLibrary. Candidate
compiles objects at runtime and has no baseline/component stylesheet link. Baseline
loads current compiled Sass. Inline scoped tokens and an internal provider selector
are common library-owned theme infrastructure; users do not supply selectors or
framework configuration. The shell has one additional library-owned display:contents
boundary, so it is not an assertion of byte-identical outer DOM.

`full-chat.json`: all four chat/dashboard × baseline/runtime cases passed. First
submission uses actual composer Enter. Assertions cover pending/running, partial
source, exact completed source, typing during streaming, multiple messages, backend
history restoration, cancellation after a real partial message, explicit resubmission,
actual Switch and Tabs interactions, Line/Pie chart output, dashboard table/bar paths,
scrolling, dark mode, abort on unmount and empty fresh remount. Paired production DOM
counts and sampled computed styles match. Runtime resources remain present after
full-document SSR hydration/unmount/remount; baseline emits no runtime resources.

Actual welcome→nonempty transitions test the nested `:has()` floating header/composer
rules. A separately labeled synthetic DOM probe temporarily removes the header and
floating-layout marker, checks the older stacked chained `:not(:has())` 36px padding,
and restores DOM synchronously. This synthetic selector test is not represented as
an actual public UI flow.

`ssr-shell.json`: actual unseeded ReactDOM full-document shell SSR/hydration, composer
editing, scoped accent updates, body sentinel preservation and actual theme button
pass with no captured hydration/render warnings.

`next.json`: production Next unseeded shell SSR/hydration plus explicitly separate
`data-ssr-renderer-companion` output passes. The companion executes actual parser,
controls, tables and charts during SSR. Actual HTTP sends after hydration, exact final
content, client navigation with retained head styles, eight concurrent distinct scoped
hues and environment-guarded explicit-GC diagnostics pass. Next build logs preserve
prebundle dynamic-require warnings; this is not a zero-build-warning claim.

## Important boundaries

- **Aggregate delivery:** RuntimeChatBoundary emits all 47 explicit style families at
  mount. `style-inventory-v2.json` corrects the original accounting: 1,500,896 emitted UTF-8 CSS bytes. The preserved version1 total of 880,729 omitted ownership guards because its helper used an obsolete API signature. In each observed
  completed workload, 28 families have matching DOM selectors; 19 families totaling
  207,056 emitted bytes have no matching selectors. Even a matched family can contain
  many unused variants/states. This does not establish on-demand delivery or tree
  shaking. Inventory queries have zero invalid selectors.
- **Expanded workload:** `workloads.json` preserves raw source, bytes and SHA256.
  Chat is 3,166 bytes and dashboard 4,191 bytes. Each combines the historical scenario
  with one additional controls/layout/table/bar/line/pie block. These are not directly
  identical to historical full-chat timings. Both current arms share the exact program.
- **SSR initial state:** attempted render-phase public setMessages did not populate
  Zustand's SSR initial snapshot. The rejected result is preserved in
  `next-rejected-render-phase-preload.json`; the workaround was removed. There is no
  supported server-populated chat-store initial-state API claim. Separate Renderer
  SSR output must not be described as server-rendered stored assistant messages.
- **Fragment lifecycle:** placing an SSR fragment and its resource styles inside the
  hydrated root reproduced styles disappearing after unmount and suppressed resource
  reinsertion on remount. Native full-document SSR hoists styles into head and passes;
  native Next navigation passes. This does not fix fragment-host applications. No
  resource-key changes or hidden style manager were added. `SSR_DOCUMENT_MODE=fragment`
  and `debug-resource.mjs` preserve reproduction, with raw traces/failures in results.
- **Storage/resubmit:** the fixture backend implements the consumer persistence
  contract. Default in-memory storage does not restore subsequent messages. Retry is
  explicit user-message resubmission, not a native retry action.
- **Coverage:** open/closed portals and all variants are not all exercised inside full
  chat; the separate component catalog supplies bounded additional coverage. In the
  observed completed full-chat state, unobserved families include Modal/Tooltip,
  several history/artifact/detailed-view panels and empty/loading decorations. No
  arbitrary host reset, older-browser, strict-CSP, accessibility-completeness or
  production migration acceptance follows.

## Reproduction

Run from `/private/tmp/openui-runtime-expanded-chat`:

1. `node build.mjs`
2. `node ssr-check.mjs`
3. `node check.mjs`
4. `node inventory.mjs`
5. `node next-build.mjs`
6. `node next/node_modules/next/dist/bin/next build next --webpack`
7. `node next-check.mjs`

Standalone server: `PORT=4242 node server.cjs`. `REPLAY_RATE=0` selects unpaced
backpressure-aware streaming; default is 40 chunks/second. `CHUNK_BYTES` defaults128.
Next memory diagnostics require `PROTOTYPE_DIAGNOSTICS=1` and Node `--expose-gc`.
The measurement agent owns timing/soak commands and distinct server ports.

## Post-timing accounting and encoding correction

See `INVENTORY-CORRECTION.md`, `style-inventory-v2.json` and `encoding-v1.json`. All executed candidate/source/build hashes remain unchanged. The frozen standalone fixture decoded HTML as Windows-1252 because it omitted a charset declaration, corrupting Unicode CSS quotation glyphs. A separate two-navigation, header-only UTF-8 proxy control restores correct decoding and passes hydration/remount checks; it did not replace or rerun any timing or soak evidence. Next has its own UTF-8 document handling. The frozen browser field named bytes counts textContent UTF-16 code units, not transferred bytes.
