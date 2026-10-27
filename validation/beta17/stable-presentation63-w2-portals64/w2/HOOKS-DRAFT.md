# #63/W2 #64 hook documentation draft for integration

Frozen candidate d1e8a05d035b66453d58953faf7d9fabacbaa8e8 has bounded packed-consumer evidence; independent integration acceptance remains pending. This draft is separate
from the production package README, which belongs to the integration owner.
Existing stable aliases and component APIs remain intact, including TextContent's
text-content/clear/card/sunk classes and SourceFaviconImage's img-only alias.

Canonical classes below replace generated attachment values. Their owned rule
bodies remain in per-component files under the accepted private zero-specificity
document guard. Consumers never target the private document marker. Source field
names identify target roles and must be checked against visible DOM in validation.
Do not promise CSS controls vendor inline themes, live coordinates or animation
opacity; existing important declarations retain their disclosed precedence.

Root base overrides use ordinary later CSS without important. Variants, states and
nested parts require the corresponding selector shown by each component's existing
rule nesting; a single base class is not promised to beat every selector/order.
Old alias-only host nodes gain no new canonical class from this change. Parts whose
old alias would broaden styling use an explicit distinct canonical target and keep
the alias on component DOM. TextContent adds a new canonical root without dropping
legacy non-openui names. No Button wrapper or new styling prop is introduced.

## Accordion

- `.openui-accordion-root` — owned target `componentClass` in components/Accordion/Accordion.tsx.

## Buttons

- `.openui-buttons-root` — owned target `componentClass` in components/Buttons/Buttons.tsx.

## Callout

- `.openui-callout-root` — owned target `rootClass` in components/Callout/callout.styles.ts.
- `.openui-callout-title-styled` — owned target `titleClass` in components/Callout/callout.styles.ts.
- `.openui-callout-description-styled` — owned target `descriptionClass` in components/Callout/callout.styles.ts.
- `.openui-callout-variant-info` — owned target `variantClasses.info` in components/Callout/callout.styles.ts.
- `.openui-callout-variant-danger` — owned target `variantClasses.danger` in components/Callout/callout.styles.ts.
- `.openui-callout-variant-warning` — owned target `variantClasses.warning` in components/Callout/callout.styles.ts.
- `.openui-callout-variant-success` — owned target `variantClasses.success` in components/Callout/callout.styles.ts.
- `.openui-callout-variant-neutral` — owned target `variantClasses.neutral` in components/Callout/callout.styles.ts.
- `.openui-callout-dismiss` — owned target `dismissClass` in components/Callout/callout.styles.ts.

## Card

- `.openui-card-root` — owned target `componentClass` in components/Card/Card.tsx.

## CardHeader

- `.openui-card-header-root` — owned target `componentClass` in components/CardHeader/CardHeader.tsx.

## Carousel

- `.openui-carousel-carousel` — owned target `carouselClass` in components/Carousel/carousel.styles.ts.
- `.openui-carousel-content-styled` — owned target `contentClass` in components/Carousel/carousel.styles.ts.
- `.openui-carousel-item-styled` — owned target `itemClass` in components/Carousel/carousel.styles.ts.
- `.openui-carousel-button-styled` — owned target `buttonClass` in components/Carousel/carousel.styles.ts.

## Citation

- `.openui-citation-container-styled` — owned target `containerClass` in components/Citation/citation.styles.ts.
- `.openui-citation-trigger` — owned target `triggerClass` in components/Citation/citation.styles.ts.
- `.openui-citation-tooltip-styled` — owned target `tooltipClass` in components/Citation/citation.styles.ts.
- `.openui-citation-tooltip-content` — owned target `tooltipContentClass` in components/Citation/citation.styles.ts.
- `.openui-citation-item-item` — owned target `itemClass` in components/Citation/citationItem.styles.ts.
- `.openui-citation-item-logo` — owned target `logoClass` in components/Citation/citationItem.styles.ts.
- `.openui-citation-item-content` — owned target `contentClass` in components/Citation/citationItem.styles.ts.
- `.openui-citation-item-title` — owned target `titleClass` in components/Citation/citationItem.styles.ts.
- `.openui-citation-item-source` — owned target `sourceClass` in components/Citation/citationItem.styles.ts.

