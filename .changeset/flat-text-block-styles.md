---
"@openuidev/react-components": minor
---

Migrate TextBlock, TextCallout, Callout, TextContent, TextContentWrapper, InlineHeader, IconText, IconTag, Tag, TagBlock and Separator to flat, render-time styles with stable classes and optional cascade layers. Size and variant classes become `--size-*` and `--variant-*` modifiers, and Callout's auto-dismiss state becomes `[data-autodismiss]`. See the README migration table for renamed classes; public props are unchanged.
