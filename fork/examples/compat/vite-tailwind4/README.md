# Vite + Tailwind 4 compatibility (#167)

Port **5732**. Production mode: **layered**. React 19.3.1, Vite 8.3.5, Tailwind CSS and
`@tailwindcss/vite` 4.3.3. Tailwind's complete preflight remains enabled via `@import "tailwindcss"`.

The Vite HTML transform emits the documented recipe before the app's CSS:

```html
<style>
  @layer theme, base, openui, components, utilities;
</style>
<style id="openui-styles"></style>
```

`configureStyles({ layer: "openui" })` runs synchronously in the entry's import graph, before
the first microtask write. The empty sheet reserves its position. The layer order is in HTML,
not solely in the CSS file. Only layered mode is registered with the harness: ordinary Tailwind
utilities on a component need this mode to win under the documented contract.

The smoke retains every shared default-theme, sheet, duplicate, layer, console, and stable-class
override assertion. Those unchanged default samples prove that preflight preserves component
backgrounds, radii, padding and fonts. An unstyled native button separately proves the preflight
is active. After the app-owned override check, the spec disables that stylesheet and clicks an
app control that adds `bg-red-500 rounded-none px-8` to the same library Button. It checks the
utility background against an ordinary utility-styled element and checks zero radius and 32 px
horizontal padding. No important modifier, extra-specific selector or injected test CSS is used.

From the repository root:

```sh
node fork/examples/compat/scripts/install-library.mjs vite-tailwind4 --update-lockfile
pnpm --dir fork/examples/compat smoke vite-tailwind4 --list-tests
pnpm --dir fork/examples/compat smoke vite-tailwind4
```

Use `--update-lockfile` only for intentional lockfile changes. Builds and production HTML/CSS
checks run in the implementation sandbox; computed cascade behavior must run in Chromium on
the orchestrator.
