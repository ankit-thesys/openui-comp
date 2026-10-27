# Observed stable-hook candidates

Source strings only; root/part/variant/state contracts must be reviewed and documented per conversion. No class is counted as an effective selector merely because it occurs in JSX. Full line-numbered contexts and state selectors: inventory.json.

| Ticket/owner | Family | Observed hooks (sample) | States (sample) |
| --- | --- | --- | --- |
| #63/W2 | Accordion | `openui-accordion`, `openui-accordion-card`, `openui-accordion-item`, `openui-accordion-sunk`, `openui-accordion-clear`, `openui-accordion-header` | `:focus-within`, `[data-state="open"]`, `[data-state="closed"]` |
| #61/W1 | Button | `openui-button-base`, `openui-button-base-large`, `openui-button-base-small`, `openui-button-base-medium`, `openui-button-base-primary`, `openui-button-base-tertiary` | `:hover`, `:disabled`, `:active` |
| #63/W2 | Buttons | `openui-buttons`, `openui-buttons-vertical`, `openui-buttons-horizontal` |  |
| #64/W1 | Calendar | `openui-calendar-root`, `openui-calendar-month`, `openui-calendar-today`, `openui-select-content`, `openui-calendar-footer`, `openui-select-viewport` | `:focus`, `:focus-visible`, `:hover`, `:disabled` |
| #63/W2 | Callout | `openui-callout`, `openui-callout-info`, `openui-callout-title`, `openui-callout-danger`, `openui-callout-neutral`, `openui-callout-success` |  |
| #63/W2 | Card | `openui-card`, `openui-card-card`, `openui-card-full`, `openui-card-sunk`, `openui-card-clear`, `openui-card-standard` |  |
| #63/W2 | CardHeader | `openui-header`, `openui-header-top`, `openui-header-bottom`, `openui-header-top-left`, `openui-header-top-right`, `openui-header-top-left-icon` |  |
| #63/W2 | Carousel | `openui-carousel`, `openui-carousel--`, `openui-carousel-item`, `openui-carousel--sunk`, `openui-carousel-button`, `openui-carousel-content` |  |
| #62/W1 | CheckBoxGroup | `openui-checkbox-group`, `openui-checkbox-group-card`, `openui-checkbox-group-sunk`, `openui-checkbox-group-clear` |  |
| #62/W1 | CheckBoxItem | `openui-checkbox-item-root`, `openui-checkbox-item-label`, `openui-checkbox-item-content`, `openui-checkbox-item-container`, `openui-checkbox-item-indicator`, `openui-checkbox-item-description` | `:disabled`, `[data-state="checked"]`, `:hover` |
| #62/W1 | Chips | `openui-chips`, `openui-chip-item`, `openui-chip-item__icon`, `openui-chip-item__text`, `openui-chip-item--disabled`, `openui-chip-item--selected` | `:hover`, `:disabled`, `:focus-visible` |
| #64/W2 | Citation | `openui-citation`, `openui-citation-item`, `openui-citation-tooltip`, `openui-citation-container`, `openui-citation-item__logo`, `openui-citation-item__title` | `:hover`, `[data-state="delayed-open"]`, `[data-state="instant-open"]`, `:active` |
| #63/W2 | CodeBlock | `openui-code-block-wrapper`, `openui-code-block-copy-button`, `openui-code-block-copy-button-copied`, `openui-code-block-syntax-highlighter` | `:hover` |
| #63/W2 | CompositeCardBlock | `openui-composite-card`, `openui-composite-card__body`, `openui-composite-card--static`, `openui-composite-card__footer`, `openui-composite-card__header`, `openui-composite-card__wrapper` | `:hover`, `:focus-visible` |
| #63/W2 | ContextCardBlock | `openui-tag`, `openui-context-card`, `openui-context-card__tag`, `openui-context-card__slot`, `openui-context-card--static`, `openui-context-card__chevron` | `:hover`, `:focus-visible` |
| #64/W1 | DatePicker | `openui-calendar-root`, `openui-date-picker-renderer-range-mode`, `openui-date-picker-renderer-single-mode`, `openui-date-picker-renderer-floating-menu`, `openui-date-picker-renderer-floating-content`, `openui-date-picker-renderer-floating-container` | `:disabled`, `:hover` |
| #63/W2 | DotMatrixLoader | `openui-dot-matrix-loader`, `openui-dot-matrix-loader__dot` |  |
| #63/W2 | EditableTable | `openui-select-trigger`, `openui-editable-table-table`, `openui-editable-table-wrapper`, `openui-editable-table-cell-base`, `openui-editable-table-cell-input`, `openui-editable-table-display-url` | `:hover` |
| #63/W2 | EntityList | `openui-entity-list`, `openui-entity-list--`, `openui-entity-list__row`, `openui-entity-list--small`, `openui-entity-list__row--`, `openui-entity-list--default` |  |
| #62/W1 | FormControl | `openui-hint`, `openui-hint-error`, `openui-form-control` |  |
| #61/W1 | IconButton | `openui-icon-button`, `openui-icon-button-icon`, `openui-icon-button-large`, `openui-icon-button-small`, `openui-icon-button-circle`, `openui-icon-button-medium` | `:hover`, `:disabled`, `:active` |
| #63/W2 | IconTag | `openui-icon-tag`, `openui-icon-tag--` |  |
| #63/W2 | IconText | `openui-icon-tag`, `openui-icon-text`, `openui-icon-text--`, `openui-icon-text__content`, `openui-text-block__primary` |  |
| #63/W2 | Image | `openui-image`, `openui-image-fit`, `openui-image-fill`, `openui-image--error` |  |
| #63/W2 | ImageBlock | `openui-image-block-image`, `openui-image-block-loader`, `openui-image-block-wrapper`, `openui-image-block-image--error`, `openui-image-block-image--mobile`, `openui-image-block-wrapper--error` |  |
| #64/W2 | ImageGallery | `openui-gallery`, `openui-gallery--quad`, `openui-gallery__grid`, `openui-gallery__image`, `openui-gallery__modal`, `openui-gallery--double` | `:hover` |
| #63/W2 | ImageText | `openui-image-text`, `openui-image-text--`, `openui-image-text__image`, `openui-image-text__content`, `openui-text-block__primary`, `openui-image-text__image-container` |  |
| #63/W2 | ImageTextLarge | `openui-image-text-large`, `openui-image-text-large__image`, `openui-image-text-large__content`, `openui-image-text-large__image-wrap` |  |
| #63/W2 | InlineHeader | `openui-inline-header`, `openui-inline-header-heading`, `openui-inline-header-description` |  |
| #63/W2 | InlineMarkdownRenderer | `openui-markdown-renderer`, `openui-inline-markdown-renderer`, `openui-inline-markdown-renderer--dark` |  |
| #62/W1 | Input | `openui-input`, `openui-input-error`, `openui-input-large`, `openui-input-small`, `openui-input-medium` | `:focus`, `:disabled`, `:hover` |
| #62/W1 | Label | `openui-label`, `openui-label-disabled`, `openui-label-required-asterisk` |  |
| #63/W2 | ListBlock | `openui-list-block`, `openui-list-block--small` |  |
| #63/W2 | ListItem | `openui-list-item`, `openui-list-item-title`, `openui-list-item-action`, `openui-list-item-content`, `openui-list-item-wrapper`, `openui-list-item-subtitle` | `:hover`, `:focus` |
| #63/W2 | MarkDownRenderer | `openui-table-container`, `openui-markdown-renderer`, `openui-markdown-renderer-card`, `openui-markdown-renderer-code`, `openui-markdown-renderer-link`, `openui-markdown-renderer-card-sunk` | `:hover` |
| #63/W2 | MetricIndicator | `openui-metric-indicator`, `openui-metric-indicator__row`, `openui-metric-indicator__trend`, `openui-metric-indicator__subtext`, `openui-metric-indicator--variant-`, `openui-metric-indicator__main-value` |  |
| #64/W1 | Modal | `openui-modal-lg`, `openui-modal-md`, `openui-modal-sm`, `openui-modal-body`, `openui-modal-root`, `openui-modal-close` | `:focus`, `:hover` |
| #62/W1 | OptionCards | `openui-option-card`, `openui-option-cards`, `openui-option-card__top`, `openui-option-card__text`, `openui-option-cards__row`, `openui-option-card__title` | `:hover`, `:disabled`, `:focus-visible` |
| #63/W2 | OverviewCardBlock | `openui-overview-card`, `openui-overview-card__slot`, `openui-overview-card__chevron`, `openui-overview-card__top-row`, `openui-overview-card__vertical`, `openui-overview-card--clickable` | `:hover`, `:focus-visible` |
| #62/W1 | RadioGroup | `openui-radio-group`, `openui-radio-group-card`, `openui-radio-group-sunk`, `openui-radio-group-clear` |  |
| #62/W1 | RadioItem | `openui-radio-item-svg`, `openui-radio-item-root`, `openui-radio-item-label`, `openui-radio-item-content`, `openui-radio-item-svg-path`, `openui-radio-item-container` | `:disabled`, `[data-state]`, `[data-state="unchecked"]`, `:hover` |
| #63/W2 | SectionBlock | `openui-section-v2`, `openui-foldable-section`, `openui-section-v2-header`, `openui-section-v2-content`, `openui-section-v2-wrapper`, `openui-foldable-section-item` | `[data-state="open"]`, `[data-state="closed"]` |
| #64/W1 | Select | `openui-select-item`, `openui-select-group`, `openui-select-label`, `openui-select-content`, `openui-select-trigger`, `openui-select-content-` | `:hover`, `[data-placeholder]`, `:disabled`, `[data-state="open"]` |
| #63/W2 | Separator | `openui-separator` | `[data-orientation="horizontal"]`, `[data-orientation="vertical"]` |
| #63/W2 | Skeleton | `openui-skeleton-bar`, `openui-skeleton-stack`, `openui-skeleton-table`, `openui-skeleton-table-row`, `openui-skeleton-table-cell`, `openui-skeleton-pie-chart-semi` |  |
| #62/W1 | Slider | `openui-slider-root`, `openui-slider-block`, `openui-slider-range`, `openui-slider-thumb`, `openui-slider-track`, `openui-slider-labels` | `:hover`, `:focus` |
| #63/W2 | SnippetCardBlock | `openui-icon-text`, `openui-image-text`, `openui-text-block`, `openui-value-card`, `openui-value-card__lhs`, `openui-value-card__rhs` | `:hover`, `:focus-visible` |
| #63/W2 | SourceFaviconImage | `openui-source-favicon-image` |  |
| #63/W2 | Sources | `openui-listed-sources`, `openui-listed-source-item`, `openui-listed-sources-header`, `openui-listed-source-item__logo`, `openui-listed-source-item__title`, `openui-listed-source-item__header` | `:hover` |
| #63/W2 | Steps | `openui-steps`, `openui-step-item`, `openui-step-title`, `openui-step-number`, `openui-step-content`, `openui-step-details` |  |
| #62/W1 | SwitchGroup | `openui-switch-group`, `openui-switch-group-card`, `openui-switch-group-sunk`, `openui-switch-group-clear` |  |
| #62/W1 | SwitchItem | `openui-switch-item-root`, `openui-switch-item-label`, `openui-switch-item-thumb`, `openui-switch-item-content`, `openui-switch-item-container`, `openui-switch-item-description` | `:hover`, `[data-disabled]`, `[data-state="checked"]`, `:disabled` |
| #63/W2 | Table | `openui-table`, `openui-table-row`, `openui-table-body`, `openui-table-cell`, `openui-table-head`, `openui-table-footer` |  |
| #63/W2 | Tabs | `openui-tabs`, `openui-tabs-list`, `openui-tabs-clear`, `openui-tabs-content`, `openui-tabs-trigger`, `openui-tabs-indicator` | `[data-state="active"]`, `:hover` |
| #63/W2 | Tag | `openui-tag`, `openui-tag-lg`, `openui-tag-md`, `openui-tag-sm`, `openui-tag-icon`, `openui-tag-info` |  |
| #63/W2 | TagBlock | `openui-tag-block` |  |
| #62/W1 | TextArea | `openui-textarea`, `openui-textarea-error` | `:focus`, `:disabled`, `:hover` |
| #63/W2 | TextBlock | `openui-text-block`, `openui-text-block--`, `openui-text-block--text`, `openui-text-block--size-`, `openui-text-block--type-`, `openui-text-block--align-` |  |
| #63/W2 | TextCallout | `openui-text-callout`, `openui-text-callout-info`, `openui-text-callout-danger`, `openui-text-callout-content`, `openui-text-callout-neutral`, `openui-text-callout-success` |  |
| #63/W2 | TextContent | `text-content`, `text-content-card`, `text-content-sunk`, `text-content-clear` |  |
| #63/W2 | TextContentWrapper | `openui-text-content`, `openui-text-content-markdown`, `openui-text-content-markdown-dark-mode` |  |
| #62/W1 | ToggleGroup | `openui-toggle-group` |  |
| #62/W1 | ToggleItem | `openui-toggle-item` | `:hover`, `:disabled`, `[data-state="on"]` |
| #64/W2 | TooltipWrapper | `openui-tooltip-body`, `openui-tooltip-content`, `openui-tooltip-heading`, `openui-tooltip-text-content` | `[data-state="delayed-open"]`, `[data-side="top"]`, `[data-side="right"]`, `[data-side="bottom"]` |
| #63/W2 | VisualCardBlock | `openui-tag`, `openui-visual-first-card`, `openui-visual-first-card__tag`, `openui-visual-first-card__top`, `openui-visual-first-card--static`, `openui-visual-first-card__action` | `:hover`, `:focus-visible` |
