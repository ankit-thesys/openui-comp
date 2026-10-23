# Goober requirements — generated decision report

React 19 is accepted. The installed-package compatibility test is not green: Next.js SSR consumer overrides fail for Tailwind v3, Bootstrap and plain CSS. Tailwind v4 and framework-free cases pass in Chromium and WebKit. Firefox coverage is unavailable because the browser could not launch. Automatic framework detection alone does not solve CSS ordering.

Goober 2.1.19; React 19.3.1; Chromium 156.0.8078.47; Next.js 16.4.2. 30 CSS-policy scenarios.

## What users do

Import and render the prototype Button. The tested React 19 SSR path requires no component CSS import, registry, provider, extraction call, or styling plugin in the app. The package build generates the CSS once; component code carries it using React stylesheet resources. Dynamic theme values use CSS variables.

The browser compatibility adapter and the automatic SSR component are two delivery paths over the same generated styles. The original SSR fixture is framework-free. The subsequent installed-package matrix uses an automatic setup command and exposes priority failures that the original isolated fixtures did not cover.

| Requirement | Observed result | Who supplies it |
| --- | --- | --- |
| No manual component CSS import | Pass in browser and server fixtures | Generated CSS + OpenUI style delivery |
| Trace rendered component to source | Prototype metadata works; not native Goober source labels | OpenUI instrumentation / build tooling |
| No hand-maintained compatibility report | Generated JSON and Markdown from checks | Prototype scripts; not a Goober feature |
| Agent-friendly workflow | Runnable commands and structured manifest provided; no agent benchmark | Project tooling |
| Tailwind v3/v4 and other CSS overrides | 4/10 executed installed-package browser/framework combinations pass; 5 unavailable. See COMPATIBILITY.md | Setup detects conventional installed dependencies; SSR style ordering remains unresolved |
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

- React 19 is accepted. Final adoption of package-build-generated static styles remains a decision; arbitrary runtime style generation is not certified.
- Fix unlayered consumer override priority under Next.js SSR for Tailwind v3, Bootstrap and plain CSS. The automatic setup command detects these frameworks but does not fix delivery order.
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

## Installed package + automatic framework setup

Artifact: @openui/goober-compat-prototype@0.0.0-prototype.2. 4/10 executed combinations pass; 5 planned combinations unavailable.

[Full generated matrix](COMPATIBILITY.md) · [Structured evidence](compatibility.json)

The app imports its own framework CSS normally. The setup command reads installed direct dependencies and generates a component entry point without asking the user to choose a CSS policy. All five apps build; repeat setup is idempotent and refuses customized entries. Unlayered library resources arrive after app CSS in Next.js, so equally specific consumer override rules lose. This is a real integration failure, not an execution error.

## Strict CSP observations

[Generated CSP results](CSP.md). The static component works with authorized style hashes and with a matching style nonce supplied to React’s streaming renderer. A nonce prop alone does not authorize SSR resource styles. The app must own its security policy; Next.js CSP and dynamic inline theme values remain unverified.
