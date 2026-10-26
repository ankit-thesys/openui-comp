# @openuidev/chat-kit (beta)

React chat components and their AI library, built on the shared
`@openuidev/react-components` package. Chat has its own package version and release
lifecycle. No dashboard kit or umbrella package is installed.

## Installation

```sh
pnpm add @openuidev/chat-kit@0.0.0-beta.0 @openuidev/react-components@0.0.0-beta.0
```

React components is a required peer and is not bundled into the chat kit. This
beta supports exactly `0.0.0-beta.0`; later versions require compatibility testing
and an explicit peer-window update. Install the other peers listed below too.

## Public imports

```tsx
import { FollowUpBlock, ModelSwitcher } from "@openuidev/chat-kit";
import { openuiChatLibrary, openuiChatPromptOptions } from "@openuidev/chat-kit/libs";
import { ThemeProvider } from "@openuidev/react-components";
import { Renderer } from "@openuidev/react-lang";
```

The component entry does not import or assemble the AI library. Use the library
with the public Renderer and supply the generated response through its existing
`response` and `isStreaming` props. Forward `onAction` to your application.
For generation, pass the library and prompt options separately to
`generateSystemPrompt`; prompt helpers, examples, rules and groups are exported
from the libs entry. The package root exposes components; implementation paths remain private.

Themes come from core. Existing component props and customization APIs remain
unchanged. Components use unmodified Goober; no manual CSS import is needed.
Styles register when the referenced module evaluates. The library delegates
reusable UI and charts to core, with no dependency on legacy react-ui or its SCSS.
See the core README for host CSS overrides, themes and the accepted KaTeX
vendor-style/font output exception.

## Support boundary

React/ReactDOM19, `@openuidev/react-lang >=1.0.1 <2` and Zod3.25.76+ or4 are
required. Core retains its own peer requirements. Chrome with plain CSS,
Tailwind v3 and Tailwind v4 is the current browser target. Client response
streaming uses the existing parser/Renderer. SSR, hydration, streaming SSR and
concurrent server style isolation remain deferred.

The general assembled OpenUI library, AgentInterface, OpenUIChat and standalone
chat helpers are excluded from this package. Existing inherited component and
chart limitations remain; extraction does not silently redesign them.

## Development

Build workspace dependencies before the kit:

```sh
pnpm run build:packages
pnpm --filter @openuidev/chat-kit run typecheck
```

The package exports ESM/CJS modules, matching declarations and source maps for
the package root and `/libs`. Internal implementation paths stay private.

Authored kit styles use stock Goober `css` and `keyframes` template strings, with
plain template fragments for shared declarations and module-level registration.
Preserve selector specificity, token fallbacks and registration order. Native
consumer style forwarding and TextContent's per-instance size variables remain
React style objects; class-name lookup maps remain ordinary objects of classes.

## Migrating from the umbrella beta

Replace `@openuidev/kits/react/chat` imports with `@openuidev/chat-kit` and
`@openuidev/kits/react/chat/libs` with `@openuidev/chat-kit/libs`. Remove the old
`@openuidev/kits` dependency and install the chat kit plus React components
explicitly. Component props, public types, library schemas and actions are unchanged.
No compatibility wrapper or old subpath alias is provided.
