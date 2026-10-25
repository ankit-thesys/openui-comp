## Summary

```diff
 @openuidev/react-ui-core (root imports)
+  OptionCards + existing public types
   InlineMarkdownRenderer
   private shared row grouping
```

Complete the deferred OptionCards control from fork issue #10, reusing the existing extracted dependencies. Stacked on draft PR35; legacy react-ui remains unchanged.

## Changes

Preserve controlled selected values/onToggle, native button selection and disabled behavior, existing role/ARIA attributes, markdown/icon/image slots, forwarded ref/native props and responsive rows. Convert its owned styles to stock Goober without a new styling API or runtime dependency.

## Evidence / Test Plan

- Before: public root and focused import checks fail because OptionCards is missing; original red logs retained.
- [x] Four focused integrated public checks, build/types and affected formatting pass; owned semantic lint/source reviews clear.
- [x] Frozen4911a82f8 artifact498447 bytes, SHA2560a66152ad19a6c7e0a732a652175723e8bd1bcde1b5159a10e3966d835b67821: native public-root ESM/CJS, strict three-mode types, Button-only exclusion and OptionCards dependency pruning pass; all installed files match tar.
- [x] Independent Chrome156 parity:6 cases /15,732 image-inclusive paired snapshots on exact4911a82f8 artifact. Plain CSS/Tailwind3/Tailwind4 both initial orders, themes, actual450/480/481/700/768/769/900px containers, controlled selection, native keyboard/focus/disabled, markdown/top slots and explicit overrides; package/lock unchanged.
- [x] Independent Spec and Standards source/integration reviews: zero actionable findings, including final browser harness/evidence.
- [x] Local integrated package CI110/110; format/lint/types/build/Publint/ATTW pass (two existing ThemeProvider hook warnings, zero lint errors).
- [ ] Fork remote build and changeset checks.

## Checklist

- [x] Related fork issue linked; no closure instruction
- [x] Documentation/evidence updated with actual results
- [x] Existing APIs and read-only legacy boundary preserved

## Merge Danger

**Door:** two-way. **Blast Radius:** component.

Draft only, stacked on PR35. No merge, publication or ticket closure. Native Tab/Enter/Space behavior is retained; custom arrow navigation/roving focus is absent in both implementations. SSR/hydration/parser streaming/performance/memory remain outside this control extraction's certification. Report inherited behavior or coverage gaps without redesigning the control.
