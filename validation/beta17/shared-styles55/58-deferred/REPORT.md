# Ticket58 — first vertical batch found a compatibility boundary

## Status
Examined; broad fallback deletion is deferred by explicit user decision: preserve behavior and retain affected fallbacks. This is the resolved disposition consumed by60, not an ongoing request to implement deletion. The issue remains open. No58 production commit. All56 trial Button fallback removals were restored from the exact pre-change snapshot. Current source is CLEAN at accepted57 commit50df8768157c5e76abda45bf39098ec4b87fa702, package treef06811c5e7e3324829f552a153ff36e9e7b6df5c. PR42 unchanged. No Worker2-owned files, charts, kits, registration, metadata or release files changed.

## Test and actual result
Trial removed ONLY56 exact fallback occurrences from Button/button.styles.ts (all defaults match canonical strings). Existing package build PASS. Frozen native candidate archive:
/private/tmp/openui-styles58-evidence/button-candidate/openuidev-react-components-0.0.0-beta.0.tgz
SHA256 cd0782d738a199d155e25ad634129c2b18efc2f33137e1d3c29f90252cfdef1d.
Accepted57 baseline archive remains SHA256 a7c562a0f284d8f290f414ce4bee2fae632c601470677d71046800a021e808e4; baseline consumer imports that immutable package.

Matched optimized public Button imports, one Goober2.1.19 origin per arm, actual plain/TW3/TW4 CSS, two real Button instances (normal/disabled).30 computed-state comparisons:18PASS,12FAIL. Provider-free and valid color overrides match. Container unset/inherit correctly inherits root defaults and matches.

In every framework, these legal CSS-wide custom-property resets fail parity:
- Root token initial, unset or inherit.
- Container token initial.

Example consumer CSS:
```css
:root { --openui-interactive-accent-default: initial; }
```
Before: the custom property has its guaranteed-invalid initial value, so var(--openui-interactive-accent-default, <blue literal>) uses the fallback. Actual Button background is oklch(0.546 0.215 262.881).
After: var(--openui-interactive-accent-default) has no fallback, so background declaration becomes invalid at computed-value time and the actual Button is transparent, rgba(0,0,0,0). Width/padding/other tokens were not reset to force this failure.

This is ordinary CSS var semantics, not a stock-Goober bug or a failure of57 central registration. Lower-priority root defaults cannot override a consumer intentionally clearing the custom property. Equal canonical strings alone are insufficient to prove fallback deletion equivalent. Any public theme/custom-property value can in principle be cleared; simply marking the single accent token as an exception would not establish safety for remaining tokens.

## Options investigated before the user decision
1. Preserve existing missing-token fallback behavior: keep necessary local fallbacks (potentially all user-overridable theme-token fallbacks). This narrows58's deduplication goal, but no machinery/patches are needed.
2. Explicitly narrow supported customization to overrides that keep used tokens defined, accepting loss of per-component fallback behavior after CSS-wide resets. This is a contract/spec decision, not a silent test relaxation. Only after that decision should broad removal proceed.

No @property aliases/private defaults/runtime repair or custom style engine is proposed/implemented. Do not waive the12 real differences as historical failures. Worker2's three fallback removals would need the same boundary decision; its common-base extraction can be investigated separately while retaining those fallbacks.

## Evidence and controls
button-first-batch.json records all56 original spans/hash. button-before.styles.ts and button-after.styles.ts plus button-removal.patch preserve the exact trial. button-corrected-results.json has all computed observations and pairwise results; button-corrected-summary.json is compact. build-button.mjs and run-button-corrected.mjs reproduce the public-consumer seam. Baseline/candidate browser metafiles and consumer lockfile pin origins.

Initial scratch server aborted on a favicon route (no complete result accepted). Corrected server defaults routes safely and clears root AND container token overrides before each case, avoiding cross-case contamination. No failed assertion was relabeled; final12failures are genuine. Own isolated browser/server closed. Source was restored only AFTER preserving the failed candidate/archive/results. Ignored dist in this checkout still reflects the trial and must NOT be repacked as the accepted source; source or accepted57 archive is authoritative. No rebuild after restore, to release the runtime window promptly.

## Window
Browser/heavy-build window RELEASED for Worker2/root/verifier. User resolved the boundary in favor of preserving behavior. Do not expand fallback deletion;60 proceeds with this retained-fallback disposition. No old fullmatrix/performance/SSR work was restarted; frozen57 evidence is untouched.

## Accepted disposition

User chose: **Preserve behavior; retain affected fallbacks.** Keep all1,444 inventoried occurrences:1,441 in Worker1's92files and three gap fallbacks in Worker2's reserved roots. The non-theme image fallback also stays. No workaround or package modification is needed for58. Root owns the issue-policy update; do not close58.59may extract equivalent base declarations while preserving its three fallbacks.60integrates accepted59with57and documents this decision; it must not wait for broad deletion. See DISPOSITION.json.
