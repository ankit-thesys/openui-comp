# Goober-only styling prototype

Throwaway evidence for the OpenUI extraction. No production components have been migrated and no styling adoption decision has been made.

## Run

Install dependencies once:

```sh
npm ci
npm ci --prefix next-fixture
```

Then run `npm run demo` and open http://127.0.0.1:4177. The three columns compare default Goober, layered Goober, and the revised library-owned style delivery. Select Tailwind v3/v4, Bootstrap, plain CSS or no framework, stylesheet order, and theme. The fixtures use real compiled framework CSS.

## Reproduce the checks

```sh
npm run check:all
```

This builds the prototype and a **production** Next.js fixture, starts fresh servers on 4187/4189, runs the checks, generates reports, then stops those servers. It rejects occupied check ports rather than silently using a stale server. Google Chrome must be installed; `BROWSER_CHANNEL` can select another installed Playwright channel.

The default/layered reference policies intentionally retain their compatibility failures. Adapted-policy, host-isolation, automatic SSR and Next.js checks fail the command on regression. A successful command is not universal compatibility certification.

To explore the production Next.js fixture after a build, run this in a second terminal:

```sh
node next-fixture/node_modules/next/dist/bin/next start next-fixture --hostname 127.0.0.1 --port 4179
```

The main dashboard links to that fixture and `/automatic`, the plain React SSR example. Restart an existing demo server after changing server-side code. `check:all` always starts fresh servers.

## What changed after the first experiment

**Host isolation:** the library build runs Goober's `css`, `keyframes` and `extractCss` APIs to generate immutable stylesheet artifacts. The adapted browser policy inserts its own tag and scopes selectors to library-marked elements. It never clears, moves or appends to the host application's `_goober` tag. Repeated calls deduplicate the owned tag.

**Automatic SSR:** the prototype `Button` in `lib/auto-button.js` renders a React 19 `<style href precedence>` resource with generated Goober CSS. React includes and deduplicates the resource during SSR/streaming and hydration. Consumers only import/render the component: no CSS import, registry, provider, extraction call, or styling plugin. The package build—not the consumer—performs compilation. Next.js configuration only establishes the monorepo fixture root; it has no styling configuration.

These are two delivery paths over the same generated styles, not a claim that arbitrary runtime Goober styles automatically support streaming. The browser adapter's framework selection remains explicit. The automatic SSR fixture is framework-free and uses static styles plus CSS variables for per-request theme values. Combining it with automatically selected Tailwind policies is still future work.

## Evidence

- `results/DECISION.md`: generated requirements assessment.
- `results/manifest.json`: structured metadata and observations for agents.
- `results/REPORT.md` / `results/results.json`: 30 CSS cases, host-sheet probe, classic extraction reference, automatic plain React SSR/hydration and CSR.
- `results/NEXT.md` / `results/next.json`: production App Router initial styles without JavaScript, hydration, delayed streamed styles, deduplication, host Goober coexistence, client navigation, eight concurrent differently themed requests, and browser errors.

Traceability and generated reports are our tooling, not Goober features. The chart is a representative SVG fixture, not an extraction of real charts.

## Limits

React 19 is required for automatic resource delivery. React 18, arbitrary runtime CSS generation, strict CSP/nonces, actual OpenUI visual parity, other browsers, and combined automatic framework selection + SSR are not certified. Existing component props and appearance must still be preserved before adopting any new styling approach. Source-copy installation tooling is not implemented here.

## Sources

- [Goober APIs](https://github.com/cristianbote/goober)
- [React 19 stylesheet resources](https://react.dev/reference/react-dom/components/style)
- [Next.js CSS-in-JS guidance](https://nextjs.org/docs/app/guides/css-in-js)

## React 19 acceptance and installed-package compatibility

React 19 is accepted for this proposal. The current measurements use React 19.3.1; accepting the major version does not certify every minor release or approve Goober adoption.

The expanded `npm run check:all` also packs an npm artifact, installs it in five standalone Next.js apps, runs automatic dependency-based configuration, builds every consumer, then runs Chromium, Firefox and WebKit compatibility checks plus CSP probes. All reports are generated even when compatibility checks fail; the overall command returns nonzero for failures or unavailable browser coverage.

To run only this round after `npm run build`:

```sh
npm run compat:prepare
npm run check:compat
npm run check:csp
npm run report
```

The last two checks currently return nonzero: the SSR override-order failures are real, and Firefox cannot launch on this machine. This is intentionally visible. No-framework and Tailwind v4 pass in Chromium/WebKit. Tailwind v3, Bootstrap and plain CSS keep the library's base appearance, but their consumer overrides lose priority when Next.js places the component resources after app CSS. The isolated browser adapter's passing results do not cover that ordering.

The setup command is installed from the packed artifact and reads declared, installed dependency versions. It generates an entry point without asking the user to choose a CSS policy, does not modify app styles/layout, is idempotent, and refuses to overwrite a differing/customized entry. It is a bounded prototype, not the planned source registry/update system; CDN styles, unusual workspace layouts and custom cascade configurations need separate handling.

CSP tests use real response headers with no `unsafe-inline`. Authorized static style hashes and matching style nonces passed to React's streaming renderer work in Chromium/WebKit. A component nonce prop alone does not authorize SSR stylesheet resources. Application CSP integration and dynamic inline theme attributes remain open.

- `results/COMPATIBILITY.md` and `compatibility.json`: installed-package browser/framework matrix, failures and unavailable checks.
- `results/compat-setup.json`: detected versions, idempotence, preservation of customized files, React peer range and client directive checks.
- `results/package-artifact.json`: npm pack file inventory and integrity.
- `results/CSP.md` and `csp.json`: CSP positive and negative probes.
- `results/validation-run.json`: latest full-run command outcomes.

Run `npm run demo:compat` after preparation to inspect all five installed consumers on ports 4210–4214. Stop that demo before rerunning compatibility checks, which use the same ports and refuse stale servers. Fixture files are generated under ignored `.compat/`; the scripts and evidence are committed, not node_modules or build output.
