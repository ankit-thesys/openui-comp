# OpenUI kits (beta)

Import chat components from `@openuidev/kits/react/chat` and the AI library from
`@openuidev/kits/react/chat/libs`. Themes come from `@openuidev/react-ui-core`.
The component entry does not import or assemble the AI library.

React 19 is required. The library requires `@openuidev/react-lang >=1.0.1 <2`
and Zod 3.25.76+ or 4. Components use stock Goober; no manual CSS import is needed.
SSR and broad performance certification remain deferred. AgentInterface,
standalone chat helpers and the assembled general OpenUI library are excluded.
