# KaTeX vendor styles: stable delivery review

Status: research only; no delivery option adopted. Production, shared configuration and browser fixtures unchanged. Worker 1 retains prototype/browser ownership.

## Recommendation for the next bounded prototype

Test React 19's built-in stylesheet resource inside the component that actually renders math:

```tsx
<link
  rel="stylesheet"
  href="https://cdn.jsdelivr.net/npm/katex@0.16.47/dist/katex.min.css"
  precedence="openui-katex"
/>
```

This is an illustrative version-pinned URL, not an implementation or a verified asset fetch. Local rehype-katex 7.0.1 currently resolves KaTeX **0.16.47**; the producer must keep stylesheet and renderer versions aligned. Do not copy the newer version from today's documentation. A final hosted artifact should also have verified integrity metadata.

React documents component-rendered stylesheet links, head placement, duplicate-href handling and precedence. This uses React itself rather than a custom DOM injector. Its precedence groups follow discovery order: the name does not by itself guarantee resistance to host styles. React may retain resources after unmount, and link completion does not imply every font has finished loading. [React link reference](https://react.dev/reference/react-dom/components/link), [React stylesheet support](https://react.dev/blog/2024/12/05/react-19#support-for-stylesheets).

KaTeX documents CDN stylesheets and a CSS/fonts directory layout with relative font URLs. Keep the vendor stylesheet intact; a handwritten Goober translation is unnecessary. [KaTeX browser integration](https://katex.org/docs/browser.html).

Expected, **not yet demonstrated for our package**: rendering math requests styles automatically; a plain URL avoids native Node loading a CSS module; unused math need not request the stylesheet or fonts. Validate these with actual public root imports, emitted bundles and browser requests.

The material tradeoff is external hosting. A default CDN introduces network availability, CSP and offline restrictions. Self-hosting is standard too, but npm assets need deployment to an HTTP URL; installing npm files alone does not provide that URL. This choice needs explicit review. [CSP style sources](https://www.w3.org/TR/CSP3/#directive-style-src), [CSP font sources](https://www.w3.org/TR/CSP3/#directive-font-src).

## Standard bundled alternative

A lazy browser-only JavaScript module can retain a bare import of KaTeX's vendor CSS for a normal CSS-aware consumer bundler. Stock tsdown dependency externalization may avoid any producer CSS-processing plugin; local tsdown is **0.21.10**, so confirm against that version before adoption. This is a candidate, not a proven build configuration. [tsdown dependencies](https://tsdown.dev/options/dependencies).

Automatic delivery then depends on the consumer toolchain. Vite documents async CSS loading; esbuild explicitly produces a CSS output that the application must link. Therefore normal CSS imports do not establish universal zero-setup delivery across arbitrary build environments. Native Node must never evaluate the CSS import. [Vite CSS features](https://vite.dev/guide/features), [esbuild CSS imports](https://esbuild.github.io/content-types/#import-from-javascript), [Node ESM loading](https://nodejs.org/api/esm.html).

The previous probe's experimental @tsdown/css route is not this stable alternative. Current tsdown documentation still labels CSS support experimental. Its successful Vite example required an explicit loadStyles call; unused builds emitted all 59 copied fonts (1,072,948 bytes), even though the browser did not request them. Emitted assets and network transfer are different measurements. Preserve this evidence without treating it as automatic-component validation. [tsdown CSS support](https://tsdown.dev/options/css).

## Acceptance checks owned by the prototype

- Actual math components load vendor styles with no consumer CSS import or loadStyles call.
- Plain CSS, Tailwind v3/v4, both host stylesheet orders; initial/late math and font readiness.
- Normal installed ESM/CJS root imports and strict consumer types; no native CSS-loader failure.
- Used and unused bundle contents, output assets and network requests reported separately.
- Deduplicated requests, failure/offline/CSP behavior and exact version alignment.
- SSR/hydration/streaming assessed separately if in scope; official React support is not our test evidence.

No universal self-contained npm solution is established that simultaneously forbids hosted URLs, consumer asset deployment/build integration and custom runtime loading. If those are all mandatory, report the conflict rather than invent machinery. A standard vendor-CSS exception is reasonable; the delivery contract still needs a decision and validation.
