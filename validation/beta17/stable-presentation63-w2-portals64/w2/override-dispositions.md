# Override probe dispositions

Original failed rows remain unchanged in small-results.json (23 failures) and override-results.json (one clear-Tabs part failure). extra-results.json retains the insufficient two-class Tabs selector failure. These are separate runs, not pooled or relabeled as passing.

Each row below maps to a same-property correction on the original actual DOM target, or an explicit pre-existing precedence limitation. JSON retains both arms, emitted matching-selector declarations, original computed values and fresh correction values. CSSOM listings include rules under conditional groups; they are diagnostic candidates, not an assertion that every media condition was active. Baseline generated selectors are used only to measure old behavior, never as consumer guidance.

## 1. IconText/actual-base-override/openui-icon-text-content

- Property: `display`; requested `inline-block`; candidate actual `block`; baseline actual `block`.
- Disposition: CSS blockification in the measured flex/grid parent makes inline-block compute to block in both arms. Test the same owned display declaration with grid (flex when already grid); the requested computed value is observable and differs from the default.
- Fresh candidate correction: `.openui-icon-text-content` → `grid`, actual `grid`, pass=True.
- Emitted rules and baseline details: `override-dispositions.json`, records[0].

## 2. IconText/actual-base-override/openui-mark-down-renderer-markdown-root

- Property: `color`; requested `rgb(1, 2, 3)`; candidate actual `oklch(0.097 0 0)`; baseline actual `oklch(0.097 0 0)`.
- Disposition: InlineMarkdownRenderer intentionally sets descendant Markdown color:inherit. Match that existing parent/part context using .openui-inline-markdown-renderer .openui-mark-down-renderer-markdown-root; later color now wins. This does not promise a single part selector beats parent context.
- Fresh candidate correction: `.openui-inline-markdown-renderer .openui-mark-down-renderer-markdown-root` → `rgb(1, 2, 3)`, actual `rgb(1, 2, 3)`, pass=True.
- Emitted rules and baseline details: `override-dispositions.json`, records[1].

## 3. IconText/actual-base-override/openui-inline-markdown-renderer-inline-markdown-root

- Property: `display`; requested `inline-block`; candidate actual `block`; baseline actual `block`.
- Disposition: CSS blockification in the measured flex/grid parent makes inline-block compute to block in both arms. Test the same owned display declaration with grid (flex when already grid); the requested computed value is observable and differs from the default.
- Fresh candidate correction: `.openui-inline-markdown-renderer-inline-markdown-root` → `grid`, actual `grid`, pass=True.
- Emitted rules and baseline details: `override-dispositions.json`, records[2].

## 4. IconText/actual-base-override/openui-text-block-root

- Property: `display`; requested `inline-block`; candidate actual `block`; baseline actual `block`.
- Disposition: CSS blockification in the measured flex/grid parent makes inline-block compute to block in both arms. Test the same owned display declaration with grid (flex when already grid); the requested computed value is observable and differs from the default.
- Fresh candidate correction: `.openui-text-block-root` → `grid`, actual `grid`, pass=True.
- Emitted rules and baseline details: `override-dispositions.json`, records[3].

## 5. TextContentWrapper/actual-base-override/openui-inline-header-root

- Property: `display`; requested `inline-block`; candidate actual `block`; baseline actual `block`.
- Disposition: CSS blockification in the measured flex/grid parent makes inline-block compute to block in both arms. Test the same owned display declaration with grid (flex when already grid); the requested computed value is observable and differs from the default.
- Fresh candidate correction: `.openui-inline-header-root` → `grid`, actual `grid`, pass=True.
- Emitted rules and baseline details: `override-dispositions.json`, records[4].

## 6. Tag/actual-base-override/openui-tag-icon-styled

- Property: `display`; requested `inline-block`; candidate actual `block`; baseline actual `block`.
- Disposition: CSS blockification in the measured flex/grid parent makes inline-block compute to block in both arms. Test the same owned display declaration with grid (flex when already grid); the requested computed value is observable and differs from the default.
- Fresh candidate correction: `.openui-tag-icon-styled` → `grid`, actual `grid`, pass=True.
- Emitted rules and baseline details: `override-dispositions.json`, records[5].

## 7. TextCallout/actual-base-override/openui-text-callout-content-styled

- Property: `display`; requested `inline-block`; candidate actual `block`; baseline actual `block`.
- Disposition: CSS blockification in the measured flex/grid parent makes inline-block compute to block in both arms. Test the same owned display declaration with grid (flex when already grid); the requested computed value is observable and differs from the default.
- Fresh candidate correction: `.openui-text-callout-content-styled` → `grid`, actual `grid`, pass=True.
- Emitted rules and baseline details: `override-dispositions.json`, records[6].

