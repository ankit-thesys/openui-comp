# Goober template conversion checklist

Planning only; no styles converted. Source snapshot `ed4ada6cb56e6c25a37a15c576200e87c6fd09a7`.
The final runtime checks must use new packed artifacts after verifier release.

## Inventory

| Source shape | Count | Interpretation |
| --- | ---: | --- |
| Goober/style-definition files | 137 | Includes existing templates, typed declaration fragments and registration callers. |
| Object `css` calls | 114 | Convert authored declarations to stock templates; no new style API. |
| Object `keyframes` calls | 25 | Convert to stock keyframe templates; preserve frames/order. |
| Identifier `css` calls | 38 | Every argument is a static identifier, not automatically a dynamic exception. |
| Existing `css` templates | 123 | Preserve unless a real parity issue requires changing them. |
| Existing keyframe templates | 3 | Preserve. |
| Typed declaration objects | 126 in54 files | Overlaps the calls above; do not add these counts as unique styles. |
| Inline-style-bearing source files | 80 | Review separately: native override forwarding, computed geometry and vendor APIs. |

The conversion touches105 source files under this syntactic inventory:72 non-TSX
style/fragment modules and33 TSX callers.32 other style files already use templates
without typed declaration objects. This is a source audit, not an estimate of
component parity or runtime performance.

## Conversion order and invariants

1. Pilot Button/Input and Select/ModelSwitcher: primitives, state selectors,
   overlays, theme portals and kits composition. Preserve Goober registration
   location/timing, selector order and specificity. No blind rewrite.
2. Convert shared declaration fragments (notably chartBaseDeclarations and
   chartTypography) and their importers together. Use ordinary template strings
   and stock interpolation; no object-to-CSS serializer, custom compiler, mixin
   framework or runtime cache layer. Preserve declaration ordering and duplicate
   overrides currently expressed through object spread.
3. Convert control/layout/overlay, text/media/data and chart families in reviewable
   groups, including all25 remaining object keyframes. Object numbers need the
   same units as Goober previously emitted; do not infer every number is pixels.
4. Convert the three kits style modules: FollowUpBlock (2 object calls),
   FollowUpItem (2 object calls,1 existing template), ModelSwitcher (12 css-object
   calls and1 object keyframe). Keep their component/library split unchanged.
5. A `css(importedDeclarations)` call currently executes in the component module
   at module scope. Preserve that timing with stock template interpolation, or
   explicitly compare injection order if moving registration into another module.
   Do not switch to per-render style generation while changing syntax.
6. Preserve token fallbacks, quotes, :where specificity, state selectors, SVG
   properties, media queries, keyframe references and existing important policy.
   Verifier-approved important cleanup remains a separate, traceable change.
7. Do not add color canonicalization while converting. Select's authored shadow
   values already match the old SCSS; its static-minifier/runtime representation
   difference remains an explicit baseline finding.

## Exception candidates requiring a short rationale, not a blanket waiver

| Candidate | Existing evidence | Proposed treatment / validation |
| --- | --- | --- |
| Native `style`/`styles` forwarding | Input.tsx:33 and many public components | Preserve consumer customization API. This is not an authored Goober object style. Test caller overrides. |
| Theme token rule generation | ThemeProvider.tsx:212,236-245; utils.ts themeToCssVars | Preserve existing provider lifecycle/scoping and per-instance token serialization. Do not replace it with a new registry or request cache. Verifier owns theme behavior. |
| Chart geometry/animation state | HorizontalBarSeries.tsx:90,120,137; PortalTooltip/ChartTooltip.tsx:105 | Computed animation delay, positioning and per-datum sizes may remain native inline values. Distinguish nearby static declarations; static values are not excused by dynamic neighbors. Test changing data/resize/animation. |
| Kits TextContent size variables | libs/openuiChatLibrary/TextContent/index.tsx:24-38 | Existing per-instance CSS variable override; preserve token cascade and supported sizes. |
| Syntax-highlighter theme map | CodeBlock.tsx:39 | Third-party component's `style` prop is a theme object API; template replacement would change its contract. Preserve existing custom theme path. |
| Official KaTeX vendor CSS/fonts | Core README Math vendor styles | Previously accepted vendor exception; do not convert vendor CSS or require a new consumer CSS import. |

