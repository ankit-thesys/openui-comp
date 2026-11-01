# Signal House

A podcast studio landing page with Next.js App Router, React 19, and Tailwind CSS 4
through `@tailwindcss/postcss`.

From the repository root:

```sh
pnpm install
pnpm --filter @openuidev/react-components build
pnpm --filter @openuidev/example-next-tailwind4 dev
```

Open http://localhost:5612. Use `build` then `start` for production, or `typecheck`
for `tsc --noEmit`.

## Styling

`app/layout.tsx` renders `<ComponentStyles layer="openui" />` once, so every component rule
sits in `@layer openui`; `app/page-body.tsx` uses `ThemeProvider mode` for the light/dark
switch only. `app/globals.css` declares the layer order before importing Tailwind:

```css
@layer theme, base, openui, components, utilities;
```

Plain Tailwind classes on Button, Card, Tag, Input and TextArea then beat the
component styles, with no important modifier; the primary button's violet
background, pill shape and padding are examples. Tailwind's preflight, in `base`,
ranks below `openui` and leaves the components styled.

## Server rendering

`<ComponentStyles>` puts the whole component sheet in `<head>` as one `<style>`, so the page
is styled before JavaScript runs, streamed content included. On hydration the browser reads
that tag and writes nothing it already has.

The session form validates locally and displays a confirmation. It never sends
personal details or books a session.
