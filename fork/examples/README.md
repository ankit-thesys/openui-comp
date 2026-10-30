# React component examples

Three standalone, fictional products built with `@openuidev/react-components`.
Each demonstrates a different styling integration, with a light/dark switch,
responsive layouts, interactive tabs and FAQs, and local-only demo forms.

| App                               | Stack                                      | Mode                                                           | Port |
| --------------------------------- | ------------------------------------------ | -------------------------------------------------------------- | ---- |
| [Fieldwork](./vite-plain-css)     | Vite, React 19, TypeScript, plain CSS      | Unlayered; stable classes and theme variables                  | 5611 |
| [Signal House](./next-tailwind4)  | Next.js App Router, React 19, Tailwind 4   | `configureStyles({ layer: "openui" })`; ordered cascade layers | 5612 |
| [Common Ground](./next-tailwind3) | Next.js App Router, React 19, Tailwind 3.4 | Unlayered; `body`-weighted utilities                           | 5613 |

From the repository root, install and build the library before starting an app:

```sh
pnpm install
pnpm --filter @openuidev/react-components build
```

The library exports its built `dist/` files. Rebuild it when switching to a
checkout with different library code. Each app README contains its run commands
and styling notes. These examples are private workspace packages and are excluded
from upstream by the fork's export script.
