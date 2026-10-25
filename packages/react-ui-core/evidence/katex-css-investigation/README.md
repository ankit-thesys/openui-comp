# KaTeX stylesheet investigation — decision OPEN

This isolated temporary package tests official tsdown0.21.10 + experimental @tsdown/css0.21.10, Vite6.4.2 and existing KaTeX assets. It is not integrated into react-ui-core and is not a matched migration performance benchmark.

## Findings

- Official `css.inject: true` preserves CSS imports; it does not generate a runtime injector. Static root imports fail native Node ESM with ERR_UNKNOWN_FILE_EXTENSION.
- Direct dynamic CSS imports emitted a missing JS target in this probe. The raw failure is retained. No runtime resolver or patch was introduced.
- A conventional lazy JavaScript module importing the vendor CSS, plus standard tsdown font copying, built through a normally installed Vite consumer. Native package-root import works while the browser-only style module is not evaluated in Node.
- Actual Chrome loaded the KaTeX stylesheet and two WOFF2 fonts for the sample fraction/exponent; computed font was KaTeX_Main and there were no failed requests. Unused import fetched no CSS or fonts and math JavaScript was pruned.
- However, the unused Vite build still emitted the copied font assets. See exact sizes.json for output costs. Browser transfer and deployed build assets are different costs.
- The consumer explicitly calls loadStyles in this isolated probe. This does NOT establish automatic delivery from an actual OpenUI component, hydration, SSR, concurrency or a clean unused asset contract.

## Approval would cover

An explicit exception allowing unmodified third-party KaTeX CSS/font assets alongside Goober-converted owned SCSS, a lazy internal style-entry import, use of the experimental official CSS build plugin and supported font asset copying. It would NOT approve a custom injector, runtime parser, URL rewrite, consumer plugin or manual stylesheet import. Actual component integration and pruning/native/browser validation would still follow approval; this evidence alone does not approve adoption.

Options: (1) approve a scoped exception for further actual-component validation, accepting experimental-tooling and emitted-font risks; (2) defer mathematical typesetting acceptance and retain the unresolved limitation; (3) request another maintained, standard asset-delivery path investigation. Do not port vendor CSS into handwritten Goober merely to hide the exception.

Source owned SCSS conversion remains stock Goober. Existing runtime KaTeX dependencies already serve math in legacy, so these total bundle sizes are not measured migration deltas. No claim of acceptable performance increase is made.