## CodeBlock

- `.openui-code-block-root` — owned target `wrapperClass` in components/CodeBlock/codeBlock.styles.ts.

## CompositeCardBlock

- `.openui-composite-card-block-card-wrapper` — owned target `wrapperClass` in components/CompositeCardBlock/card.styles.ts.
- `.openui-composite-card-block-card-root` — owned target `rootClass` in components/CompositeCardBlock/card.styles.ts.

## ContextCardBlock

- `.openui-context-card-block-card-image` — owned target `imageClass` in components/ContextCardBlock/card.styles.ts.
- `.openui-context-card-block-card-root` — owned target `rootClass` in components/ContextCardBlock/card.styles.ts.

## DotMatrixLoader

- `.openui-dot-matrix-loader-root` — owned target `componentClass` in components/DotMatrixLoader/DotMatrixLoader.tsx.

## EditableTable

Initially deferred; existing generated styles/hooks remain, with no claim of effective stable conversion.

## EntityList

- `.openui-entity-list-root` — owned target `rootClass` in components/EntityList/entityList.styles.ts.

## IconTag

- `.openui-icon-tag-root` — owned target `rootClass` in components/IconTag/iconTag.styles.ts.
- `.openui-icon-tag-size-xs` — owned target `sizeClasses.xs` in components/IconTag/iconTag.styles.ts.
- `.openui-icon-tag-size-s` — owned target `sizeClasses.s` in components/IconTag/iconTag.styles.ts.
- `.openui-icon-tag-size-m` — owned target `sizeClasses.m` in components/IconTag/iconTag.styles.ts.
- `.openui-icon-tag-size-l` — owned target `sizeClasses.l` in components/IconTag/iconTag.styles.ts.
- `.openui-icon-tag-size-xl` — owned target `sizeClasses.xl` in components/IconTag/iconTag.styles.ts.
- `.openui-icon-tag-variant-neutral` — owned target `variantClasses.neutral` in components/IconTag/iconTag.styles.ts.
- `.openui-icon-tag-variant-info` — owned target `variantClasses.info` in components/IconTag/iconTag.styles.ts.
- `.openui-icon-tag-variant-success` — owned target `variantClasses.success` in components/IconTag/iconTag.styles.ts.
- `.openui-icon-tag-variant-warning` — owned target `variantClasses.warning` in components/IconTag/iconTag.styles.ts.
- `.openui-icon-tag-variant-danger` — owned target `variantClasses.danger` in components/IconTag/iconTag.styles.ts.
- `.openui-icon-tag-variant-inverted` — owned target `variantClasses.inverted` in components/IconTag/iconTag.styles.ts.

## IconText

- `.openui-icon-text-root` — owned target `rootClass` in components/IconText/iconText.styles.ts.
- `.openui-icon-text-layout-vertical` — owned target `layoutClasses.vertical` in components/IconText/iconText.styles.ts.
- `.openui-icon-text-layout-horizontal` — owned target `layoutClasses.horizontal` in components/IconText/iconText.styles.ts.
- `.openui-icon-text-content` — owned target `contentClass` in components/IconText/iconText.styles.ts.

## Image

- `.openui-image-root` — owned target `imageClass` in components/Image/image.styles.ts.
- `.openui-image-fit-styled` — owned target `fitClass` in components/Image/image.styles.ts.
- `.openui-image-fill-styled` — owned target `fillClass` in components/Image/image.styles.ts.
- `.openui-image-error` — owned target `errorClass` in components/Image/image.styles.ts.

## ImageBlock

- `.openui-image-block-wrapper-styled` — owned target `wrapperClass` in components/ImageBlock/imageBlock.styles.ts.
- `.openui-image-block-wrapper-mobile` — owned target `wrapperMobileClass` in components/ImageBlock/imageBlock.styles.ts.
- `.openui-image-block-error` — owned target `errorClass` in components/ImageBlock/imageBlock.styles.ts.
- `.openui-image-block-image-styled` — owned target `imageClass` in components/ImageBlock/imageBlock.styles.ts.
- `.openui-image-block-image-mobile` — owned target `imageMobileClass` in components/ImageBlock/imageBlock.styles.ts.
- `.openui-image-block-loader-styled` — owned target `loaderClass` in components/ImageBlock/imageBlock.styles.ts.

