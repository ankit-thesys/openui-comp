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
- [ ] Source behavior, build, types and affected format/lint checks.
- [ ] Normally installed frozen artifact: native public-root ESM/CJS, strict three-mode types, Button-only exclusion and OptionCards dependency pruning.
- [ ] Independent real Chrome parity: plain CSS/Tailwind3/Tailwind4 both initial orders, themes, actual responsive widths/boundaries, controlled selection, native keyboard/focus, disabled states, markdown/top slots and explicit overrides.
- [ ] Independent Spec and Standards reviews.
- [ ] Integrated package CI and fork remote checks.

## Checklist

- [x] Related fork issue linked; no closure instruction
- [ ] Documentation/evidence updated with actual results
- [x] Existing APIs and read-only legacy boundary preserved

## Merge Danger

**Door:** two-way. **Blast Radius:** component.

Draft only, stacked on PR35. No merge, publication or ticket closure. SSR/hydration/performance/memory remain outside this control extraction's certification. Report inherited behavior or coverage gaps without redesigning the control.
