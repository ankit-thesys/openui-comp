---
"@openuidev/react-components": minor
---

Shared primitives take the look a card gives them through public props instead of the card's
private variables: Tag `surface="image"`; TextBlock, IconText and ImageText `overflow="truncate"`
and `width="fill"`; InlineMarkdownRenderer and MarkDownRenderer `typography="inherit"`; and
MarkDownRenderer `listLeadIn="spaced"`. Each emits a modifier class. The card blocks and
TextContentWrapper set them for the primitives in their slots, so rendering is unchanged.
MarkDownRenderer no longer uses `@container style()` queries: CompositeCard emphasis and quoted
links and inline code (now `[data-quoted]`) also work in Firefox.
