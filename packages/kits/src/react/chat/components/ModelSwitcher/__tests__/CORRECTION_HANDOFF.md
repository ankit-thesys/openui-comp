# Model border correction — integration handoff (#16)

Status: source correction and regression harness ready. Corrected installed
artifact and Chrome validation are pending. The verifier currently owns the
browser; do not run until explicitly released.

Source-only commit: **`1a41c2c33`** on `codex/chat-kit-components`.
It changes only `ModelSwitcher/modelSwitcher.styles.ts`: add
`borderColor: "currentColor"` inside the existing hover/open rule, with one short
comment. No props, DOM, callbacks, theme API, shared Select, legacy source,
package metadata or dependencies changed. No frozen tarball/consumer changed.

The red regression evidence is preserved in `35eaa68f3`: frozen product
`8405f44e0` has 42 failed strict style comparisons out of 330. That result remains
failed and is not superseded by source review or syntax checks.

## Regression coverage prepared

The existing normal/hover strict comparisons and raw properties remain intact.
The public installed-package harness additionally checks:

- A consumer's ordinary CSS width/style override exposes a 1px solid border;
  hovered color must retain the legacy currentColor reset.
- Open trigger styling with the pointer moved away, covering the separate
  data-state selector.
- A consumer's explicit important border color still wins.
- Nested dark/light trigger hover and open states, including the original
  nested hover comparison.
- Chrome plain CSS/Tailwind v3/Tailwind v4 and both host stylesheet orders.

`KIT_BORDER_ONLY=1` runs this focused subset and labels report coverage
`model-border-regression`; it makes no full chat/form acceptance claim. Default
mode still runs the original full component sequence after the added checks.
The harness restores hover before the existing custom-theme hover assertion;
this sequencing issue was identified and resolved in independent review.

`KIT_PRODUCT_COMMIT` is now required so a new refreeze cannot be mislabelled as
the older product. Each run inventories the selected normally installed consumer
and verifies its fixture dependency links. Use a new output directory to retain
earlier failing reports.

## Worker1 integration and next browser window

1. Integrate the separate source commit and accompanying regression commit.
   Worker1 retains ownership of package metadata, lockfile and publication setup.
2. Refreeze new kits/core tarballs as appropriate and install in a fresh normal
   consumer. Provide the exact product commit, consumer path and verified
   archive hashes. Do not replace the original 8405 consumer/artifacts.
3. After explicit browser release, run the strict targeted matrix with those
   artifacts; diagnostic continuation is optional and never converts a mismatch
   into a pass. Preserve raw observations, archive/source hashes and package
   immutability evidence. Release the browser afterward.

```sh
KIT_PRODUCT_COMMIT=<new-frozen-product-ref> \
KIT_CONSUMER=/absolute/new-installed-consumer \
KIT_BROWSER_TOOLS=/absolute/package-with-vite-and-playwright \
KIT_SASS_TOOLS=/absolute/package-with-sass \
KIT_HOST_CSS=/absolute/frozen-framework-css \
KIT_BROWSER_OUT=/absolute/owned/ModelSwitcher/__tests__/results/new-border-run \
KIT_BORDER_ONLY=1 KIT_BROWSER_RELEASE=1 \
node packages/kits/src/react/chat/components/ModelSwitcher/__tests__/browser.mjs
```

## Checks completed without browser

Corrected source TypeScript check and semantic ESLint pass. Runner syntax,
fixture TSX transformation and formatting pass. Independent Spec and Standards
reviews confirm the scoped production correction and resolved harness finding;
no remaining actionable source findings. These checks do not prove corrected
installed-package style parity. SSR remains deferred.
