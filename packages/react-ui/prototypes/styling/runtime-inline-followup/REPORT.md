# Inline themes and automatic host CSS: measured runtime follow-up

**Decision: OPEN.** This is prototype evidence, not approval of runtime Goober or a migration. Package, component and ownership decisions are unchanged. Prior static and runtime artifacts remain intact.

The tested runtime path can style actual OpenUI components during SSR, hydration and delayed React streaming without consumer CSS imports, a styling setup command, framework flags or a consumer build plugin. The new Tailwind compatibility adapter is proved only for Button. Other components rendered in the fixture do not thereby inherit its compatibility guarantee.

## Results

| Control | Result | What it establishes |
| --- | --- | --- |
| Inline variables alone | Host isolation fails | Exact SSR/hydration tokens work, but original ThemeProvider still writes to body and changes outside content |
| Inline variables plus automatic theme scope | 29/29 checks | Exact tokens and scope IDs through SSR/hydration; nested/dark/sibling isolation; outside content preserved; concurrent documents and client navigation |
| Scoped themes plus Button CSS adapter in production Next | 85/85 checks | Initial shell styling without JavaScript, hydration, delayed first-visible Button/Table parity, normal/hover overrides and sampled Button states in plain CSS/Tailwind v3/v4 |
| Separate Button CSS-order/state matrix | 24/24 cases | Both effective stylesheet orders, default/button/submit/reset types inside forms, default and override states |
| Unrelated width/height preservation | 24/24 cases | The rollback guard does not discard host sizing owned only by descendants in the source styles |
| Stricter disabled-cursor priority contract | 20/24 cases | An unresolved difference: ordinary cursor utilities override disabled cursor in v4; plain CSS/v3 retain not-allowed. Explicit disabled modifiers work across all three |

These suites overlap; their counts must not be added into a claim of independent coverage. Exact framework/browser versions, source hashes, failed intermediate observations and corrected harness expectations are retained in the evidence.

## How the automatic candidate works

Theme values stay in inline CSS variables, so changing an accent does not generate a new Goober theme class. A library-owned wrapper derives a stable scope with React useId and passes that selector internally to ThemeProvider. This stops its existing insertion effect from writing theme variables to body. Consumers never provide the selector. Across 120 unique updates, style elements stay at eight and component resource IDs remain stable. Twelve simultaneous distinct-hue requests preserve their own main and delayed tokens; this is a bounded concurrency check, not a new long memory soak.

Button defaults run through Goober inside the components CSS layer. A small unlayered rule uses revert-layer for only the 16 properties owned by the Button root. It defeats standard preflight resets while leaving ordinary class utilities free to customize the component. React 19 delivers the generated CSS resource. This integration is code the library would own; Goober alone does not supply the entire contract. The [cascade investigation](cascade-research/FINDINGS.md) explains the rule and its primary CSS specification references.

The streaming test deliberately introduces the first library Button after the shell. CSS arrives after the hidden HTML but before React reveals it; the first visible observations match expected styles. With JavaScript disabled, that delayed markup remains hidden. We claim styled initial-shell SSR and styled JavaScript-driven delayed reveal, not no-JavaScript rendering of hidden Suspense content. Independent original Table samples under each framework agree with the recorded reveal styles.

## Remaining decisions and coverage

- The CSS adapter covers Button only. Compound controls, charts, portals and the full chat shell still need this candidate's own coverage.
- Review ordinary versus explicit disabled utility priority before treating customization as consistent across frameworks.
- The internal theme/base/components/utilities layer declaration assumes the standard order. It cannot reorder a host's pre-existing incompatible order; unusual resets and shadow roots are unproved. A winning rollback can discard lower-specificity unlayered declarations on properties the component owns.
- Strict CSP/nonce and portal inheritance are untested. Inline variables need a compatible policy.
- This round did not repeat performance, bundles, full chat integration or a prolonged soak. Previous performance and memory numbers belong to their original builds and cannot certify this changed candidate.
- This is a source-level local diagnostic with installed fixture dependencies, not a clean published-tarball consumer install test.

Keep the styling execution model reopened and implementation tickets paused pending human review.

## Evidence and reproduction

- [Protocol](PROTOCOL.md)
- [Next investigation and corrections](inline-next/REPORT.md)
- [First inline result, including body leak](inline-next/results/next-runtime.json)
- [Scoped control: 29 checks](inline-next/scoped-control/results/scoped-focused.json)
- [Combined control: 85 checks](inline-next/combined-control/results/scoped-focused.json)
- [Independent original Table reference](inline-next/combined-control/results/table-baseline-reference.json)
- [Executed combined source/build hashes](inline-next/combined-control/results/executed-artifacts.json)
- [Refined CSS matrix](cascade-research/results-refined-root.json), [unrelated size checks](cascade-research/size-results.json), [cursor difference](cascade-research/cursor-results.json)
- [Reproduction instructions](README.md)

The frozen source files and original result hashes retain their measured paths. Prepare a separate scratch copy for reruns; never overwrite preserved evidence.
