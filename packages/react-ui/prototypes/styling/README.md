# Goober-only styling prototype

Throwaway evidence for OpenUI extraction. No production components have been migrated and no styling adoption decision has been made. React 19 is accepted for this proposal.

## Current approach

The package build uses Goober to generate immutable CSS. The prototype installer detects directly installed Tailwind v3/v4 or Bootstrap, generates a component entry and stylesheet, and inserts the stylesheet import **before existing imports** in the Next.js root layout. Plain CSS uses the unlayered policy; Tailwind v4 uses its standard layer order.

Users run the installer and import the generated components. They do not manually arrange CSS imports or write a provider, style registry, or SSR extraction code. The installer owns that integration: this is automated setup, not an absence of setup. Existing app CSS is untouched.

The installed component does not emit inline React stylesheet resources. All installed variant styles, including delayed variants, are bundled into the initial stylesheet. This fixes the previous failure where Next.js placed inline component resources after app CSS and consumer overrides lost. The cost is loading the installed CSS up front; arbitrary runtime-generated styles are outside this path.

The installer supports exactly one conventional `app/layout.{js,jsx,ts,tsx}` or `src/app/layout.{js,jsx,ts,tsx}`. It parses the layout, preserves directives and source text, and validates generated files before writing. Repeat setup is idempotent. Customized generated files, ambiguous roots, and reordered generated imports cause a refusal without edits. This is a bounded prototype, not the complete source registry or update system.

## Run

```sh
npm ci
npm ci --prefix next-fixture
npm run demo
```

Open http://127.0.0.1:4177. The dashboard shows the latest installed-package results, plus the original three-policy browser experiment. The latter retains reference-policy failures for comparison.

To build and start the five installed-package examples:

```sh
npm run compat:prepare
npm run demo:compat
```

Examples run at ports 4210–4214: no framework, Tailwind v3, Tailwind v4, Bootstrap, plain CSS. Preparation installs a real packed artifact in each app and invokes its setup command; no source-import shortcuts. These are generated, disposable fixtures under `.compat/`.

## Reproduce all checks

Stop the consumer demos before running:

```sh
npm run check:all
```

This builds the browser prototype, original production Next.js reference, packed package and all five consumer apps. Fresh servers are used; occupied test ports are rejected. Checks cover:

- Styles before JavaScript, hydration, consumer overrides and hover.
- Actual separate streamed response chunks, initial CSS containing delayed variant rules, and style observations when streamed content first becomes visible.
- Repeated mounts, stylesheet counts, host Goober preservation, interaction and client navigation.
- Original framework-free SSR, eight concurrent differently themed requests, representative themes/portals and chart updates.
- Installer preservation/idempotence/refusal cases and static-component CSP positive/negative probes.

Chrome must be installed. Playwright WebKit is tested, not a Safari release certification. Firefox currently fails to launch on this host; unavailable coverage produces a nonzero overall exit code even when all executed checks pass. Read generated results rather than treating that exit code as a component failure.

For focused checks after preparation:

```sh
node scripts/check-setup.mjs
npm run check:compat
npm run check:csp
npm run report
```

## Evidence

- `results/DECISION.md` / `manifest.json`: generated requirements assessment and structured metadata.
- `results/COMPATIBILITY.md` / `compatibility.json`: installed-package browser/framework matrix, streaming transport and first-visible measurements.
- `results/setup-safety.json` / `compat-setup.json`: installer checks and detected versions.
- `results/package-artifact.json`: packed file inventory and integrity.
- `results/CSP.md` / `csp.json`: real response-header CSP tests. External CSS works under `style-src 'self'` in the static probe. Application policy, integrated Next.js streaming CSP and dynamic theme attributes still need work.
- `results/REPORT.md` / `results.json`: original browser policies and plain React SSR/hydration.
- `results/NEXT.md` / `next.json`: original framework-free React 19 resource delivery reference.
- `results/validation-run.json`: full-run outcomes, including unavailable coverage.

The framework-free reference remains available through `/automatic` and a separate Next.js fixture on port 4179. Its React stylesheet-resource path is not the installed consumer's external stylesheet path. Both use the same Goober-generated rules.

## Limits

Representative Button and SVG chart fixtures do not certify actual OpenUI appearance or behavior. Static CSS adoption, full component parity, Firefox coverage, additional React versions, non-Next hosts, unusual layouts, custom cascade configurations, CSP integration and the production registry remain open. Traceability, automatic integration and generated evidence come from OpenUI tooling, not Goober itself. The library does not modify the host application's `_goober` sheet.

## Sources

- [Goober APIs](https://github.com/cristianbote/goober)
- [React stylesheet resources](https://react.dev/reference/react-dom/components/style)
- [Next.js CSS ordering](https://nextjs.org/docs/app/getting-started/css)


## Interactive performance lab

Open [the local performance lab](http://127.0.0.1:4177/performance.html) after `npm run demo`. Chat and dashboard have equal priority. Run matched synthetic controls, type/scroll during replay, stop, and export JSON. See [the hands-on guide](PERFORMANCE-LAB.md) and [the full prototype test plan](PERFORMANCE-PLAN.md). The first lab isolates styling overhead. The real-component lab below adds production parser/renderer replay and standalone SSR pressure; full adoption approval remains pending. `npm run check:performance` verifies the lab with the demo running.


## Real OpenUI performance lab

See [the real-component guide](REAL-PERFORMANCE.md) and [measured results](results/REAL-PERFORMANCE.md). This uses actual production Markdown, forms, tables and D3 charts through `openuiChatLibrary`, the headless stream adapter, incremental parser and Renderer. Both arms share the same client bundle; the candidate generates equivalent static CSS through Goober during the build.

```sh
npm ci
npm ci --prefix real
npm run demo:real
```

Open [the real OpenUI lab](http://127.0.0.1:4180). Choose Both to exercise chat and dashboard equally. Exported JSON is separate from the earlier synthetic lab. With that server running, run `npm run check:real:browser`; afterward run `npm run check:real:ssr` (owns a fresh server on 4181), then `npm run report:real`. Do not run browser timing and SSR saturation concurrently.