## 8. ImageText/actual-base-override/openui-image-text-image

- Property: `width`; requested `137px`; candidate actual `64px`; baseline actual `64px`.
- Disposition: The image is a flex item inside the existing 40px container. A 137px width resolves to 64px in both arms under intrinsic/flex sizing. The same width declaration set to 31px yields 31px in both arms; no container or production CSS changed.
- Fresh candidate correction: `.openui-image-text-image` → `31px`, actual `31px`, pass=True.
- Emitted rules and baseline details: `override-dispositions.json`, records[7].

## 9. ImageText/actual-base-override/openui-image-text-content

- Property: `display`; requested `inline-block`; candidate actual `block`; baseline actual `block`.
- Disposition: CSS blockification in the measured flex/grid parent makes inline-block compute to block in both arms. Test the same owned display declaration with grid (flex when already grid); the requested computed value is observable and differs from the default.
- Fresh candidate correction: `.openui-image-text-content` → `grid`, actual `grid`, pass=True.
- Emitted rules and baseline details: `override-dispositions.json`, records[8].

## 10. Sources/actual-base-override/openui-sources-listed-sources-header

- Property: `display`; requested `inline-block`; candidate actual `block`; baseline actual `block`.
- Disposition: CSS blockification in the measured flex/grid parent makes inline-block compute to block in both arms. Test the same owned display declaration with grid (flex when already grid); the requested computed value is observable and differs from the default.
- Fresh candidate correction: `.openui-sources-listed-sources-header` → `grid`, actual `grid`, pass=True.
- Emitted rules and baseline details: `override-dispositions.json`, records[9].

## 11. Sources/actual-base-override/openui-sources-item-item

- Property: `display`; requested `inline-block`; candidate actual `block`; baseline actual `block`.
- Disposition: CSS blockification in the measured flex/grid parent makes inline-block compute to block in both arms. Test the same owned display declaration with grid (flex when already grid); the requested computed value is observable and differs from the default.
- Fresh candidate correction: `.openui-sources-item-item` → `grid`, actual `grid`, pass=True.
- Emitted rules and baseline details: `override-dispositions.json`, records[10].

## 12. Sources/actual-base-override/openui-sources-item-header

- Property: `display`; requested `inline-block`; candidate actual `block`; baseline actual `block`.
- Disposition: CSS blockification in the measured flex/grid parent makes inline-block compute to block in both arms. Test the same owned display declaration with grid (flex when already grid); the requested computed value is observable and differs from the default.
- Fresh candidate correction: `.openui-sources-item-header` → `grid`, actual `grid`, pass=True.
- Emitted rules and baseline details: `override-dispositions.json`, records[11].

## 13. Sources/actual-base-override/openui-carousel-carousel

- Property: `display`; requested `inline-block`; candidate actual `block`; baseline actual `block`.
- Disposition: CSS blockification in the measured flex/grid parent makes inline-block compute to block in both arms. Test the same owned display declaration with grid (flex when already grid); the requested computed value is observable and differs from the default.
- Fresh candidate correction: `.openui-carousel-carousel` → `grid`, actual `grid`, pass=True.
- Emitted rules and baseline details: `override-dispositions.json`, records[12].

## 14. Sources/actual-base-override/openui-carousel-content-styled

- Property: `display`; requested `inline-block`; candidate actual `block`; baseline actual `block`.
- Disposition: CSS blockification in the measured flex/grid parent makes inline-block compute to block in both arms. Test the same owned display declaration with grid (flex when already grid); the requested computed value is observable and differs from the default.
- Fresh candidate correction: `.openui-carousel-content-styled` → `grid`, actual `grid`, pass=True.
- Emitted rules and baseline details: `override-dispositions.json`, records[13].

## 15. Sources/actual-base-override/openui-carousel-item-styled

- Property: `background-color`; requested `rgb(2, 3, 4)`; candidate actual `rgba(0, 0, 0, 0)`; baseline actual `rgba(0, 0, 0, 0)`.
- Disposition: Sources applies background-color:transparent !important on the actual Carousel item. The original simple-class probe targets that element in each arm and remains transparent; emitted CSSOM rules and recorded classes support the retained precedence limitation. The later diagnostic uses .openui-sources-container as an ancestor, but that ancestor is absent from source/fixture. Its failed value does not establish a stronger matching override result and is invalid as correction evidence. Raw results remain unchanged. Final verification must check selector matching on the actual same-element Sources/Carousel classes before measuring the property; no new measurement is claimed here.
- Invalid nonmatching diagnostic, not stronger-override evidence: `.openui-sources-container .openui-carousel-item-styled` → `rgb(2, 3, 4)`, actual `rgba(0, 0, 0, 0)`, pass=False.
- Emitted rules and baseline details: `override-dispositions.json`, records[14].

