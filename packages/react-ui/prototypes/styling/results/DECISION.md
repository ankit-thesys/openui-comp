# Goober requirements — generated decision report

The host-style conflict and SSR setup blockers are resolved in the tested prototype paths. This is Goober-generated static CSS plus OpenUI-owned delivery, not stock runtime Goober. Universal zero-configuration framework support and production OpenUI parity remain unproven.

Goober 2.1.19; React 19.3.1; Chromium 156.0.8078.47; Next.js 16.4.2. 30 CSS-policy scenarios.

## What users do

Import and render the prototype Button. The tested React 19 SSR path requires no component CSS import, registry, provider, extraction call, or styling plugin in the app. The package build generates the CSS once; component code carries it using React stylesheet resources. Dynamic theme values use CSS variables.

The browser compatibility adapter and the automatic SSR component are two delivery paths over the same generated styles. The SSR fixture is framework-free; it does not prove that the explicit Tailwind v3/v4 policy can be selected automatically.

| Requirement | Observed result | Who supplies it |
| --- | --- | --- |
| No manual component CSS import | Pass in browser and server fixtures | Generated CSS + OpenUI style delivery |
| Trace rendered component to source | Prototype metadata works; not native Goober source labels | OpenUI instrumentation / build tooling |
| No hand-maintained compatibility report | Generated JSON and Markdown from checks | Prototype scripts; not a Goober feature |
| Agent-friendly workflow | Runnable commands and structured manifest provided; no agent benchmark | Project tooling |
| Tailwind v3/v4 and other CSS overrides | Adapted policy: 10/10 scenarios pass; framework choice still explicit | OpenUI cascade policy; automatic framework configuration remains open |
| Do not disturb host Goober styles | Pass: host color, sheet contents and relative position preserved in probes | Library-owned styles, no writes to host Goober sheet |
| Light/dark themes and portals | Pass in representative adapted fixtures; token forwarding implemented in fixture | OpenUI theme/portal integration |
| Chart updates without CSS rule growth | Pass in representative chart fixture | Stable style rules + data attributes |
| Classic SSR without app extraction setup | Pass, including hydration; client-only path also tested | React 19 stylesheet resources inside library component |
| Next.js SSR without app styling setup | Pass in production fixture: initial styles, hydration, streaming, navigation, eight concurrent requests | Library build generates Goober CSS; React 19 delivers component resources |

## Policy results

| Policy | Base styles | Consumer override | Complete scenario checks |
| --- | --- | --- | --- |
| default | 10/10 | 5/10 | 5/10 |
| layered | 8/10 | 10/10 | 8/10 |
| adapted | 10/10 | 10/10 | 10/10 |

Default and layered reference-policy failures remain visible. The adapted policy now injects only its own generated stylesheet and scopes rules to library-marked elements. It never moves or modifies the application’s _goober tag.

## Automatic SSR checks

- serverStyled: PASS
- hydratedStyled: PASS
- interactive: PASS
- streamedStyled: PASS
- noVisibleUnstyledDelayedContent: PASS
- resourceDeduplicated: PASS
- hostPreserved: PASS
- navigationStyled: PASS
- concurrentRequestsIsolated: PASS
- streamObserved: PASS
- streamedCSSBeforeReveal: PASS
- noBrowserErrors: PASS

## Remaining work before adoption

- Choose whether React 19 and package-build-generated static styles are acceptable constraints. Runtime arbitrary style generation is not certified by these results.
- Automate framework-policy selection and test combined SSR + Tailwind v3/v4 before claiming universal no-setup compatibility.
- Validate actual OpenUI components, supported browsers, strict CSP/nonces, and package distribution.
- Retain component-to-source metadata and generated checks as OpenUI tooling.

## Sources

- Goober API: https://github.com/cristianbote/goober
- React stylesheet resources: https://react.dev/reference/react-dom/components/style
- Next.js CSS-in-JS: https://nextjs.org/docs/app/guides/css-in-js

## Limits

- Representative components, not production OpenUI ports
- Chromium only
- Production Next.js evidence is recorded separately in results/next.json
- No universal CSS framework guarantee
- Adapted is an explicit framework-aware policy, not automatic detection
- Adapted policy uses generated static Goober styles in a private tag; arbitrary dynamic runtime CSS is not covered
- Traceability uses prototype data attributes and source metadata; Goober does not generate the report or source labels itself
- React 19 required; React 18 not covered
- Static Goober-generated rules and dynamic CSS variables; arbitrary runtime style creation not covered
- Next.js fixture has no CSS framework: Tailwind matrix is tested separately with an explicit policy
- Representative components, Chromium only
- No strict CSP/nonce or cross-version validation
