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

Card content and controls currently accept empty arrays: their component unions will expand as subsequent tickets register the visuals and filters. Empty cards faithfully display the source's invalid-definition state. Layout descriptions and argument order are retained from dashboards-ui-library, including references to these future components.
