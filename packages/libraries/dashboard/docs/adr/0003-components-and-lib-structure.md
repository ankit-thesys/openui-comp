# Plain components in `components/`, OpenUI Lang definitions in `lib/`

Status: Accepted

The port kept dashboards-ui-library's file shape: one large file per group holding each component's schema, OpenUI Lang definition and drawing code together, one 1,900-line shared file, and one block of CSS per group. The dashboard library is restructured into the pattern its previous version used, while dashboards-ui-library stays the place where fixes are written first.

```text
src/
├── index.ts                  # library and ThemeProvider exports
├── components/
│   ├── <group>/<Name>/        # plain React component, its props interface, <name>.styles.ts
│   ├── shared/<Name>/         # Legend, TooltipCard, RankedList, ViewSwitch, states ...
│   └── ThemeProvider/
├── lib/
│   ├── <group>/<Name>/        # schema.ts and the OpenUI Lang definition
│   ├── defineComponents.ts
│   ├── group.ts, registeredGroups.ts, slots.ts  # group registrations and prompt slots
│   ├── schemaCoverage.ts      # every definition declares a SchemaCovered type
│   ├── styles.ts              # compiles raw CSS blocks once, in STYLE_ORDER
│   ├── library.tsx
│   └── prompt-options/
└── shared/                    # Format, pure helpers, contexts
```

- **Grouped, not flat.** Folders keep his ten groups, one level deeper than the previous library's flat list.
- **Component owns its props.** A component declares a TypeScript props interface and does not import zod or `lib/`. The definition in `lib/` passes schema-parsed props in, so a schema that drifts from the interface fails the build. Its `SchemaCovered` type checks that every schema field reaches a prop or is consumed by the definition.
- **Strict boundary where it is cheap.** Components take plain props and do not import `@openuidev/react-lang`. The parts that need live OpenUI Lang state (filters writing variables, Query loading states, streaming, Compare mode) receive it from the `lib/` definition as props or context.
- **Dependency direction.** `lib/` imports components and shared code; components import components and shared code; shared code imports neither. Only `shared/queryState.ts` may import `@openuidev/react-lang` outside `lib/`. The boundary test checks every folder recursively. Each `lib/<group>/index.ts` registers definitions and raw style blocks; `registeredGroups.ts` gathers the nine non-Structure groups before `defineComponents.ts` assembles the full registry.
- **CSS rules are unchanged.** Each component gets its own styles file holding its part of his selectors. Class names stay plain strings; there is no `names` object and no one-class-per-element rewrite.
- **Exports are unchanged:** `library` and `ThemeProvider`. The plain components stay internal.

## Considered and rejected

- **Styles as `names` plus one `css` class per element**, as the previous library had. About 2,700 lines of CSS would be rewritten, many of his rules depend on context and do not convert one-to-one, and every later CSS fix from his repo would need translating by hand.
- **Folders only**, leaving schema, definition and drawing code in one file per component.
- **Our library as the source of truth.** Not now: fixes are still written in dashboards-ui-library first.

## Consequences

- A fix from dashboards-ui-library no longer lands in one matching file. It is found by component name, and its CSS by class name.
- Rules that several components share live with the shared piece or the group. CSS blocks are compiled in one place, `lib/styles.ts`, in the source stylesheet's order (`STYLE_ORDER`); `styleOrder.test.ts` pins their classes and order.
- The restructure is proven by the existing tests, the byte-identical prompt, and `pnpm compare` in `tests/dashboard-library`, which compares every card in both previews in light and dark.
- It lands as its own pull request stacked on the port, so the port can be reviewed and merged as a faithful copy.

See [source-map.md](../source-map.md) for the original files and where to copy fixes.
