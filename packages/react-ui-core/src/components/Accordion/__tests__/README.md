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
