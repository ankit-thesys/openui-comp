# Runtime Goober + actual OpenUI in production Next: not accepted

The synchronized production Next 16.4.2 build executes Goober in the browser and server, imports actual production OpenUI components/parser through the runtime Fixture, and imports no library CSS or consumer styling setup in the runtime arm. Host CSS resources are allowed; the same library adapter is used with plain CSS, Tailwind 3 and Tailwind 4 without framework configuration. The baseline references the full existing production stylesheet. The source/bundle manifest is `next-build.json`; compiled artifacts and selected source hashes are in `next-final-artifacts.json`.

The runtime candidate fails meaningful styling checks. Both actual renderer Buttons and a standalone RuntimeButton without ThemeProvider render with browser defaults before JavaScript: gray background, black text, `1px 6px` padding and `2px outset` border. The full baseline has real white text, `7px 10px` padding, `8px` radius and the intended accent border. Runtime theme tokens themselves are present, but component selectors do not match. Hydration produces no React errors while the runtime controls remain visually wrong. A successful hydration alone is not styling correctness.

The cause is the object selector rewrite used to preserve specificity. For example, the descriptor key `:where(&).openui-button-base` passes through Goober as `:where(.goX).goX .openui-button-base`, introducing an extra descendant. The generated scope class is on the same Button, so that selector does not apply. Hover selectors are also changed. Runtime framework override checks appear green because the library's rules are missing; these are explicitly not compatibility passes or grounds for acceptance.

The initial pre-specificity-fix adapter did style controls, but plain CSS/Tailwind 3/Tailwind 4 overrides all failed. Initial raw observations are preserved in `next-first-runtime.json`; its selected-module baseline and runtime both lacked default tokens before hydration, showing black text and zero padding. That initial pass on accent color alone was inadequate. The final check uses the full baseline and verifies padding, text, border, radius and default tokens so equally incomplete styling cannot pass. The prototype subsequently added a library-owned full resolved-theme resource and per-declaration default fallbacks; the selector bug remains visible in the synchronized final result.

The full baseline's original ThemeProvider does not emit custom theme overrides during SSR. Its default blue is correctly styled, while custom red/blue overrides appear after hydration. Those baseline SSR theme failures are an existing integration gap, separate from the runtime selector failure.

Transport and request checks are bounded diagnostics: 100 complete SSR responses at concurrency 10, 50 per arm, alternating themes/scenarios, pass status/source-marker/runtime-theme-rule checks. Eight concurrent JavaScript-disabled runtime documents retain their requested marker, but fail actual accent styling because of the selector defect. Six streams are aborted after the first chunk and a later request succeeds; this proves continued availability, not request timer cleanup or memory safety. The initial shell and delayed dashboard arrive in different transport chunks. Visible delayed Table header styles are sampled against baseline; this does not certify the complete chart or portal path.

The host Goober probe keeps its own target and remains unchanged through library renders. Browser/server Goober is included in the tested bundle. The Next prebundle selects a universal decoder export and shares Next's React singleton; it emits build warnings about a remaining require helper. Chrome only, representative components only. Scoped chart rules cannot reach tooltip portals outside their root. No CSP, mobile, full migration, sustained capacity or accepted performance claim is made. The checker refuses occupied ports; unknown listeners on 4213/4214 were preserved, and its owned 4215 server was stopped.

Reproduce from any directory after the foundation source/descriptors exist:

```sh
node /private/tmp/openui-runtime-probe/next-build.mjs
npm run build --prefix /private/tmp/openui-runtime-probe/next
node /private/tmp/openui-runtime-probe/next-check.mjs
```

The checker exits nonzero and records failures. User review is required before treating a candidate as accepted.
