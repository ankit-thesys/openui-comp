# Vite streaming SSR compatibility (#167)

Port **5731**. Production modes: **unlayered** and **layered**. React 19.3.1, Vite 8.3.5.

Vite builds separate client and server entries. `server.mjs` serves only production assets and
uses the client manifest for hashed JS/CSS URLs. It binds to `127.0.0.1` and refuses a port that
differs from the package manifest. Occupied ports fail rather than falling back.

`src/entry-server.tsx` calls the packed library's `/styles` `getComponentStyles()` once per
response, before `renderToPipeableStream` begins. It writes one `data-openui-styles` sheet in the
UTF-8 shell head before app CSS and the app-owned, initially disabled override stylesheet.
Layered mode passes `{ layer: "openui" }` and puts the layer-order statement before that sheet.
The client inherits its layer from the server sheet; it does not configure a second one.

A response-local 150 ms promise suspends the sample section. The Button and fallback flush
first, with the complete sheet already delivered; Card, Input, Select, Tabs and MiniLineChart
arrive in a later stream flush. The client hydrates after the stream and exposes an effect-based
hydration marker, so the shared smoke's duplicate and console assertions run after hydration.
No registry or incremental sheet injection is used.

`scripts/check-stream.mjs` checks the HTTP chunks, UTF-8 header, full sheet, head/CSS order,
configured layer, fallback and later content. The Playwright spec calls that same check, runs
every shared smoke assertion, compares the server sheet byte-for-byte before and after
hydration, and checks the shell Button's baseline styles in a context with JavaScript disabled.

From the repository root:

```sh
node fork/examples/compat/scripts/install-library.mjs vite-ssr --update-lockfile
pnpm --dir fork/examples/compat smoke vite-ssr --list-tests
pnpm --dir fork/examples/compat smoke vite-ssr
```

For a browser-free manual stream check, in this app directory:

```sh
OPENUI_COMPAT_MODE=layered pnpm build
pnpm start --port 5731
# In another terminal, with the same mode:
OPENUI_COMPAT_MODE=layered pnpm check:stream
curl --fail --no-buffer http://127.0.0.1:5731/
```

Omit the environment variable or use `unlayered` for the other mode. Use `--update-lockfile`
only for intentional lockfile changes. The implementation sandbox verified builds and HTTP
streaming; Chromium assertions must run on the orchestrator.
