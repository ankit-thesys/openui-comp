# Complete runner prerequisite audit for Worker1 (#17)

Source-only audit of runner `f2aad47ac` (unchanged at `24f52fef0`). This covers
`run.mjs`, `provenance.mjs`, `browser.mjs`, `analysis.mjs` and `protocol.mjs`.
It is a checklist for a **new immutable handoff**, not permission to edit V1/V2
or a claim that browser-only preflight exercises every runner gate. Do not run
formal modes until Worker1 freezes the complete contract and releases the window.

## Gates before any browser can launch

1. Explicit release: `BETA17_QUIET_WINDOW_RELEASED=yes`. CLI mode is exactly
   `benchmark` or `soak`, with a readable manifest path and a new output path.
2. Manifest parses as JSON; `schemaVersion` is numeric `1`; `consumer` is an
   absolute path; `productCommit` is present and identifies the frozen artifact
   source. `inputs` is nonempty. Keep the hash of the exact manifest bytes.
3. `runtimeModules` is nonempty. **Every listed module path is an exact key in
   `inputs`.** This check uses exact strings; the runner does not canonicalize
   these keys. Prefer canonical absolute paths in both places. A `/tmp` versus
   `/private/tmp` alias, relative path, or a hash stored only under a separate
   proof/package-relative path will not satisfy this guard.
4. Every `inputs` key is absolute, readable as a file and hashes to its declared
   SHA256. The runner computes lowercase 64-character SHA256 from actual bytes.
   Include all declared runtime modules, including nested third-party files,
   not only core/kits. Preserve the existing replay/client/server/build/served
   files, installed package/lock/archive provenance and module-origin evidence.
   Hash a separate proof file too when it is part of the claimed frozen chain.
5. All four exact cell keys exist: `chat/paced`, `chat/stress`,
   `dashboard/paced`, `dashboard/stress`. Each has nonempty `expectedText`,
   `expectedDom`, `renderedRoot`, `requiredText`, and lowercase 64-hex
   `payloadSha256`/`scheduleSha256`. Expected source must be the exact final
   assistant source, not a rendered-text approximation. Both arms use identical
   payload bytes, chunk boundaries, schedule and workload configuration.
6. Independent installed inventory succeeds. From the consumer's package.json,
   Node public-entry resolution must find `@openuidev/react-ui-core` and
   `@openuidev/kits/react/chat`. The resolved real entries must lie inside the
   consumer's real `node_modules`, under a matching package's `dist`, with the
   expected package names. Workspace/source symlinks outside that directory are
   rejected. Each installed `dist` tree must be readable and contain ordinary
   files/directories (no symlink entries). Inventory includes both package.json
   files, both entire dist trees and the consumer package.json.
7. Exactly one consumer-root lockfile exists among `package-lock.json`,
   `pnpm-lock.yaml`, `yarn.lock`, `npm-shrinkwrap.json`; it is hashed too.
8. Playwright resolves from the consumer or the explicit existing absolute
   `BETA17_PLAYWRIGHT_MODULE` path. Current tools use Playwright 1.59.1. Node must
   support `import.meta.dirname` (tested Node22.22.2). No installation/build is
   performed by the runner.
9. The output directory must **not exist**; its parent is writable. Manifest and
   runner-source copies can be written there. This preserves prior evidence.
10. The browser is now an isolated pinned Chrome for Testing build, not the user's
    auto-updating Chrome channel. Follow `CFT-HANDOFF.md`: `browser` metadata,
    exact executable hash, all extracted app-file hashes and symlink targets are
    required. The full runner verifies these before launches and after execution;
    there is no installed-Chrome fallback. Both arms use the same binary and
    `1280×900` viewport. CDP and process RSS access must be permitted. These are
    operator prerequisites, not component-consumer setup. The prior system-Chrome
    assumption is preserved only in historical V1–V4 evidence.

## Browser contract (exercise all cells and both arms)

