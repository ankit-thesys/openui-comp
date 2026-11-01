# Next.js Pages Router compatibility (#165)

Standalone packed-library consumer, port 5714 from `package.json`. Exact versions match the
App Router fixture: Next 16.4.3, React/React DOM 19.3.1, Tailwind 4.3.3, TypeScript 7.0.2,
Playwright 1.56.1 (harness pin), Zustand 4.5.7 (supported peer range).

From the repository root:

```sh
node fork/examples/compat/scripts/install-library.mjs next-pages --update-lockfile
pnpm --dir fork/examples/compat smoke next-pages
pnpm --dir fork/examples/compat smoke next-pages --list-tests
```

Only use `--update-lockfile` when creating or intentionally changing the lockfile.
The harness runs both CSS modes. `pnpm build` performs a real Turbopack production build,
then typechecks the app and local/shared specs. `pnpm start --port 5714` rejects an occupied
port and binds 127.0.0.1. Test listing starts no browser or server.

`pages/_document.tsx` imports `getComponentStyles()` from the packed `/styles` entry and
inlines one full `data-openui-styles` sheet in `Head` before Next's app stylesheets. Layered
mode passes `{ layer: "openui" }` and emits the order statement before that sheet. `_app`
loads the selected global CSS. Plain mode imports no Tailwind; layered mode includes Tailwind
4 with the layer order recipe. Each mode has its own build output and generated tsconfig;
TypeScript incremental checking is disabled to avoid stale Next validator diagnostics.

The smoke spec uses `shared/smoke.ts` on `/` (static) and `/dynamic/request-time`
(`getServerSideProps`). All shared assertions remain enabled. The ready marker requires an
effect after hydration. Local assertions require the full sheet in head, plain CSS after it,
zero browser component rules and no hydration errors. The fixture registers no browser-only
rules. Console listeners span the local assertions too.

The app's real `.openui-button` override lives under print media. `enableOverrides` activates
print media only after shared default-theme checks. It must win with one class, without CSS
injection or added specificity, in both modes.

Manual inspection, with a server running in a separate shell:

```sh
cd fork/examples/compat/next-pages
OPENUI_COMPAT_MODE=layered pnpm build
OPENUI_COMPAT_MODE=layered pnpm start --port 5714
OPENUI_COMPAT_MODE=layered node scripts/check-html.mjs
OPENUI_COMPAT_MODE=layered pnpm test:smoke --list
```

The curl script checks both routes for a full sheet in head, correct layer and stylesheet
order, no browser tag in server HTML, and the selected mode marker. Layered mode requires the
order statement before the server sheet. Chromium checks must run on the orchestrator.

See [App Router matrix and report](../next-app/README.md) and the
[library's server setup](../../../../packages/react-components/README.md#server-rendered-styles).