## 16. Tabs/actual-base-override/openui-tabs-container

- Property: `display`; requested `inline-block`; candidate actual `block`; baseline actual `block`.
- Disposition: CSS blockification in the measured flex/grid parent makes inline-block compute to block in both arms. Test the same owned display declaration with grid (flex when already grid); the requested computed value is observable and differs from the default.
- Fresh candidate correction: `.openui-tabs-container` → `grid`, actual `grid`, pass=True.
- Emitted rules and baseline details: `override-dispositions.json`, records[15].

## 17. Tabs/actual-base-override/openui-tabs-list-styled

- Property: `box-sizing`; requested `content-box`; candidate actual `border-box`; baseline actual `border-box`.
- Disposition: Clear Tabs default uses root + clear-state + part (three classes). The original single-part probe and extra two-class container probe are insufficient. Candidate .openui-tabs-tabs.openui-tabs-clear .openui-tabs-list-styled passes. The initial diagnostic baseline correction used a new canonical class absent from baseline and failed; retain it as a fixture error. tabs-state-results.json separately tests legacy baseline .openui-tabs.openui-tabs-clear .openui-tabs-list and candidate canonical selector across all six CSS/order configurations.
- Fresh candidate correction: `.openui-tabs-tabs.openui-tabs-clear .openui-tabs-list-styled` → `content-box`, actual `content-box`, pass=True.
- Emitted rules and baseline details: `override-dispositions.json`, records[16].

## 18. Steps/actual-base-override/openui-steps-root

- Property: `width`; requested `137px`; candidate actual `280px`; baseline actual `280px`.
- Disposition: Existing min-width:280px clamps requested width:137px in both arms. Width:317px is above that bound and changes the same owned width property to the requested value in both arms.
- Fresh candidate correction: `.openui-steps-root` → `317px`, actual `317px`, pass=True.
- Emitted rules and baseline details: `override-dispositions.json`, records[17].

## 19. Steps/actual-base-override/openui-steps-item

- Property: `display`; requested `inline-block`; candidate actual `block`; baseline actual `block`.
- Disposition: CSS blockification in the measured flex/grid parent makes inline-block compute to block in both arms. Test the same owned display declaration with grid (flex when already grid); the requested computed value is observable and differs from the default.
- Fresh candidate correction: `.openui-steps-item` → `grid`, actual `grid`, pass=True.
- Emitted rules and baseline details: `override-dispositions.json`, records[18].

## 20. SectionBlock/actual-base-override/openui-section-block-foldable-section-item

- Property: `display`; requested `inline-block`; candidate actual `block`; baseline actual `block`.
- Disposition: CSS blockification in the measured flex/grid parent makes inline-block compute to block in both arms. Test the same owned display declaration with grid (flex when already grid); the requested computed value is observable and differs from the default.
- Fresh candidate correction: `.openui-section-block-foldable-section-item` → `grid`, actual `grid`, pass=True.
- Emitted rules and baseline details: `override-dispositions.json`, records[19].

## 21. SectionBlock/actual-base-override/openui-section-block-foldable-section-header

- Property: `display`; requested `inline-block`; candidate actual `block`; baseline actual `block`.
- Disposition: CSS blockification in the measured flex/grid parent makes inline-block compute to block in both arms. Test the same owned display declaration with grid (flex when already grid); the requested computed value is observable and differs from the default.
- Fresh candidate correction: `.openui-section-block-foldable-section-header` → `grid`, actual `grid`, pass=True.
- Emitted rules and baseline details: `override-dispositions.json`, records[20].

## 22. ImageGallery/actual-base-override/openui-image-gallery-grid

- Property: `display`; requested `inline-block`; candidate actual `block`; baseline actual `block`.
- Disposition: CSS blockification in the measured flex/grid parent makes inline-block compute to block in both arms. Test the same owned display declaration with grid (flex when already grid); the requested computed value is observable and differs from the default.
- Fresh candidate correction: `.openui-image-gallery-grid` → `flex`, actual `flex`, pass=True.
- Emitted rules and baseline details: `override-dispositions.json`, records[21].

## 23. ImageGallery/actual-base-override/openui-image-gallery-show-all

- Property: `display`; requested `inline-block`; candidate actual `block`; baseline actual `block`.
- Disposition: CSS blockification in the measured flex/grid parent makes inline-block compute to block in both arms. Test the same owned display declaration with grid (flex when already grid); the requested computed value is observable and differs from the default.
- Fresh candidate correction: `.openui-image-gallery-show-all` → `grid`, actual `grid`, pass=True.
- Emitted rules and baseline details: `override-dispositions.json`, records[22].

