# Expanded runtime full-chat investigation

This is a separate, unaccepted runtime candidate. Production source is unchanged.
The shell is the actual public AgentInterface, internal ChatProvider/Zustand store,
fetchLLM/AG-UI adapter and GenUI message renderer. Both arms use exactly the same
JavaScript and expanded response generator. `response.ts` appends one actual
controls/layout/table/bar/line/pie block to each historical chat/dashboard program.
These full-chat workloads are therefore not directly identical to historical timings.

Candidate styling executes Goober objects at runtime, using the explicitly patched
private Goober source in `vendor/`. It imports zero legacy stylesheets. Baseline
alone loads compiled production Sass. The library-owned RuntimeChatBoundary emits
all 47 explicit style families at once and adds a display:contents wrapper outside
the actual shell. This is aggregate full-shell coverage, not per-component delivery
or tree-shaking proof; emitted unused families are reported separately. Scoped
inline theme variables and a library-owned ThemeProvider selector prevent body leaks.

## Commands

- `node build.mjs`
- `PORT=4242 node server.cjs`
- `node ssr-check.mjs` — unseeded shell SSR/hydration, actual theme toggle and body sentinel
- `node check.mjs` — four actual expanded live-chat cases and conditional shell selectors
- `node inventory.mjs` — emitted families and observed DOM-selector matches
- `node next-build.mjs && node next/node_modules/next/dist/bin/next build next --webpack`
- `node next-check.mjs` — production Next shell SSR, separate actual Renderer companion,
  full HTTP send after hydration, navigation and concurrent scoped themes

Standalone routes accept `arm=baseline|runtime`, `scenario=chat|dashboard`, `size=2`.
`window.__fullChat` exposes mount/unmount, snapshot, send, cancel, retry (explicit
resubmission), newThread/select, theme and accent(value). Backend REPLAY_RATE defaults
40 chunks/sec; zero drains without timer pacing and honors writable backpressure.
CHUNK_BYTES defaults128. The event buffer is capped500; server history20/requestlog100.

The Next route has the same arms/scenarios and supports numeric accentSeed. Its
actual store is unseeded during SSR. `data-ssr-renderer-companion` explicitly labels
separate actual parser/chart SSR output. Render-phase setMessages was tried, rejected
by real SSR assertions (Zustand's initial snapshot remains empty), and removed.
The failed result remains under results/next-rejected-render-phase-preload.json.
There is no claim of a supported server-populated chat-store initial-state API.

## SSR fragment support remains open

Default standalone rendering uses native React full-document SSR, which hoists
resources into head. Native Next also owns the full document. Both preserve styles
outside the hydrated chat root across teardown/remount. Rendering a FullChat SSR
fragment directly inside that root reproduced a failure: unmount removes its SSR
style nodes, while React's resource cache then suppresses reinsertion on remount.
We added no style manager or changing resource keys to hide this limitation.
Set SSR_DOCUMENT_MODE=fragment to reproduce that construction; debug-resource.mjs
prints resource state through hydrate/unmount/remount. Preserved failure and corrected
full-document traces are in results/. Full-document correctness does not establish
fragment SSR support or a blanket zero-setup SSR contract.

Controls/state and portal/variant coverage is bounded by recorded checks. A synthetic
stacked/no-header DOM probe is explicitly distinguished from actual welcome→message
transitions. No production migration, acceptance, arbitrary host-reset guarantee,
strict CSP compatibility or long-run memory guarantee follows from these checks.
