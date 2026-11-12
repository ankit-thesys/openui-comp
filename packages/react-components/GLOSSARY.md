# React Components

`@openuidev/react-components`: the styled React component library and its themes, and the contract by which consumers restyle it.

## Styling contract

**Component family**:
A public component together with its sub-components and portal content, sharing one name segment (`tabs` for `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent`).
_Avoid_: module, widget

**Root**:
The element of a family member that receives the consumer's `className`, `style` and `ref`. Elements the member adds around it are parts.
_Avoid_: base, wrapper, container, outermost element

**Part**:
Any element other than a root that a family renders and owns.
_Avoid_: slot, child, element

**Block**:
A root or a part: anything that can carry modifiers.

**Stable class**:
A documented class on a block; the public target for consumer overrides.
_Avoid_: selector, hook, styling target

**Modifier**:
A stable class that records the value of one prop on a block.
_Avoid_: variant class

**Axis**:
The prop a modifier comes from, such as `variant` or `size`. "Variant" names one particular axis, never axes in general.
_Avoid_: dimension, type

**Tone**:
The axis for what an action means to the user (`default`, `destructive`), independent of its variant and size.
_Avoid_: button type, intent, kind

**State**:
A condition that changes at runtime without any prop changing, exposed as an attribute on the block (open, active, disabled, highlighted).
_Avoid_: status, mode

**Prose**:
Body text produced from markdown content (paragraphs, headings, lists, quotes), as opposed to the parts the renderer replaces such as code blocks, links and tables.
_Avoid_: markdown body, rich text

**Foreign content**:
Markup inside a block that the library does not render, such as consumer children or math output.
