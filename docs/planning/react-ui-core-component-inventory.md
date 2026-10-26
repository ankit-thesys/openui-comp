# Approved react-ui-core component inventory

Status: the 65-family reusable UI inventory and full Charts subtree are approved for core. Supporting-code details and deferred kit decisions are tracked separately.

## Agreed boundaries

- Core contains reusable UI components. AgentInterface and OpenUIChat are excluded.
- The full Charts subtree belongs in react-ui-core. No separate react-visualization package is in scope.
- Preserve existing props as much as possible; no intended appearance or behavior changes. Only extraction-essential changes are in scope. Any redesign or observable deviation requires a separate decision.
- Existing react-ui remains available while the new packages are developed.

## Approved core component families

These are current source-family names, not a claim that every directory exports exactly one component. Copy each selected family's existing public subcomponents and types as well.

| Group | Count | Component families |
| --- | ---: | --- |
| Inputs and controls | 21 | `Button`, `Buttons`, `Calendar`, `CheckBoxGroup`, `CheckBoxItem`, `Chips`, `DatePicker`, `FormControl`, `IconButton`, `Input`, `Label`, `OptionCards`, `RadioGroup`, `RadioItem`, `Select`, `Slider`, `SwitchGroup`, `SwitchItem`, `TextArea`, `ToggleGroup`, `ToggleItem` |
| Layout and containers | 9 | `Accordion`, `Card`, `CardHeader`, `Carousel`, `Modal`, `SectionBlock`, `Separator`, `Steps`, `Tabs` |
| Text and presentation | 13 | `Callout`, `CodeBlock`, `IconTag`, `IconText`, `InlineHeader`, `InlineMarkdownRenderer`, `MarkDownRenderer`, `Tag`, `TagBlock`, `TextBlock`, `TextCallout`, `TextContent`, `TextContentWrapper` |
| Images | 5 | `Image`, `ImageBlock`, `ImageGallery`, `ImageText`, `ImageTextLarge` |
| Data and lists | 6 | `EditableTable`, `EntityList`, `ListBlock`, `ListItem`, `MetricIndicator`, `Table` |
| Composed cards | 5 | `CompositeCardBlock`, `ContextCardBlock`, `OverviewCardBlock`, `SnippetCardBlock`, `VisualCardBlock` |
| Citations and sources | 3 | `Citation`, `SourceFaviconImage`, `Sources` |
| Loading and help | 3 | `DotMatrixLoader`, `Skeleton`, `TooltipWrapper` |

**Table total: 65 approved reusable UI families**, including composed cards and citation/source UI. The complete Charts subtree is additional approved core scope, including its existing chart components and supporting code.

## Assigned to the initial chat kit

FollowUpBlock, FollowUpItem, and ModelSwitcher belong in `kits/chat`. This destination is confirmed and its implementation is included in Monday's submission. Retain their existing react-ui implementations as the baseline.

## Additional scope and destinations

| Item | Disposition |
| --- | --- |
| Charts | Copy the complete subtree into react-ui-core, in addition to the 65 families listed above. |
| AgentInterface | Do not port for now. Keep the existing implementation in react-ui; extraction and placement are outside Monday scope. |
| OpenUIChat | Outside core. Its placement and relationship to AgentInterface/the initial kit remain pending. |
| ToolCall, ToolResult | Outside the approved core inventory. Resolve placement with chat-specific helpers as needed for the Monday chat kit without porting AgentInterface; retain existing implementations. |
| _shared | Mixed support directory. Copy only needed reusable utilities; do not copy its chat tool-renderer machinery wholesale. |
| GenUI schemas, assembled libraries, prompts/examples | openuiChatLibrary and required definitions/support move into kits/chat/libs for Monday. Do not migrate openuiLibrary wholesale; its future ownership is a pending team decision. Preserve the existing library. These are not visual core components. |
| react-headless convenience re-exports | Not part of the visual component inventory; no automatic carryover into core. |

## Required supporting code

- ThemeProvider, theme types/defaults/swatches, createTheme, theme hooks, CSS tokens, utilities, and component styles must accompany or support the selected components. They are not counted among the 65 families.
- Preserve each selected family's local contexts and helpers as needed.
- Calendar and DatePicker depend on LayoutContext. Its current values include mobile, fullscreen, tray, and copilot; removing it would risk behavior changes. Its extraction/API treatment remains open.
- Charts depend on shared controls and theming. They also use PrintContext for export metadata; preserve required support in core and decide which context APIs need public exports.
- Old/new comparison is required for migration validation. The test setup must account for provider and global-style interference; interchangeable mixed-component interoperability is not an agreed requirement.

## Preserve the full public surface of selected families

- Modal, ToggleGroup, and ToggleItem have component subpath entry points but are absent from the root export barrel. Do not omit them from inventory because of that.
- MetricIndicator exports MetricIndicatorInline and MetricIndicatorWithStrikethrough.
- TextBlock exports TextBlockView.
- SectionBlock exports SectionV2 and FoldableSectionRoot/Item/Trigger/Content.
- Skeleton also exports PieChartSkeleton and TableSkeleton. Keep these exports in core alongside the chart and table implementations.
- Preserve exported parts such as Accordion, Select, Table, and Carousel subcomponents, GalleryModal, citation/source components, and SliderBlock.

## Source evidence

Inventory checked against packages/react-ui/src/index.ts and each listed packages/react-ui/src/components/<family>/index.ts. There is no src/components/index.ts barrel.

Additional boundary evidence: FollowUpBlock/FollowUpBlock.tsx, ModelSwitcher/ModelSwitcher.tsx, ToolCall/ToolCallTimeline.tsx, Calendar/Calendar.tsx, DatePicker/DatePicker.tsx, context/LayoutContext.tsx, and packages/react-ui/tsdown.config.ts.

The components directory contains 75 immediate directories: the 65 approved families, three chat-kit families, Charts, AgentInterface, OpenUIChat, ToolCall, ToolResult, ThemeProvider, and _shared. This directory count is not an exported-component count.
