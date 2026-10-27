# @openuidev/dashboard-kit (beta)

The OpenUI dashboard AI component library: the registry, prompt options and
examples that tell a model which components it may emit for dashboard surfaces.

Rendering comes from `@openuidev/react-components`, which is a required peer.
This kit owns only the dashboard library definition and `Stack`, its root layout
primitive.

## Install

```sh
pnpm add @openuidev/dashboard-kit@0.0.0-beta.0 @openuidev/react-components@0.0.0-beta.0
```

`@openuidev/react-components`, `@openuidev/react-lang`, `react`, `react-dom` and
`zod` are peer dependencies.

## Usage

```ts
import { Stack } from "@openuidev/dashboard-kit";
import {
  openuiLibrary,
  openuiComponentGroups,
  openuiExamples,
  openuiAdditionalRules,
  openuiPromptOptions,
} from "@openuidev/dashboard-kit/lib";
```

- The root entrypoint exports `Stack` and `StackSchema`.
- `/lib` exports the five AI-integration values.

## Relationship to the chat kit

The two kits are siblings with the same shape, over the same rendering
vocabulary:

| | `@openuidev/chat-kit` | `@openuidev/dashboard-kit` |
|---|---|---|
| Root exports | `FollowUpBlock`, `FollowUpItem`, `ModelSwitcher` | `Stack`, `StackSchema` |
| `/lib` exports | the five `openuiChat*` values | the five `openui*` values |
| Library root | `Card` | `Stack` |
| Registered components | 84 | 82 |
| Component groups | 12 | 10 |

The two libraries overlap heavily but are not subsets of one another: the
dashboard library has `Modal` and `Stack`, while the chat library has
`FollowUpBlock`, `FollowUpItem`, `SectionBlock` and `SectionItem`.

`ContentChildUnion` (the dashboard content union, which includes `Stack`) ships
here; `ChatContentChildUnion` stays in the chat kit, so neither kit carries the
other's components.

## Migrating

Replace imports from legacy `@openuidev/react-ui/genui-lib`:

```diff
- import { openuiLibrary, openuiPromptOptions } from "@openuidev/react-ui/genui-lib";
+ import { openuiLibrary, openuiPromptOptions } from "@openuidev/dashboard-kit/lib";
```

The generated spec and JSON schema are byte-identical to the legacy library, so
no prompt or schema changes are required.

## Scripts

```sh
pnpm --filter @openuidev/dashboard-kit run build
pnpm --filter @openuidev/dashboard-kit run typecheck
```
