# @openuidev/kits (beta)

Use-case kits built on `@openuidev/react-ui-core`. The initial React chat kit
owns FollowUpBlock, FollowUpItem, ModelSwitcher and its OpenUI chat library.
Additional kits can follow without moving reusable components into each kit.

## Public imports

```tsx
import { FollowUpBlock, ModelSwitcher } from "@openuidev/kits/react/chat";
import {
  openuiChatLibrary,
  openuiChatPromptOptions,
} from "@openuidev/kits/react/chat/libs";
import { ThemeProvider } from "@openuidev/react-ui-core";
import { Renderer } from "@openuidev/react-lang";
```

The component entry does not import or assemble the AI library. Use the library
with the public Renderer and supply the generated response through its existing
`response` and `isStreaming` props. Forward `onAction` to your application.
For generation, pass the library and prompt options separately to
`generateSystemPrompt`; prompt helpers, examples, rules and groups are exported
from the libs entry. No package root or internal component imports are public.

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
pnpm --filter @openuidev/kits run ci
```

The package exports ESM/CJS modules, matching declarations and source maps for
`react/chat` and `react/chat/libs`. Internal implementation paths stay private.
