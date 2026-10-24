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