No custom Goober patch, injection manager, import scanner or new public styling
prop is proposed. Static object declarations are convertible until actual evidence
shows otherwise; there is no approved broad dynamic-object exception.

## Checks once execution is allowed

- Compare emitted declarations/native computed states for each pilot, including
  hover/disabled/focus/validation and overlay content. Do not accept generated
  class-name churn as a reason to mask actual computed differences.
- Exercise plain CSS, real Tailwind3/4 preflights before/after, public explicit
  overrides and all existing custom theme presets. Preserve baseline failures.
- Verify unused component JS/styles pruning, automatic styling and module
  evaluation behavior with packed imports. Template syntax alone proves none of these.
- Run affected family checks per group, then the complete approved integrated
  matrix against new artifact hashes. No reinterpretation of SSR as accepted support.

## Files requiring conversion/call-site review

| File | css object | keyframe object | identifier call | typed objects |
| --- | ---: | ---: | ---: | ---: |
| [packages/kits/src/react/chat/components/FollowUpBlock/followUpBlock.styles.ts](../../../packages/kits/src/react/chat/components/FollowUpBlock/followUpBlock.styles.ts) | 2 | 0 | 0 | 0 |
| [packages/kits/src/react/chat/components/FollowUpItem/followUpItem.styles.ts](../../../packages/kits/src/react/chat/components/FollowUpItem/followUpItem.styles.ts) | 2 | 0 | 0 | 0 |
| [packages/kits/src/react/chat/components/ModelSwitcher/modelSwitcher.styles.ts](../../../packages/kits/src/react/chat/components/ModelSwitcher/modelSwitcher.styles.ts) | 12 | 1 | 0 | 0 |
| [packages/react-ui-core/src/components/Accordion/Accordion.tsx](../../../packages/react-ui-core/src/components/Accordion/Accordion.tsx) | 0 | 0 | 1 | 0 |
| [packages/react-ui-core/src/components/Accordion/accordion.styles.ts](../../../packages/react-ui-core/src/components/Accordion/accordion.styles.ts) | 0 | 2 | 0 | 1 |
| [packages/react-ui-core/src/components/Button/Button.tsx](../../../packages/react-ui-core/src/components/Button/Button.tsx) | 0 | 0 | 1 | 0 |
| [packages/react-ui-core/src/components/Button/button.styles.ts](../../../packages/react-ui-core/src/components/Button/button.styles.ts) | 0 | 0 | 0 | 1 |
| [packages/react-ui-core/src/components/Buttons/Buttons.tsx](../../../packages/react-ui-core/src/components/Buttons/Buttons.tsx) | 0 | 0 | 1 | 0 |
| [packages/react-ui-core/src/components/Buttons/buttons.styles.ts](../../../packages/react-ui-core/src/components/Buttons/buttons.styles.ts) | 0 | 0 | 0 | 1 |
| [packages/react-ui-core/src/components/Calendar/Calendar.tsx](../../../packages/react-ui-core/src/components/Calendar/Calendar.tsx) | 0 | 0 | 1 | 0 |
| [packages/react-ui-core/src/components/Calendar/calendar.styles.ts](../../../packages/react-ui-core/src/components/Calendar/calendar.styles.ts) | 0 | 0 | 0 | 1 |
| [packages/react-ui-core/src/components/Card/Card.tsx](../../../packages/react-ui-core/src/components/Card/Card.tsx) | 0 | 0 | 1 | 0 |
| [packages/react-ui-core/src/components/Card/card.styles.ts](../../../packages/react-ui-core/src/components/Card/card.styles.ts) | 0 | 0 | 0 | 1 |
| [packages/react-ui-core/src/components/CardHeader/CardHeader.tsx](../../../packages/react-ui-core/src/components/CardHeader/CardHeader.tsx) | 0 | 0 | 1 | 0 |
| [packages/react-ui-core/src/components/CardHeader/cardHeader.styles.ts](../../../packages/react-ui-core/src/components/CardHeader/cardHeader.styles.ts) | 0 | 0 | 0 | 1 |
| [packages/react-ui-core/src/components/Carousel/carousel.styles.ts](../../../packages/react-ui-core/src/components/Carousel/carousel.styles.ts) | 4 | 0 | 0 | 4 |
| [packages/react-ui-core/src/components/Charts/AreaChart/areaChart.styles.ts](../../../packages/react-ui-core/src/components/Charts/AreaChart/areaChart.styles.ts) | 1 | 0 | 0 | 0 |
| [packages/react-ui-core/src/components/Charts/BarChart/barChart.styles.ts](../../../packages/react-ui-core/src/components/Charts/BarChart/barChart.styles.ts) | 1 | 1 | 0 | 0 |
| [packages/react-ui-core/src/components/Charts/BarChart/horizontalBarChart.styles.ts](../../../packages/react-ui-core/src/components/Charts/BarChart/horizontalBarChart.styles.ts) | 1 | 1 | 0 | 0 |
| [packages/react-ui-core/src/components/Charts/CalendarHeatmap/calendarHeatmap.styles.ts](../../../packages/react-ui-core/src/components/Charts/CalendarHeatmap/calendarHeatmap.styles.ts) | 0 | 1 | 0 | 0 |
| [packages/react-ui-core/src/components/Charts/FunnelChart/funnelChart.styles.ts](../../../packages/react-ui-core/src/components/Charts/FunnelChart/funnelChart.styles.ts) | 0 | 1 | 0 | 0 |
| [packages/react-ui-core/src/components/Charts/HeatmapChart/heatmapChart.styles.ts](../../../packages/react-ui-core/src/components/Charts/HeatmapChart/heatmapChart.styles.ts) | 2 | 0 | 0 | 0 |
| [packages/react-ui-core/src/components/Charts/LineChart/lineChart.styles.ts](../../../packages/react-ui-core/src/components/Charts/LineChart/lineChart.styles.ts) | 1 | 0 | 0 | 0 |
| [packages/react-ui-core/src/components/Charts/PieChart/pieChart.styles.ts](../../../packages/react-ui-core/src/components/Charts/PieChart/pieChart.styles.ts) | 1 | 1 | 0 | 0 |
| [packages/react-ui-core/src/components/Charts/RadarChart/radarChart.styles.ts](../../../packages/react-ui-core/src/components/Charts/RadarChart/radarChart.styles.ts) | 1 | 1 | 0 | 0 |
| [packages/react-ui-core/src/components/Charts/RadialChart/radialChart.styles.ts](../../../packages/react-ui-core/src/components/Charts/RadialChart/radialChart.styles.ts) | 1 | 0 | 0 | 0 |
| [packages/react-ui-core/src/components/Charts/ScatterChart/scatterChart.styles.ts](../../../packages/react-ui-core/src/components/Charts/ScatterChart/scatterChart.styles.ts) | 1 | 1 | 0 | 0 |
| [packages/react-ui-core/src/components/Charts/shared/animations/drawLine.styles.ts](../../../packages/react-ui-core/src/components/Charts/shared/animations/drawLine.styles.ts) | 0 | 1 | 0 | 0 |
| [packages/react-ui-core/src/components/Charts/shared/animations/fadeAppear.styles.ts](../../../packages/react-ui-core/src/components/Charts/shared/animations/fadeAppear.styles.ts) | 0 | 1 | 0 | 0 |
| [packages/react-ui-core/src/components/Charts/shared/chartBaseDeclarations.ts](../../../packages/react-ui-core/src/components/Charts/shared/chartBaseDeclarations.ts) | 0 | 0 | 0 | 11 |
| [packages/react-ui-core/src/components/Charts/shared/chartTypography.ts](../../../packages/react-ui-core/src/components/Charts/shared/chartTypography.ts) | 0 | 0 | 0 | 1 |
| [packages/react-ui-core/src/components/CheckBoxGroup/CheckBoxGroup.tsx](../../../packages/react-ui-core/src/components/CheckBoxGroup/CheckBoxGroup.tsx) | 0 | 0 | 1 | 0 |
| [packages/react-ui-core/src/components/CheckBoxGroup/styles.ts](../../../packages/react-ui-core/src/components/CheckBoxGroup/styles.ts) | 0 | 0 | 0 | 1 |
| [packages/react-ui-core/src/components/CheckBoxItem/CheckBoxItem.tsx](../../../packages/react-ui-core/src/components/CheckBoxItem/CheckBoxItem.tsx) | 0 | 0 | 1 | 0 |
| [packages/react-ui-core/src/components/CheckBoxItem/styles.ts](../../../packages/react-ui-core/src/components/CheckBoxItem/styles.ts) | 0 | 0 | 0 | 1 |
| [packages/react-ui-core/src/components/Chips/Chips.tsx](../../../packages/react-ui-core/src/components/Chips/Chips.tsx) | 0 | 0 | 1 | 0 |
| [packages/react-ui-core/src/components/Chips/chips.styles.ts](../../../packages/react-ui-core/src/components/Chips/chips.styles.ts) | 0 | 0 | 0 | 1 |
| [packages/react-ui-core/src/components/Citation/citation.styles.ts](../../../packages/react-ui-core/src/components/Citation/citation.styles.ts) | 4 | 4 | 0 | 3 |
| [packages/react-ui-core/src/components/Citation/citationItem.styles.ts](../../../packages/react-ui-core/src/components/Citation/citationItem.styles.ts) | 5 | 0 | 0 | 5 |
| [packages/react-ui-core/src/components/CodeBlock/codeBlock.styles.ts](../../../packages/react-ui-core/src/components/CodeBlock/codeBlock.styles.ts) | 1 | 0 | 0 | 1 |
| [packages/react-ui-core/src/components/DatePicker/datePicker.styles.ts](../../../packages/react-ui-core/src/components/DatePicker/datePicker.styles.ts) | 0 | 1 | 0 | 1 |
| [packages/react-ui-core/src/components/DatePicker/helpers/components/FloatingDatePickerRenderer.tsx](../../../packages/react-ui-core/src/components/DatePicker/helpers/components/FloatingDatePickerRenderer.tsx) | 0 | 0 | 1 | 0 |
| [packages/react-ui-core/src/components/DotMatrixLoader/DotMatrixLoader.tsx](../../../packages/react-ui-core/src/components/DotMatrixLoader/DotMatrixLoader.tsx) | 0 | 0 | 1 | 0 |
| [packages/react-ui-core/src/components/DotMatrixLoader/dotMatrixLoader.styles.ts](../../../packages/react-ui-core/src/components/DotMatrixLoader/dotMatrixLoader.styles.ts) | 0 | 0 | 0 | 1 |
| [packages/react-ui-core/src/components/EditableTable/base/components/editableCell.styles.ts](../../../packages/react-ui-core/src/components/EditableTable/base/components/editableCell.styles.ts) | 10 | 0 | 0 | 11 |
| [packages/react-ui-core/src/components/EditableTable/base/components/editableSelectCell.styles.ts](../../../packages/react-ui-core/src/components/EditableTable/base/components/editableSelectCell.styles.ts) | 1 | 0 | 0 | 1 |
| [packages/react-ui-core/src/components/EditableTable/editableTable.styles.ts](../../../packages/react-ui-core/src/components/EditableTable/editableTable.styles.ts) | 9 | 0 | 0 | 9 |
| [packages/react-ui-core/src/components/FormControl/FormControl.tsx](../../../packages/react-ui-core/src/components/FormControl/FormControl.tsx) | 0 | 0 | 1 | 0 |
| [packages/react-ui-core/src/components/FormControl/Hint/Hint.tsx](../../../packages/react-ui-core/src/components/FormControl/Hint/Hint.tsx) | 0 | 0 | 1 | 0 |
| [packages/react-ui-core/src/components/FormControl/Hint/hint.styles.ts](../../../packages/react-ui-core/src/components/FormControl/Hint/hint.styles.ts) | 0 | 0 | 0 | 1 |
| [packages/react-ui-core/src/components/FormControl/formControl.styles.ts](../../../packages/react-ui-core/src/components/FormControl/formControl.styles.ts) | 0 | 0 | 0 | 1 |
| [packages/react-ui-core/src/components/IconButton/IconButton.tsx](../../../packages/react-ui-core/src/components/IconButton/IconButton.tsx) | 0 | 0 | 1 | 0 |
| [packages/react-ui-core/src/components/IconButton/iconButton.styles.ts](../../../packages/react-ui-core/src/components/IconButton/iconButton.styles.ts) | 0 | 0 | 0 | 1 |
| [packages/react-ui-core/src/components/InlineHeader/inlineHeader.styles.ts](../../../packages/react-ui-core/src/components/InlineHeader/inlineHeader.styles.ts) | 3 | 0 | 0 | 3 |
| [packages/react-ui-core/src/components/InlineMarkdownRenderer/inlineMarkdown.styles.ts](../../../packages/react-ui-core/src/components/InlineMarkdownRenderer/inlineMarkdown.styles.ts) | 1 | 0 | 0 | 1 |
| [packages/react-ui-core/src/components/Input/Input.tsx](../../../packages/react-ui-core/src/components/Input/Input.tsx) | 0 | 0 | 1 | 0 |
| [packages/react-ui-core/src/components/Input/input.styles.ts](../../../packages/react-ui-core/src/components/Input/input.styles.ts) | 0 | 0 | 0 | 1 |
| [packages/react-ui-core/src/components/Label/Label.tsx](../../../packages/react-ui-core/src/components/Label/Label.tsx) | 0 | 0 | 1 | 0 |
| [packages/react-ui-core/src/components/Label/label.styles.ts](../../../packages/react-ui-core/src/components/Label/label.styles.ts) | 0 | 0 | 0 | 1 |
| [packages/react-ui-core/src/components/MarkDownRenderer/markdown.styles.ts](../../../packages/react-ui-core/src/components/MarkDownRenderer/markdown.styles.ts) | 3 | 0 | 0 | 3 |
| [packages/react-ui-core/src/components/Modal/modal.styles.ts](../../../packages/react-ui-core/src/components/Modal/modal.styles.ts) | 7 | 2 | 0 | 7 |
| [packages/react-ui-core/src/components/RadioGroup/RadioGroup.tsx](../../../packages/react-ui-core/src/components/RadioGroup/RadioGroup.tsx) | 0 | 0 | 1 | 0 |
| [packages/react-ui-core/src/components/RadioGroup/styles.ts](../../../packages/react-ui-core/src/components/RadioGroup/styles.ts) | 0 | 0 | 0 | 1 |
| [packages/react-ui-core/src/components/RadioItem/RadioItem.tsx](../../../packages/react-ui-core/src/components/RadioItem/RadioItem.tsx) | 0 | 0 | 1 | 0 |
| [packages/react-ui-core/src/components/RadioItem/styles.ts](../../../packages/react-ui-core/src/components/RadioItem/styles.ts) | 0 | 0 | 0 | 1 |
| [packages/react-ui-core/src/components/SectionBlock/FoldableSection.tsx](../../../packages/react-ui-core/src/components/SectionBlock/FoldableSection.tsx) | 0 | 0 | 5 | 0 |
| [packages/react-ui-core/src/components/SectionBlock/SectionV2.tsx](../../../packages/react-ui-core/src/components/SectionBlock/SectionV2.tsx) | 0 | 0 | 1 | 0 |
| [packages/react-ui-core/src/components/SectionBlock/foldableSection.styles.ts](../../../packages/react-ui-core/src/components/SectionBlock/foldableSection.styles.ts) | 0 | 0 | 0 | 5 |
| [packages/react-ui-core/src/components/SectionBlock/sectionV2.styles.ts](../../../packages/react-ui-core/src/components/SectionBlock/sectionV2.styles.ts) | 0 | 0 | 0 | 1 |
| [packages/react-ui-core/src/components/Select/select.styles.ts](../../../packages/react-ui-core/src/components/Select/select.styles.ts) | 7 | 1 | 0 | 2 |
| [packages/react-ui-core/src/components/Separator/Separator.tsx](../../../packages/react-ui-core/src/components/Separator/Separator.tsx) | 0 | 0 | 1 | 0 |
| [packages/react-ui-core/src/components/Separator/separator.styles.ts](../../../packages/react-ui-core/src/components/Separator/separator.styles.ts) | 0 | 0 | 0 | 1 |
| [packages/react-ui-core/src/components/Skeleton/PieChartSkeleton.tsx](../../../packages/react-ui-core/src/components/Skeleton/PieChartSkeleton.tsx) | 0 | 0 | 1 | 0 |
| [packages/react-ui-core/src/components/Skeleton/Skeleton.tsx](../../../packages/react-ui-core/src/components/Skeleton/Skeleton.tsx) | 0 | 0 | 1 | 0 |
| [packages/react-ui-core/src/components/Skeleton/SkeletonBar.tsx](../../../packages/react-ui-core/src/components/Skeleton/SkeletonBar.tsx) | 0 | 0 | 1 | 0 |
| [packages/react-ui-core/src/components/Skeleton/TableSkeleton.tsx](../../../packages/react-ui-core/src/components/Skeleton/TableSkeleton.tsx) | 0 | 0 | 1 | 0 |
| [packages/react-ui-core/src/components/Skeleton/pieChartSkeleton.styles.ts](../../../packages/react-ui-core/src/components/Skeleton/pieChartSkeleton.styles.ts) | 0 | 0 | 0 | 1 |
| [packages/react-ui-core/src/components/Skeleton/skeleton.styles.ts](../../../packages/react-ui-core/src/components/Skeleton/skeleton.styles.ts) | 0 | 0 | 0 | 2 |
| [packages/react-ui-core/src/components/Skeleton/skeletonPulse.ts](../../../packages/react-ui-core/src/components/Skeleton/skeletonPulse.ts) | 0 | 1 | 0 | 0 |
| [packages/react-ui-core/src/components/Skeleton/tableSkeleton.styles.ts](../../../packages/react-ui-core/src/components/Skeleton/tableSkeleton.styles.ts) | 0 | 0 | 0 | 1 |
| [packages/react-ui-core/src/components/Slider/Slider.tsx](../../../packages/react-ui-core/src/components/Slider/Slider.tsx) | 0 | 0 | 1 | 0 |
| [packages/react-ui-core/src/components/Slider/SliderBlock.tsx](../../../packages/react-ui-core/src/components/Slider/SliderBlock.tsx) | 0 | 0 | 1 | 0 |
| [packages/react-ui-core/src/components/Slider/slider.styles.ts](../../../packages/react-ui-core/src/components/Slider/slider.styles.ts) | 0 | 0 | 0 | 1 |
| [packages/react-ui-core/src/components/Slider/sliderBlock.styles.ts](../../../packages/react-ui-core/src/components/Slider/sliderBlock.styles.ts) | 0 | 0 | 0 | 1 |
| [packages/react-ui-core/src/components/SourceFaviconImage/sourceFaviconImage.styles.ts](../../../packages/react-ui-core/src/components/SourceFaviconImage/sourceFaviconImage.styles.ts) | 1 | 0 | 0 | 0 |
| [packages/react-ui-core/src/components/Sources/listedSources.styles.ts](../../../packages/react-ui-core/src/components/Sources/listedSources.styles.ts) | 5 | 0 | 0 | 2 |
| [packages/react-ui-core/src/components/Sources/sourcesItem.styles.ts](../../../packages/react-ui-core/src/components/Sources/sourcesItem.styles.ts) | 5 | 0 | 0 | 2 |
| [packages/react-ui-core/src/components/Steps/Steps.tsx](../../../packages/react-ui-core/src/components/Steps/Steps.tsx) | 0 | 0 | 2 | 0 |
| [packages/react-ui-core/src/components/Steps/steps.styles.ts](../../../packages/react-ui-core/src/components/Steps/steps.styles.ts) | 0 | 0 | 0 | 2 |
| [packages/react-ui-core/src/components/SwitchGroup/SwitchGroup.tsx](../../../packages/react-ui-core/src/components/SwitchGroup/SwitchGroup.tsx) | 0 | 0 | 1 | 0 |
| [packages/react-ui-core/src/components/SwitchGroup/styles.ts](../../../packages/react-ui-core/src/components/SwitchGroup/styles.ts) | 0 | 0 | 0 | 1 |
| [packages/react-ui-core/src/components/SwitchItem/SwitchItem.tsx](../../../packages/react-ui-core/src/components/SwitchItem/SwitchItem.tsx) | 0 | 0 | 1 | 0 |
| [packages/react-ui-core/src/components/SwitchItem/styles.ts](../../../packages/react-ui-core/src/components/SwitchItem/styles.ts) | 0 | 0 | 0 | 1 |
| [packages/react-ui-core/src/components/Table/scrollableTable.styles.ts](../../../packages/react-ui-core/src/components/Table/scrollableTable.styles.ts) | 3 | 0 | 0 | 3 |
| [packages/react-ui-core/src/components/Table/table.styles.ts](../../../packages/react-ui-core/src/components/Table/table.styles.ts) | 7 | 0 | 0 | 7 |
| [packages/react-ui-core/src/components/Tabs/tabs.styles.ts](../../../packages/react-ui-core/src/components/Tabs/tabs.styles.ts) | 5 | 0 | 0 | 5 |
| [packages/react-ui-core/src/components/TextArea/TextArea.tsx](../../../packages/react-ui-core/src/components/TextArea/TextArea.tsx) | 0 | 0 | 1 | 0 |
| [packages/react-ui-core/src/components/TextArea/textArea.styles.ts](../../../packages/react-ui-core/src/components/TextArea/textArea.styles.ts) | 0 | 0 | 0 | 1 |
| [packages/react-ui-core/src/components/TextBlock/textBlock.styles.ts](../../../packages/react-ui-core/src/components/TextBlock/textBlock.styles.ts) | 1 | 0 | 0 | 1 |
| [packages/react-ui-core/src/components/TextContentWrapper/textContentWrapper.styles.ts](../../../packages/react-ui-core/src/components/TextContentWrapper/textContentWrapper.styles.ts) | 2 | 0 | 0 | 2 |
| [packages/react-ui-core/src/components/ToggleGroup/ToggleGroup.tsx](../../../packages/react-ui-core/src/components/ToggleGroup/ToggleGroup.tsx) | 0 | 0 | 1 | 0 |
| [packages/react-ui-core/src/components/ToggleGroup/styles.ts](../../../packages/react-ui-core/src/components/ToggleGroup/styles.ts) | 0 | 0 | 0 | 1 |
| [packages/react-ui-core/src/components/ToggleItem/ToggleItem.tsx](../../../packages/react-ui-core/src/components/ToggleItem/ToggleItem.tsx) | 0 | 0 | 1 | 0 |
| [packages/react-ui-core/src/components/ToggleItem/styles.ts](../../../packages/react-ui-core/src/components/ToggleItem/styles.ts) | 0 | 0 | 0 | 1 |
| [packages/react-ui-core/src/components/TooltipWrapper/tooltipWrapper.styles.ts](../../../packages/react-ui-core/src/components/TooltipWrapper/tooltipWrapper.styles.ts) | 4 | 4 | 0 | 4 |

Exact line numbers and source hashes: [style-inventory.json](style-inventory.json).
