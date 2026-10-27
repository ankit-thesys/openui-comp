# Chat kit package migration

The chat kit has an independent package identity and release lifecycle. Install both packages:

```sh
npm install @openuidev/chat-kit@0.0.0-beta.0 @openuidev/react-components@0.0.0-beta.0
```

The current beta requires the exact tested React components version `0.0.0-beta.0`; this is not a claim of compatibility with future betas. React 19 and the other declared peers remain required. Native archive installation is used in the comparison lab while these packages are unpublished.

| Previous import                   | Current import             |
| --------------------------------- | -------------------------- |
| `@openuidev/kits/react/chat`      | `@openuidev/chat-kit`      |
| `@openuidev/kits/react/chat/libs` | `@openuidev/chat-kit/libs` |

```tsx
import { ThemeProvider, Button } from "@openuidev/react-components";
import {
  FollowUpBlock,
  FollowUpItem,
  ModelSwitcher,
} from "@openuidev/chat-kit";
import {
  openuiChatLibrary,
  openuiChatPromptOptions,
} from "@openuidev/chat-kit/libs";
```

Existing props, refs, callbacks, schemas, customization and theme APIs are preserved. There is no old-package forwarding alias. Chat has its own version; it does not belong to a fixed or linked release group with React components. The kits folder can contain future independent kits, but no dashboard package is created now.

Use one installed compatible React components peer so direct components and chat content share the ThemeProvider context. The comparison lab documents native packing and installation without source aliases. The package move does not introduce a CSS import, setup command, build plugin, or new styling API.

Historical reports, imports recorded as evidence, archive hashes and frozen runs are preserved. The complete template matrix remains nonpassing: Select portal comparisons, inherited HorizontalBar instability, screenshot reviews and known issues remain recorded. Existing Input/Label customization findings and incomplete theme/palette coverage are separate limitations. This packaging change does not certify SSR/hydration or repair those findings.

Specification: [issue45](https://github.com/ankit-thesys/openui-comp/issues/45). Implementation and validation are tracked by issues46–49.
