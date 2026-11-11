# The dashboard library draws with recharts and owns its theme

The dashboard library draws every chart with recharts, as dashboards-ui-library does, even though `@openuidev/react-components` has its own D3 charts. react-components is not changed for this port. The dashboard library uses it only for the `css` tag. Anything else it needs is copied into the dashboard library and rewritten there.

The ThemeProvider is written from scratch in the dashboard library, using the same mechanism as react-components' ThemeProvider. Mode comes from the `mode` prop, then the nearest dashboard ThemeProvider above it, then light. The `lightTheme` and `darkTheme` overrides are typed against the dashboard's own tokens. Variables are written to a scoped selector, and nested providers auto-scope. It does not read react-components' ThemeProvider. A `Dashboard` with no provider above it applies the default theme itself.

Styles are rewritten from his plain stylesheet into the `css` tag. The theme tokens are his set (series colours, sequential and diverging ramps with their text inks, the muted mark, surfaces), renamed from `--pdk-*` to `--openui-dashboard-*`, rather than react-components' `--openui-*` tokens. His palette was checked for colour-vision deficiency, and react-components' chart tokens don't carry that.

## Consequences

- The library has two chart engines across the repo: D3 in react-components and recharts here. A react-components theme does not recolour dashboard charts.
- The copied ThemeProvider can drift from react-components'.
