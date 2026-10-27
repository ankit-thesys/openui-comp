# Stock-Goober stable-target pilot — proposal to validate

Accepted base60: c1aaf994d5c0fbfb56b83685221eeea9b409e57c, archive1db41852f9e5aa11ccbfe5a56cdb3d00c8ad753ad5e73cb19bdf4832e7f7b957. Independent340assessment PASS read before editing. Protected67/42 stay frozen.

Stock css always supplies a generated scope. Reuse the already-accepted57root-guard idiom, with that generated scope only on html at zero specificity:

```ts
const stylesheetScope = css`
  :where(&:root) {
    .openui-button-root {
      ${buttonStyles}
    }
  }
`;
if (typeof document !== "undefined") {
  document.documentElement.classList.add(stylesheetScope);
}
```

Remove generated componentClass from Button's actual root. The CSS target is now the stable root/variant/state hierarchy; consumer selectors never need the generated html guard. It is an implementation namespace, not a documented customization hook. No claim that emitted CSS contains literally zero generated characters: stock-Goober still generates the zero-specificity root guard. The pilot review must assess that exact distinction against the stable-global-target contract before any parallel families.

No glob/createGlobalStyles, cache/runtime patch, selector registry, parser, CSS string rewrite or custom injector. The ordinary classList.add setup is the same kind of automatic root setup accepted57. Each module registers only its own static CSS through stock API. No new provider/import/setup command.

IconButton preserves its existing icon span, Slot/asChild/ref semantics. Button children/iconLeft/iconRight remain direct children; no wrappers or fictional part hooks.

Proposed shared-base pattern: one stable opt-in openui-border-box helper class on the same three roots, with stock zero-specificity html guard. Existing stable-hook-only host divs must remain unchanged; only explicit new helper opt-in styles them. Root-specific later CSS has equal specificity to the helper and may override box-sizing. No FormControl/Buttons/TagBlock family is claimed fully converted before its other owned selectors migrate.

Required red/green consumer seam: old baseline has generated root ownership so ordinary later stable base-property CSS cannot beat it; candidate must allow corresponding base-property overrides without important. Matching variant/size/state/part selectors prove effective override behavior. Keep default appearance/geometry, callbacks/keyboard/disabled/ref/asChild semantics and all1444fallbacks. Host globals both directions, independent component imports/order, tree shaking, common-base actual consumers, themes/portals where affected and bounded indirect chart controls must pass. No chart selector edits.

This document is a proposal, not mechanism acceptance. Root/spec review can reject the guard interpretation; do not silently call it fully global without disclosing the guard. No62–64 implementation until independent61acceptance.

## Canonical root hooks / host ownership

Pilot uses new canonical openui-button-root and openui-icon-button-root styling targets while preserving existing openui-button-base/openui-icon-button aliases and all existing variants/parts. This replaces generated component ownership with explicit stable ownership without restyling host nodes that carry only the pre-existing hooks. No data attribute, wrapper or prop API is added. Later CSS can use the canonical hook or existing alias at equivalent specificity. Shared-base explicit openui-border-box likewise preserves existing hook-only host negatives.

## Stock parser correction

The flat selector experiment emitted an additional generated class outside `:where()`, increasing specificity and failing ordinary overrides. Its source, archive and partial observations remain under attempt02/candidate-v2. Standard nested CSS emits the generated guard entirely inside `:where()`; candidate-v3 tests that actual emitted selector. No parser patch or output rewrite is used. Source review alone is not acceptance.
