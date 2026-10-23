# Component-owned full-chat runtime investigation

This scratch preserves the original baseline and actual AgentInterface, ChatProvider, store, AG-UI adapter and parser. Runtime source copies compose ordinary forwardRef OwnedElement nodes at explicit original class owners. Each immutable definition compiles lazily once and uses native React style resources. There is no eager 47-family boundary, response scan, global emitter or new style manager. This is an investigation, not production acceptance.

Core source and inherited private Goober parser/rollback guard limitations are frozen separately in `/private/tmp/openui-runtime-owned-components/FINAL-SOURCE-SHA256.json`. The server-side detached target remains inherited experimental support. The shell generator includes every authored selector; `results/shell-unassigned.json` must be empty. Original ancestor rules stay at their genuine ancestor owner. Closed RenameDialog emits no definitions before opening. SVG primitive attachments are class-only; their HTML/component owner supplies native resources.

The baseline imports the untouched production source graph, with zero OwnedElement render/compile counters. Candidate source copies additionally apply the existing public useTheme().portalThemeClassName pattern to shell portal roots; original baseline portal token behavior is recorded rather than silently changed. The failed pre-fix result is preserved as `results/full-chat-before-portal-fix.json`.

Reproduce from this directory:

```sh
node prepare-shell.mjs
node build.mjs
node next-build.mjs
(cd next && npm run build)
node check.mjs
node ssr-check.mjs
node next-check.mjs
```

`prepare-shell.mjs` includes the reproducible portal source composition pass. Do not run it during measurements. Local correctness ports are 4342 and 4343. Backend supports PORT, REPLAY_RATE (default 40 chunks/s; 0 honors backpressure without timer pacing), CHUNK_BYTES (default128). New standalone HTML includes UTF-8 header and meta. Next backend proxy is configurable through PROBE_BACKEND_URL at build time. PROTOTYPE_DIAGNOSTICS=1 permits explicit GC on diagnostics; Next reports actual process memory, not a separately imported counter instance.

The common expanded chat/dashboard response generator is `response.ts`; both arms use identical content. This workload is not identical to the historical small chat timing workload. Browser API is `window.__fullChat` with mount/unmount/snapshot/send/cancel/newThread/select/retry/theme/accent, plus direct `window.__readStyleCounters()`. Accent updates retain store state; mount creates a fresh store; event buffer is bounded500. `theme()` toggles mode. Counters are bounded scalars and compileCount reflects first use rather than send count.

Full chat correctness covers actual composer input, pending/partial/exact final source, multiple messages, history, cancellation/resubmit, expanded controls and chart geometry, scoped themes, conditional header/welcome branches, lazy modal resources and teardown/remount. A separate synthetic no-header style probe is labelled in raw results. Resources must hoist to head without in-app style tags, global Goober tags or duplicate href keys.

SSR uses an unseeded actual chat shell. Next includes a separately labelled actual Renderer SSR companion for completed response content; it does not preload ChatProvider state or claim server execution of a conversation parser. Next browser checks perform actual live send and client navigation after hydration. Full-document/head resource hoisting is the supported tested path. SSR fragment root teardown remains an inherited open support limit; no cache-key churn or restore manager was added. No performance or long memory claim is made by correctness results. Next build retains known bundled dynamic-require warnings and skips TypeScript validation as the prior fixture did.
