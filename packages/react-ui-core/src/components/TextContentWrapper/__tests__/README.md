# TextContentWrapper extraction checkpoint

Public-root React DOM test fails before export, then verifies existing header composition, GFM table, literal single-dollar handling, asynchronous KaTeX markup and rerender cleanup. DOMParser is the real JSDOM API, not a mock. Source types and declaration build pass.

Component logic and existing plugin configuration are preserved. MarkDownRenderer supplies the shared rich-text rules formerly duplicated in the wrapper SCSS; wrapper-specific list spacing and dark-mode rules use stock Goober. No legacy stylesheet is imported.

## Unresolved acceptance requirement

The inherited dynamic rehype-katex import generates math markup but does not deliver KaTeX CSS/fonts. This test proves markup only. Automatic math stylesheet delivery, real browser parity and final installed-package validation remain pending. A separate temporary official-tooling asset prototype is not part of this implementation and has not been accepted. No custom injector, URL rewriting, plugin patch or new styling API is introduced.
