# Interactive layout slice — phase 1 (#11)

Baseline: `bd4c4270e2ecb8a564e3d4d51fffc1d41212e6db` (#30 plus orchestration record). Branch: `codex/core-layout-interactions`.

Owned families: Accordion, Carousel, Steps and Tabs, including existing public parts and types. Modal and TooltipWrapper wait for the integrated container checkpoint. Other containers, shared root exports, package metadata and lockfile belong to Worker1. No legacy source or friend-baseline files are edited.

## Integration additions

Re-export each family's `index.ts` from the root, using the existing root-only package contract:

```ts
export * from "./components/Accordion";
export * from "./components/Carousel";
export * from "./components/Steps";
export * from "./components/Tabs";
```

Add runtime dependencies following the unchanged legacy package ranges: `@radix-ui/react-accordion: ^1.2.2` and `@radix-ui/react-tabs: ^1.1.2`. Carousel and Tabs use existing IconButton. Steps adds no runtime dependency. Reuse existing clsx, Goober, lucide, React and ReactDOM. Worker1 decides final lockfile resolutions and validates the integrated artifact.

Public runtime exports: Accordion, AccordionItem, AccordionTrigger, AccordionContent; Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext; Steps, StepsItem; Tabs, TabsList, TabsTrigger, TabsContent. Preserve all exported prop types plus CarouselRef. Internal variant types/contexts and style classes are not new root exports.

## TDD and early evidence

Confirmed seam: a consumer importing built core through its root and rendering public React APIs. Each family test first failed because its root export was absent. Accordion then passed actual DOM expand/collapse, refs, native props and disabled behavior. Steps passed numbering, explicit integer/default handling and updates. A subsequent standalone StepsItem layout test failed (`block` vs `flex`); applying its own module-level Goober class restored its existing standalone layout and default number.

Carousel and Tabs currently pass composition/markup checks only. Those checks render React markup without effects; **they do not establish SSR styling support, scrolling, keyboard or browser compatibility**. Real interactions and the framework/theme/style-order matrix remain required. No ResizeObserver or layout mocks are introduced to manufacture passes.

Initial producer typecheck and ESM/CJS declaration build pass using the repository's strict compiler options, expanded into a standalone scratch config to avoid a repository-relative extends path. The scratch producer adds only the four owned root exports and dependencies for scoped validation. It is not a tracked competing scaffold. It resolves normal, unmodified dependency installations from earlier isolated tooling; installed-package checks are still pending. Current scratch Radix versions: Accordion 1.3.1 and Tabs 1.2.1; Goober 2.1.19. Final evidence must record the actual integrated resolutions.

The first scratch build accidentally ran before its standalone tsconfig existed and exhausted the default Node heap. After supplying the complete compiler config, the same source builds under the normal heap. This is a scratch setup failure, not component runtime/performance evidence.

## Preserved baseline observations

- CarouselContent accepts a forwarded ref but its existing implementation uses only the context scroll ref. Do not silently fix this while extracting.
- Steps' legacy `typography(title, default)` resolves no map entry and Sass emits no typography declarations for `.openui-step-title`. The extraction preserves inherited typography rather than inventing a font.
- CarouselPrevious/Next require the existing IconButton `icon` prop; they do not supply arrow icons by default.

## Run scoped checks

Set `CORE_CONSUMER` to the built producer or normally installed packed consumer and `CORE_TEST_TOOLS` to an installation with jsdom. Test-only globals expose jsdom's normal DOM APIs; animation frames use standard timer scheduling. No component internals are mocked.

```sh
node --test packages/react-ui-core/src/components/Accordion/__tests__/*.test.mjs
```

Red/green TAP output is retained under `results/`. These early records are bounded test evidence, not certification of the combined slice. Browser acceptance, packed imports/types, tree shaking, full final test run and independent review remain pending.

## Follow-up validation and review corrections

The installed consumer uses a normal npm-installed tarball, with no source alias for the candidate and unmodified Goober 2.1.19. Native Node ESM/CommonJS checks cover every public runtime part. Strict TypeScript 6.0.3 with `skipLibCheck: false` covers Bundler, NodeNext ESM and NodeNext CommonJS; original prop/ref types compile and new `sx`/Steps className/omitted required arrow icons are rejected. The consumer's dependencies are isolated from the checkout. Full combined-package metadata/CI remains the integration owner's responsibility.

Independent review identified stock Goober's handling of functional pseudos preceding hover as a risk. Chrome reproduced a real inactive Tabs hover mismatch (root height 157px instead of baseline 153px). Both definitions now use equivalent ordinary `:hover:not([data-state="active"])` ordering. The before-fix log and tested artifact hash are retained as `results/tabs-hover-red.*`; Goober itself is unchanged.

Two early browser failures were test synchronization problems, not component fixes: Carousel was sampled during native smooth scrolling, and Accordion was sampled before its finished exit animation had completed presence cleanup. The runner now waits for the expected scroll destination and two animation frames after finishing finite CSS animations. Earlier logs remain marked as unsettled observations. Review also strengthened Carousel's multiplier test: six cards leave enough overflow to assert a distinct, unclamped third-card destination for `itemsToScroll={2}`. Tabs overflow likewise waits for its actual destination rather than merely detecting scrolling has started.

The browser fixture exercises actual React prop overrides, controlled and uncontrolled selection, disabled controls, refs, keyboard focus/navigation, responsive layout, explicit overrides, independent/custom/nested theme scopes, host preservation and remount cleanup. All existing Accordion and Tabs variants and Carousel card/sunk/noSnap modes are represented. Steps retains its closed props API; no unsupported className/style API is manufactured for override testing. Finite animations are sampled at endpoints, not asserted pixel-by-pixel throughout motion. CSS animation/transition names are hashed by Goober; the matrix compares observable styles and duration instead of requiring identical names.

Reproduce browser checks with `CORE_CONSUMER`, `CORE_BROWSER_TOOLS` (esbuild), `CORE_SASS_TOOLS` (normal Sass), `CORE_HOST_STYLES` (existing extracted host-style archive), `CORE_PLAYWRIGHT` (absolute module path) and `CORE_BROWSER_RESULTS` (output JSON):

```sh
node packages/react-ui-core/src/components/Accordion/__tests__/compatibility.browser.mjs
```

`CORE_MATRIX_FRAMEWORKS` and `CORE_MATRIX_CASES` optionally restrict diagnostics. The baseline arm compiles the legacy index.scss read-only and bundles legacy components with the same React/dependency installation. Only that comparison arm receives old styles; candidate source/builds have no legacy-style input. Final artifact/source hashes and result counts will be recorded after the complete run.

The complete matrix also caught a genuine host-order regression in the Accordion extraction: with Tailwind v3 after the component sheet, the disabled trigger cursor was pointer instead of the baseline default. The generated ancestor had increased base-trigger specificity. The base rule now uses `& :where(.openui-accordion-trigger)` to retain the original single-class specificity, allowing stylesheet order to work as before. Variant/state styling remains unchanged. `results/accordion-disabled-cursor-red.*` records the failing case and artifact hash. This is standard CSS, with no framework detection or runtime patch.

Scoped semantic lint passed using the repository config and installed tooling via `NODE_PATH`; the Prettier ESLint rule was checked separately with the repository-equivalent formatting configuration because this worktree lacks the plugin installation used by that rule. Final integrated CI must run the normal package command with its actual dependency installation. No lint configuration or dependency was edited here.

## Final owned-batch result

Production source is committed through `f8e29d5c2` after initial extraction `2b7398668`. The final scoped tarball SHA256 is `79b5a4f7c1c593255f209791a581e0840972024891e66c66f5ef6bd9657bca30` (200,434 bytes).

- All 33 public component/import/bundle consumer tests passed against the normally installed tarball (`results/consumer-tests.tap`).
- Producer TypeScript 5.9.3 strict checking and ESM/CJS declarations passed. Consumer TypeScript 6.0.3 strict checking with `skipLibCheck: false` passed Bundler, NodeNext ESM and NodeNext CommonJS.
- Chrome 156 passed all 24 framework/order/family cases and 38,118 paired computed-style element snapshots. Each case covers five theme states; all agreed states, variants and relevant interactions are included. Detailed counts and hashes are in `results/browser-final.json`.
- Independent Standards and Spec reviews have zero remaining actionable findings; source and test concerns were fixed and failing evidence retained (`results/review.md`).
- Production source matches the scratch producer, and its dist files match the normal installed tarball. Configurations, versions and hashes are in `results/artifact.json`; the installed consumer lockfile is retained.

The exact tested browser runner is retained in `results/browser-runner-used.txt`. A subsequent Prettier pass only reflowed one method chain in the canonical runner; there was no logic change. The manifest records both hashes. The final run supersedes earlier partial/synchronization runs. No further product source changed after the successful final artifact was packed.

**Ready for integration, not whole-slice acceptance.** Worker1 must integrate the three committed batches, add the recorded root/dependency entries, and rerun the combined package checks and browser matrix. This owner has released the browser window. Modal and TooltipWrapper remain untouched until the integrated container checkpoint passes. No merge, release, SSR support or performance/memory certification is implied.
