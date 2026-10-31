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

## Site map

```text
packages/react-components/
├── src/
│   ├── index.ts               # the public entry: every export
│   ├── components/            # one folder per component
│   │   ├── Charts/            # area, bar, line, pie, radar and other charts
│   │   ├── ThemeProvider/     # themes and token variables
│   │   └── _shared/           # parts shared by cards, Markdown and icons
│   ├── styles/                # style registration and token defaults
│   ├── context/               # layout and print context
│   ├── hooks/                 # shared React hooks
│   └── utils/                 # class name and preference helpers
└── docs/
    └── reference/
        └── selectors.md       # generated list of every stable class and data attribute
```

## Stable selectors

Each component exposes stable `openui-*` classes and data attributes for overrides. The full
list is in [docs/reference/selectors.md](docs/reference/selectors.md).

## Development

```sh
pnpm --filter @openuidev/react-components run build
pnpm --filter @openuidev/react-components run typecheck
```

The build writes ESM and CJS bundles with declarations and source maps to `dist/`.
