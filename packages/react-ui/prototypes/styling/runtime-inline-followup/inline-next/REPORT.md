# Inline theme runtime Next investigation

Decision remains open. Three separate source/build/result sets are preserved; no production files or previous artifacts were changed. Tests use production Next 16.4.2, React 19 and Chrome. Runtime consumers import no component CSS, registry, extraction call, framework selector or styling plugin. Host CSS is a separate input.

## 1. Inline theme boundary alone

The durable `theme-inline-control/Fixture.tsx` was copied into `runtime/Fixture.tsx`, with source paths fixed and the baseline delegated to preserved `runtime/OriginalFixture.tsx`. Test-only mode/nested probes were added. The component Goober adapter was unchanged.

`results/next-runtime.json` confirms complete inline token maps before JavaScript and exact hydration equality for blue, red, nested light/dark and standalone dark boundaries. All string tokens are checked against unmodified default theme exports, not a few sampled colors. There are no Theme Goober resources. Across 120 committed distinct accent updates, nine component resource IDs and eight style elements remain stable; final rendered color settles correctly. Intermediate computed colors reflect the existing 120ms transition and are recorded rather than required to equal each new target immediately. Nested and independently themed sibling controls retain their own tokens.

However, the actual original ThemeProvider still writes a body rule through its insertion effect. A host root sentinel stays `oklch(0.7 0.1 90 / 1)`, while the outside host element and standalone Button inherit blue initially and the 120th unique accent afterward. The baseline body API control also changes outside inheritance from blue to red. Inline boundaries protect descendants but do not remove those global writes. This first candidate fails the stronger scoped-host contract. Original framework override limitations remain.

Initial expectation/selector errors are preserved separately. They involved two initialism names in the checker conversion, sampling during CSS transitions, and a malformed test locator; no app fix was hidden as a harness correction. `first-inline-executed-artifacts.json` identifies the frozen first candidate and corrected executed checker.

## 2. Automatic scoped theme wrapper

`scoped-control/` adds a package-owned wrapper that uses React useId to generate a stable unique boundary selector and passes it internally to the existing ThemeProvider. The same boundary renders complete inline variables during SSR. Consumers supply no selector or styling setup; the original provider implementation and baseline branch remain untouched.

`scoped-control/results/scoped-focused.json` passes 29 focused checks: exact full token maps and stable scope IDs across SSR/hydration, nested/dark resolution, no Theme Goober resources, 120 unique updates with bounded resource count, unchanged outside sentinel/Button, sibling isolation, no provider body selectors, eight concurrent red/blue documents and eight actual Next client-Link navigations. This control did not establish first delayed resource paint or new framework compatibility; its component adapter is unchanged.

## 3. Scoped themes plus Button-only cascade bridge

`combined-control/` copies the scoped control and changes only the Button branch of the component style adapter. It layers Button rules in `components` with an explicit standard layer order, plus a low-specificity unlayered `revert-layer` guard for the 16 properties actually owned by production Button root selectors. Root-property metadata comes from the production Sass selector AST; SVG-only width/height are excluded. Other component units remain unchanged. There is no framework detection, consumer flag, emitted-CSS rewrite or postprocessor in this candidate.

`combined-control/results/scoped-focused.json` passes 85 recorded checks. This is a bounded diagnostic inventory, not proof of complete migration:

- Full-token SSR/hydration, scope isolation, nested/dark themes, 120 unique accent updates and resource bounds continue to pass.
- Initial-shell no-JavaScript actual renderer Buttons and explicit submit/reset/button controls are styled under none, plain CSS, Tailwind 3 preflight and Tailwind 4.
- A separate `lateOnly` route emits no library Button in its shell. Its first Button resource is introduced with delayed real dashboard content. Real JS reveal observations find correct renderer Button styles, ordinary overrides and Table header styles on every recorded first-laid-out observation in all four environments.
- Default hover, active, disabled cursor/background and focus-visible with an actual auto 3px outline pass. Normal and hover host utilities pass in plain CSS, Tailwind 3 and Tailwind 4.
- Twelve concurrent numeric-only distinct hue requests each preserve exact main and delayed inline accent values and separate scope IDs. Eight concurrent red/blue documents and repeated client navigation also pass.

The original baseline Table route was sampled separately under every matching host framework. All saved first-reveal Table fields match it: transparent background, text `oklch(0.097 0 0)`, 12px padding, 14px font and 21px line height. Source and full baseline asset hashes are in `combined-control/results/table-baseline-reference.json`. The initial guessed line-height assertion is preserved in `first-combined-observations.json`; the corrected gate uses prior independent baseline fields and the independent route comparison checks all recorded fields.

The streaming distinction matters: CSS arrives after hidden content markup but before React's reveal script. The checker records offsets and chunks; it does not claim CSS precedes the HTML. With JavaScript disabled, delayed content remains inside a hidden container and its new style resources are pending React reveal. Its computed browser/preflight defaults are recorded as hidden markup observations, not a visible-paint failure or no-JS paint success. The initial shell is the no-JS styled-content proof; the JS MutationObserver is the delayed first-reveal proof.

## Limits and provenance

The bridge is proved here only for actual native Button components and representative forms. Other library units, portals, chart families, CSS engines and browsers need their own review. Isolated research still finds a cross-framework priority difference for ordinary cursor utilities on disabled Buttons; the default disabled state passes, but that broader utility contract is not claimed resolved. Focus outline presence is not an accessibility contrast certification. Inline variables require compatible CSP; strict CSP/nonce policy was not tested.

No new prolonged memory soak, heap budget, cold-network performance or production capacity claim follows from these controls. Eight-to-eight style element counts and stable resource IDs across 120 updates establish bounded observed browser resources only. The earlier static/runtime soak evidence belongs to its original build.

Both controls retain their original pre-build manifests and separate `results/executed-artifacts.json` files with actual executed checker and compiled server/client artifact hashes. Harness-only corrections did not rebuild candidate app code. Owned port 4235 servers stopped. No acceptance decision, issue, commit or push was made.
