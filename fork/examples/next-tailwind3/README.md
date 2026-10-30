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

## Server rendering and override weight

`app/style-registry.tsx` keeps one `createStyleRegistry()` per response and inlines each
`registry.flush()` through `useServerInsertedHTML` into a `<style id="openui-styles">` tag:
the first holds every rule so far, later ones only the new rules. The page is styled before
JavaScript runs, and the browser merges the tags so each rule appears once after hydration.

Next places these tags after the app stylesheet, so a component rule beats an
app rule of equal weight. Two settings give the app's CSS one extra element of
weight, without `!important`:

- `tailwind.config.ts` sets `important: "body"`, so utilities compile to
  `body .bg-emerald-700` and beat the component styles; the hero button shows it.
- The stable-class overrides at the end of `app/globals.css` start with `body`,
  for example `body .openui-button` and
  `body .openui-tabs-trigger[data-state="active"]`.

The visit form validates locally and displays a confirmation. It never sends
personal details or makes a real booking.
