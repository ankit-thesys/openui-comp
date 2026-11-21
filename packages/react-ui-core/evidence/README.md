# Final integrated artifact evidence

`core-first-slice.tgz` is the exact tarball used by the final Chrome run, with SHA256 and source/build/runtime records in `final-artifact.json`. `browser.json` records all six completed cases and 33,600 paired computed-style snapshots. `browser.log` records progress. `packed-component-tests.tap`, `strict-consumer.tap`, `package-tests.log`, `lint.log`, `publint.log` and `attw.log` preserve the scoped checks. The initial baseline-dependency setup failure is preserved separately and is not a product failure or passing case.

`browser-host-styles.tar.gz` contains captured legacy CSS and plain/Tailwind 3/4 host styles plus their tool versions. They are reference test inputs, excluded from package publication. The runtime test arm does not load legacy component CSS. No production build depends on this archive.

To repeat the browser matrix, install this tarball with React/ReactDOM 19 in a fresh temporary consumer. The recorded run used 19.2.4. With pnpm, add clsx 2.1.1 as a test-only consumer dev dependency so the separate **legacy reference source** can resolve it; the new package already declares its own clsx dependency, and its minimal packed-consumer tests run without that direct dependency.

```sh
mkdir -p /private/tmp/core-style-reference
tar -xzf packages/react-ui-core/evidence/browser-host-styles.tar.gz -C /private/tmp/core-style-reference
CORE_CONSUMER=/absolute/path/to/installed-consumer \
CORE_BROWSER_TOOLS=/absolute/path/to/this/checkout/packages/react-ui-core \
CORE_PLAYWRIGHT=/absolute/path/to/playwright/index.mjs \
CORE_BASELINE=/absolute/path/to/this/checkout/packages/react-ui/src/components \
CORE_STYLE_EVIDENCE=/private/tmp/core-style-reference \
CORE_BROWSER_RESULTS=/private/tmp/new-core-browser-result.json \
node packages/react-ui-core/src/components/Button/__tests__/browser.mjs
```

Playwright and Chrome are ordinary maintainer test tools; they are not production styling requirements. No performance suite should run concurrently with this browser matrix. The baseline source remains read-only. Use a fresh result path to preserve previous evidence. The matrix finishes native CSS transitions before endpoint sampling; it does not alter production transitions.

Verify archived bytes against `SHA256.json`. Source/build hashes identify the exact producer inputs/outputs; the integration revision predates only documentation/evidence changes. The result is ready for human review, not publication or whole-migration acceptance.
