---
"@openuidev/react-components": minor
---

Migrate the shared card grid/carousel layout, CompositeCardBlock, ContextCardBlock,
VisualCardBlock, OverviewCardBlock, SnippetCardBlock and OptionCards to flat,
render-time styles. Consumer CSS can target stable root, part and modifier classes
in default and layer modes. Legacy card classes and styling variables are renamed;
see the package README migration table. Public component props are unchanged.
