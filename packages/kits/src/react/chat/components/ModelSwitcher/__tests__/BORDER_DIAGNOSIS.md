# ModelSwitcher border mismatch — source-only diagnosis

Product `8405f44e0`; no component/core/package edits and no further browser use.

## Cause: equal specificity, reversed stylesheet registration order

Legacy Select's `.openui-select-trigger:hover` and
`.openui-select-trigger[data-state=open]` set
`border-color: var(--openui-border-interactive)`. Their specificity is `(0,2,0)`.
The model rule `.openui-model-switcher .openui-model-switcher-trigger` also has
`(0,2,0)` and sets `border: none`, which resets the color to `currentColor`.

In the compiled independent legacy CSS, Select hover/open appears around lines
670–686; the model's reset follows at line 926. Equal-specificity source order
therefore makes the model reset win. The model's own hover/open rule at line
945 changes background/text color without changing that result.

The frozen installed ModelSwitcher ESM module imports `modelSwitcher.styles.mjs`
before its core import. In the emitted Vite runtime chunk, the model root's
stock Goober `css()` call appears around line 705; Select's trigger `css()` call
follows around line 3380. The matching generated selectors retain equal
specificity: model generated-root plus legacy trigger class `(0,2,0)`, versus
Select generated-trigger plus hover/open `(0,2,0)`. The later Select state rule
therefore wins the border-color tie. The model base reset still wins border
width/style against Select's lower-specificity base rule, leaving `0px none`.

This explains both measured groups: all 36 direct trigger-hover differences and
six inner triggers still hovered after the nested menu closes. It does not
indicate a missing theme context or a Goober parsing bug. The open trigger has
the same source-level ordering risk; this matrix sampled the open **portal**,
not a separate open-trigger style snapshot, so that extension is an inference.

Sources: legacy `ModelSwitcher/modelSwitcher.scss` and `Select/select.scss`;
new `ModelSwitcher/modelSwitcher.styles.ts` lines 13/23–25; shared
`react-ui-core/.../Select/select.styles.ts` lines 29–45; frozen installed
ModelSwitcher ESM entry. The authoritative report records source/bundle hashes
and retains the compiled legacy stylesheet.

## Narrow conventional correction to consider

Add one declaration to the model's **existing** hover/open rule:

```ts
'&:hover, &[data-state="open"]': {
  backgroundColor: "var(--openui-highlight-strong, oklch(0.097 0 0 / 0.08))",
  color: "var(--openui-text-neutral-primary, oklch(0.097 0 0 / 1))",
  borderColor: "currentColor",
}
```

That selector has `(0,3,0)` and explicitly preserves the color produced by the
legacy reset regardless of eager module registration order. It changes no
public API, DOM, event behavior, theme tokens or shared Select contract. It uses
ordinary CSS and stock Goober; no ordering shim, dependency patch, style injector
or parser workaround is required. The component owner is Worker2; shared Select
does not need modification. Do not reset the whole border in this state rule:
that would unnecessarily interfere with consumer width/style customization.

This proposal is **not applied or browser-validated**. Coordinate product
refreeze before implementing it, then rerun the affected component states,
including open trigger, nested hover, both host orders and explicit overrides.
Keep the frozen failing report intact rather than filtering border colors out.

## Can a consumer override make the difference visible?

Width alone cannot: the existing `border-style: none` still suppresses the border.
But a consumer can expose it by setting width **and** a visible style while
leaving color to the component, for example through its existing DOM class:

```css
.consumer-scope .openui-model-switcher-trigger {
  border-width: 1px !important;
  border-style: solid !important;
}
```

Then the differing currentColor/interactive-token color can render visibly on
hover. A consumer that explicitly supplies its own winning border color masks
the difference. This is CSS cascade analysis, not a new browser measurement;
the exposed-border case belongs in the focused validation after refreeze.
