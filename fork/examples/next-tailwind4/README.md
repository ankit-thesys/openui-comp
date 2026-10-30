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

`app/style-registry.tsx` calls `configureStyles({ layer: "openui" })` once, on the server
and in the browser, so every component rule sits in `@layer openui`; `app/page-body.tsx`
uses `ThemeProvider mode` for the light/dark switch only. `app/globals.css` declares the
layer order before importing Tailwind, and `app/layout.tsx` repeats it at the top of
`<head>` followed by an empty `<style id="openui-styles">`, the library README's recipe. Next
hoists the globals.css link above both, so its declaration comes first in practice:

```css
@layer theme, base, openui, components, utilities;
```

Plain Tailwind classes on Button, Card, Tag, Input and TextArea then beat the
component styles, with no important modifier; the primary button's violet
background, pill shape and padding are examples. Tailwind's preflight, in `base`,
ranks below `openui` and leaves the components styled.

## Server rendering

`app/style-registry.tsx` keeps one `createStyleRegistry()` per response and inlines each
`registry.flush()` through `useServerInsertedHTML` into a `<style id="openui-styles">` tag:
the first holds every rule so far, later ones only the new rules. The page is styled before
JavaScript runs. The browser adopts the first `openui-styles` tag and merges the later ones
into it, so each rule appears once after hydration. Next places these tags after its own
stylesheet; in layer mode that order does not matter, because the layer order comes first.

The session form validates locally and displays a confirmation. It never sends
personal details or books a session.
