# Common Ground

A neighborhood workspace landing page with Next.js App Router, React 19,
Tailwind CSS 3.4, a Tailwind configuration, and PostCSS.

From the repository root:

```sh
pnpm install
pnpm --filter @openuidev/react-components build
pnpm --filter @openuidev/example-next-tailwind3 dev
```

Open http://localhost:5613. Use `build` then `start` for production, or `typecheck`
for `tsc --noEmit`.

## Styling

The app uses the library's default **unlayered** mode. Do not call
`configureStyles({ layer })` with Tailwind 3: its preflight is unlayered and would beat layered component rules.
`ThemeProvider mode` controls the light/dark switch.

## Server rendering and override order

`app/layout.tsx` renders `<ComponentStyles />` once: the whole component sheet as one `<style>`
in `<head>`, so the page is styled before JavaScript runs. On hydration the browser reads that
tag and writes nothing it already has.

`app/page.tsx`, not the root layout, imports `globals.css`. Next then places the app stylesheet
after the component sheet, so equal-weight app rules win with no extra weight and no
`!important`: Tailwind utilities such as the hero button's `bg-emerald-700`, and the
stable-class overrides at the end of `globals.css`, such as `.openui-button` and
`.openui-tabs-trigger[data-state="active"]`.

The visit form validates locally and displays a confirmation. It never sends
personal details or makes a real booking.
