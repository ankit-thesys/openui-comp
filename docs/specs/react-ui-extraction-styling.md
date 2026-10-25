# Accepted styling decision — extraction spec7 addendum

Status: accepted by the user on2026-10-25. This scoped decision supplements [fork spec7](https://github.com/ankit-thesys/openui-comp/issues/7) and supersedes prior unapproved-math-delivery wording only. Package/component/ownership decisions remain unchanged. Slice12 still requires integrated checks, independent review and CI before acceptance; no merge/release or ticket closure is implied.

## Owned component styles

All extracted owned component SCSS is converted one-to-one to stock runtime Goober through its public APIs. Preserve existing appearance, behavior, props, class hooks, theme APIs and explicit customization. No dependency on legacy react-ui SCSS, generated compatibility CSS, new sx API, custom injector/parser/cache/pruner, private Goober API or dependency patch.

## Accepted vendor exception: KaTeX CSS and fonts

Use unmodified official KaTeX CSS/font assets for mathematical typesetting. Do not translate vendor styles to Goober. The private lazy math module imports `katex/dist/katex.min.css` and re-exports the existing rehype-katex plugin; TextContentWrapper's existing client effect imports that module. No new public entry/API. The base MarkDownRenderer receives the plugin through TextContentWrapper's existing composition; it does not acquire a new unconditional math parser.

Declare KaTeX as a direct dependency in the same `^0.16.0` range as rehype-katex7.0.1. Current workspace and validated normal installs resolve CSS and renderer to0.16.47; record/check alignment when updating dependencies. Keep existing stable tsdown dependency externalization/configuration. No experimental @tsdown/css plugin, asset-copy configuration, hosted/CDN dependency or consumer setup command is introduced.

## Supported consumer contract and accepted costs

- Default Vite6.4.2 production builds are the validated zero-additional-styling-setup contract: ordinary component imports load the lazy vendor CSS/fonts. Plain CSS and Tailwind v3/v4 are supported host styles with the existing explicit override rules; framework choice alone does not define bundler support.
- Bare esbuild needs font asset loaders and application CSS linking. Automatic styling across arbitrary bundlers is **not** promised. Other bundlers/frameworks require explicit validation before expanding support.
- Vite may emit all59 vendor font files, about1.07MB, even in a Button-only build. This unused emitted-asset cost is accepted. The unused math JS/CSS are pruned and the unused page downloads no math CSS/fonts; emitted assets and network downloads must be reported separately. No bespoke deletion/pruning step.
- The existing wrapper effect loads math dependencies whenever TextContentWrapper mounts, including non-math text. No new content-scanning/loading heuristic.
- Native public-root ESM/CJS import and declaration support do not establish server styling support. SSR/hydration/streaming SSR/concurrent server isolation remain deferred. No new offline/CSP/failure recovery or performance guarantee is implied.

## Required validation

Keep public package-consumer TDD. Automatic CSS/font delivery is tested with a real normally installed tarball in Vite/Chrome, including original markdown/header/GFM/literal-dollar/update behavior. JSDOM cannot execute browser CSS imports; do not mock them to claim delivery. JavaScript/Goober pruning tests explicitly leave vendor CSS external; Vite browser/build checks own vendor asset assertions. CI installs Chrome through maintained Playwright tooling.

Retain exact artifact/version/lock evidence, native/strict/package checks and affected browser results. The stable prototype comparison and earlier experimental prototype remain historical evidence, not substitutes for integrated validation. See `packages/react-ui-core/evidence/katex-stable-delivery/README.md` and subsequent integrated evidence.