## ImageGallery

- `.openui-image-gallery-gallery-modal-modal` — owned target `modalClass` in components/ImageGallery/galleryModal.styles.ts.
- `.openui-image-gallery-gallery-modal-content` — owned target `contentClass` in components/ImageGallery/galleryModal.styles.ts.
- `.openui-image-gallery-gallery-modal-header` — owned target `headerClass` in components/ImageGallery/galleryModal.styles.ts.
- `.openui-image-gallery-gallery-modal-heading` — owned target `headingClass` in components/ImageGallery/galleryModal.styles.ts.
- `.openui-image-gallery-gallery-modal-main` — owned target `mainClass` in components/ImageGallery/galleryModal.styles.ts.
- `.openui-image-gallery-gallery-modal-carousel-container` — owned target `carouselContainerClass` in components/ImageGallery/galleryModal.styles.ts.
- `.openui-image-gallery-gallery-modal-carousel` — owned target `carouselClass` in components/ImageGallery/galleryModal.styles.ts.
- `.openui-image-gallery-gallery-modal-button-container` — owned target `buttonContainerClass` in components/ImageGallery/galleryModal.styles.ts.
- `.openui-image-gallery-gallery-modal-left-button` — owned target `leftButtonClass` in components/ImageGallery/galleryModal.styles.ts.
- `.openui-image-gallery-gallery-modal-right-button` — owned target `rightButtonClass` in components/ImageGallery/galleryModal.styles.ts.
- `.openui-image-gallery-gallery-modal-thumbnail` — owned target `thumbnailClass` in components/ImageGallery/galleryModal.styles.ts.
- `.openui-image-gallery-gallery-modal-active-thumbnail` — owned target `activeThumbnailClass` in components/ImageGallery/galleryModal.styles.ts.
- `.openui-image-gallery-gallery` — owned target `galleryClass` in components/ImageGallery/imageGallery.styles.ts.
- `.openui-image-gallery-grid` — owned target `gridClass` in components/ImageGallery/imageGallery.styles.ts.
- `.openui-image-gallery-layout-openui-gallery-single` — owned target `layoutClasses.openui-gallery--single` in components/ImageGallery/imageGallery.styles.ts.
- `.openui-image-gallery-layout-openui-gallery-double` — owned target `layoutClasses.openui-gallery--double` in components/ImageGallery/imageGallery.styles.ts.
- `.openui-image-gallery-layout-openui-gallery-triple` — owned target `layoutClasses.openui-gallery--triple` in components/ImageGallery/imageGallery.styles.ts.
- `.openui-image-gallery-layout-openui-gallery-quad` — owned target `layoutClasses.openui-gallery--quad` in components/ImageGallery/imageGallery.styles.ts.
- `.openui-image-gallery-layout-openui-gallery-default` — owned target `layoutClasses.openui-gallery--default` in components/ImageGallery/imageGallery.styles.ts.
- `.openui-image-gallery-image` — owned target `imageClass` in components/ImageGallery/imageGallery.styles.ts.
- `.openui-image-gallery-main-image` — owned target `mainImageClass` in components/ImageGallery/imageGallery.styles.ts.
- `.openui-image-gallery-show-all` — owned target `showAllClass` in components/ImageGallery/imageGallery.styles.ts.

## ImageText

- `.openui-image-text-root` — owned target `rootClass` in components/ImageText/imageText.styles.ts.
- `.openui-image-text-image-container` — owned target `imageContainerClass` in components/ImageText/imageText.styles.ts.
- `.openui-image-text-image` — owned target `imageClass` in components/ImageText/imageText.styles.ts.
- `.openui-image-text-layout-vertical` — owned target `layoutClasses.vertical` in components/ImageText/imageText.styles.ts.
- `.openui-image-text-layout-horizontal` — owned target `layoutClasses.horizontal` in components/ImageText/imageText.styles.ts.
- `.openui-image-text-content` — owned target `contentClass` in components/ImageText/imageText.styles.ts.

## ImageTextLarge

