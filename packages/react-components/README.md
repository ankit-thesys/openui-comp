# @openuidev/react-components (beta)

Reusable OpenUI React components, charts and themes, styled with Goober. It sits beside
`@openuidev/react-ui`, which stays unchanged.

## Install

```sh
pnpm add @openuidev/react-components react react-dom zod zustand
```

Peer dependencies: React 19, `zod` 3.25 or 4, and `zustand` 4.5.

## Usage

```tsx
import { Button, Input, ThemeProvider } from "@openuidev/react-components";

export function ContactForm() {
  return (
    <ThemeProvider>
      <Input aria-label="Name" />
      <Button variant="primary">Send</Button>
    </ThemeProvider>
  );
}
```

Every component, supporting part and type comes from the package root; there are no subpath
exports.

## Styling

Component rules go into one `<style id="openui-styles">` tag in the browser. The root also
exports `css` and `keyframes` for your own rules.

```ts
import { configureStyles } from "@openuidev/react-components";

// Optional: put every component rule in a cascade layer. Call once, before rendering.
configureStyles({ layer: "openui" });
```

Under a CSP nonce, set `window.__nonce__` before the component library loads.

### Server rendering

A server render sends the rules of the classes it rendered, and only those. Each component
renders React 19 hoisted `<style>` tags next to its elements; React writes each class once per
page, merges a flush's tags into one, and streams a Suspense boundary's rules with that boundary.
An app usually does nothing: Next.js (App Router and Pages), React Router, TanStack Start and
plain Vite SSR all work without a registry or stream hook.

In the browser, the server's tags move to the start of `<head>` before hydration, ahead of app
CSS. The browser sheet then writes the rules your bundle imports and skips classes the server
already sent, so no rule appears twice. ThemeProvider sends its theme variables the same way, so a
dark or custom theme is right before scripts run.

Classes inside an `<svg>` are the one exception to "only rendered classes": React renders a
`<style>` in place inside SVG, so a chart's HTML root sends the whole style modules its SVG
parts use.

### Layers in server-rendered apps

Layered mode is the recommended setup for server-rendered apps. Configure in code both the server
and the browser run, and give the app's whole layer order, which goes ahead of any component layer
because component rules come first in `<head>`:

```ts
configureStyles({ layer: "openui", order: "theme, base, openui, components, utilities" });
```

A browser that never calls `configureStyles` takes the layer and order from the server's tags.

Without layers, an app stylesheet of equal weight beats component rules only once scripts have
moved the server's tags ahead of it; until then, in frameworks that place app CSS first, the
component rule wins.

### CSP nonce

React keeps a hoisted tag's rules only when the tag carries the nonce passed to its server render
as `nonce: { style }`. Give `configureStyles` a function that returns the current request's nonce,
read from request-scoped storage so concurrent requests each get their own:

```tsx
import { AsyncLocalStorage } from "node:async_hooks";
import { renderToPipeableStream } from "react-dom/server";

const requestNonce = new AsyncLocalStorage<string>();
configureStyles({ layer: "openui", nonce: () => requestNonce.getStore() });

requestNonce.run(nonce, () => renderToPipeableStream(<App />, { nonce: { style: nonce } }));
```

`configureStyles` replaces every option on each call, so pass the layer, order and nonce together.

### Your own `css` classes

Classes from the component library's `css` reach server HTML the same way when you render
`styleRules` after the element that uses them. It renders nothing in the browser.

```tsx
import { css, styleRules } from "@openuidev/react-components";

const badge = css`
  padding: 2px 6px;
`;

export const Badge = ({ children }: { children: React.ReactNode }) => (
  <>
    <span className={badge}>{children}</span>
    {styleRules(badge)}
  </>
);
```

Render it after the element, not before: before it, React adds a text separator to the markup.

## Site map

```text
packages/react-components/
└── src/
    ├── index.ts               # the public entry: every export
    ├── components/            # one folder per component
    │   ├── Charts/            # area, bar, line, pie, radar and other charts
    │   ├── ThemeProvider/     # themes and token variables
    │   └── _shared/           # parts shared by cards, Markdown and icons
    ├── styles/                # the component sheet (css.ts), style tags and token defaults
    ├── context/               # layout and print context
    ├── hooks/                 # shared React hooks
    └── utils/                 # class name and preference helpers
```

## Stable selectors

Each component exposes stable `openui-*` classes and data attributes for overrides:

```css
.openui-callout--variant-warning {
  border-left: 4px solid #f59e0b;
}
.openui-tabs-trigger[data-state="active"] {
  color: #7c3aed;
}
```

## Development

```sh
pnpm --filter @openuidev/react-components run build
pnpm --filter @openuidev/react-components run typecheck
```

The build writes ESM and CJS bundles with declarations and source maps to `dist/`.
