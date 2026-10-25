# Chat-kit validation checkpoint

Production source: `8405f44e0`. The immutable consumer and exact archive file
hashes are recorded in artifact-manifest.json. Every installed core/kit file was
compared against its archive; consumer package and lockfiles are preserved.

Package CI passes seven tests plus format, lint, types, build, Publint and ATTW.
Six copied-renderer hook warnings remain; no lint errors. Tests cover public
entries, native ESM/CJS and strict Bundler/NodeNext ESM/CJS types; retained-byte
component/library pruning; actual parser chunks; Renderer streaming-disabled
forms, validation, action events, history restoration and clear/unmount.
The packed test disables lifecycle scripts using standard npm configuration:
it tests built artifacts without rebuilding a dependency while another test
imports it. The original lifecycle race failure remains recorded.

The production-Vite browser run in browser-final.log exercises actual streamed
HTTP text, markdown, two painted chart bars, table rows, forms/actions, saved
history, cancellation/restart/clear, scoped themes/logos/portal selection and
explicit framework overrides. Six framework/order scenarios completed with no
page errors or live streams. An expected cancelled fetch reports ERR_ABORTED;
a favicon 404 and standard Rollup client-directive/chunk-size warnings are not
application page errors. The isolated no-provider Card gap failed at `normal`
before the conventional 12px variable fallback; spacing-red.log preserves it.

**Browser acceptance remains provisional.** Final review found that hover
samples could be taken before transitions settled and stylesheet placement was
scheduled but not directly asserted. The current runner now waits for host CSS
readiness, asserts its position relative to `_goober`, waits for animations and
requires a distinct host hover color before comparing kit output. This revised
runner must be executed after the current browser owner's release. The executed/
copy is the previous run and is deliberately not rewritten as new evidence.
Worker2's independent component matrix and the separate verifier are pending.

The host CSS assets and tool versions are retained byte-for-byte under host/.
Use CORE_HOST_STYLES pointing to that directory, KIT_CONSUMER to the immutable
installed consumer, and CORE_BROWSER_TOOLS to the existing core tooling package.
No user CSS import, setup plugin, custom Goober runtime or dependency patch was
added. No SSR, full visual parity, #17 performance/soak or error-free claim.
Legacy packages, assembled openuiLibrary, helpers and AgentInterface remain
unchanged. Earlier core HorizontalBar default-height limitation remains open.
