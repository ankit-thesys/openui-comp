# Installed package + automatic framework setup — generated results

Installed npm tarball in five standalone production Next.js apps; host CSS imported in root layout; automatic setup from installed direct dependencies

| Browser | Framework | Result | Failed checks |
| --- | --- | --- | --- |
| chromium 156.0.8078.47 | none | PASS |  |
| chromium 156.0.8078.47 | tailwind3 | FAIL | overrideSSR, overrideClient, hover, streaming |
| chromium 156.0.8078.47 | tailwind4 | PASS |  |
| chromium 156.0.8078.47 | bootstrap | FAIL | overrideSSR, overrideClient, hover, streaming |
| chromium 156.0.8078.47 | plain | FAIL | overrideSSR, overrideClient, hover, streaming |
| webkit 27.2 | none | PASS |  |
| webkit 27.2 | tailwind3 | FAIL | overrideSSR, overrideClient, hover, streaming |
| webkit 27.2 | tailwind4 | PASS |  |
| webkit 27.2 | bootstrap | FAIL | overrideSSR, overrideClient, hover, streaming |
| webkit 27.2 | plain | FAIL | overrideSSR, overrideClient, hover, streaming |

## Unavailable checks

- firefox: launch failed: browserType.launch: Failed to launch the browser process.

- Representative Button only; full OpenUI component parity not certified
- WebKit is Playwright WebKit, not a Safari release certification
- Conventional directly declared framework dependencies; CDN-loaded CSS and unusual monorepo layouts need separate handling
- Framework CSS compiled by fixture preparation from pinned real packages; no custom Tailwind config variants yet
