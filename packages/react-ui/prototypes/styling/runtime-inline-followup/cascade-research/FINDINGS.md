# Automatic cascade research — throwaway, decision open

The bounded Button result is promising, but this is not an accepted library migration. Actual Next/hydration/lazy-delivery integration is being tested independently. This scratch never changes the previous investigation or production sources.

## What the cascade permits

Normal unlayered author declarations outrank normal declarations in every named layer, before specificity is considered. Named layers keep their first-declared relative order; a later declaration cannot reorder existing layers. [CSS Cascade 5 ordering](https://www.w3.org/TR/css-cascade-5/#cascade-sort), [layer ordering](https://www.w3.org/TR/css-cascade-5/#layer-order).

A winning `revert-layer` declaration rolls the property back through the current cascade layer; an unlayered bridge therefore exposes the underlying named-layer result. It does not selectively remove only a reset: unlayered intentional declarations are also removed whenever the bridge wins. [CSS Cascade 5 rollback](https://www.w3.org/TR/css-cascade-5/#revert-layer).

`@scope` does not reverse layer priority. Scope proximity comes after layer and specificity comparisons. [CSS Cascade 6 ordering](https://www.w3.org/TR/css-cascade-6/#cascade-sort). Style queries inspect computed container values, not the originating framework or declaration layer. Inherited framework variables would be detection signals, not a universal proof of host configuration. [CSS Conditional Rules 5 style queries](https://drafts.csswg.org/css-conditional-5/#style-container).

## Tested candidate

The actual production Button receives two generated classes. Render-time Goober compiles its real descriptor inside `@layer components`, then compiles a separate library-owned unlayered rollback guard. React19 delivers the resulting CSS as a style resource. There is no stylesheet import, consumer setup, framework detection, global important flag, host stylesheet rewrite, or generated-CSS postprocessing.

```js
const base = compile({ '@layer components': actualButtonDescriptor });
const rollback = Object.fromEntries(rootOwnedProperties.map(p => [p, 'revert-layer']));
const guard = compile({
  'html button:where(&)': {
    ...rollback,
    '&:disabled': { cursor: 'revert-layer' },
  },
});
// Style resource text:
// @layer theme, base, components, utilities;
// + base.css + guard.css
// Existing Button receives base.className + ' ' + guard.className.
```

The normal guard has specificity `(0,0,2)`, above standard type/universal Preflight rules, below ordinary class utilities. Its disabled cursor exception has `(0,1,2)`: it shields Tailwind3 `:disabled {cursor:default}`, while explicit `disabled:cursor-wait` has two class/pseudo-class components and can win. No Button props or DOM structure are removed or changed.

Guard property metadata is essential. A first broad descriptor walk incorrectly included width/height owned only by descendant SVG rules. The refined `button-root-metadata.json` derives 16 root properties from the actual production SCSS selector AST; width/height are excluded. Sass and selector parsing run only to prepare this experimental metadata. Runtime imports objects and the property list, and executes Goober.

## Evidence and corrections

Pinned packages: React19.3.1, Goober2.1.19, Tailwind3.4.19, Tailwind4.3.3. Actual Chrome version is recorded in the raw matrix. Fresh cursor utility assets include full Preflight.

- `results-first-resource-order.json`: initial 48 cases. JSX host-first did not mean effective CSS-first because React19 hoisted resources before links. One late CSS initial sample also caught a transition. This is preserved, not treated as final ordering evidence.
- `results-cascade-matrix.json`: corrected 66-case no-JS SSR matrix uses controlled actual document order and a settling delay. Unlayered candidate passed0/6 full contracts; layer-only4/6; class rollback3/6; low type rollback16/24; low type rollback plus disabled-cursor exception24/24. Includes plain/TW3/TW4, host first/late, default and intentional classes, hover, disabled background/cursor, explicit button/submit/reset types inside forms.
- `size-results-first-invalid-height-assertion.json`: preserved harness mistake. Padding32px forces used border-box height64px even with authored height60px. This was normal CSS sizing, not rollback interference.
- `size-results.json`: refined metadata passed24/24 root ownership checks. Unrelated unlayered host width180px/height60px survive on default/disabled controls; intentional padding32px has expected used height64px.
- `results-refined-root.json`: normal/state matrix repeated against the refined root-owned property bundle.
- `cursor-results.json`: stricter cursor priority check preserved20/24 outcome. Plain/TW3 retain library `not-allowed` for ordinary cursor classes on disabled controls; explicit disabled modifier wins. TW4's utility layer also allows ordinary cursor classes to win. This is a cross-framework state priority difference, not an identical priority contract.

## Limits

This is a focused Button proof. All other component units, compound widgets, portals, Shadow DOM, arbitrary host resets, arbitrary layer ordering, custom variants and older framework/browser versions are unproved. The helper declares the standard theme/base/components/utilities layer order; it cannot reorder a consumer's already-established incompatible order and may influence undeclared host layer names. That must be a reviewed library contract.

The rollback guard can expose underlying layers and can discard lower-specificity unlayered styles for properties the Button owns. The refined metadata avoids doing this for unrelated root width/height, but a complete component/variant ownership audit remains necessary. Disabled cursor priority differs between TW3 and TW4 as recorded. Ordinary overrides, state overrides and library disabled behavior need an explicit public contract.

The corrected matrix manipulates host link position in the *test document* after SSR solely to prove CSS order cases. It does not claim React's real resource insertion order, hydration, navigation or late Suspense behavior; those require the independently integrated Next test. The library CSS itself is never postprocessed. No production capacity/performance or acceptance claim follows from these bounded correctness checks.