- `.openui-image-text-large-root` — owned target `rootClass` in components/ImageTextLarge/imageTextLarge.styles.ts.
- `.openui-image-text-large-image-wrap` — owned target `imageWrapClass` in components/ImageTextLarge/imageTextLarge.styles.ts.
- `.openui-image-text-large-image` — owned target `imageClass` in components/ImageTextLarge/imageTextLarge.styles.ts.

## InlineHeader

- `.openui-inline-header-root` — owned target `rootClass` in components/InlineHeader/inlineHeader.styles.ts.
- `.openui-inline-header-heading-styled` — owned target `headingClass` in components/InlineHeader/inlineHeader.styles.ts.
- `.openui-inline-header-description-styled` — owned target `descriptionClass` in components/InlineHeader/inlineHeader.styles.ts.

## InlineMarkdownRenderer

- `.openui-inline-markdown-renderer-inline-markdown-root` — owned target `rootClass` in components/InlineMarkdownRenderer/inlineMarkdown.styles.ts.

## ListBlock

- `.openui-list-block-root` — owned target `rootClass` in components/ListBlock/listBlock.styles.ts.

## ListItem

- `.openui-list-item-root` — owned target `rootClass` in components/ListItem/listItem.styles.ts.

## MarkDownRenderer

- `.openui-mark-down-renderer-markdown-code` — owned target `codeClass` in components/MarkDownRenderer/markdown.styles.ts.
- `.openui-mark-down-renderer-markdown-link` — owned target `linkClass` in components/MarkDownRenderer/markdown.styles.ts.
- `.openui-mark-down-renderer-markdown-root` — owned target `rootClass` in components/MarkDownRenderer/markdown.styles.ts.

## MetricIndicator

- `.openui-metric-indicator-root` — owned target `rootClass` in components/MetricIndicator/metricIndicator.styles.ts.

## OverviewCardBlock

- `.openui-overview-card-block-root` — owned target `rootClass` in components/OverviewCardBlock/overviewCardBlock.styles.ts.

## SectionBlock

- `.openui-section-block-foldable-section-root` — owned target `rootClass` in components/SectionBlock/FoldableSection.tsx.
- `.openui-section-block-foldable-section-item` — owned target `itemClass` in components/SectionBlock/FoldableSection.tsx.
- `.openui-section-block-foldable-section-header` — owned target `headerClass` in components/SectionBlock/FoldableSection.tsx.
- `.openui-section-block-foldable-section-trigger` — owned target `triggerClass` in components/SectionBlock/FoldableSection.tsx.
- `.openui-section-block-foldable-section-content` — owned target `contentClass` in components/SectionBlock/FoldableSection.tsx.
- `.openui-section-block-section-v2-root` — owned target `componentClass` in components/SectionBlock/SectionV2.tsx.

## Separator

- `.openui-separator-root` — owned target `componentClass` in components/Separator/Separator.tsx.

## Skeleton

- `.openui-skeleton-pie-chart-skeleton-root` — owned target `componentClass` in components/Skeleton/PieChartSkeleton.tsx.
- `.openui-skeleton-root` — owned target `componentClass` in components/Skeleton/Skeleton.tsx.
- `.openui-skeleton-bar-root` — owned target `componentClass` in components/Skeleton/SkeletonBar.tsx.
- `.openui-skeleton-table-skeleton-root` — owned target `componentClass` in components/Skeleton/TableSkeleton.tsx.

## SnippetCardBlock

- `.openui-snippet-card-block-root` — owned target `rootClass` in components/SnippetCardBlock/snippetCardBlock.styles.ts.

## SourceFaviconImage

- `.openui-source-favicon-image-root` — owned target `faviconClass` in components/SourceFaviconImage/sourceFaviconImage.styles.ts.

## Sources

