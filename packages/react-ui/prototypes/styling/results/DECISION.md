# Goober requirements — generated decision report

10/10 executed installed-package browser/framework combinations pass; 5 planned combinations remain unavailable. The installer generates static Goober CSS and inserts its import before app imports in the Next.js root layout. Consumer override order passes in the executed fixtures, including SSR and streaming. React 19 is accepted; production adoption remains pending.

Goober 2.1.19; React 19.3.1; Chromium 156.0.8078.47; Next.js 16.4.2. 30 CSS-policy scenarios.

## What users do

Run the package configuration command once, then import and render the generated Button entry. The tool detects the installed framework, generates CSS, and adds its import before existing imports in the Next.js root layout. Users do not arrange stylesheets, write a provider, or add an SSR registry. The import exists and is maintained by our installer. All installed prototype variants load in the initial stylesheet, including streamed variants. Dynamic theme values use CSS variables.

The original React stylesheet-resource fixture remains a framework-free reference. The installed-package matrix uses external generated CSS to preserve consumer override order. The prior inline resource path failed when Next.js emitted it after unlayered app CSS; automatic early import fixes that tested case.

| Requirement | Observed result | Who supplies it |
| --- | --- | --- |
| No manual styling setup | Installer adds the first CSS import and generates the component entry; no provider or SSR registry | OpenUI Next.js installer + Goober-generated static CSS |
| Trace rendered component to source | Prototype metadata works; not native Goober source labels | OpenUI instrumentation / build tooling |
| No hand-maintained compatibility report | Generated JSON and Markdown from checks | Prototype scripts; not a Goober feature |
| Agent-friendly workflow | Runnable commands and structured manifest provided; no agent benchmark | Project tooling |
| Tailwind v3/v4 and other CSS overrides | 10/10 executed installed-package browser/framework combinations pass; 5 unavailable. See COMPATIBILITY.md | Installer controls root-layout import order and detects conventional installed dependencies |
| Do not disturb host Goober styles | Pass: host color, sheet contents and relative position preserved in probes | Library-owned styles, no writes to host Goober sheet |
| Light/dark themes and portals | Pass in representative adapted fixtures; token forwarding implemented in fixture | OpenUI theme/portal integration |
| Chart updates without CSS rule growth | Pass in representative chart fixture | Stable style rules + data attributes |
| Classic SSR without app extraction setup | Pass, including hydration; client-only path also tested | React 19 stylesheet resources inside library component |
| Next.js SSR with automated styling setup | 10/10 executed combinations pass initial styles, hydration, real streaming, navigation and host isolation | Initial generated stylesheet includes all installed variants before streamed content |

## Policy results

| Policy | Base styles | Consumer override | Complete scenario checks |
| --- | --- | --- | --- |
| default | 10/10 | 5/10 | 5/10 |
| layered | 8/10 | 10/10 | 8/10 |
| adapted | 10/10 | 10/10 | 10/10 |

Default and layered reference-policy failures remain visible. The adapted policy now injects only its own generated stylesheet and scopes rules to library-marked elements. It never moves or modifies the application’s _goober tag.

## Original framework-free SSR reference checks

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
- Extend the conventional Next.js installer to other supported hosts and layouts. Custom cascade configurations and later consumer import rearrangement need explicit handling.
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
- Representative Button only; full OpenUI component parity not certified
- WebKit is Playwright WebKit, not a Safari release certification
- Conventional directly declared framework dependencies; CDN-loaded CSS and unusual monorepo layouts need separate handling
- Framework CSS compiled by fixture preparation from pinned real packages; no custom Tailwind config variants yet
- Installer adds generated stylesheet as the first root-layout import; no hand editing is needed
- Static styles for all installed prototype variants are loaded initially; arbitrary runtime-generated rules are outside this path

## Installed package + automatic framework setup

Artifact: @openui/goober-compat-prototype@0.0.0-prototype.3. 10/10 executed combinations pass; 5 planned combinations unavailable.

[Full generated matrix](COMPATIBILITY.md) · [Structured evidence](compatibility.json)

All five production apps build. The setup command keeps app CSS intact and adds generated defaults first. Tailwind v4 additionally declares its standard layer order. Safety checks cover JS/TSX layouts, directives, repeat installation, customized output, ambiguous roots and reordered imports. Refusal checks verify no files change. Static CSS for all installed variants loads up front; this is not arbitrary runtime Goober CSS.

## Strict CSP observations

[Generated CSP results](CSP.md). The new external stylesheet works under style-src self with no inline-style authorization in the static component probe. The reference resource path also works with authorized hashes or a matching renderer style nonce; a component nonce prop alone fails. The app owns its security policy; integrated Next.js CSP/streaming and dynamic inline theme values remain unverified.
