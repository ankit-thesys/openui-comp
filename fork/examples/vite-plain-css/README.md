# Fieldwork

A garden planning landing page using Vite, React 19, TypeScript, and plain CSS.

From the repository root:

```sh
pnpm install
pnpm --filter @openuidev/react-components build
pnpm --filter @openuidev/example-vite-plain-css dev
```

Open http://localhost:5611. Use `build` for a production bundle, `preview` to
serve that bundle on the same port, and `typecheck` for `tsc --noEmit`.

## Integration

`ThemeProvider mode` controls light and dark themes. Component styles stay in
their default unlayered mode; no Tailwind or CSS processing plugin is needed.
`index.html` reserves an empty `<style id="_goober">` first in `<head>`; the
library writes its rules there, so the app stylesheet loads after it and wins ties.

Overrides are in `src/styles.css`: `--openui-*` variables scoped to `.fieldwork`
customize the palette, while stable classes such as `.openui-button` and
`.openui-tabs-trigger[data-state="active"]` customize shape and interactive
states without `!important`. App-scoped tokens inherit into controls; Select's
portal receives its theme from ThemeProvider.

`src/App.tsx` contains the page and local interactions. The form validates an
email and displays a confirmation without sending or storing information.
