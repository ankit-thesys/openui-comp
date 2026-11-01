# Next.js App Router compatibility (#165)

Standalone packed-library consumer. Next.js 16.4.3, React/React DOM 19.3.1,
Tailwind 4.3.3 and TypeScript 7.0.2 are exact stable registry versions checked on
2026-10-31. Playwright 1.56.1 matches the harness; Zustand 4.5.7 matches the library's peer range.

Run from the repository root:

```sh
node fork/examples/compat/scripts/install-library.mjs next-app --update-lockfile
pnpm --dir fork/examples/compat smoke next-app
```

Only use `--update-lockfile` when creating or intentionally changing the lockfile.
The ordinary harness command checks both CSS modes and all four servers:

| Playwright project    | Port | Next command                       |
| --------------------- | ---- | ---------------------------------- |
| turbopack-production  | 5710 | next build --turbopack; next start |
| webpack-production    | 5711 | next build --webpack; next start   |
| turbopack-development | 5712 | next dev --turbopack               |
| webpack-development   | 5713 | next dev --webpack                 |

`pnpm build` builds both production outputs, then typechecks the app and shared/local specs.
`pnpm start --port 5710` supervises all four servers, rejects occupied matrix ports, binds
127.0.0.1 and stops the other children if any server fails. Each server and CSS mode has its
own build directory and generated TypeScript configuration. TypeScript incremental checking
is disabled to keep old Next validator diagnostics out of subsequent modes. No browser or
server starts when listing tests. `OPENUI_COMPAT_MODE` defaults to `unlayered`.

Every project tests `/` (force-static), `/dynamic/request-time` (force-dynamic, awaited params)
and `/stream` (force-dynamic, 1.5-second Suspense delay before the component samples).
Each route calls `shared/smoke.ts` with every assertion enabled. The readiness marker requires
a hydration effect; local assertions require the server sheet in head and zero browser-sheet
rules, since this fixture registers no browser-only styles. Console listeners span all checks.

A separate test reads the streaming response incrementally, requiring a full sheet and
fallback in an earlier chunk than the late components. It then blocks external scripts and
checks Button, Card, Input and Select computed styles while the hydration marker is still
false. Inline React boundary reveal scripts remain enabled, so the delayed DOM becomes visible.

The root layout renders `ComponentStyles` once. In layered mode it imports Tailwind CSS from
the root, starting with `@layer theme, base, openui, components, utilities;`. In plain CSS mode
it imports app CSS only from the nested samples layout, per the library README. Build aliases
select a no-op module at the opposite depth, so plain mode imports no Tailwind preflight.
The specs pin the corresponding stylesheet positions.

The real app stylesheet contains the equal-weight `.openui-button` background override under
`@media print`. The shared helper's `enableOverrides` uses Playwright's print media emulation
after default-theme checks. This activates an existing app rule without injecting CSS or
increasing selector specificity. Both modes must compute `rgb(1, 2, 3)`.

For browser-free inspection of a single server, use three shells (choose matching mode/server):

```sh
cd fork/examples/compat/next-app
OPENUI_COMPAT_MODE=layered pnpm build
OPENUI_COMPAT_MODE=layered pnpm start --port 5710 --server turbopack-production
OPENUI_COMPAT_MODE=layered node scripts/check-html.mjs turbopack-production
OPENUI_COMPAT_MODE=layered pnpm test:smoke --list
```

Without a server argument, `check-html.mjs` checks all four ports using curl. It requires a full
server sheet in head, the selected layer, no browser sheet in server HTML, the mode marker,
and CSS ordering. For layered mode it fetches the app CSS and checks the layer-order recipe.
The `/stream` HTML must contain fallback before late content.

This sandbox cannot run Chromium. Turbopack dev also hits a sandbox FSEvent startup failure;
keep its project enabled and run the ordinary harness on the orchestrator. No library or
shared harness assertions are disabled.

Setup references: [library README](../../../../packages/react-components/README.md#server-rendered-styles),
[ADR amendment](../../../react-components-dev/docs/adr/0002-hookfree-css.md#amendment-append-only-sheet-162),
[Next CLI](https://nextjs.org/docs/app/api-reference/cli/next),
[Tailwind Next setup](https://tailwindcss.com/docs/installation/framework-guides/nextjs).
