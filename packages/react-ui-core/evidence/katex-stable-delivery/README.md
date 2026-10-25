# Stable vendor CSS delivery — actual-component prototype, decision OPEN

User chose **investigate a stable standard delivery path**. This authorizes isolated validation, not adoption of vendor CSS or a styling-contract exception. Production stays at88fdccf94; old react-ui and both previews are untouched. No experimental CSS plugin, custom injector/parser/cache, URL rewrite or font-copy mechanism is used in this candidate.

## Small implementation being evaluated

In a temporary copy of the actual package, replace TextContentWrapper's existing lazy `import("rehype-katex")` with `import("./mathRenderer")`. The new private module is only:

```ts
import "katex/dist/katex.min.css";
export { default } from "rehype-katex";
```

Declare the existing renderer's KaTeX range `^0.16.0` as a direct runtime dependency. Normal npm installation resolves renderer and stylesheet to0.16.47. No public API, owned SCSS conversion, effect lifecycle or Goober implementation changes. The existing tsdown0.21.10 configuration is unchanged: declared dependencies are externalized, so its experimental CSS processing is never invoked. The emitted private module retains the bare CSS dependency import. [tsdown dependency handling](https://tsdown.dev/options/dependencies).

**Actual component clarification:** math is enabled by TextContentWrapper, which internally renders MarkDownRenderer with the existing remark-math/rehype-katex pipeline. MarkDownRenderer alone does not promise automatic math parsing. This prototype tests that real composition; it does not add math to the base renderer or expose loadStyles to consumers.

## What passed

Normal npm-installed prototype tarball394879 bytes, SHA256 `8cae8687c7d0a5830b7f863a5f86f2e6e3bf3561c76950d23581170e637d5085`. Consumer imports only the package's components and React. No consumer CSS import, setup command, Vite config or build plugin was added. Vite6.4.2 default production build delivers the lazy stylesheet automatically; this follows its documented async CSS behavior. [Vite CSS code splitting](https://vite.dev/guide/features#css-code-splitting).

- Native Node ESM and CJS package-root imports pass without evaluating the lazy browser CSS module. This is **not SSR/hydration certification**.
- Actual OpenUI wrapper: **6 cases /2,808 paired math element snapshots** in Chrome156.0.8078.47. Plain CSS/Tailwind3/Tailwind4, host sheets explicitly before/after vendor CSS, light/dark/custom state and nested dark scope. Automatic styling matches the same component with the unmodified official vendor CSS preloaded as a test reference. Candidate requests never use that reference URL; reference CSS is test-only, not consumer setup.
- Two mounted wrappers share one loaded stylesheet; sample fraction/exponent/root uses KaTeX_Main and KaTeX_Math WOFF2 fonts. Fonts are ready before snapshots, host sentinel color is preserved, no failed candidate requests. See `browser.json`, `automatic-math.png`.
- Button-only page requests **no math JS, math CSS or font files**. Its build excludes the math JS chunk and CSS.
- Public wrapper/base-renderer props compile with strict TS5.9.3, skipLibCheck:false, in Bundler/NodeNext ESM/NodeNext CJS. No new styling prop.

A first font assertion failed while the test server did not serve the absolute `/assets/` font URLs produced by Vite. Raw first report/log are retained. Correcting only test-server asset routing passed; no product code or assertion was removed. Standard finite-animation settling measures endpoints, not transitional frames. This prototype does not test actual streaming parser, SSR, hydration, concurrency, offline/CSP failure handling or performance/soak.

## Costs and remaining limits

| Output | Wrapper used | Button only |
| --- | ---: | ---: |
| Math JS chunk |267203 bytes;79123 gzip |0 |
| Math CSS |29288 bytes;7941 gzip |0 |
| Emitted font files |59;1072948 bytes |**59;1072948 bytes** |
| Browser font downloads for sample |2 WOFF2;42712 body bytes |0 |

These are prototype output totals, **not migration deltas or performance measurements**. The used consumer also emits existing dynamic icon chunks; those are not introduced by vendor CSS. The wrapper's preserved effect loads its math engine/styles whenever the wrapper mounts, including text without a formula; this is not “parse the text and load only for math.” No new parser or conditional-loading heuristic was added.

**Unused emitted fonts remain a limitation.** Vite emits vendor font assets during CSS processing even though final Button-only JS/CSS tree shaking drops the math module. Do not equate no browser downloads with no deployed artifacts. No post-build deletion or custom pruning patch was introduced.

**Supported build contract is specific, not universal.** This demonstrates automatic delivery in default Vite6.4.2. Plain CSS/Tailwind versions are host styles, not substitutes for an application bundler. Stock esbuild with default asset handling fails on font formats; with explicit built-in file loaders it builds separate CSS output, which the application must link. The library cannot promise zero additional setup for bare esbuild. Logs/output metadata are retained; no esbuild/browser workaround was adopted. [esbuild CSS imports](https://esbuild.github.io/content-types/#import-from-javascript).

Native direct import of the private browser-only CSS module is not supported. Only the public root's native import is tested. Other app frameworks/bundlers, development/HMR, asset base-path deployment and CSS/font failures are unvalidated; do not infer support from Vite production success.

## Independent alternative and decision needed

Worker2's read-only primary-source review is preserved as `independent-options-review.md`. It identifies React19's built-in `<link rel="stylesheet" precedence="…">` as another standard option, with React managing head placement/deduplication. It still needs a version-aligned hosted CSS/font URL: a default CDN brings network/CSP/offline policy; self-hosting requires deployment of assets. No CDN/hosted resource option was adopted or broadly prototyped here. [React stylesheet link](https://react.dev/reference/react-dom/components/link).

**Recommendation:** the bundled CSS candidate is a stable, small, maintainable option **if Vite-style automatic CSS handling and the emitted-font cost are acceptable**. It removes the experimental producer plugin and font-copy configuration from the earlier candidate. Accepting it still requires explicit permission for unmodified third-party CSS/assets alongside Goober-owned styles and a defined supported app-build contract. If zero emitted unused assets or arbitrary zero-setup bundlers are mandatory, this result does not meet that requirement. Review those tradeoffs before changing the spec or production.

## Review

Independent Spec and Standards reviewers report zero actionable findings in the isolated source, probes and bounded claims. They confirm that this supports evaluating the candidate, not adopting it. Theme snapshots test inherited tokens against the reference; they do not certify contrast on an arbitrary host background.

## Evidence provenance

Exact prototype tarball, unchanged producer config, two changed/new component source files, installed build output archive, per-file build manifest, native/build/browser/asset/type logs and independent review are committed here. `provenance.json` records versions and hashes.

React declaration devDependencies were added **after** browser/build measurement for strict consumer type checks. The archived consumer lock is that later type-check lock, not the earlier browser lock whose hash remains in the raw report. Do not claim identical lock bytes across stages. The exact pre-types browser build outputs are preserved unchanged in `consumer-built-output.tgz` and `build-manifest.json`; this boundary is disclosed instead of rerunning unchanged compatibility cases. No full migration acceptance follows from this prototype.
