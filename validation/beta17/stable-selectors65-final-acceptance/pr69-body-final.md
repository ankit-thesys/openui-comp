## Summary

Give controls, presentation/layout components and portals stable canonical root/variant/state/part targets using the accepted stock-Goober private zero-specificity document guard. Preserve props, aliases, behavior, themes and fallback values.

```text
packages/react-components/
├── README.md          # canonical targets, context, inventory and exceptions
└── src/components/    # per-component owned selector registrations
```

Stacked on frozen #68. Related: #62, #63, #64, #65. Across pilot and batches 64 non-chart families are converted; EditableTable remains deferred. Chart-owned selectors and legacy react-ui are unchanged. All 1,444 fallbacks remain; broad deletion is deferred.

## Evidence

- **Before:** accepted61 has stable Button/IconButton targets while the remaining owned registrations use generated attachment classes.
  **After:** documented matching later unlayered selectors target actual owned rules, preserving appearance, interactions, theme scopes and host isolation.
- **4,591 worker checks** pass, separately from **2,136 valid independent assertions** accepted by the root. Independent assertions are not 2,136 independent scenarios; native/source/archive/graph audits are separate. Original invalid harness failures and explicit corrections remain retained, not relabeled.
- Independent Chrome 156 plain CSS/Tailwind v3/v4, six framework/order configurations: controls, 43 presentation fixtures, real Select/Calendar/DatePicker/Modal portals, transient tooltip/citation/gallery/loading states, actual cold/lazy automatic styling, host tokens/layers/globals, contextual overrides and repeated registration. All 178 W2 canonical hooks and 16 W1 portal sites are observed. The report defines the bounded replay; not every historical property/size/range is rerun.
- Build/typecheck and two source review axes pass. 166 ESM/CJS exports and 440 declarations unchanged; 371 embedded owned sources and 2210 members per installed archive bind exact inputs. All 1,444 fallback expressions/counts retained; six formatting-only differences independently audited.
- Eight representative optimized family pairs preserve reachable output counts/entry CSS sizes. Cold/lazy shell static JS is unchanged; dynamic reachable bytes and retained shared/vendor costs are reported, not presented as runtime speed or zero-unused proof.

**Sources remains an explicit important-property exception.** Real same-element targets match both arms; existing width 180px/background important declarations defeat normal later consumer rules. A real URL activates the has-url hover important branch, also confirmed in all six configurations. This is not ordinary background/width override success. Inline Image width retains precedence; corrected stylesheet-owned probes pass. No important declaration, product animation, Goober runtime or injector was patched.

[Exact independent report/raw corrections](https://github.com/ankit-thesys/openui-comp/blob/59106f0b7899ecd6c436f38bc175fc8b9ac6ea60/validation/beta17/stable-selectors65-independent/independent/REPORT.md) · [Independent retention manifest](https://github.com/ankit-thesys/openui-comp/blob/59106f0b7899ecd6c436f38bc175fc8b9ac6ea60/validation/beta17/stable-selectors65-independent/MANIFEST.json) · [Worker report](https://github.com/ankit-thesys/openui-comp/blob/59106f0b7899ecd6c436f38bc175fc8b9ac6ea60/validation/beta17/stable-selectors65-combined/combined/REPORT.md) · [Final ticket disposition](https://github.com/ankit-thesys/openui-comp/blob/59106f0b7899ecd6c436f38bc175fc8b9ac6ea60/validation/beta17/stable-selectors65-final-acceptance/ticket-disposition.md).

Frozen source `75f69041891147d52dc0f0d2c4b21a048e575aa8`; archive SHA256 `d2a4b51255d745f41a7b51820ac0ec55ef5db8ff2b6f8d91ab43bade7766d037`. Independent report SHA256 `72977ae780c2b61cbcd93c98f51720b9ff56da1a4ac8acd4897b29e531f71cb1`. **Bounded selector gate accepted.** No source69 CI pass, merge, release, publication or ticket closure is implied. Lab CI results are tied to their own head and are separate from source69.

## Merge Danger

**Door:** two-way

Source-only styling changes can be reverted; no data or release migration.

**Blast Radius:** styling

New react-components consumers depend on selector precedence and portal delivery. Matching later unlayered context is required; vendor inline styles, live animation values, private keyframes and official KaTeX CSS/font limits remain. EditableTable and chart-owned conversion are excluded. SSR/hydration, full chat/parser streaming, performance/memory/soak and full beta #17 acceptance remain outside this gate. PR42/67/68 and this production head stay frozen; CI/tooling/dependencies remain unchanged.
