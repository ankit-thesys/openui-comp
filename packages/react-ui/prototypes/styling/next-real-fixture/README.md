# Actual OpenUI production Next fixture

From the parent styling directory, after `npm ci`, `npm ci --prefix real` and installing the existing next-fixture dependencies:

```sh
npm run build:real
node scripts/prepare-next-real.mjs
npm run build --prefix next-real-fixture
node scripts/check-next-real.mjs
```

The checker owns port 4183 and refuses to reuse an occupied server. It writes results/next-real.json. Both CSS arms share the same bundled production React components/parser; Goober executes only in the preceding static CSS build. The fixture uses the existing isolated Next installation via a generated symlink. The decoder alias selects its universal implementation because its browser export accesses document during module evaluation and cannot execute on the server.

`entry.tsx` contains a fixture-only automatic theme helper: a child of the real ThemeProvider reads its resolved context and renders a scoped token rule during SSR and hydration. The unadapted provider uses insertion effects and has no server token CSS; the checker deliberately reproduces this gap. No production source is changed. The helper covers inline content; it does not certify portaled themes.

Tailwind 4 selection automatically uses a package-built layered asset in both arms: `@layer theme,base,components,utilities` then OpenUI CSS in `components`. Plain CSS and Tailwind 3 use early unlayered component CSS. All three framework overrides are checked before JavaScript, after hydration and at delayed reveal. A separate `policy=legacy` probe reproduces the default unlayered stylesheet conflict with Tailwind 4. This adapter is prototype packaging, not an upstream source change.

For isolated process observations, launch with `PROTOTYPE_DIAGNOSTICS=1 node --expose-gc next-fixture/node_modules/next/dist/bin/next start next-real-fixture --hostname 127.0.0.1 --port 4186`. `/api/diagnostics` returns memory, pid and uptime; `?gc=1` runs GC only with the environment guard and exposed function. Page parameters: `scenario=chat|dashboard`, `arm=baseline|generated`, `theme=red|blue`, `bridge=off` (omit to enable helper), `framework=none|plain|tailwind3|tailwind4`. Pages are dynamic; the delayed real workload resolves after 650ms.