- `.openui-sources-listed-sources-list` — owned target `listClass` in components/Sources/listedSources.styles.ts.
- `.openui-sources-listed-sources-header` — owned target `headerClass` in components/Sources/listedSources.styles.ts.
- `.openui-sources-listed-sources-title` — owned target `titleClass` in components/Sources/listedSources.styles.ts.
- `.openui-sources-listed-sources-buttons` — owned target `buttonsClass` in components/Sources/listedSources.styles.ts.
- `.openui-sources-listed-sources-container` — owned target `containerClass` in components/Sources/listedSources.styles.ts.
- `.openui-sources-item-item` — owned target `itemClass` in components/Sources/sourcesItem.styles.ts.
- `.openui-sources-item-header` — owned target `headerClass` in components/Sources/sourcesItem.styles.ts.
- `.openui-sources-item-name` — owned target `nameClass` in components/Sources/sourcesItem.styles.ts.
- `.openui-sources-item-title` — owned target `titleClass` in components/Sources/sourcesItem.styles.ts.
- `.openui-sources-item-logo` — owned target `logoClass` in components/Sources/sourcesItem.styles.ts.

## Steps

- `.openui-steps-root` — owned target `componentClass` in components/Steps/Steps.tsx.
- `.openui-steps-item` — owned target `itemClass` in components/Steps/Steps.tsx.

## Table

- `.openui-table-scrollable-table-wrapper` — owned target `wrapperClass` in components/Table/scrollableTable.styles.ts.
- `.openui-table-scrollable-table-scroll-container` — owned target `scrollContainerClass` in components/Table/scrollableTable.styles.ts.
- `.openui-table-scrollable-table-control` — owned target `controlClass` in components/Table/scrollableTable.styles.ts.
- `.openui-table-container-styled` — owned target `containerClass` in components/Table/table.styles.ts.
- `.openui-table-table` — owned target `tableClass` in components/Table/table.styles.ts.
- `.openui-table-footer-styled` — owned target `footerClass` in components/Table/table.styles.ts.
- `.openui-table-head-styled` — owned target `headClass` in components/Table/table.styles.ts.
- `.openui-table-row-styled` — owned target `rowClass` in components/Table/table.styles.ts.
- `.openui-table-cell-styled` — owned target `cellClass` in components/Table/table.styles.ts.
- `.openui-table-alignment` — owned target `alignmentClass` in components/Table/table.styles.ts.

## Tabs

- `.openui-tabs-tabs` — owned target `tabsClass` in components/Tabs/tabs.styles.ts.
- `.openui-tabs-container` — owned target `containerClass` in components/Tabs/tabs.styles.ts.
- `.openui-tabs-list-styled` — owned target `listClass` in components/Tabs/tabs.styles.ts.
- `.openui-tabs-trigger-styled` — owned target `triggerClass` in components/Tabs/tabs.styles.ts.
- `.openui-tabs-content-styled` — owned target `contentClass` in components/Tabs/tabs.styles.ts.

## Tag

- `.openui-tag-root` — owned target `rootClass` in components/Tag/tag.styles.ts.
- `.openui-tag-icon-styled` — owned target `iconClass` in components/Tag/tag.styles.ts.
- `.openui-tag-text-styled` — owned target `textClass` in components/Tag/tag.styles.ts.
- `.openui-tag-size-sm` — owned target `sizeClasses.sm` in components/Tag/tag.styles.ts.
- `.openui-tag-size-md` — owned target `sizeClasses.md` in components/Tag/tag.styles.ts.
- `.openui-tag-size-lg` — owned target `sizeClasses.lg` in components/Tag/tag.styles.ts.
- `.openui-tag-variant-neutral` — owned target `variantClasses.neutral` in components/Tag/tag.styles.ts.
- `.openui-tag-variant-info` — owned target `variantClasses.info` in components/Tag/tag.styles.ts.
- `.openui-tag-variant-success` — owned target `variantClasses.success` in components/Tag/tag.styles.ts.
- `.openui-tag-variant-warning` — owned target `variantClasses.warning` in components/Tag/tag.styles.ts.
- `.openui-tag-variant-danger` — owned target `variantClasses.danger` in components/Tag/tag.styles.ts.

## TagBlock

- `.openui-tag-block-root` — owned target `blockClass` in components/TagBlock/tagBlock.styles.ts.

## TextBlock

- `.openui-text-block-root` — owned target `rootClass` in components/TextBlock/textBlock.styles.ts.

## TextCallout

