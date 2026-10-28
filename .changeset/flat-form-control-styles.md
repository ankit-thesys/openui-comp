---
"@openuidev/react-components": minor
---

Migrate FormControl, Hint, Label, Input, TextArea and Buttons to flat, render-time styles with stable root, part and modifier classes and optional cascade layers. Input and TextArea states use `:focus-within`, `:disabled` and `[aria-invalid="true"]`, Label's disabled state is `[aria-disabled="true"]`, and Input sizes are `--size-*` modifiers; FormControl's error context still reaches its fields. See the README migration table for renamed classes; public props are unchanged.
