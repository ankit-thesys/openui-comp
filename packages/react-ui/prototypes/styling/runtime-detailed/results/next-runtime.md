# Detailed runtime Next round

Candidate: `nested-object-specificity-neutral-unlayered`. Production Next 16.4.2 and Chrome, actual production OpenUI components/parser, runtime Goober object descriptors and package-owned React 19 style resources. The runtime consumer imports no component CSS, extraction/setup/registry or styling plugin; it passes no framework configuration to the library. Host stylesheet links and the host's own Goober usage are separate. The baseline uses the full original unlayered production stylesheet.

The corrected checker records 127 checks, with 14 failures. Checks overlap, so this is a diagnostic inventory, not a completeness or adoption score. All recorded Button normal, hover, active, disabled and focus-visible computed styles match the original no-framework baseline for both arms under none, plain CSS, Tailwind 3 with preflight and Tailwind 4. Untouched styles also match before JavaScript and at the first laid-out delayed reveal: typography, padding, border, radius, colors, cursor, opacity and other recorded fields. Runtime controls retain Inter/sans-serif at 16px/20px; disabled controls have the intended disabled accent and `not-allowed` cursor; focus-visible matches the original outline. These results concern browser-computed style behavior, not an accessibility certification.

| Behavior | Plain CSS | Tailwind 3 | Tailwind 4 |
| --- | --- | --- | --- |
| Untouched Button base/states, both arms | Matches original | Matches original with preflight | Matches original |
| Ordinary class overrides before JS / after hydration / first late reveal, both arms | Pass | Pass | Fail |
| Ordinary hover background override, both arms | Fail | Fail | Fail |

The failures are retained:

- Plain/Tailwind 3 hover overrides differ only in background: the actual library Button uses `oklch(0.546 0.215 262.881 / 0.8)` while the native host reference uses green `rgb(34, 197, 94)`. Host color, padding and radius still apply. The original stylesheet has the same failure: its compound pseudo selector is more specific than the ordinary host hover utility.
- Tailwind 4 layered utilities lose to unlayered component rules in both arms. In the hover comparison, the host reference has green `oklch(0.723 0.219 149.579)`, RGB white, `32px` padding and zero radius; the library Button retains its theme hover background, theme white, `7px 10px` padding and `8px` radius. Normal and first-reveal override checks also fail. No layer workaround or framework-specific library configuration was introduced.
- The original ThemeProvider correctly styles default SSR content but emits custom overrides only after hydration; the two baseline custom red/blue SSR checks fail. Runtime red/blue SSR theme and full default-token checks pass through the package-owned theme resource and declaration fallbacks.

The runtime standalone Button without ThemeProvider passes. Runtime hydration, actual form editing, theme updates, navigation, eight concurrent request markers/rendered themes, host Goober preservation, separate shell/delayed transport and the first laid-out delayed Table header samples pass. The runtime engine is present in the browser bundle (`goober.modern.js`). Full chart/portal coverage, dark or nested themes, CSP and other browsers are not established here.

The same final compiled app completes 100 SSR responses at concurrency 10, 50 per arm, alternating themes/scenarios, with status/source-marker/runtime-theme-rule checks. Six streams are aborted after the first chunk and a later request succeeds. This is bounded closed-loop correctness pressure, not capacity, timer cleanup or leak evidence. It is separate from earlier static and runtime soak work.

One harness correction was necessary. New standalone state probes were accidentally included by the older generic themed-renderer reveal observer, producing two false late-theme failures. `next-observer-contaminated.json` preserves that complete first run. Only the observer selector was narrowed to the actual renderer's theme boundary; foundation/app code was neither changed nor rebuilt. The corrected checker then passed both renderer reveal gates. `next-build.json` retains the original pre-build checker hash; `next-executed-artifacts.json` separately records the corrected executed checker SHA and actual compiled server/client app artifact hashes, with this distinction documented.

Raw evidence: `next-runtime.json`, including all state samples, native-host comparisons, visible-reveal samples and pressure responses. The checker intentionally exits nonzero for genuine failures. Its owned port 4225 server stopped. No production source, prior artifacts, decision or ticket was changed. User review remains necessary before accepting an approach.

```sh
node /private/tmp/openui-runtime-detailed/next-build.mjs
npm run build --prefix /private/tmp/openui-runtime-detailed/next
node /private/tmp/openui-runtime-detailed/next-check.mjs
```
