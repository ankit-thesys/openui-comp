from pathlib import Path
import subprocess
r=Path('/private/tmp/openui-selectors65-finalization');lab=subprocess.check_output(['git','rev-parse','HEAD'],cwd='/Users/ankitdas/.codex/worktrees/component-comparison/openui',text=True).strip();u='https://github.com/ankit-thesys/openui-comp/blob/'+lab+'/validation/beta17/'
b67='''## Summary

Register215 canonical light-theme token defaults automatically on the document root and share border-box only across the existing Buttons, FormControl and TagBlock roots. Public imports need no CSS import, provider or setup command.

```text
src/styles/
├── defaults.ts  canonical light tokens in the lowest-priority layer
└── base.ts      root-only border-box opt-in for three existing components
```

All1,444 component fallback expressions remain: clearing a token with initial still uses the component's existing default. Broad fallback deletion in #58 is deferred by user decision. Stacked on frozen #42. Related: #55, #57, #58, #59, #60.

## Evidence

- **Before:** repeated root declarations and local fallback defaults.
  **After:** automatic canonical root defaults plus one shared root rule, preserving fallback behavior and unrelated host styles.
-453 combined worker browser checks and39 optimized-origin checks pass; build/typecheck, strict consumer types and166 native ESM/CJS exports pass.
- **340 valid independent checks accepted** within #60 common-style scope, separate from worker evidence. The preserved120 invalid gap assertions are explicitly reassessed against unchanged raw DOM observations; they are not additional browser runs or relabeled raw successes.
- Plain CSS/Tailwind v3/v4, stylesheet order, cleared/inherited/container tokens, host globals/layers, themes, portals, syntax-theme delivery and repeated registration are covered within the report's scope.
- [Independent #60 report]('''+u+'''shared-styles55/60-independent/REPORT.md) · [Worker report]('''+u+'''shared-styles55/60/REPORT.md).

Frozen source `c1aaf994d5c0fbfb56b83685221eeea9b409e57c`; archive SHA256 `1db41852f9e5aa11ccbfe5a56cdb3d00c8ad753ad5e73cb19bdf4832e7f7b957`. This draft is scoped accepted evidence, not merge/release or full beta approval. The stable-selector pilot and later family migration belong to #68/#69 and are not included in this source head. No source CI pass is claimed.

## Merge Danger

**Door:** two-way

Reverting restores the previous additive-package styling; no data migration.

**Blast Radius:** styling

Root custom-property inheritance and three shared component roots. Legacy packages, charts, kits, dependencies and CI/release tooling are unchanged. SSR/hydration, streaming, performance/memory and full beta acceptance remain outside this gate. Fallback deletion stays deferred.
'''
b68='''## Summary

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
- **888 worker checks** and **259 independent checks** pass as separate evidence. Native ESM/CJS exports166, declarations440 and fallbacks1,444 remain unchanged; build/type checks pass.
- Actual plain CSS/Tailwind v3/v4, both stylesheet orders, host globals/aliases, keyboard/callback/disabled/ref/asChild behavior, themes, real Modal descendant controls, Calendar/Select and bounded indirect chart controls are covered.
- Static single-component imports prune the unused pilot counterpart. A retained shared lazy chunk registers both pilot styles in both arms; no one-style-per-lazy-import or zero-unused guarantee is made. Registration plateaus are not memory or speed measurements.
- [Independent #61 report]('''+u+'''stable-selectors61-independent/REPORT.md) · [Frozen worker report]('''+u+'''stable-selectors61/61/REPORT.md).

Frozen source `1c3833a045c4c66de92b69413a3824eca1798fcd`; archive SHA256 `0dad61fb4c48477f0496f819bef2f131908a3789ec184cefb7fe8de94c68d6a5`. Independent pilot scope is accepted; this draft does not certify all later families or full beta readiness. Broad fallback deletion remains deferred. No source CI pass is claimed.

## Merge Danger

**Door:** two-way

Source-only selector registration changes can be reverted; no data migration.

**Blast Radius:** styling

Button/IconButton consumers and their indirect controls, plus shared root box sizing. Matching later unlayered selectors are required; earlier/layered CSS or a root-only rule need not beat variants/states/parts. Legacy react-ui, chart-owned source, kits, dependencies and CI/releases remain unchanged. SSR/hydration, streaming, performance/memory and full beta acceptance are outside this gate. PR42 and PR67 heads remain frozen.
'''
b69='''## Summary

Give controls, presentation/layout components and portals stable canonical root/variant/state/part targets using the accepted stock-Goober private zero-specificity document guard. Preserve props, aliases, behavior, themes and fallback values.

```text
packages/react-components/
├── README.md          # canonical targets, context, inventory and exceptions
└── src/components/    # per-component owned selector registrations
```

Stacked on frozen #68. Related: #62, #63, #64, #65. Across pilot and batches64 non-chart families are converted; EditableTable remains deferred. Chart-owned selectors and legacy react-ui are unchanged. All1,444 fallbacks remain; broad deletion is deferred.

## Evidence

- **Before:** accepted61 has stable Button/IconButton targets while the remaining owned registrations use generated attachment classes.
  **After:** documented matching later unlayered selectors target actual owned rules, preserving appearance, interactions, theme scopes and host isolation.
- **4,591 worker checks** pass, separately from **2,136 valid independent assertions** accepted by the root. Independent assertions are not2,136 independent scenarios; native/source/archive/graph audits are separate. Original invalid harness failures and explicit corrections remain retained, not relabeled.
- Independent Chrome156 plain CSS/Tailwind v3/v4, six framework/order configurations: controls,43 presentation fixtures, real Select/Calendar/DatePicker/Modal portals, transient tooltip/citation/gallery/loading states, actual cold/lazy automatic styling, host tokens/layers/globals, contextual overrides and repeated registration. All178 W2 canonical hooks and16 W1 portal sites are observed. The report defines the bounded replay; not every historical property/size/range is rerun.
- Build/typecheck and two source review axes pass.166 ESM/CJS exports and440 declarations unchanged;371 embedded owned sources and2210 members per installed archive bind exact inputs. All1,444 fallback expressions/counts retained; six formatting-only differences independently audited.
- Eight representative optimized family pairs preserve reachable output counts/entry CSS sizes. Cold/lazy shell static JS is unchanged; dynamic reachable bytes and retained shared/vendor costs are reported, not presented as runtime speed or zero-unused proof.

**Sources remains an explicit important-property exception.** Real same-element targets match both arms; existing width180px/background important declarations defeat normal later consumer rules. A real URL activates the has-url hover important branch, also confirmed in all six configurations. This is not ordinary background/width override success. Inline Image width retains precedence; corrected stylesheet-owned probes pass. No important declaration, product animation, Goober runtime or injector was patched.

[Exact independent report/raw corrections]('''+u+'''stable-selectors65-independent/independent/REPORT.md) · [Independent retention manifest]('''+u+'''stable-selectors65-independent/MANIFEST.json) · [Worker report]('''+u+'''stable-selectors65-combined/combined/REPORT.md) · [Final ticket disposition]('''+u+'''stable-selectors65-final-acceptance/ticket-disposition.md).

Frozen source `75f69041891147d52dc0f0d2c4b21a048e575aa8`; archive SHA256 `d2a4b51255d745f41a7b51820ac0ec55ef5db8ff2b6f8d91ab43bade7766d037`. Independent report SHA256 `72977ae780c2b61cbcd93c98f51720b9ff56da1a4ac8acd4897b29e531f71cb1`. **Bounded selector gate accepted.** No source69 CI pass, merge, release, publication or ticket closure is implied. Lab CI results are tied to their own head and are separate from source69.

## Merge Danger

**Door:** two-way

Source-only styling changes can be reverted; no data or release migration.

**Blast Radius:** styling

New react-components consumers depend on selector precedence and portal delivery. Matching later unlayered context is required; vendor inline styles, live animation values, private keyframes and official KaTeX CSS/font limits remain. EditableTable and chart-owned conversion are excluded. SSR/hydration, full chat/parser streaming, performance/memory/soak and full beta#17 acceptance remain outside this gate. PR42/67/68 and this production head stay frozen; CI/tooling/dependencies remain unchanged.
'''
for n,body in [(67,b67),(68,b68),(69,b69)]:
 # Add spaces after numeric shorthand in prose while preserving literal hashes/URLs.
 for a,b in [('Register215','Register 215'),('All1,444','All 1,444'),('-453','- 453'),('and39','and 39'),('preserved120','preserved 120'),('exports166','exports 166'),('declarations440','declarations 440'),('fallbacks1,444','fallbacks 1,444'),('batches64','batches 64'),('are not2,136','are not 2,136'),('Chrome156','Chrome 156'),('controls,43','controls, 43'),('All178','All 178'),('and16','and 16'),('pass.166','pass. 166'),('and440','and 440'),(';371','; 371'),('and2210','and 2210'),('width180px','width 180px'),('beta#17','beta #17')]:body=body.replace(a,b)
 (r/('pr'+str(n)+'-body-final.md')).write_text(body)
print('Prepared final descriptions at lab',lab)
