# Beta consumer guidance (pending #17 performance acceptance)

These draft packages coexist with react-ui. No deprecation date, publication or
migration approval follows from a successful test run. Existing react-ui stays
unchanged; report inherited defects separately.

| Consumer surface | New owner/import |
| --- | --- |
| Reusable components, all chart families, theme APIs | `@openuidev/react-ui-core` |
| ModelSwitcher, FollowUpBlock, FollowUpItem | `@openuidev/kits/react/chat` |
| openuiChatLibrary and chat prompt/group exports | `@openuidev/kits/react/chat/libs` |
| Streaming parser and Renderer | `@openuidev/react-lang` |
| AgentInterface, OpenUIChat shell, standalone helpers | Deferred; do not port implicitly |
| General assembled openuiLibrary | Existing package; team decision remains pending |

Core supports its root import. Kits has the two explicit entries above, not a
root kits import. Preserve existing props, className/style and ThemeProvider
customization APIs; there is no new sx API. Use lightTheme/darkTheme/mode and a
scoped cssSelector for independent themes and portals.

New extracted components use stock runtime Goober and bring their styles through
component JavaScript. A new-only consumer does not import old react-ui SCSS/CSS,
run a styling setup command or add a custom build plugin. KaTeX's lazy standard
CSS/font delivery is the documented dependency exception. A consumer retaining
old screens must retain their existing legacy stylesheet integration.

Use ordinary explicit consumer overrides where CSS priority requires them:
important declarations in plain CSS, the existing important utility syntax in
Tailwind v3 or v4, and existing className/style props. Host CSS loading order and
hover/disabled behavior must match recorded compatibility evidence. This does
not promise to defeat arbitrary important selectors or host global rules.

React 19 and Chrome are the initial boundary, with plain CSS and Tailwind v3/v4.
The kit's react-lang peer is >=1.0.1 <2; supported Zod peers are ^3.25.76 or ^4.
SSR/hydration/streaming SSR remain deferred and are not certified by client-side
HTTP replay tests. The source registry/distribution design is separate.

Bundlers can discard unused JavaScript exports. Runtime styles are evaluated for
the retained import graph; importing the assembled AI library retains its full
component definitions. Do not interpret component-only pruning as a promise that
an assembled library includes only components named by one response. Report raw,
gzip, emitted assets and downloaded assets separately; unused emitted KaTeX font
files are an existing disclosed limitation.

The inherited HorizontalBar string-height/legend-fit comparison remains unpassed.
Keep this visible in beta documentation rather than declaring unconditional
visual parity. Chat/dashboard matched performance and ten-minute memory soaks
must meet the agreed investigation process before #17 is accepted.
