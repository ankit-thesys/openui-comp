# Dashboard library next

The dashboard port's layout foundation: `Dashboard`, `Section`, `Row`, and `Card` in one OpenUI Lang library.

```tsx
import { library, ThemeProvider } from "@openuidev/dashboard-library-next";
import { Renderer } from "@openuidev/react-lang";

<ThemeProvider mode="dark" lightTheme={{ series1: "#6155e8" }}>
  <Renderer library={library} response={program} />
</ThemeProvider>;
```

The provider owns dashboard tokens (`--openui-dashboard-*`). Token override keys are camel case, such as `surfaceSubtle`, `series1`, and `space2xl`. Each mode merges its overrides over that mode's defaults. When `darkTheme` is omitted, `lightTheme` overrides apply to both modes, following the react-components provider mechanism. Mode inherits from the nearest dashboard provider and otherwise defaults to light. Every provider creates its own scope, including sibling providers. A Dashboard outside a provider installs the light defaults in its own scope.

Only `library` and `ThemeProvider` are public exports. The internal theme context also carries a portal class for components added in subsequent tickets. Styles use the react-components `css` tag; no stylesheet import is needed.

Components come in groups, one file each in `src/groups/`. A group ticket fills in its own file and nothing else: `src/groups/index.ts` imports every group and, by component name, puts each component in his slots (Card content, Card controls, Section rows, Dashboard children) and in his prompt order. `src/prompt.ts` holds his prompt groups and notes in full; it shows only registered components and holds back notes that name components not yet registered, so the prompt becomes his word for word once every group has landed.

Selectors in the `css` tag never put a comma inside parentheses (`:is(a, b)`, `:not(:has(a, b))`): goober splits selectors at every comma, which breaks them. List the alternatives as separate selectors.
