# React Router 7.18.5: streaming compatibility

Standalone production fixture for [#166](https://github.com/ankit-thesys/openui-comp/issues/166).
Port **5720** is reserved in `package.json`; both `unlayered` and `layered` modes run by default.
React and React DOM are 19.3.1. All direct versions are exact. Node 22 types match the harness
runtime; Playwright 1.56.1 matches the shared fixture. TypeScript 6.0.3 is the newest stable
major supported by React Router 7's build tooling. React Router stays on the latest stable 7.x
as required by the ticket (the registry's latest tag now points to 8.x).

The root route puts the full `/styles` collector result in a single `data-openui-styles` tag in
`<head>`, before both app stylesheets. Layered builds put the layer-order statement first and
collect with `{ layer: "openui" }`. The client reads the server sheet without `configureStyles`.
A 600 ms deferred loader renders all fixed sample components after the shell, under a light
ThemeProvider. Readiness waits for that subtree's hydration effect; the smoke test clicks the
sample Button to verify event handling too.

The app's single Playwright spec calls `shared/smoke.ts` with every assertion enabled. Local
assertions additionally verify a streamed fallback followed by server-rendered samples, UTF-8,
head placement and stylesheet order, an unchanged server sheet, zero browser component rules,
and zero JS append/insertRule writes to component sheets during hydration. Theme/default-token
sheets are outside the component-sheet audit, as in the shared contract.

From the repository root:

```sh
node fork/examples/compat/scripts/install-library.mjs react-router --update-lockfile
pnpm --dir fork/examples/compat smoke react-router --list-tests
pnpm --dir fork/examples/compat smoke react-router
```

For manual browser-free checks (keep the production server running in another terminal):

```sh
cd fork/examples/compat/react-router
OPENUI_COMPAT_MODE=layered pnpm build
pnpm start --port 5720
# Separate terminal, in the same app directory:
OPENUI_COMPAT_MODE=layered node scripts/check-stream.mjs
curl --fail --no-buffer -A "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36" http://127.0.0.1:5720/ > /tmp/react-router-layered.html
```

Repeat with `unlayered` for the other mode. `check-stream.mjs` requires the shell and late
component HTML to arrive in separate chunks at least 300 ms apart, and checks the full server
sheet and CSS order. It returns HTML for reuse by the smoke spec. No browser is launched by
this script or by `--list-tests`. The server binds only to `127.0.0.1`, requires its manifest
port, and fails on an occupied port.

There is intentionally no custom `app/entry.server.tsx`: framework mode selects the package's
Node default, which uses `renderToPipeableStream` and `onShellReady` for browser user agents.
`isbot` is pinned because that default entry requires it; declaring it avoids the framework
attempting an install during type generation/build. The default entry returns `text/html`; the
UTF-8 document declaration and streamed byte decoder verify encoding. Production mode is set
before importing the React Router adapter or server build.

The deferred delay stays below the harness readiness probe's one-second timeout. React Router's
default entry waits for all content for the probe's Node user agent; browser requests still
stream the shell immediately.
