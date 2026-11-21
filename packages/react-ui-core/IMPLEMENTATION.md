# First core slice — ready for review

Issue [#9](https://github.com/ankit-thesys/openui-comp/issues/9), under parent #7. The user accepted eager runtime Goober styling for this bounded browser migration. **Implementation and scoped validation are complete; no issue closure, merge or publication has been performed.**

## Delivered scope

`@openuidev/react-ui-core` exposes Button, Input, TextArea, their existing public prop types and existing theme APIs through the root only. The package produces module-preserving ESM/CJS and matching declarations. Runtime dependencies are stock Goober 2.1.19 and clsx, with React/ReactDOM 19 peers. The provisional package version is `0.0.0-beta.0`.

Existing theme data, swatches, types, algorithms, hooks and preference constants are preserved. Theme contexts and the minimal FormControl context remain internal. The full FormControl component, remaining families, charts and kits are not migrated in this slice. The copied preference/layout-effect helpers remove dependencies on old package or chart folders.

Worker 1 owns scaffold, themes, shared context, root wiring and final integration. Worker 2 owns the controls and their tests. Starting revision is `c5699fdb4`. Scaffold commit: `f015d11ca`; integrated component commit: `5802dcf4b` (original `321c624b6`); root wiring/tests: `5bc1487eb`; final component evidence: `4ebbae480` and `feb1c5940` (originals `add27e8fa`, `110ce1810`). The final evidence commit follows these revisions without changing runtime code.

## Results on the integrated artifact

| Check | Result |
| --- | --- |
| Full package suite | 16 tests passed |
| Component/bundle tests against an installed tarball | 5 tests passed |
| Strict TypeScript consumer modes | NodeNext ESM, NodeNext CJS and Bundler passed; no skipLibCheck |
| Runtime formats and declarations | ESM/CJS, root exports and private-subpath rejection passed |
| Browser matrix on the final integrated tarball | All 6 cases passed; 33,600 paired computed-style snapshots |
| CSS hosts and order | Plain CSS, Tailwind v3/v4; host stylesheet before and after component styles |
| Theme coverage | No provider, light, dark, explicit custom light and custom dark |
| States and customization | Variants/sizes, hover, active, focus, error/disabled combinations, important hover overrides, native keyboard/text interactions and host isolation passed |
| Unused code/styles | Unused root imports remove core/Goober runtime; retained Button excludes other controls and theme tables |
| Automatic styling and theme integration | Installed browser bundle renders controls with no CSS import/link; light/dark public theme updates and cleanup passed |
| Build without legacy source/styles | Isolated new-package ESM/CJS/declaration build passed with no old react-ui directory or CSS/SCSS output |
| Typecheck / formatting / package checks | Passed; Publint and all ATTW modes report no problems |
| Lint | 0 errors; 2 disclosed inherited theme-memo warnings |

The final browser run uses the **integrated tarball**, rather than borrowing Worker 2's earlier scratch-artifact result. Its runtime is React/ReactDOM 19.2.4, stock Goober 2.1.19 and Chrome 156.0.8078.47. Node 22.22.2, pnpm 10.33.0, TypeScript 6.0.3 and tsdown 0.21.10 were used. Exact artifact and source/build hashes are in [evidence/final-artifact.json](evidence/final-artifact.json). The 82,255-byte tarball SHA256 is `76a48b1e439e02a0d5641edfb177334c6419237c142dd700496a1ef4c0b52796`.

The default/nested/explicit selector behavior, portal class mechanism, deprecated `theme` alias/precedence, system mode, preference persistence/reset and blocked-storage handling are also covered through built public APIs. A packed consumer checks forwarded ref types and existing size/style props, rejects `sx` and numeric Input size, and exercises controls with public ThemeProvider updates. JSDOM checks are distinct from the Chrome computed-style matrix; neither is a pixel comparison or universal proof of defect absence.

## Integrity and implementation boundaries

`git diff c5699fdb4 -- packages/react-ui` is empty. The pre-existing lockfile bytes remain unchanged; only the new importer and Goober records were added. The installed Goober module is byte-identical to preserved stock 2.1.19, SHA256 `3708e75d7cebc41beaab527374f9e0b21711437e6cf05cd3f7dff2c532086d43`. All 143 recorded source/build/artifact files remained unchanged during final verification. Browser results also record compiled-script, fixture and runner hashes.

There are no dependency patches, private targets, custom caches, parser forks, generated guards, stylesheet bridges, new styling APIs or consumer setup/build plugins. Equivalent standard CSS selector ordering and `:where` specificity preserve the old results; the component test notes document the issues caught. Production builds do not read old SCSS/generated CSS. Captured legacy and host CSS are **test-only reference inputs**, excluded from the published tarball.

## Reproduction

From the repository root after normal workspace dependency installation:

```sh
pnpm --filter @openuidev/react-ui-core test
pnpm --filter @openuidev/react-ui-core typecheck
pnpm --filter @openuidev/react-ui-core lint:check
pnpm --filter @openuidev/react-ui-core format:check
pnpm --filter @openuidev/react-ui-core check:publint
pnpm --filter @openuidev/react-ui-core check:attw
```

The full suite builds the package, tests public exports and renders, packs and installs a temporary consumer, checks three strict TypeScript modes, and builds an isolated source copy without the legacy package. It reuses normal installed tooling/dependencies; it does not claim a dependency-free build. The source package test command includes the nested component tests.

[evidence/README.md](evidence/README.md) gives the exact final-tarball browser setup. It includes an archived host/reference stylesheet fixture so reproduction does not depend on another worker's checkout. [Component test instructions](src/components/Button/__tests__/README.md) describe the matrix and supported environment variables. Evidence artifacts and logs are hashed in `evidence/SHA256.json`.

## TDD and setup failures

The public-root import test was run before implementation and failed because the new built entry did not exist. After copying the preserved theme implementation and adding build/root exports, it passed. Further theme checks are regression/parity tests, not claimed as separate test-first behavior changes. The root control export and packed-control assertions separately failed on missing Button before integration, then passed after the component commit and root wiring. Worker 2 records the individual control red/green checkpoints.

Setup failures were kept separate from package defects: npm's default cache was unwritable in the sandbox; temporary cache configuration avoided changing ownership. The isolated-source fixture initially could not find repository-level tsdown from a temporary non-workspace folder, then used the existing CLI directly. The final Chrome run initially stopped before launching because legacy reference imports could not resolve clsx under strict pnpm layout. Only that comparison fixture received a test-only direct clsx 2.1.1 dependency; the minimal production consumer had already passed independently. The setup failure log is preserved, and the subsequent complete six-case run passed.

The custom-dark review statement was corrected: the existing provider falls back from darkTheme to lightTheme. The useful improvement was explicit dark overrides and independent expected-value assertions, not a theme behavior fix.

## Residual limits

Two existing `react-hooks/exhaustive-deps` warnings concern the copied ThemeProvider's empty light-theme fallback object. No runtime memoization change was introduced during extraction. Existing top-level body targeting, preference-global attributes and lack of cross-tab hook synchronization are preserved; independent top-level themes still need the existing explicit cssSelector API.

SSR, hydration, streaming SSR and concurrent server style isolation remain deferred. The accepted import-time CSS cost remains documented; this slice does not remeasure full-library performance or memory. React/browser versions and bundlers beyond the recorded checks are not certified. Release metadata/version remains subject to review. No later migration slice, friend baseline path, publication, deprecation or merge was included.
