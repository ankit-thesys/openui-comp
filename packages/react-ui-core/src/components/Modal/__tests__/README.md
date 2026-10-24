# Overlay extraction — phase 2 (#11)

Baseline: `bd1bcf5db` (archived green container checkpoint at `d88873401`). Branch: `codex/core-layout-overlays`. The prior interactive-layout branch is preserved. Only Modal, TooltipWrapper and their owned tests/styles are edited. Shared root exports, metadata and lockfile remain Worker1's responsibility. Neither preview checkout, legacy production nor friend-baseline files are edited; untracked crates remain untouched.

## Integration

Add root exports using the existing family entries:

```ts
export * from "./components/Modal";
export * from "./components/TooltipWrapper";
```

Preserve `Modal`, `ModalProps`, `TooltipWrapper` and `TooltipWrapperProps`. Add `@radix-ui/react-tooltip: ^1.2.7`, the existing legacy range. Modal adds no dependency. Both use existing ThemeProvider/useTheme portal support, React/ReactDOM and clsx; Modal also uses existing lucide-react. No new public styling props, contexts or component subpaths are introduced.

Styles are hand-reviewed, one-to-one Goober definitions. Modal's fade/slide and Tooltip's four directional fade/slide keyframes use stock `keyframes`; necessary tooltip shared animation definitions are local until another extracted family needs them. The old SCSS z-overlay resolves to 9999 and is copied as that normal CSS value; no chat-package dependency is added. Modal's dormant sr-only class is retained within its portal root. No legacy SCSS/CSS is used by the new producer.

## TDD and evidence boundary

Confirmed seam: a consumer importing the built core root and rendering public React APIs. Modal first failed as a missing public export, then passed body portal/initial focus/controlled open/close/Escape/backdrop callback and size-update checks. TooltipWrapper first failed as missing, then passed its no-content child/ref/native-prop/click behavior. Red and green TAP records live in `results/`.

These early producer tests do not establish complete browser, tooltip positioning/truncation, focus return/trapping, nested portal themes or packed-package acceptance. Those checks remain pending. No layout observers are mocked. The scratch producer copies current core, expands the repository's strict tsconfig into a standalone config, and adds only the two scoped root exports and tooltip dependency for validation. It is temporary tooling, not a tracked alternative scaffold; Worker1 must validate the integrated package.

## Baseline observations to verify

Modal's existing implementation focuses its content on open but contains no focus-trap or return-focus implementation, and uses a fixed title ID. Its comment in the new copy now accurately says it focuses content on open. Nested Escape listeners and labels need explicit baseline observation before any defect is attributed to extraction. Do not introduce Radix Dialog, trapping infrastructure or a new modal API silently.

Tooltip's truncation path replaces its child ref; verification must distinguish that inherited behavior from its ordinary nontruncated child path. Its required single React child and resize-driven truncation checks remain unchanged.

SSR remains deferred. No whole issue #11 acceptance, merge or publication is implied by an owned implementation batch.

## Installed-consumer checks

The source batch is `fb46c2103`. The normally installed scoped tarball passes all 53 public component/import/bundle tests, including the inherited container/control tests, both native Node import modes, and Button/Modal/Tooltip-only root pruning. TypeScript 6.0.3 strict consumers with `skipLibCheck: false` pass Bundler, NodeNext ESM and NodeNext CommonJS. Producer strict TypeScript 5.9.3 and ESM/CJS declaration builds pass.

The browser fixture compares candidate package imports against legacy source/SCSS only in the baseline arm. It measures actual visible geometry, computed styles including SVG stroke, real layout/ResizeObserver truncation, React prop updates, controlled dismissal, portal/nested/independent themes, explicit overrides, and cleanup. No geometry, observers or component internals are mocked. Modal has no className/style prop: its overrides use a React-rendered stylesheet targeting preserved CSS classes. Tooltip uses its existing className and important plain/Tailwind overrides.

Fixture configuration waits for React's rendered data-config attribute before asserting updated native disabled state. Earlier sampler assumptions about nested Escape and tooltip pointer leave were replaced with direct baseline/runtime observations. Those are diagnostic comparisons, not assertions of successful desired accessibility behavior. Modal's nested behavior is tested in isolation, then with a tooltip as a separate composition case; parent unmount must remove every portal.

Finite animations are sampled at settled endpoints with standard Web Animations APIs; the matrix does not certify every intermediate animation frame. Strict focus-return observations close the dialog while focus is inside it, independently of the focus-escape test. SSR, performance and memory-soak claims remain out of scope.

Run scoped checks with CORE_CONSUMER pointing at a normal installed consumer, CORE_TEST_TOOLS/CORE_BROWSER_TOOLS at the normal jsdom/esbuild tooling installation, CORE_SASS_TOOLS at Sass, CORE_HOST_STYLES at the existing extracted host-style archive and CORE_PLAYWRIGHT at its absolute module entry:

```sh
node --test packages/react-ui-core/src/components/Modal/__tests__/*.test.mjs
node packages/react-ui-core/src/components/Modal/__tests__/compatibility.browser.mjs
```

Set CORE_BROWSER_RESULTS to save raw browser results. CORE_MATRIX_FRAMEWORKS and CORE_MATRIX_CASES can restrict diagnostics. Worker1 must rerun the committed checks on its final combined package and run normal scoped CI. Scoped semantic lint uses the repository config via NODE_PATH; formatting is checked separately because this checkout lacks that config's local Prettier plugin installation. No lint/dependency configuration was edited.

## Final owned result

- Source batch: `fb46c2103`. All 53 installed public consumer tests and all three strict type modes passed.
- Chrome 156 passed 12 framework/order/family cases and 4,674 paired visible/computed-style snapshots across five theme states. Normal, responsive, override, positioning, truncation, keyboard/dismissal, nested/independent portal-theme and cleanup checks passed. No extraction-only mismatch was found.
- Independent Standards and Spec reviews found no actionable source/test issues. This does not approve inherited accessibility limitations; see `INHERITED_LIMITATIONS.md` and the separate browser diagnostic records.
- Exact scoped tarball: `results/overlays.tgz`, SHA256 `f29d8955f775c97c4771e1cbccd2b49e37a29014384130eb91c8d9899e5c5d86` (241,672 bytes). Source and installed dist files match the recorded producer hashes. Metadata, versions, lockfile and raw output are archived under `results/`.

The browser window is released to Worker1. Integrate the source and validation commits, add the two root exports and recorded tooltip dependency, then rerun normal combined-package CI and browser checks on the final installed artifact. Whole issue #11 acceptance, the inherited behavior decisions, merging and publishing are not implied by this handoff. No production source changed after the final tarball was packed.