- `.openui-text-callout-root` — owned target `rootClass` in components/TextCallout/textCallout.styles.ts.
- `.openui-text-callout-variant-neutral` — owned target `variantClasses.neutral` in components/TextCallout/textCallout.styles.ts.
- `.openui-text-callout-variant-info` — owned target `variantClasses.info` in components/TextCallout/textCallout.styles.ts.
- `.openui-text-callout-variant-warning` — owned target `variantClasses.warning` in components/TextCallout/textCallout.styles.ts.
- `.openui-text-callout-variant-success` — owned target `variantClasses.success` in components/TextCallout/textCallout.styles.ts.
- `.openui-text-callout-variant-danger` — owned target `variantClasses.danger` in components/TextCallout/textCallout.styles.ts.
- `.openui-text-callout-content-styled` — owned target `contentClass` in components/TextCallout/textCallout.styles.ts.
- `.openui-text-callout-title` — owned target `titleClass` in components/TextCallout/textCallout.styles.ts.
- `.openui-text-callout-description` — owned target `descriptionClass` in components/TextCallout/textCallout.styles.ts.

## TextContent

- `.openui-text-content-root` — owned target `rootClass` in components/TextContent/textContent.styles.ts.
- `.openui-text-content-variant-sunk` — owned target `variantClasses.sunk` in components/TextContent/textContent.styles.ts.
- `.openui-text-content-variant-card` — owned target `variantClasses.card` in components/TextContent/textContent.styles.ts.
- `.openui-text-content-variant-clear` — owned target `variantClasses.clear` in components/TextContent/textContent.styles.ts.

## TextContentWrapper

- `.openui-text-content-wrapper-root` — owned target `rootClass` in components/TextContentWrapper/textContentWrapper.styles.ts.
- `.openui-text-content-wrapper-markdown` — owned target `markdownClass` in components/TextContentWrapper/textContentWrapper.styles.ts.

## TooltipWrapper

- `.openui-tooltip-wrapper-body` — owned target `bodyClass` in components/TooltipWrapper/tooltipWrapper.styles.ts.
- `.openui-tooltip-wrapper-heading` — owned target `headingClass` in components/TooltipWrapper/tooltipWrapper.styles.ts.
- `.openui-tooltip-wrapper-text` — owned target `textClass` in components/TooltipWrapper/tooltipWrapper.styles.ts.
- `.openui-tooltip-wrapper-content` — owned target `contentClass` in components/TooltipWrapper/tooltipWrapper.styles.ts.

## VisualCardBlock

- `.openui-visual-card-block-card-clickable` — owned target `clickableClass` in components/VisualCardBlock/card.styles.ts.
- `.openui-visual-card-block-card-root` — owned target `rootClass` in components/VisualCardBlock/card.styles.ts.

Shared card layout registrations have one W2 owner; helper classes are integration details until the intended public card hooks are documented. See conversion-ledger.json for exact rules.

## Validated contextual customization examples

Root defaults accept ordinary later CSS. Preserve existing selector context for nested or state-specific defaults:

```css
/* Clear Tabs has root + clear variant + part specificity. */
.openui-tabs-tabs.openui-tabs-clear .openui-tabs-list-styled {
  box-sizing: content-box;
}

/* Inline Markdown intentionally inherits from its parent. */
.openui-inline-markdown-renderer .openui-mark-down-renderer-markdown-root {
  color: rgb(1, 2, 3);
}

/* Match the gallery's active-thumbnail state. */
.openui-image-gallery-gallery-modal-thumbnail.openui-image-gallery-gallery-modal-active-thumbnail {
  border-top-color: rgb(3, 4, 5);
}
```

These examples use public component/state classes, not the private document marker, IDs, inline styles or important declarations. Clear Tabs passes six CSS/order configurations in both arms. The portal active-thumbnail example passes all six configurations and three themes.

Sources intentionally retains its existing important width/background declarations. The original simple-class background probe on the actual Carousel item fails in both arms, with matching important declarations recorded in CSSOM. The later .openui-sources-container ancestor diagnostic does not match the fixture and is not stronger-selector evidence. Final verification should assert matching on the same-element Sources/Carousel classes before a contextual property probe. This has not been rerun. See `sources-diagnostic-erratum.md` and `override-dispositions.md`.
