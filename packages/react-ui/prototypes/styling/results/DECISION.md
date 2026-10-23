# Goober requirements — generated decision report

Verdict: Goober is a plausible styling engine, but the requirement set is not met by Goober alone or by this prototype adapter yet. No adoption decision has been made.

Goober 2.1.19; Chromium 156.0.8078.47; 30 CSS-policy scenarios, plus theme, shared-host, classic SSR and Next.js smoke probes.

| Requirement | Observed result | Who supplies it |
| --- | --- | --- |
| No manual component CSS import | Pass in browser fixtures | Goober runtime |
| Trace rendered component to source | Prototype metadata works; not native Goober source labels | OpenUI instrumentation / build tooling |
| No hand-maintained compatibility report | Generated JSON and Markdown from checks | Prototype scripts; not a Goober feature |
| Agent-friendly workflow | Runnable commands and structured manifest provided; no agent benchmark | Project tooling |
| Tailwind v3/v4 and other CSS overrides | Conditional: adapter needed in tested load orders | OpenUI cascade/insertion policy |
| Do not interfere with host styles | Not met by prototype adapter when the host shares Goober sheet | Requires isolated insertion ownership |
| Light/dark themes and portals | Pass in representative fixtures; token forwarding implemented in fixture | OpenUI theme/portal integration |
| Chart updates without CSS rule growth | Pass in representative chart fixture | Stable style rules + data attributes |
| Classic server render and hydration | Pass with explicit extraction | Goober API + server integration |
| Next.js App Router without SSR setup | Not met: no initial server styles; styled after hydration | Requires framework SSR/streaming integration |

## Policy results

| Policy | Base styles | Consumer override | Complete scenario checks |
| --- | --- | --- | --- |
| default | 10/10 | 5/10 | 5/10 |
| layered | 8/10 | 10/10 | 8/10 |
| adapted | 10/10 | 10/10 | 10/10 |

The default-policy failures reproduce stylesheet-order and Tailwind v4 layer conflicts. Layering fixes v4 utility precedence but loses base styling to v3 preflight. The framework-aware adapter handles those fixtures but moves Goober’s shared style tag, changing cascade priority for an existing Goober host component. It is not a production-safe universal adapter.

## Remaining work before adoption

- Design library-owned style insertion that does not reorder an application’s Goober styles.
- Package and validate a supported SSR/streaming integration for required hosts; passing classic SSR does not certify Next.js App Router.
- Make the chosen cascade policy part of generated installation/configuration rather than scattered manual documentation.
- Retain component-to-source metadata and generated checks as OpenUI tooling.
- Validate actual OpenUI components and supported browsers before migrating the complete library.

## Sources

- Goober API: https://github.com/cristianbote/goober
- Tailwind v3 custom styles: https://v3.tailwindcss.com/docs/adding-custom-styles
- Tailwind v4 custom styles: https://tailwindcss.com/docs/adding-custom-styles
- Next.js CSS-in-JS: https://nextjs.org/docs/app/guides/css-in-js

## Limits

- Representative components, not production OpenUI ports
- Chromium only
- Classic renderToString/hydration only; no Next.js App Router or streaming certification
- No universal CSS framework guarantee
- Adapted is an explicit framework-aware policy, not automatic detection
- Prototype adapter moves the shared Goober style tag; it is not production-safe for hosts sharing that sheet
- Traceability uses prototype data attributes and source metadata; Goober does not generate the report or source labels itself
- Next.js probe is a development-mode smoke check, not production or concurrent-request verification.
