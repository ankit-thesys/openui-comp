# Runtime Goober + actual OpenUI in production Next: base styled, not accepted

Final candidate: **scoped-extra-specificity**. `next-runtime.json` records the final production Next 16.4.2 build. The runtime arm compiles component object descriptors through Goober on server/client and owns React 19 style resources. Its consumer imports no component stylesheet, extraction/setup/registry or styling plugin, and passes no framework configuration to the library. The baseline links the full existing production stylesheet. Host stylesheet links are separate inputs.

Base correctness now passes. Actual renderer Buttons before JavaScript have requested blue/red backgrounds, white `oklch(0.994 0 89.876)` text, `7px 10px` padding, `8px` radius and the same accent border as baseline. A standalone RuntimeButton without ThemeProvider also passes its base style gate through declaration fallbacks. Complete default theme tokens come from a library-owned scoped runtime resource; there is no inline-accent shortcut. Eight concurrent JavaScript-disabled documents preserve the requested source marker and rendered theme. Hydration, forms, local theme changes, navigation and delayed first visible content pass without browser/React errors. The new delayed dashboard Table's sampled header styles match baseline at every observed visible mutation.

The candidate still fails requirements:

- Plain CSS, Tailwind 3 and Tailwind 4 host class overrides all lose to runtime component rules. The scope adds selector specificity. No framework-specific workaround or layer configuration was supplied to make these checks green.
- The actual runtime Button fails its hover state. After transition settling, baseline changes to `oklch(0.546 0.215 262.881 / 0.8)` while runtime retains `oklch(0.55 0.2 260)`. Goober changes the compound pseudo selector. No selector postprocessor or hidden fix was introduced.
- Scoped chart rules cannot reach tooltip portals outside their root. That path is unsupported, not certified by this table/Button matrix.

The full baseline's unchanged ThemeProvider correctly styles its default theme during SSR but emits custom overrides only after hydration; its custom red/blue SSR checks fail separately. Its unlayered stylesheet also defeats Tailwind 4 layered utilities, while baseline plain/Tailwind 3 overrides pass.

History is preserved rather than overwritten. `next-first-runtime.json` records the first adapter: it styled accent but both selected-module baseline/runtime lacked full default tokens, yielding black text/zero padding before hydration. Explicit padding/text/border/default-token gates replaced that inadequate accent-only gate. `next-where-failed.json`, `.md` and artifact hashes record the attempted `:where(&)` specificity adapter, which Goober translated into extra descendant selectors and left Buttons unstyled. The final candidate restores matching original scoped selectors, retaining full theme resources and declaration fallbacks. It restores base appearance while leaving specificity and hover failures visible. Runtime object descriptors are generated once from selected production Sass; this is not a completed hand-authored component port.

Final bounded SSR diagnostics run on the same compiled candidate: 100 responses, concurrency 10, 50 per arm, alternating themes/scenarios, all status/source-marker/runtime-theme-rule checks pass. Six deliberate aborts after the initial chunk are followed by a successful request. These are closed-loop local checks, not capacity, request timer cleanup or leak evidence. Shell and delayed content arrive in separate chunks. This work is separate from the earlier static twenty-minute soak.

Host Goober retains its own target and remains unchanged through library rendering. The tested browser bundle includes `goober.modern.js`. `next-build.json` records source inputs; `next-final-artifacts.json` records actual compiled artifacts and selected final source hashes. Next's prebundle selects the universal decoder and shares its React singleton; critical-dependency warnings remain for its require helper. Chrome only, representative components only; sampled table header parity does not certify every chart layout, portal, component state, CSP or browser.

Unknown listeners on 4213/4214 were preserved. The checker used and stopped its own 4215 server. It intentionally exits nonzero because requirements fail. No production files or frozen static fixtures were changed. User review is required before either approach is accepted.

```sh
node /private/tmp/openui-runtime-probe/next-build.mjs
npm run build --prefix /private/tmp/openui-runtime-probe/next
node /private/tmp/openui-runtime-probe/next-check.mjs
```
