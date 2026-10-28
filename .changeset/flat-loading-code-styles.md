---
"@openuidev/react-components": minor
---

Migrate the Skeleton family, DotMatrixLoader and CodeBlock to flat, render-time styles with stable classes and optional cascade layers. Skeleton and loader dimensions pass through private `--_openui-*` variables, CodeBlock's copied state is `[data-state="copied"]`, and its highlighter `!important` margin remains a documented exception. See the README migration table for renamed classes; public props are unchanged.