- `origin` plus each cell's `urls.baseline`/`urls.runtime` serves the intended
  isolated built application. Worker2 adds a unique `session` query parameter.
  The fixture forwards it on transport requests. Public entry/module-origin
  build evidence must establish installed packages and no arm mixing. Root
  response state is ordinary fixture state; do not claim a headless chat store.
- `selectors` contains `ready`, `mounted`, `mount`, `unmount`, `start`, `cancel`,
  `status`, `message`, `input`, `theme`. Each selector uniquely identifies its
  existing control/output. Ready/mounted text is `true`/`false`; status is
  `streaming`/`idle`. Hidden final-source output remains readable as textContent.
  Mount/unmount controls remain outside the rendered subtree.
- `input` and `theme` are ordinary fillable inputs. Theme accepts degree values
  mapped through the existing ThemeProvider API. Each paced sample fills a
  distinct sequence value, matched between arms; before/after input values must
  differ. Both status and server activity must still show streaming before and
  after the measured fill. UI readiness alone is insufficient evidence.
- Every `expectedDom` probe has a valid public DOM `selector` and exact numeric
  `count` verified from both arms. The semantic form probe is
  `main [role="form"]`, not native `main form`. Dashboard has a `bars` probe;
  all expected bars must also have positive width and height. `requiredText`
  strings must be present under `renderedRoot`. Final source/idle and final
  rendered correctness plus two frames are separate observations.
- `statsPath` supports `?session=ID` and returns session-scoped cumulative
  `started`, `completed`, `cancelled` and current `active`, `activeTimers`.
  A complete stream increments started/completed by exactly one without
  cancellation. Checkpoints after completion/unmount must have active/timers0.
- `streamPath` identifies the actual fetch request pathname. Cancellation must
  begin while exactly one stream is active and its nonempty source is a strict
  prefix of expected source. Chrome observes requestfailed with an abort error,
  server cancelled increments once, status becomes idle, active/timers become0.
  An already-completed response cannot serve as a cancellation sample.
- No page errors are allowed. Final rendering must remain correct across
  repeated mount/unmount, cancellation and theme changes. Snapshot reads all
  stylesheets' cssRules; cross-origin access failures cannot be ignored.
- Memory collection uses standard CDP metrics/DOM counters, owned process IDs
  and `ps` RSS. A process-sampling error invalidates that run; never substitute0.

## Report/integrity gates after running

- Manifest schema/hash and complete before-input map match the manifest, and
  after-input map is identical. Independent installed-file before/after maps
  match. Any recorded error makes evidence invalid. Do not mutate the handoff,
  proof, lock, packages, served output or replay files during a run.
- Benchmark: 8 excluded first streams plus exactly80 measured streams: four
  cells × ten pairs × two arms, AB/BA alternating within each cell. Every sample
  preserves raw final source/hash, correct counts/text, idle and zero live
  resources. Each workload/arm has ten valid paced input observations.
- Primary completion: per-cell median regression <=10%, p95 <=15%. Rendered
  readiness timings remain separate diagnostics. Each workload/arm paced
  input-command p95 <=100ms. Never pool chat/dashboard or arms to hide a breach.
- Soak: both workloads, separate processes per arm, 12 warmup cycles, at least
  ten minutes each, at least ten measured cycles, 30-second natural checkpoints
  through600s, and genuine cancellation each tenth cycle/arm. Preserve target
  and actual sample times. All checkpoints follow unmount; warm/terminal
  endpoints use two standard garbage collections, natural samples do not.
- Per arm/workload retained heap growth <=5MiB; style tags/rules/bytes plateau;
  active streams/timers0 at every checkpoint. Gross RSS growth >100MiB flags
  investigation with per-process evidence; it does not silently become a heap
  failure or pass. Endpoints precede memory pressure or tab closure.

Worker1 should validate every declared runtime-module key/hash and all schema,
public DOM and transport prerequisites together before issuing V3. Worker2
will rerun these gates before formal execution. An 8/8 browser-only preflight
alone does not validate the immutable inventory gate. Keep V1/V2 failure and
preflight artifacts; no product changes or guard weakening are requested.
