## Summary

Give Button and IconButton stable owned targets so consumers can use matching later unlayered root/variant/state/part selectors. Stock nested Goober CSS registers automatically with a private zero-specificity html guard; existing aliases, props, appearance and fallbacks remain.

```text
packages/react-components/
├── src/components/{Button,IconButton}/  canonical root targets
├── src/styles/base.ts                  explicit shared border-box opt-in
└── README.md                           override contract and pilot inventory
```

Stacked on frozen #67. Only these two component families and the existing one-declaration shared base are converted at this head. Later family work is separate in #69.

## Evidence

- **Before:** the rejected flat selector form emitted extra generated specificity and failed ordinary overrides.
  **After:** standard nested CSS emits the approved guard, with no generated component styling class on actual pilot roots. Matching ordinary base/variant/size/state/part overrides pass. Original failed trials remain retained.
- **888 worker checks** and **259 independent checks** pass as separate evidence. Native ESM/CJS exports 166, declarations 440 and fallbacks 1,444 remain unchanged; build/type checks pass.
- Actual plain CSS/Tailwind v3/v4, both stylesheet orders, host globals/aliases, keyboard/callback/disabled/ref/asChild behavior, themes, real Modal descendant controls, Calendar/Select and bounded indirect chart controls are covered.
- Static single-component imports prune the unused pilot counterpart. A retained shared lazy chunk registers both pilot styles in both arms; no one-style-per-lazy-import or zero-unused guarantee is made. Registration plateaus are not memory or speed measurements.
- [Independent #61 report](https://github.com/ankit-thesys/openui-comp/blob/59106f0b7899ecd6c436f38bc175fc8b9ac6ea60/validation/beta17/stable-selectors61-independent/REPORT.md) · [Frozen worker report](https://github.com/ankit-thesys/openui-comp/blob/59106f0b7899ecd6c436f38bc175fc8b9ac6ea60/validation/beta17/stable-selectors61/61/REPORT.md).

Frozen source `1c3833a045c4c66de92b69413a3824eca1798fcd`; archive SHA256 `0dad61fb4c48477f0496f819bef2f131908a3789ec184cefb7fe8de94c68d6a5`. Independent pilot scope is accepted; this draft does not certify all later families or full beta readiness. Broad fallback deletion remains deferred. No source CI pass is claimed.

## Merge Danger

**Door:** two-way

Source-only selector registration changes can be reverted; no data migration.

**Blast Radius:** styling

Button/IconButton consumers and their indirect controls, plus shared root box sizing. Matching later unlayered selectors are required; earlier/layered CSS or a root-only rule need not beat variants/states/parts. Legacy react-ui, chart-owned source, kits, dependencies and CI/releases remain unchanged. SSR/hydration, streaming, performance/memory and full beta acceptance are outside this gate. PR42 and PR67 heads remain frozen.
