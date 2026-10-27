# Public export disposition proposal

Planning only. Source snapshot `ed4ada6cb56e6c25a37a15c576200e87c6fd09a7`. No export has been
removed. Complete traced definitions and kits imports are in
[export-inventory.json](export-inventory.json); the source-only AST traversal has
no unresolved exports. This is not external-consumer telemetry or declaration
type-checking evidence.

## Decision summary

- Root currently exposes166 runtime values and194 types. No generated style-class
  values are root-exported in this inventory; do not invent a cleanup target.
- Kits uses101 distinct core symbols:98 runtime values and3 public types
  (ButtonsProps,EditableTableRow,ThemeMode), across61 import-bearing source files.
- **No root removal is proven safe by this preparation.** Lack of a kits import
  does not mean a supported building block is unused by consumers.
- Keep documented chart utilities, legend composition, layout/print context APIs,
  theme customization and existing component parts. Core README:41 and121-127
  explicitly establish several of these contracts.
- Independent export audit now confirms safeUrl,safeOpenUrl,getFaviconUrl and
  openSourceInNewTab were explicitly public in legacy. **Keep all four for parity**;
  no removal decision is needed. See the preserved audit report under the lab's
  `evidence/export-contract/`. This supersedes the earlier ambiguous classification.
- IconWrapper lives under _shared but is directly used at4 kits sites.
  CardSourceProvider/CardSourceSchema are used in library assembly. Their paths or
  helper-like names do not authorize removal or an /internal replacement.

## Keep / remove / ambiguous table

| Category | Proposed disposition | Evidence / boundary |
| --- | --- | --- |
| Components, charts, parts and composed cards | Keep | Confirmed supported building-block policy. Includes GalleryModal, CompositeCard/ContextCard/VisualCard and control/table/section parts. |
| Theme APIs, defaults, swatches, constants and types | Keep | Existing customization preserved; README:41. Context objects not already public remain private. |
| Scatter helpers, CHART_CLASS_PREFIX, LegendStoreProvider/useLegendEntry/StackedLegend | Keep | Explicit README:121-127 contract; absence of kits usage is not removal evidence. |
| Layout/Print context families | Keep | Explicit existing integration contract; no SSR implication. |
| IconWrapper and source provider/schema | Keep | Concrete production kits consumers; no replacement or internal escape hatch approved. |
| Current public types | Keep pending public-signature audit | Props/data/composition types must remain usable in ESM/CJS declarations. Private declaration dependencies may remain privately declared when reachable; do not export every internal type by default. |
| safeUrl,safeOpenUrl,getFaviconUrl,openSourceInNewTab | Keep | Explicit legacy root/Source barrel public exports independently confirmed; parity requires preserving them. |
| ThemeContext/FormControlContext, legend publisher/store implementation, style classes and geometry helpers not root-exported | Keep private | Already outside supported root surface. Do not add export or /internal path merely for kits convenience. |
| Root export removals proven safe | None | No removal should proceed solely from spelling, folder name or lack of in-repo import. |

## Kits contract

`@openuidev/kits/react/chat` keeps FollowUpBlock,FollowUpItem,ModelSwitcher and
their5 public types (including ModelLogo/ModelOption).
`@openuidev/kits/react/chat/libs` keeps its5 assembly/prompt exports. No root kits
entry, component-specific core subpath, or /internal escape hatch is introduced.

ModelSwitcher composes Select,SelectContent,SelectGroup,SelectItem,SelectLabel,
SelectSeparator,SelectTrigger,Tag,useTheme and ThemeMode through the supported
core root. Other adapters similarly need Accordion/Carousel/Table/Tabs parts.
The exhaustive per-symbol consumer list below is the starting dependency check.

## Cleanup execution and validation

1. Pin post-rename root/subpath export maps and emitted ESM/CJS declaration/API
   inventory. Confirm that AST and built export lists match before removing names.
2. Trace each proposed removal to public signatures, docs and maintained consumers.
   Record replacement and explicit rationale. Remove an unnecessary barrel
   re-export without deleting implementation still needed inside the package.
3. If a proposed internal is needed by kits, use an existing supported public
   component API. If that cannot express the composition, bring that exact case
   to the user; do not silently add /internal or duplicate code into kits.
4. Maintain an explicit keep/remove allowlist. For retained imports, compile
   packed ESM and CJS consumers including public type use. For approved removals,
   prove both runtime import and strict type import fail.
5. Test export-map resolution for deep source/dist/internal paths. Core already
   has only root exports; unbundled physical files are not an implicit public API.
   Do not delete files solely because they exist in the tarball.
6. Verify kits native imports/library assembly, tree shaking and supported
   compositions. Run affected behavior checks, then the approved integrated matrix
   after all stages. Keep baseline nonpassing classifications explicit.

## Complete core root table

Each row traces its defining file. “Keep type” is conservative preservation, not
proof that every type is transitively required. See JSON for every kits import site.

| Symbol | Kind | Proposal | Production kits sites | Definition |
| --- | --- | --- | ---: | --- |
| `Accordion` | value | Keep | 1 | [packages/react-ui-core/src/components/Accordion/Accordion.tsx:23](../../../packages/react-ui-core/src/components/Accordion/Accordion.tsx#L23) |
| `AccordionContent` | value | Keep | 1 | [packages/react-ui-core/src/components/Accordion/Accordion.tsx:91](../../../packages/react-ui-core/src/components/Accordion/Accordion.tsx#L91) |
| `AccordionContentProps` | type | Keep type | 0 | [packages/react-ui-core/src/components/Accordion/Accordion.tsx:84](../../../packages/react-ui-core/src/components/Accordion/Accordion.tsx#L84) |
| `AccordionItem` | value | Keep | 1 | [packages/react-ui-core/src/components/Accordion/Accordion.tsx:43](../../../packages/react-ui-core/src/components/Accordion/Accordion.tsx#L43) |
| `AccordionItemProps` | type | Keep type | 0 | [packages/react-ui-core/src/components/Accordion/Accordion.tsx:35](../../../packages/react-ui-core/src/components/Accordion/Accordion.tsx#L35) |
| `AccordionProps` | type | Keep type | 0 | [packages/react-ui-core/src/components/Accordion/Accordion.tsx:11](../../../packages/react-ui-core/src/components/Accordion/Accordion.tsx#L11) |
| `AccordionTrigger` | value | Keep | 1 | [packages/react-ui-core/src/components/Accordion/Accordion.tsx:64](../../../packages/react-ui-core/src/components/Accordion/Accordion.tsx#L64) |
| `AccordionTriggerProps` | type | Keep type | 0 | [packages/react-ui-core/src/components/Accordion/Accordion.tsx:56](../../../packages/react-ui-core/src/components/Accordion/Accordion.tsx#L56) |
| `AreaChart` | value | Keep | 0 | [packages/react-ui-core/src/components/Charts/AreaChart/AreaChart.tsx:30](../../../packages/react-ui-core/src/components/Charts/AreaChart/AreaChart.tsx#L30) |
| `AreaChartCondensed` | value | Keep | 1 | [packages/react-ui-core/src/components/Charts/AreaChart/AreaChartCondensed.tsx:7](../../../packages/react-ui-core/src/components/Charts/AreaChart/AreaChartCondensed.tsx#L7) |
| `AreaChartCondensedProps` | type | Keep type | 0 | [packages/react-ui-core/src/components/Charts/AreaChart/AreaChartCondensed.tsx:4](../../../packages/react-ui-core/src/components/Charts/AreaChart/AreaChartCondensed.tsx#L4) |
| `AreaChartData` | type | Keep type | 0 | [packages/react-ui-core/src/components/Charts/AreaChart/types.ts:3](../../../packages/react-ui-core/src/components/Charts/AreaChart/types.ts#L3) |
| `AreaChartProps` | type | Keep type | 0 | [packages/react-ui-core/src/components/Charts/AreaChart/types.ts:7](../../../packages/react-ui-core/src/components/Charts/AreaChart/types.ts#L7) |
| `AreaChartVariant` | type | Keep type | 0 | [packages/react-ui-core/src/components/Charts/AreaChart/types.ts:5](../../../packages/react-ui-core/src/components/Charts/AreaChart/types.ts#L5) |
| `BarChart` | value | Keep | 0 | [packages/react-ui-core/src/components/Charts/BarChart/BarChart.tsx:32](../../../packages/react-ui-core/src/components/Charts/BarChart/BarChart.tsx#L32) |
| `BarChartCondensed` | value | Keep | 1 | [packages/react-ui-core/src/components/Charts/BarChart/BarChartCondensed.tsx:10](../../../packages/react-ui-core/src/components/Charts/BarChart/BarChartCondensed.tsx#L10) |
| `BarChartCondensedProps` | type | Keep type | 0 | [packages/react-ui-core/src/components/Charts/BarChart/BarChartCondensed.tsx:4](../../../packages/react-ui-core/src/components/Charts/BarChart/BarChartCondensed.tsx#L4) |
| `BarChartData` | type | Keep type | 0 | [packages/react-ui-core/src/components/Charts/BarChart/types.ts:3](../../../packages/react-ui-core/src/components/Charts/BarChart/types.ts#L3) |
| `BarChartOrientation` | type | Keep type | 0 | [packages/react-ui-core/src/components/Charts/BarChart/types.ts:7](../../../packages/react-ui-core/src/components/Charts/BarChart/types.ts#L7) |
| `BarChartProps` | type | Keep type | 0 | [packages/react-ui-core/src/components/Charts/BarChart/types.ts:9](../../../packages/react-ui-core/src/components/Charts/BarChart/types.ts#L9) |
| `BarChartVariant` | type | Keep type | 0 | [packages/react-ui-core/src/components/Charts/BarChart/types.ts:5](../../../packages/react-ui-core/src/components/Charts/BarChart/types.ts#L5) |
| `BaseChartProps` | type | Keep type | 0 | [packages/react-ui-core/src/components/Charts/types/common.ts:13](../../../packages/react-ui-core/src/components/Charts/types/common.ts#L13) |
| `black` | value | Keep | 0 | [packages/react-ui-core/src/components/ThemeProvider/swatches.ts:346](../../../packages/react-ui-core/src/components/ThemeProvider/swatches.ts#L346) |
| `BrandSwatchName` | type | Keep type | 0 | [packages/react-ui-core/src/components/ThemeProvider/swatches.ts:432](../../../packages/react-ui-core/src/components/ThemeProvider/swatches.ts#L432) |
| `Button` | value | Keep | 1 | [packages/react-ui-core/src/components/Button/Button.tsx:39](../../../packages/react-ui-core/src/components/Button/Button.tsx#L39) |
| `ButtonProps` | type | Keep type | 0 | [packages/react-ui-core/src/components/Button/Button.tsx:12](../../../packages/react-ui-core/src/components/Button/Button.tsx#L12) |
| `Buttons` | value | Keep | 1 | [packages/react-ui-core/src/components/Buttons/Buttons.tsx:25](../../../packages/react-ui-core/src/components/Buttons/Buttons.tsx#L25) |
| `ButtonsProps` | type | Keep type | 1 | [packages/react-ui-core/src/components/Buttons/Buttons.tsx:12](../../../packages/react-ui-core/src/components/Buttons/Buttons.tsx#L12) |
| `calculateScatterDomain` | value | Keep | 0 | [packages/react-ui-core/src/components/Charts/ScatterChart/utils/scatterChartUtils.ts:65](../../../packages/react-ui-core/src/components/Charts/ScatterChart/utils/scatterChartUtils.ts#L65) |
| `Calendar` | value | Keep | 0 | [packages/react-ui-core/src/components/Calendar/Calendar.tsx:14](../../../packages/react-ui-core/src/components/Calendar/Calendar.tsx#L14) |
| `CalendarHeatmap` | value | Keep | 0 | [packages/react-ui-core/src/components/Charts/CalendarHeatmap/CalendarHeatmap.tsx:23](../../../packages/react-ui-core/src/components/Charts/CalendarHeatmap/CalendarHeatmap.tsx#L23) |
| `CalendarHeatmapDatum` | type | Keep type | 0 | [packages/react-ui-core/src/components/Charts/CalendarHeatmap/types.ts:1](../../../packages/react-ui-core/src/components/Charts/CalendarHeatmap/types.ts#L1) |
| `CalendarHeatmapProps` | type | Keep type | 0 | [packages/react-ui-core/src/components/Charts/CalendarHeatmap/types.ts:57](../../../packages/react-ui-core/src/components/Charts/CalendarHeatmap/types.ts#L57) |
| `CalendarProps` | type | Keep type | 0 | [packages/react-ui-core/src/components/Calendar/Calendar.tsx:12](../../../packages/react-ui-core/src/components/Calendar/Calendar.tsx#L12) |
| `Callout` | value | Keep | 1 | [packages/react-ui-core/src/components/Callout/Callout.tsx:29](../../../packages/react-ui-core/src/components/Callout/Callout.tsx#L29) |
| `CalloutProps` | type | Keep type | 0 | [packages/react-ui-core/src/components/Callout/Callout.tsx:13](../../../packages/react-ui-core/src/components/Callout/Callout.tsx#L13) |
| `Card` | value | Keep | 1 | [packages/react-ui-core/src/components/Card/Card.tsx:27](../../../packages/react-ui-core/src/components/Card/Card.tsx#L27) |
| `CardHeader` | value | Keep | 1 | [packages/react-ui-core/src/components/CardHeader/CardHeader.tsx:20](../../../packages/react-ui-core/src/components/CardHeader/CardHeader.tsx#L20) |
| `CardHeaderProps` | type | Keep type | 0 | [packages/react-ui-core/src/components/CardHeader/CardHeader.tsx:10](../../../packages/react-ui-core/src/components/CardHeader/CardHeader.tsx#L10) |
| `CardProps` | type | Keep type | 0 | [packages/react-ui-core/src/components/Card/Card.tsx:11](../../../packages/react-ui-core/src/components/Card/Card.tsx#L11) |
| `CardSource` | type | Keep type | 0 | [packages/react-ui-core/src/components/Sources/SourceContext.tsx:11](../../../packages/react-ui-core/src/components/Sources/SourceContext.tsx#L11) |
| `CardSourceContext` | value | Keep | 0 | [packages/react-ui-core/src/components/Sources/SourceContext.tsx:26](../../../packages/react-ui-core/src/components/Sources/SourceContext.tsx#L26) |
| `CardSourceProvider` | value | Keep | 1 | [packages/react-ui-core/src/components/Sources/SourceContext.tsx:52](../../../packages/react-ui-core/src/components/Sources/SourceContext.tsx#L52) |
| `CardSourceSchema` | value | Keep | 1 | [packages/react-ui-core/src/components/Sources/SourceContext.tsx:5](../../../packages/react-ui-core/src/components/Sources/SourceContext.tsx#L5) |
| `Carousel` | value | Keep | 1 | [packages/react-ui-core/src/components/Carousel/Carousel.tsx:49](../../../packages/react-ui-core/src/components/Carousel/Carousel.tsx#L49) |
| `CarouselContent` | value | Keep | 1 | [packages/react-ui-core/src/components/Carousel/Carousel.tsx:196](../../../packages/react-ui-core/src/components/Carousel/Carousel.tsx#L196) |
| `CarouselItem` | value | Keep | 1 | [packages/react-ui-core/src/components/Carousel/Carousel.tsx:226](../../../packages/react-ui-core/src/components/Carousel/Carousel.tsx#L226) |
| `CarouselNext` | value | Keep | 1 | [packages/react-ui-core/src/components/Carousel/Carousel.tsx:259](../../../packages/react-ui-core/src/components/Carousel/Carousel.tsx#L259) |
| `CarouselPrevious` | value | Keep | 1 | [packages/react-ui-core/src/components/Carousel/Carousel.tsx:234](../../../packages/react-ui-core/src/components/Carousel/Carousel.tsx#L234) |
| `CarouselProps` | type | Keep type | 0 | [packages/react-ui-core/src/components/Carousel/Carousel.tsx:35](../../../packages/react-ui-core/src/components/Carousel/Carousel.tsx#L35) |
| `CarouselRef` | type | Keep type | 0 | [packages/react-ui-core/src/components/Carousel/Carousel.tsx:44](../../../packages/react-ui-core/src/components/Carousel/Carousel.tsx#L44) |
| `CHART_CLASS_PREFIX` | value | Keep | 0 | [packages/react-ui-core/src/components/Charts/utils/constants.ts:11](../../../packages/react-ui-core/src/components/Charts/utils/constants.ts#L11) |
| `CHART_PALETTE_KEYS` | value | Keep | 0 | [packages/react-ui-core/src/components/ThemeProvider/types.ts:12](../../../packages/react-ui-core/src/components/ThemeProvider/types.ts#L12) |
| `ChartColorPalette` | type | Keep type | 0 | [packages/react-ui-core/src/components/ThemeProvider/types.ts:25](../../../packages/react-ui-core/src/components/ThemeProvider/types.ts#L25) |
| `ChartData` | type | Keep type | 0 | [packages/react-ui-core/src/components/Charts/types/common.ts:11](../../../packages/react-ui-core/src/components/Charts/types/common.ts#L11) |
| `ChartPaletteKey` | type | Keep type | 0 | [packages/react-ui-core/src/components/ThemeProvider/types.ts:23](../../../packages/react-ui-core/src/components/ThemeProvider/types.ts#L23) |
| `CheckBoxGroup` | value | Keep | 1 | [packages/react-ui-core/src/components/CheckBoxGroup/CheckBoxGroup.tsx:24](../../../packages/react-ui-core/src/components/CheckBoxGroup/CheckBoxGroup.tsx#L24) |
| `CheckBoxGroupProps` | type | Keep type | 0 | [packages/react-ui-core/src/components/CheckBoxGroup/CheckBoxGroup.tsx:11](../../../packages/react-ui-core/src/components/CheckBoxGroup/CheckBoxGroup.tsx#L11) |
| `CheckBoxItem` | value | Keep | 1 | [packages/react-ui-core/src/components/CheckBoxItem/CheckBoxItem.tsx:23](../../../packages/react-ui-core/src/components/CheckBoxItem/CheckBoxItem.tsx#L23) |
| `CheckBoxItemProps` | type | Keep type | 0 | [packages/react-ui-core/src/components/CheckBoxItem/CheckBoxItem.tsx:9](../../../packages/react-ui-core/src/components/CheckBoxItem/CheckBoxItem.tsx#L9) |
| `Chips` | value | Keep | 1 | [packages/react-ui-core/src/components/Chips/Chips.tsx:28](../../../packages/react-ui-core/src/components/Chips/Chips.tsx#L28) |
| `ChipsItem` | type | Keep type | 0 | [packages/react-ui-core/src/components/Chips/Chips.tsx:10](../../../packages/react-ui-core/src/components/Chips/Chips.tsx#L10) |
| `ChipsProps` | type | Keep type | 0 | [packages/react-ui-core/src/components/Chips/Chips.tsx:17](../../../packages/react-ui-core/src/components/Chips/Chips.tsx#L17) |
| `ChipsSelectionType` | type | Keep type | 0 | [packages/react-ui-core/src/components/Chips/Chips.tsx:8](../../../packages/react-ui-core/src/components/Chips/Chips.tsx#L8) |
| `Citation` | value | Keep | 0 | [packages/react-ui-core/src/components/Citation/Citation.tsx:80](../../../packages/react-ui-core/src/components/Citation/Citation.tsx#L80) |
| `CitationItem` | value | Keep | 0 | [packages/react-ui-core/src/components/Citation/CitationItem.tsx:11](../../../packages/react-ui-core/src/components/Citation/CitationItem.tsx#L11) |
| `CitationItemProps` | type | Keep type | 0 | [packages/react-ui-core/src/components/Citation/CitationItem.tsx:7](../../../packages/react-ui-core/src/components/Citation/CitationItem.tsx#L7) |
| `CitationProps` | type | Keep type | 0 | [packages/react-ui-core/src/components/Citation/Citation.tsx:11](../../../packages/react-ui-core/src/components/Citation/Citation.tsx#L11) |
| `CodeBlock` | value | Keep | 1 | [packages/react-ui-core/src/components/CodeBlock/CodeBlock.tsx:17](../../../packages/react-ui-core/src/components/CodeBlock/CodeBlock.tsx#L17) |
| `CodeBlockProps` | type | Keep type | 0 | [packages/react-ui-core/src/components/CodeBlock/CodeBlock.tsx:9](../../../packages/react-ui-core/src/components/CodeBlock/CodeBlock.tsx#L9) |
| `ColorTheme` | type | Keep type | 0 | [packages/react-ui-core/src/components/ThemeProvider/types.ts:34](../../../packages/react-ui-core/src/components/ThemeProvider/types.ts#L34) |
| `CompositeCard` | value | Keep | 0 | [packages/react-ui-core/src/components/CompositeCardBlock/CompositeCardBlock.tsx:24](../../../packages/react-ui-core/src/components/CompositeCardBlock/CompositeCardBlock.tsx#L24) |
| `CompositeCardBlock` | value | Keep | 1 | [packages/react-ui-core/src/components/CompositeCardBlock/CompositeCardBlock.tsx:77](../../../packages/react-ui-core/src/components/CompositeCardBlock/CompositeCardBlock.tsx#L77) |
| `CompositeCardBlockItem` | type | Keep type | 0 | [packages/react-ui-core/src/components/CompositeCardBlock/CompositeCardBlock.tsx:6](../../../packages/react-ui-core/src/components/CompositeCardBlock/CompositeCardBlock.tsx#L6) |
| `CompositeCardBlockProps` | type | Keep type | 0 | [packages/react-ui-core/src/components/CompositeCardBlock/CompositeCardBlock.tsx:64](../../../packages/react-ui-core/src/components/CompositeCardBlock/CompositeCardBlock.tsx#L64) |
| `CompositeCardProps` | type | Keep type | 0 | [packages/react-ui-core/src/components/CompositeCardBlock/CompositeCardBlock.tsx:16](../../../packages/react-ui-core/src/components/CompositeCardBlock/CompositeCardBlock.tsx#L16) |
| `ContextCard` | value | Keep | 0 | [packages/react-ui-core/src/components/ContextCardBlock/ContextCardBlock.tsx:31](../../../packages/react-ui-core/src/components/ContextCardBlock/ContextCardBlock.tsx#L31) |
| `ContextCardBgColor` | type | Keep type | 0 | [packages/react-ui-core/src/components/ContextCardBlock/ContextCardBlock.tsx:9](../../../packages/react-ui-core/src/components/ContextCardBlock/ContextCardBlock.tsx#L9) |
| `ContextCardBlock` | value | Keep | 1 | [packages/react-ui-core/src/components/ContextCardBlock/ContextCardBlock.tsx:100](../../../packages/react-ui-core/src/components/ContextCardBlock/ContextCardBlock.tsx#L100) |
| `ContextCardBlockItem` | type | Keep type | 0 | [packages/react-ui-core/src/components/ContextCardBlock/ContextCardBlock.tsx:11](../../../packages/react-ui-core/src/components/ContextCardBlock/ContextCardBlock.tsx#L11) |
| `ContextCardBlockProps` | type | Keep type | 0 | [packages/react-ui-core/src/components/ContextCardBlock/ContextCardBlock.tsx:87](../../../packages/react-ui-core/src/components/ContextCardBlock/ContextCardBlock.tsx#L87) |
| `ContextCardProps` | type | Keep type | 0 | [packages/react-ui-core/src/components/ContextCardBlock/ContextCardBlock.tsx:23](../../../packages/react-ui-core/src/components/ContextCardBlock/ContextCardBlock.tsx#L23) |
| `createTheme` | value | Keep | 0 | [packages/react-ui-core/src/components/ThemeProvider/utils.ts:81](../../../packages/react-ui-core/src/components/ThemeProvider/utils.ts#L81) |
| `DatePicker` | value | Keep | 1 | [packages/react-ui-core/src/components/DatePicker/DatePicker.tsx:19](../../../packages/react-ui-core/src/components/DatePicker/DatePicker.tsx#L19) |
| `DatePickerProps` | type | Keep type | 0 | [packages/react-ui-core/src/components/DatePicker/DatePicker.tsx:7](../../../packages/react-ui-core/src/components/DatePicker/DatePicker.tsx#L7) |
| `defaultDarkTheme` | value | Keep | 0 | [packages/react-ui-core/src/components/ThemeProvider/defaultTheme.ts:530](../../../packages/react-ui-core/src/components/ThemeProvider/defaultTheme.ts#L530) |
| `defaultLightTheme` | value | Keep | 0 | [packages/react-ui-core/src/components/ThemeProvider/defaultTheme.ts:516](../../../packages/react-ui-core/src/components/ThemeProvider/defaultTheme.ts#L516) |
| `DotMatrixLoader` | value | Keep | 0 | [packages/react-ui-core/src/components/DotMatrixLoader/DotMatrixLoader.tsx:48](../../../packages/react-ui-core/src/components/DotMatrixLoader/DotMatrixLoader.tsx#L48) |
| `DotMatrixLoaderVariant` | type | Keep type | 0 | [packages/react-ui-core/src/components/DotMatrixLoader/DotMatrixLoader.tsx:46](../../../packages/react-ui-core/src/components/DotMatrixLoader/DotMatrixLoader.tsx#L46) |
| `EditableCellType` | type | Keep type | 0 | [packages/react-ui-core/src/components/EditableTable/base/components/CellTypes.ts:3](../../../packages/react-ui-core/src/components/EditableTable/base/components/CellTypes.ts#L3) |
| `EditableTable` | value | Keep | 1 | [packages/react-ui-core/src/components/EditableTable/EditableTable.tsx:136](../../../packages/react-ui-core/src/components/EditableTable/EditableTable.tsx#L136) |
| `EditableTableChangesBar` | value | Keep | 1 | [packages/react-ui-core/src/components/EditableTable/EditableTable.tsx:486](../../../packages/react-ui-core/src/components/EditableTable/EditableTable.tsx#L486) |
| `EditableTableChangesBarProps` | type | Keep type | 0 | [packages/react-ui-core/src/components/EditableTable/EditableTable.tsx:472](../../../packages/react-ui-core/src/components/EditableTable/EditableTable.tsx#L472) |
| `EditableTableColumn` | type | Keep type | 0 | [packages/react-ui-core/src/components/EditableTable/EditableTable.tsx:51](../../../packages/react-ui-core/src/components/EditableTable/EditableTable.tsx#L51) |
| `EditableTableProps` | type | Keep type | 0 | [packages/react-ui-core/src/components/EditableTable/EditableTable.tsx:60](../../../packages/react-ui-core/src/components/EditableTable/EditableTable.tsx#L60) |
| `EditableTableRow` | type | Keep type | 1 | [packages/react-ui-core/src/components/EditableTable/EditableTable.tsx:46](../../../packages/react-ui-core/src/components/EditableTable/EditableTable.tsx#L46) |
| `EffectTheme` | type | Keep type | 0 | [packages/react-ui-core/src/components/ThemeProvider/types.ts:319](../../../packages/react-ui-core/src/components/ThemeProvider/types.ts#L319) |
| `EntityList` | value | Keep | 1 | [packages/react-ui-core/src/components/EntityList/EntityList.tsx:52](../../../packages/react-ui-core/src/components/EntityList/EntityList.tsx#L52) |
| `EntityListProps` | type | Keep type | 0 | [packages/react-ui-core/src/components/EntityList/EntityList.tsx:14](../../../packages/react-ui-core/src/components/EntityList/EntityList.tsx#L14) |
| `EntityListRow` | type | Keep type | 0 | [packages/react-ui-core/src/components/EntityList/EntityList.tsx:6](../../../packages/react-ui-core/src/components/EntityList/EntityList.tsx#L6) |
| `EntityListSize` | type | Keep type | 0 | [packages/react-ui-core/src/components/EntityList/EntityList.tsx:12](../../../packages/react-ui-core/src/components/EntityList/EntityList.tsx#L12) |
| `ExportChartData` | type | Keep type | 0 | [packages/react-ui-core/src/components/Charts/types/exportChartData.ts:4](../../../packages/react-ui-core/src/components/Charts/types/exportChartData.ts#L4) |
| `FoldableSectionContent` | value | Keep | 1 | [packages/react-ui-core/src/components/SectionBlock/FoldableSection.tsx:108](../../../packages/react-ui-core/src/components/SectionBlock/FoldableSection.tsx#L108) |
| `FoldableSectionContentProps` | type | Keep type | 0 | [packages/react-ui-core/src/components/SectionBlock/FoldableSection.tsx:100](../../../packages/react-ui-core/src/components/SectionBlock/FoldableSection.tsx#L100) |
| `FoldableSectionItem` | value | Keep | 1 | [packages/react-ui-core/src/components/SectionBlock/FoldableSection.tsx:45](../../../packages/react-ui-core/src/components/SectionBlock/FoldableSection.tsx#L45) |
| `FoldableSectionItemProps` | type | Keep type | 0 | [packages/react-ui-core/src/components/SectionBlock/FoldableSection.tsx:37](../../../packages/react-ui-core/src/components/SectionBlock/FoldableSection.tsx#L37) |
| `FoldableSectionRoot` | value | Keep | 1 | [packages/react-ui-core/src/components/SectionBlock/FoldableSection.tsx:24](../../../packages/react-ui-core/src/components/SectionBlock/FoldableSection.tsx#L24) |
| `FoldableSectionRootProps` | type | Keep type | 0 | [packages/react-ui-core/src/components/SectionBlock/FoldableSection.tsx:22](../../../packages/react-ui-core/src/components/SectionBlock/FoldableSection.tsx#L22) |
| `FoldableSectionTrigger` | value | Keep | 1 | [packages/react-ui-core/src/components/SectionBlock/FoldableSection.tsx:67](../../../packages/react-ui-core/src/components/SectionBlock/FoldableSection.tsx#L67) |
| `FoldableSectionTriggerProps` | type | Keep type | 0 | [packages/react-ui-core/src/components/SectionBlock/FoldableSection.tsx:59](../../../packages/react-ui-core/src/components/SectionBlock/FoldableSection.tsx#L59) |
| `formatScatterTooltipValue` | value | Keep | 0 | [packages/react-ui-core/src/components/Charts/ScatterChart/utils/scatterChartUtils.ts:91](../../../packages/react-ui-core/src/components/Charts/ScatterChart/utils/scatterChartUtils.ts#L91) |
| `FormControl` | value | Keep | 1 | [packages/react-ui-core/src/components/FormControl/FormControl.tsx:15](../../../packages/react-ui-core/src/components/FormControl/FormControl.tsx#L15) |
| `FormControlProps` | type | Keep type | 0 | [packages/react-ui-core/src/components/FormControl/FormControl.tsx:8](../../../packages/react-ui-core/src/components/FormControl/FormControl.tsx#L8) |
| `FunnelChart` | value | Keep | 0 | [packages/react-ui-core/src/components/Charts/FunnelChart/FunnelChart.tsx:17](../../../packages/react-ui-core/src/components/Charts/FunnelChart/FunnelChart.tsx#L17) |
| `FunnelChartData` | type | Keep type | 0 | [packages/react-ui-core/src/components/Charts/FunnelChart/types.ts:5](../../../packages/react-ui-core/src/components/Charts/FunnelChart/types.ts#L5) |
| `FunnelChartProps` | type | Keep type | 0 | [packages/react-ui-core/src/components/Charts/FunnelChart/types.ts:7](../../../packages/react-ui-core/src/components/Charts/FunnelChart/types.ts#L7) |
| `FunnelEdges` | type | Keep type | 0 | [packages/react-ui-core/src/components/Charts/FunnelChart/parts/funnelGeometry.ts:6](../../../packages/react-ui-core/src/components/Charts/FunnelChart/parts/funnelGeometry.ts#L6) |
| `FunnelOrientation` | type | Keep type | 0 | [packages/react-ui-core/src/components/Charts/FunnelChart/parts/funnelGeometry.ts:5](../../../packages/react-ui-core/src/components/Charts/FunnelChart/parts/funnelGeometry.ts#L5) |
| `GalleryModal` | value | Keep | 0 | [packages/react-ui-core/src/components/ImageGallery/GalleryModal.tsx:30](../../../packages/react-ui-core/src/components/ImageGallery/GalleryModal.tsx#L30) |
| `GalleryModalProps` | type | Keep type | 0 | [packages/react-ui-core/src/components/ImageGallery/GalleryModal.tsx:23](../../../packages/react-ui-core/src/components/ImageGallery/GalleryModal.tsx#L23) |
| `getFaviconUrl` | value | Keep (legacy public) | 0 | [packages/react-ui-core/src/components/Sources/SourceContext.tsx:35](../../../packages/react-ui-core/src/components/Sources/SourceContext.tsx#L35) |
| `getScatterDatasets` | value | Keep | 0 | [packages/react-ui-core/src/components/Charts/ScatterChart/utils/scatterChartUtils.ts:8](../../../packages/react-ui-core/src/components/Charts/ScatterChart/utils/scatterChartUtils.ts#L8) |
| `HeatmapChart` | value | Keep | 0 | [packages/react-ui-core/src/components/Charts/HeatmapChart/HeatmapChart.tsx:17](../../../packages/react-ui-core/src/components/Charts/HeatmapChart/HeatmapChart.tsx#L17) |
| `HeatmapChartData` | type | Keep type | 0 | [packages/react-ui-core/src/components/Charts/HeatmapChart/types.ts:4](../../../packages/react-ui-core/src/components/Charts/HeatmapChart/types.ts#L4) |
| `HeatmapChartProps` | type | Keep type | 0 | [packages/react-ui-core/src/components/Charts/HeatmapChart/types.ts:6](../../../packages/react-ui-core/src/components/Charts/HeatmapChart/types.ts#L6) |
| `Hint` | value | Keep | 1 | [packages/react-ui-core/src/components/FormControl/Hint/Hint.tsx:16](../../../packages/react-ui-core/src/components/FormControl/Hint/Hint.tsx#L16) |
| `HintProps` | type | Keep type | 0 | [packages/react-ui-core/src/components/FormControl/Hint/Hint.tsx:9](../../../packages/react-ui-core/src/components/FormControl/Hint/Hint.tsx#L9) |
| `HorizontalBarChart` | value | Keep | 1 | [packages/react-ui-core/src/components/Charts/BarChart/HorizontalBarChart.tsx:12](../../../packages/react-ui-core/src/components/Charts/BarChart/HorizontalBarChart.tsx#L12) |
| `HorizontalBarChartData` | type | Keep type | 0 | [packages/react-ui-core/src/components/Charts/BarChart/HorizontalBarChart.tsx:4](../../../packages/react-ui-core/src/components/Charts/BarChart/HorizontalBarChart.tsx#L4) |
| `HorizontalBarChartProps` | type | Keep type | 0 | [packages/react-ui-core/src/components/Charts/BarChart/HorizontalBarChart.tsx:6](../../../packages/react-ui-core/src/components/Charts/BarChart/HorizontalBarChart.tsx#L6) |
| `HorizontalBarChartVariant` | type | Keep type | 0 | [packages/react-ui-core/src/components/Charts/BarChart/HorizontalBarChart.tsx:5](../../../packages/react-ui-core/src/components/Charts/BarChart/HorizontalBarChart.tsx#L5) |
| `IconButton` | value | Keep | 2 | [packages/react-ui-core/src/components/IconButton/IconButton.tsx:56](../../../packages/react-ui-core/src/components/IconButton/IconButton.tsx#L56) |
| `IconButtonProps` | type | Keep type | 0 | [packages/react-ui-core/src/components/IconButton/IconButton.tsx:15](../../../packages/react-ui-core/src/components/IconButton/IconButton.tsx#L15) |
| `IconTag` | value | Keep | 0 | [packages/react-ui-core/src/components/IconTag/IconTag.tsx:17](../../../packages/react-ui-core/src/components/IconTag/IconTag.tsx#L17) |
| `IconTagProps` | type | Keep type | 0 | [packages/react-ui-core/src/components/IconTag/IconTag.tsx:9](../../../packages/react-ui-core/src/components/IconTag/IconTag.tsx#L9) |
| `IconTagSize` | type | Keep type | 0 | [packages/react-ui-core/src/components/IconTag/IconTag.tsx:6](../../../packages/react-ui-core/src/components/IconTag/IconTag.tsx#L6) |
| `IconTagVariant` | type | Keep type | 0 | [packages/react-ui-core/src/components/IconTag/IconTag.tsx:7](../../../packages/react-ui-core/src/components/IconTag/IconTag.tsx#L7) |
| `IconText` | value | Keep | 1 | [packages/react-ui-core/src/components/IconText/IconText.tsx:32](../../../packages/react-ui-core/src/components/IconText/IconText.tsx#L32) |
| `IconTextIconVariant` | type | Keep type | 0 | [packages/react-ui-core/src/components/IconText/IconText.tsx:8](../../../packages/react-ui-core/src/components/IconText/IconText.tsx#L8) |
| `IconTextLayout` | type | Keep type | 0 | [packages/react-ui-core/src/components/IconText/IconText.tsx:9](../../../packages/react-ui-core/src/components/IconText/IconText.tsx#L9) |
| `IconTextProps` | type | Keep type | 0 | [packages/react-ui-core/src/components/IconText/IconText.tsx:11](../../../packages/react-ui-core/src/components/IconText/IconText.tsx#L11) |
| `IconWrapper` | value | Keep | 4 | [packages/react-ui-core/src/components/_shared/icons/IconWrapper.tsx:15](../../../packages/react-ui-core/src/components/_shared/icons/IconWrapper.tsx#L15) |
| `IconWrapperProps` | type | Keep type | 0 | [packages/react-ui-core/src/components/_shared/icons/IconWrapper.tsx:8](../../../packages/react-ui-core/src/components/_shared/icons/IconWrapper.tsx#L8) |
| `Image` | value | Keep | 1 | [packages/react-ui-core/src/components/Image/Image.tsx:31](../../../packages/react-ui-core/src/components/Image/Image.tsx#L31) |
| `ImageBlock` | value | Keep | 1 | [packages/react-ui-core/src/components/ImageBlock/ImageBlock.tsx:19](../../../packages/react-ui-core/src/components/ImageBlock/ImageBlock.tsx#L19) |
| `ImageBlockProps` | type | Keep type | 0 | [packages/react-ui-core/src/components/ImageBlock/ImageBlock.tsx:13](../../../packages/react-ui-core/src/components/ImageBlock/ImageBlock.tsx#L13) |
| `ImageGallery` | value | Keep | 1 | [packages/react-ui-core/src/components/ImageGallery/ImageGallery.tsx:40](../../../packages/react-ui-core/src/components/ImageGallery/ImageGallery.tsx#L40) |
| `ImageItem` | type | Keep type | 0 | [packages/react-ui-core/src/components/ImageGallery/ImageGallery.tsx:14](../../../packages/react-ui-core/src/components/ImageGallery/ImageGallery.tsx#L14) |
| `ImageProps` | type | Keep type | 0 | [packages/react-ui-core/src/components/Image/Image.tsx:9](../../../packages/react-ui-core/src/components/Image/Image.tsx#L9) |
| `ImageText` | value | Keep | 1 | [packages/react-ui-core/src/components/ImageText/ImageText.tsx:27](../../../packages/react-ui-core/src/components/ImageText/ImageText.tsx#L27) |
| `ImageTextLarge` | value | Keep | 1 | [packages/react-ui-core/src/components/ImageTextLarge/ImageTextLarge.tsx:15](../../../packages/react-ui-core/src/components/ImageTextLarge/ImageTextLarge.tsx#L15) |
| `ImageTextLargeProps` | type | Keep type | 0 | [packages/react-ui-core/src/components/ImageTextLarge/ImageTextLarge.tsx:6](../../../packages/react-ui-core/src/components/ImageTextLarge/ImageTextLarge.tsx#L6) |
| `ImageTextLayout` | type | Keep type | 0 | [packages/react-ui-core/src/components/ImageText/ImageText.tsx:12](../../../packages/react-ui-core/src/components/ImageText/ImageText.tsx#L12) |
| `ImageTextProps` | type | Keep type | 0 | [packages/react-ui-core/src/components/ImageText/ImageText.tsx:14](../../../packages/react-ui-core/src/components/ImageText/ImageText.tsx#L14) |
| `InlineHeader` | value | Keep | 1 | [packages/react-ui-core/src/components/InlineHeader/InlineHeader.tsx:11](../../../packages/react-ui-core/src/components/InlineHeader/InlineHeader.tsx#L11) |
| `InlineHeaderProps` | type | Keep type | 0 | [packages/react-ui-core/src/components/InlineHeader/InlineHeader.tsx:5](../../../packages/react-ui-core/src/components/InlineHeader/InlineHeader.tsx#L5) |
| `InlineMarkdownRenderer` | value | Keep | 0 | [packages/react-ui-core/src/components/InlineMarkdownRenderer/InlineMarkdownRenderer.tsx:23](../../../packages/react-ui-core/src/components/InlineMarkdownRenderer/InlineMarkdownRenderer.tsx#L23) |
| `InlineMarkdownRendererProps` | type | Keep type | 0 | [packages/react-ui-core/src/components/InlineMarkdownRenderer/InlineMarkdownRenderer.tsx:13](../../../packages/react-ui-core/src/components/InlineMarkdownRenderer/InlineMarkdownRenderer.tsx#L13) |
| `Input` | value | Keep | 1 | [packages/react-ui-core/src/components/Input/Input.tsx:22](../../../packages/react-ui-core/src/components/Input/Input.tsx#L22) |
| `InputProps` | type | Keep type | 0 | [packages/react-ui-core/src/components/Input/Input.tsx:9](../../../packages/react-ui-core/src/components/Input/Input.tsx#L9) |
| `Label` | value | Keep | 2 | [packages/react-ui-core/src/components/Label/Label.tsx:17](../../../packages/react-ui-core/src/components/Label/Label.tsx#L17) |
| `LabelProps` | type | Keep type | 0 | [packages/react-ui-core/src/components/Label/Label.tsx:9](../../../packages/react-ui-core/src/components/Label/Label.tsx#L9) |
| `LayoutContext` | value | Keep | 0 | [packages/react-ui-core/src/context/LayoutContext.tsx:3](../../../packages/react-ui-core/src/context/LayoutContext.tsx#L3) |
| `LayoutContextProvider` | value | Keep | 0 | [packages/react-ui-core/src/context/LayoutContext.tsx:7](../../../packages/react-ui-core/src/context/LayoutContext.tsx#L7) |
| `LayoutTheme` | type | Keep type | 0 | [packages/react-ui-core/src/components/ThemeProvider/types.ts:149](../../../packages/react-ui-core/src/components/ThemeProvider/types.ts#L149) |
| `LegendEntry` | type | Keep type | 0 | [packages/react-ui-core/src/components/Charts/shared/core/legend/types.ts:8](../../../packages/react-ui-core/src/components/Charts/shared/core/legend/types.ts#L8) |
| `LegendItem` | type | Keep type | 0 | [packages/react-ui-core/src/components/Charts/types/common.ts:1](../../../packages/react-ui-core/src/components/Charts/types/common.ts#L1) |
| `LegendStoreProvider` | value | Keep | 0 | [packages/react-ui-core/src/components/Charts/shared/core/legend/LegendStoreProvider.tsx:35](../../../packages/react-ui-core/src/components/Charts/shared/core/legend/LegendStoreProvider.tsx#L35) |
| `LineChart` | value | Keep | 0 | [packages/react-ui-core/src/components/Charts/LineChart/LineChart.tsx:29](../../../packages/react-ui-core/src/components/Charts/LineChart/LineChart.tsx#L29) |
| `LineChartCondensed` | value | Keep | 1 | [packages/react-ui-core/src/components/Charts/LineChart/LineChartCondensed.tsx:7](../../../packages/react-ui-core/src/components/Charts/LineChart/LineChartCondensed.tsx#L7) |
| `LineChartCondensedProps` | type | Keep type | 0 | [packages/react-ui-core/src/components/Charts/LineChart/LineChartCondensed.tsx:4](../../../packages/react-ui-core/src/components/Charts/LineChart/LineChartCondensed.tsx#L4) |
| `LineChartData` | type | Keep type | 0 | [packages/react-ui-core/src/components/Charts/LineChart/types.ts:3](../../../packages/react-ui-core/src/components/Charts/LineChart/types.ts#L3) |
| `LineChartProps` | type | Keep type | 0 | [packages/react-ui-core/src/components/Charts/LineChart/types.ts:7](../../../packages/react-ui-core/src/components/Charts/LineChart/types.ts#L7) |
| `LineChartVariant` | type | Keep type | 0 | [packages/react-ui-core/src/components/Charts/LineChart/types.ts:5](../../../packages/react-ui-core/src/components/Charts/LineChart/types.ts#L5) |
| `ListBlock` | value | Keep | 1 | [packages/react-ui-core/src/components/ListBlock/ListBlock.tsx:23](../../../packages/react-ui-core/src/components/ListBlock/ListBlock.tsx#L23) |
| `ListBlockProps` | type | Keep type | 0 | [packages/react-ui-core/src/components/ListBlock/ListBlock.tsx:13](../../../packages/react-ui-core/src/components/ListBlock/ListBlock.tsx#L13) |
| `ListedSourceItem` | value | Keep | 0 | [packages/react-ui-core/src/components/Sources/SourcesItem.tsx:12](../../../packages/react-ui-core/src/components/Sources/SourcesItem.tsx#L12) |
| `ListedSources` | value | Keep | 0 | [packages/react-ui-core/src/components/Sources/ListedSources.tsx:20](../../../packages/react-ui-core/src/components/Sources/ListedSources.tsx#L20) |
| `ListedSourcesProps` | type | Keep type | 0 | [packages/react-ui-core/src/components/Sources/ListedSources.tsx:16](../../../packages/react-ui-core/src/components/Sources/ListedSources.tsx#L16) |
| `ListItem` | value | Keep | 1 | [packages/react-ui-core/src/components/ListItem/ListItem.tsx:24](../../../packages/react-ui-core/src/components/ListItem/ListItem.tsx#L24) |
| `ListItemProps` | type | Keep type | 0 | [packages/react-ui-core/src/components/ListItem/ListItem.tsx:8](../../../packages/react-ui-core/src/components/ListItem/ListItem.tsx#L8) |
| `ListItemSize` | type | Keep type | 0 | [packages/react-ui-core/src/components/ListItem/ListItem.tsx:6](../../../packages/react-ui-core/src/components/ListItem/ListItem.tsx#L6) |
| `ListItemVariant` | type | Keep type | 0 | [packages/react-ui-core/src/components/ListItem/ListItem.tsx:5](../../../packages/react-ui-core/src/components/ListItem/ListItem.tsx#L5) |
| `MarkDownRenderer` | value | Keep | 3 | [packages/react-ui-core/src/components/MarkDownRenderer/MarkDownRenderer.tsx:48](../../../packages/react-ui-core/src/components/MarkDownRenderer/MarkDownRenderer.tsx#L48) |
| `MarkDownRendererProps` | type | Keep type | 0 | [packages/react-ui-core/src/components/MarkDownRenderer/MarkDownRenderer.tsx:41](../../../packages/react-ui-core/src/components/MarkDownRenderer/MarkDownRenderer.tsx#L41) |
| `MetricIndicatorInline` | value | Keep | 1 | [packages/react-ui-core/src/components/MetricIndicator/MetricIndicator.tsx:82](../../../packages/react-ui-core/src/components/MetricIndicator/MetricIndicator.tsx#L82) |
| `MetricIndicatorInlineProps` | type | Keep type | 0 | [packages/react-ui-core/src/components/MetricIndicator/MetricIndicator.tsx:18](../../../packages/react-ui-core/src/components/MetricIndicator/MetricIndicator.tsx#L18) |
| `MetricIndicatorTrend` | type | Keep type | 0 | [packages/react-ui-core/src/components/MetricIndicator/MetricIndicator.tsx:5](../../../packages/react-ui-core/src/components/MetricIndicator/MetricIndicator.tsx#L5) |
| `MetricIndicatorWithStrikethrough` | value | Keep | 1 | [packages/react-ui-core/src/components/MetricIndicator/MetricIndicator.tsx:74](../../../packages/react-ui-core/src/components/MetricIndicator/MetricIndicator.tsx#L74) |
| `MetricIndicatorWithStrikethroughProps` | type | Keep type | 0 | [packages/react-ui-core/src/components/MetricIndicator/MetricIndicator.tsx:10](../../../packages/react-ui-core/src/components/MetricIndicator/MetricIndicator.tsx#L10) |
| `MiniAreaChart` | value | Keep | 0 | [packages/react-ui-core/src/components/Charts/MiniAreaChart/MiniAreaChart.tsx:21](../../../packages/react-ui-core/src/components/Charts/MiniAreaChart/MiniAreaChart.tsx#L21) |
| `MiniAreaChartData` | type | Keep type | 0 | [packages/react-ui-core/src/components/Charts/MiniAreaChart/types.ts:1](../../../packages/react-ui-core/src/components/Charts/MiniAreaChart/types.ts#L1) |
| `MiniAreaChartProps` | type | Keep type | 0 | [packages/react-ui-core/src/components/Charts/MiniAreaChart/types.ts:3](../../../packages/react-ui-core/src/components/Charts/MiniAreaChart/types.ts#L3) |
| `MiniBarChart` | value | Keep | 0 | [packages/react-ui-core/src/components/Charts/MiniBarChart/MiniBarChart.tsx:20](../../../packages/react-ui-core/src/components/Charts/MiniBarChart/MiniBarChart.tsx#L20) |
| `MiniBarChartData` | type | Keep type | 0 | [packages/react-ui-core/src/components/Charts/MiniBarChart/types.ts:1](../../../packages/react-ui-core/src/components/Charts/MiniBarChart/types.ts#L1) |
| `MiniBarChartProps` | type | Keep type | 0 | [packages/react-ui-core/src/components/Charts/MiniBarChart/types.ts:3](../../../packages/react-ui-core/src/components/Charts/MiniBarChart/types.ts#L3) |
| `MiniLineChart` | value | Keep | 0 | [packages/react-ui-core/src/components/Charts/MiniLineChart/MiniLineChart.tsx:19](../../../packages/react-ui-core/src/components/Charts/MiniLineChart/MiniLineChart.tsx#L19) |
| `MiniLineChartData` | type | Keep type | 0 | [packages/react-ui-core/src/components/Charts/MiniLineChart/types.ts:1](../../../packages/react-ui-core/src/components/Charts/MiniLineChart/types.ts#L1) |
| `MiniLineChartProps` | type | Keep type | 0 | [packages/react-ui-core/src/components/Charts/MiniLineChart/types.ts:3](../../../packages/react-ui-core/src/components/Charts/MiniLineChart/types.ts#L3) |
| `Modal` | value | Keep | 0 | [packages/react-ui-core/src/components/Modal/Modal.tsx:32](../../../packages/react-ui-core/src/components/Modal/Modal.tsx#L32) |
| `ModalProps` | type | Keep type | 0 | [packages/react-ui-core/src/components/Modal/Modal.tsx:18](../../../packages/react-ui-core/src/components/Modal/Modal.tsx#L18) |
| `NeutralSwatchName` | type | Keep type | 0 | [packages/react-ui-core/src/components/ThemeProvider/swatches.ts:430](../../../packages/react-ui-core/src/components/ThemeProvider/swatches.ts#L430) |
| `openSourceInNewTab` | value | Keep (legacy public) | 0 | [packages/react-ui-core/src/components/Sources/SourceContext.tsx:18](../../../packages/react-ui-core/src/components/Sources/SourceContext.tsx#L18) |
| `OpenUIGalleryProps` | type | Keep type | 0 | [packages/react-ui-core/src/components/ImageGallery/ImageGallery.tsx:20](../../../packages/react-ui-core/src/components/ImageGallery/ImageGallery.tsx#L20) |
| `OptionCards` | value | Keep | 1 | [packages/react-ui-core/src/components/OptionCards/OptionCards.tsx:32](../../../packages/react-ui-core/src/components/OptionCards/OptionCards.tsx#L32) |
| `OptionCardsItem` | type | Keep type | 0 | [packages/react-ui-core/src/components/OptionCards/OptionCards.tsx:9](../../../packages/react-ui-core/src/components/OptionCards/OptionCards.tsx#L9) |
| `OptionCardsProps` | type | Keep type | 0 | [packages/react-ui-core/src/components/OptionCards/OptionCards.tsx:21](../../../packages/react-ui-core/src/components/OptionCards/OptionCards.tsx#L21) |
| `OptionCardsSelectionType` | type | Keep type | 0 | [packages/react-ui-core/src/components/OptionCards/OptionCards.tsx:7](../../../packages/react-ui-core/src/components/OptionCards/OptionCards.tsx#L7) |
| `OverviewCardBlock` | value | Keep | 1 | [packages/react-ui-core/src/components/OverviewCardBlock/OverviewCardBlock.tsx:31](../../../packages/react-ui-core/src/components/OverviewCardBlock/OverviewCardBlock.tsx#L31) |
| `OverviewCardBlockItem` | type | Keep type | 0 | [packages/react-ui-core/src/components/OverviewCardBlock/OverviewCardBlock.tsx:10](../../../packages/react-ui-core/src/components/OverviewCardBlock/OverviewCardBlock.tsx#L10) |
| `OverviewCardBlockLayout` | type | Keep type | 0 | [packages/react-ui-core/src/components/OverviewCardBlock/OverviewCardBlock.tsx:8](../../../packages/react-ui-core/src/components/OverviewCardBlock/OverviewCardBlock.tsx#L8) |
| `OverviewCardBlockProps` | type | Keep type | 0 | [packages/react-ui-core/src/components/OverviewCardBlock/OverviewCardBlock.tsx:18](../../../packages/react-ui-core/src/components/OverviewCardBlock/OverviewCardBlock.tsx#L18) |
| `PieChart` | value | Keep | 1 | [packages/react-ui-core/src/components/Charts/PieChart/PieChart.tsx:35](../../../packages/react-ui-core/src/components/Charts/PieChart/PieChart.tsx#L35) |
| `PieChartData` | type | Keep type | 0 | [packages/react-ui-core/src/components/Charts/PieChart/types.ts:3](../../../packages/react-ui-core/src/components/Charts/PieChart/types.ts#L3) |
| `PieChartProps` | type | Keep type | 0 | [packages/react-ui-core/src/components/Charts/PieChart/types.ts:5](../../../packages/react-ui-core/src/components/Charts/PieChart/types.ts#L5) |
| `PieChartSkeleton` | value | Keep | 1 | [packages/react-ui-core/src/components/Skeleton/PieChartSkeleton.tsx:6](../../../packages/react-ui-core/src/components/Skeleton/PieChartSkeleton.tsx#L6) |
| `PrintContext` | value | Keep | 0 | [packages/react-ui-core/src/context/PrintContext.tsx:5](../../../packages/react-ui-core/src/context/PrintContext.tsx#L5) |
| `PrintContextProvider` | value | Keep | 0 | [packages/react-ui-core/src/context/PrintContext.tsx:12](../../../packages/react-ui-core/src/context/PrintContext.tsx#L12) |
| `RadarChart` | value | Keep | 1 | [packages/react-ui-core/src/components/Charts/RadarChart/RadarChart.tsx:15](../../../packages/react-ui-core/src/components/Charts/RadarChart/RadarChart.tsx#L15) |
| `RadarChartData` | type | Keep type | 0 | [packages/react-ui-core/src/components/Charts/RadarChart/types.ts:3](../../../packages/react-ui-core/src/components/Charts/RadarChart/types.ts#L3) |
| `RadarChartProps` | type | Keep type | 0 | [packages/react-ui-core/src/components/Charts/RadarChart/types.ts:5](../../../packages/react-ui-core/src/components/Charts/RadarChart/types.ts#L5) |
| `RadialChart` | value | Keep | 1 | [packages/react-ui-core/src/components/Charts/RadialChart/RadialChart.tsx:27](../../../packages/react-ui-core/src/components/Charts/RadialChart/RadialChart.tsx#L27) |
| `RadialChartData` | type | Keep type | 0 | [packages/react-ui-core/src/components/Charts/RadialChart/types.ts:3](../../../packages/react-ui-core/src/components/Charts/RadialChart/types.ts#L3) |
| `RadialChartProps` | type | Keep type | 0 | [packages/react-ui-core/src/components/Charts/RadialChart/types.ts:5](../../../packages/react-ui-core/src/components/Charts/RadialChart/types.ts#L5) |
| `RadioGroup` | value | Keep | 1 | [packages/react-ui-core/src/components/RadioGroup/RadioGroup.tsx:24](../../../packages/react-ui-core/src/components/RadioGroup/RadioGroup.tsx#L24) |
| `RadioGroupProps` | type | Keep type | 0 | [packages/react-ui-core/src/components/RadioGroup/RadioGroup.tsx:11](../../../packages/react-ui-core/src/components/RadioGroup/RadioGroup.tsx#L11) |
| `RadioItem` | value | Keep | 1 | [packages/react-ui-core/src/components/RadioItem/RadioItem.tsx:19](../../../packages/react-ui-core/src/components/RadioItem/RadioItem.tsx#L19) |
| `RadioItemProps` | type | Keep type | 0 | [packages/react-ui-core/src/components/RadioItem/RadioItem.tsx:9](../../../packages/react-ui-core/src/components/RadioItem/RadioItem.tsx#L9) |
| `safeOpenUrl` | value | Keep (legacy public) | 0 | [packages/react-ui-core/src/components/_shared/utils/safeUrl.ts:37](../../../packages/react-ui-core/src/components/_shared/utils/safeUrl.ts#L37) |
| `safeUrl` | value | Keep (legacy public) | 0 | [packages/react-ui-core/src/components/_shared/utils/safeUrl.ts:16](../../../packages/react-ui-core/src/components/_shared/utils/safeUrl.ts#L16) |
| `ScatterChart` | value | Keep | 1 | [packages/react-ui-core/src/components/Charts/ScatterChart/ScatterChart.tsx:17](../../../packages/react-ui-core/src/components/Charts/ScatterChart/ScatterChart.tsx#L17) |
| `ScatterChartData` | type | Keep type | 0 | [packages/react-ui-core/src/components/Charts/ScatterChart/types.ts:12](../../../packages/react-ui-core/src/components/Charts/ScatterChart/types.ts#L12) |
| `ScatterChartProps` | type | Keep type | 0 | [packages/react-ui-core/src/components/Charts/ScatterChart/types.ts:21](../../../packages/react-ui-core/src/components/Charts/ScatterChart/types.ts#L21) |
| `ScatterDataset` | type | Keep type | 0 | [packages/react-ui-core/src/components/Charts/ScatterChart/types.ts:7](../../../packages/react-ui-core/src/components/Charts/ScatterChart/types.ts#L7) |
| `ScatterPoint` | type | Keep type | 0 | [packages/react-ui-core/src/components/Charts/ScatterChart/types.ts:1](../../../packages/react-ui-core/src/components/Charts/ScatterChart/types.ts#L1) |
| `ScrollableTable` | value | Keep | 1 | [packages/react-ui-core/src/components/Table/ScrollableTable.tsx:13](../../../packages/react-ui-core/src/components/Table/ScrollableTable.tsx#L13) |
| `ScrollableTableProps` | type | Keep type | 0 | [packages/react-ui-core/src/components/Table/ScrollableTable.tsx:8](../../../packages/react-ui-core/src/components/Table/ScrollableTable.tsx#L8) |
| `SectionV2` | value | Keep | 1 | [packages/react-ui-core/src/components/SectionBlock/SectionV2.tsx:13](../../../packages/react-ui-core/src/components/SectionBlock/SectionV2.tsx#L13) |
| `SegmentedBar` | value | Keep | 0 | [packages/react-ui-core/src/components/Charts/SegmentedBar/SegmentedBar.tsx:31](../../../packages/react-ui-core/src/components/Charts/SegmentedBar/SegmentedBar.tsx#L31) |
| `SegmentedBarData` | type | Keep type | 0 | [packages/react-ui-core/src/components/Charts/SegmentedBar/types.ts:4](../../../packages/react-ui-core/src/components/Charts/SegmentedBar/types.ts#L4) |
| `SegmentedBarProps` | type | Keep type | 0 | [packages/react-ui-core/src/components/Charts/SegmentedBar/types.ts:6](../../../packages/react-ui-core/src/components/Charts/SegmentedBar/types.ts#L6) |
| `Select` | value | Keep | 2 | [packages/react-ui-core/src/components/Select/Select.tsx:32](../../../packages/react-ui-core/src/components/Select/Select.tsx#L32) |
| `SelectContent` | value | Keep | 2 | [packages/react-ui-core/src/components/Select/Select.tsx:125](../../../packages/react-ui-core/src/components/Select/Select.tsx#L125) |
| `SelectContentProps` | type | Keep type | 0 | [packages/react-ui-core/src/components/Select/Select.tsx:116](../../../packages/react-ui-core/src/components/Select/Select.tsx#L116) |
| `SelectGroup` | value | Keep | 1 | [packages/react-ui-core/src/components/Select/Select.tsx:58](../../../packages/react-ui-core/src/components/Select/Select.tsx#L58) |
| `SelectGroupProps` | type | Keep type | 0 | [packages/react-ui-core/src/components/Select/Select.tsx:51](../../../packages/react-ui-core/src/components/Select/Select.tsx#L51) |
| `SelectItem` | value | Keep | 2 | [packages/react-ui-core/src/components/Select/Select.tsx:187](../../../packages/react-ui-core/src/components/Select/Select.tsx#L187) |
| `SelectItemProps` | type | Keep type | 0 | [packages/react-ui-core/src/components/Select/Select.tsx:177](../../../packages/react-ui-core/src/components/Select/Select.tsx#L177) |
| `SelectLabel` | value | Keep | 1 | [packages/react-ui-core/src/components/Select/Select.tsx:165](../../../packages/react-ui-core/src/components/Select/Select.tsx#L165) |
| `SelectLabelProps` | type | Keep type | 0 | [packages/react-ui-core/src/components/Select/Select.tsx:158](../../../packages/react-ui-core/src/components/Select/Select.tsx#L158) |
| `SelectProps` | type | Keep type | 0 | [packages/react-ui-core/src/components/Select/Select.tsx:28](../../../packages/react-ui-core/src/components/Select/Select.tsx#L28) |
| `SelectSeparator` | value | Keep | 1 | [packages/react-ui-core/src/components/Select/Select.tsx:223](../../../packages/react-ui-core/src/components/Select/Select.tsx#L223) |
| `SelectSeparatorProps` | type | Keep type | 0 | [packages/react-ui-core/src/components/Select/Select.tsx:216](../../../packages/react-ui-core/src/components/Select/Select.tsx#L216) |
| `SelectTrigger` | value | Keep | 2 | [packages/react-ui-core/src/components/Select/Select.tsx:88](../../../packages/react-ui-core/src/components/Select/Select.tsx#L88) |
| `SelectTriggerProps` | type | Keep type | 0 | [packages/react-ui-core/src/components/Select/Select.tsx:72](../../../packages/react-ui-core/src/components/Select/Select.tsx#L72) |
| `SelectValue` | value | Keep | 1 | [packages/react-ui-core/src/components/Select/Select.tsx:70](../../../packages/react-ui-core/src/components/Select/Select.tsx#L70) |
| `Separator` | value | Keep | 1 | [packages/react-ui-core/src/components/Separator/Separator.tsx:8](../../../packages/react-ui-core/src/components/Separator/Separator.tsx#L8) |
| `SingleStackedBar` | value | Keep | 1 | [packages/react-ui-core/src/components/Charts/SegmentedBar/SingleStackedBar.tsx:8](../../../packages/react-ui-core/src/components/Charts/SegmentedBar/SingleStackedBar.tsx#L8) |
| `SingleStackedBarData` | type | Keep type | 0 | [packages/react-ui-core/src/components/Charts/SegmentedBar/SingleStackedBar.tsx:4](../../../packages/react-ui-core/src/components/Charts/SegmentedBar/SingleStackedBar.tsx#L4) |
| `SingleStackedBarProps` | type | Keep type | 0 | [packages/react-ui-core/src/components/Charts/SegmentedBar/SingleStackedBar.tsx:5](../../../packages/react-ui-core/src/components/Charts/SegmentedBar/SingleStackedBar.tsx#L5) |
| `Skeleton` | value | Keep | 0 | [packages/react-ui-core/src/components/Skeleton/Skeleton.tsx:6](../../../packages/react-ui-core/src/components/Skeleton/Skeleton.tsx#L6) |
| `Slider` | value | Keep | 0 | [packages/react-ui-core/src/components/Slider/Slider.tsx:42](../../../packages/react-ui-core/src/components/Slider/Slider.tsx#L42) |
| `SliderBlock` | value | Keep | 1 | [packages/react-ui-core/src/components/Slider/SliderBlock.tsx:64](../../../packages/react-ui-core/src/components/Slider/SliderBlock.tsx#L64) |
| `SliderBlockProps` | type | Keep type | 0 | [packages/react-ui-core/src/components/Slider/SliderBlock.tsx:13](../../../packages/react-ui-core/src/components/Slider/SliderBlock.tsx#L13) |
| `SliderProps` | type | Keep type | 0 | [packages/react-ui-core/src/components/Slider/Slider.tsx:25](../../../packages/react-ui-core/src/components/Slider/Slider.tsx#L25) |
| `SnippetCardBlock` | value | Keep | 1 | [packages/react-ui-core/src/components/SnippetCardBlock/SnippetCardBlock.tsx:40](../../../packages/react-ui-core/src/components/SnippetCardBlock/SnippetCardBlock.tsx#L40) |
| `SnippetCardBlockItem` | type | Keep type | 0 | [packages/react-ui-core/src/components/SnippetCardBlock/SnippetCardBlock.tsx:13](../../../packages/react-ui-core/src/components/SnippetCardBlock/SnippetCardBlock.tsx#L13) |
| `SnippetCardBlockProps` | type | Keep type | 0 | [packages/react-ui-core/src/components/SnippetCardBlock/SnippetCardBlock.tsx:25](../../../packages/react-ui-core/src/components/SnippetCardBlock/SnippetCardBlock.tsx#L25) |
| `SnippetCardTooltip` | type | Keep type | 0 | [packages/react-ui-core/src/components/SnippetCardBlock/SnippetCardBlock.tsx:8](../../../packages/react-ui-core/src/components/SnippetCardBlock/SnippetCardBlock.tsx#L8) |
| `SourceFaviconImage` | value | Keep | 0 | [packages/react-ui-core/src/components/SourceFaviconImage/SourceFaviconImage.tsx:17](../../../packages/react-ui-core/src/components/SourceFaviconImage/SourceFaviconImage.tsx#L17) |
| `SourceFaviconImageProps` | type | Keep type | 0 | [packages/react-ui-core/src/components/SourceFaviconImage/SourceFaviconImage.tsx:6](../../../packages/react-ui-core/src/components/SourceFaviconImage/SourceFaviconImage.tsx#L6) |
| `Sources` | value | Keep | 1 | [packages/react-ui-core/src/components/Sources/Sources.tsx:9](../../../packages/react-ui-core/src/components/Sources/Sources.tsx#L9) |
| `SourcesItemComponentProps` | type | Keep type | 0 | [packages/react-ui-core/src/components/Sources/SourcesItem.tsx:7](../../../packages/react-ui-core/src/components/Sources/SourcesItem.tsx#L7) |
| `SourceWithFavicon` | type | Keep type | 0 | [packages/react-ui-core/src/components/Sources/SourceContext.tsx:13](../../../packages/react-ui-core/src/components/Sources/SourceContext.tsx#L13) |
| `StackedLegend` | value | Keep | 0 | [packages/react-ui-core/src/components/Charts/shared/core/StackedLegend/StackedLegend.tsx:23](../../../packages/react-ui-core/src/components/Charts/shared/core/StackedLegend/StackedLegend.tsx#L23) |
| `StackedLegendItem` | type | Keep type | 0 | [packages/react-ui-core/src/components/Charts/shared/core/legend/types.ts:1](../../../packages/react-ui-core/src/components/Charts/shared/core/legend/types.ts#L1) |
| `StackedLegendProps` | type | Keep type | 0 | [packages/react-ui-core/src/components/Charts/shared/core/StackedLegend/StackedLegend.tsx:14](../../../packages/react-ui-core/src/components/Charts/shared/core/StackedLegend/StackedLegend.tsx#L14) |
| `Steps` | value | Keep | 1 | [packages/react-ui-core/src/components/Steps/Steps.tsx:19](../../../packages/react-ui-core/src/components/Steps/Steps.tsx#L19) |
| `StepsItem` | value | Keep | 1 | [packages/react-ui-core/src/components/Steps/Steps.tsx:31](../../../packages/react-ui-core/src/components/Steps/Steps.tsx#L31) |
| `StepsItemProps` | type | Keep type | 0 | [packages/react-ui-core/src/components/Steps/Steps.tsx:7](../../../packages/react-ui-core/src/components/Steps/Steps.tsx#L7) |
| `StepsProps` | type | Keep type | 0 | [packages/react-ui-core/src/components/Steps/Steps.tsx:13](../../../packages/react-ui-core/src/components/Steps/Steps.tsx#L13) |
| `swatch` | value | Keep | 0 | [packages/react-ui-core/src/components/ThemeProvider/swatches.ts:446](../../../packages/react-ui-core/src/components/ThemeProvider/swatches.ts#L446) |
| `swatchToken` | value | Keep | 0 | [packages/react-ui-core/src/components/ThemeProvider/swatches.ts:452](../../../packages/react-ui-core/src/components/ThemeProvider/swatches.ts#L452) |
| `swatchTokens` | value | Keep | 0 | [packages/react-ui-core/src/components/ThemeProvider/swatches.ts:455](../../../packages/react-ui-core/src/components/ThemeProvider/swatches.ts#L455) |
| `SwitchGroup` | value | Keep | 1 | [packages/react-ui-core/src/components/SwitchGroup/SwitchGroup.tsx:23](../../../packages/react-ui-core/src/components/SwitchGroup/SwitchGroup.tsx#L23) |
| `SwitchGroupProps` | type | Keep type | 0 | [packages/react-ui-core/src/components/SwitchGroup/SwitchGroup.tsx:10](../../../packages/react-ui-core/src/components/SwitchGroup/SwitchGroup.tsx#L10) |
| `SwitchItem` | value | Keep | 1 | [packages/react-ui-core/src/components/SwitchItem/SwitchItem.tsx:23](../../../packages/react-ui-core/src/components/SwitchItem/SwitchItem.tsx#L23) |
| `SwitchItemProps` | type | Keep type | 0 | [packages/react-ui-core/src/components/SwitchItem/SwitchItem.tsx:9](../../../packages/react-ui-core/src/components/SwitchItem/SwitchItem.tsx#L9) |
| `Table` | value | Keep | 0 | [packages/react-ui-core/src/components/Table/Table.tsx:23](../../../packages/react-ui-core/src/components/Table/Table.tsx#L23) |
| `TableBody` | value | Keep | 1 | [packages/react-ui-core/src/components/Table/Table.tsx:49](../../../packages/react-ui-core/src/components/Table/Table.tsx#L49) |
| `TableCell` | value | Keep | 1 | [packages/react-ui-core/src/components/Table/Table.tsx:103](../../../packages/react-ui-core/src/components/Table/Table.tsx#L103) |
| `TableCellProps` | type | Keep type | 0 | [packages/react-ui-core/src/components/Table/Table.tsx:99](../../../packages/react-ui-core/src/components/Table/Table.tsx#L99) |
| `TableFooter` | value | Keep | 0 | [packages/react-ui-core/src/components/Table/Table.tsx:57](../../../packages/react-ui-core/src/components/Table/Table.tsx#L57) |
| `TableHead` | value | Keep | 1 | [packages/react-ui-core/src/components/Table/Table.tsx:77](../../../packages/react-ui-core/src/components/Table/Table.tsx#L77) |
| `TableHeader` | value | Keep | 1 | [packages/react-ui-core/src/components/Table/Table.tsx:41](../../../packages/react-ui-core/src/components/Table/Table.tsx#L41) |
| `TableHeadProps` | type | Keep type | 0 | [packages/react-ui-core/src/components/Table/Table.tsx:72](../../../packages/react-ui-core/src/components/Table/Table.tsx#L72) |
| `TableRow` | value | Keep | 1 | [packages/react-ui-core/src/components/Table/Table.tsx:65](../../../packages/react-ui-core/src/components/Table/Table.tsx#L65) |
| `TableSkeleton` | value | Keep | 1 | [packages/react-ui-core/src/components/Skeleton/TableSkeleton.tsx:6](../../../packages/react-ui-core/src/components/Skeleton/TableSkeleton.tsx#L6) |
| `Tabs` | value | Keep | 1 | [packages/react-ui-core/src/components/Tabs/Tabs.tsx:20](../../../packages/react-ui-core/src/components/Tabs/Tabs.tsx#L20) |
| `TabsContent` | value | Keep | 1 | [packages/react-ui-core/src/components/Tabs/Tabs.tsx:256](../../../packages/react-ui-core/src/components/Tabs/Tabs.tsx#L256) |
| `TabsContentProps` | type | Keep type | 0 | [packages/react-ui-core/src/components/Tabs/Tabs.tsx:248](../../../packages/react-ui-core/src/components/Tabs/Tabs.tsx#L248) |
| `TabsList` | value | Keep | 1 | [packages/react-ui-core/src/components/Tabs/Tabs.tsx:50](../../../packages/react-ui-core/src/components/Tabs/Tabs.tsx#L50) |
| `TabsListProps` | type | Keep type | 0 | [packages/react-ui-core/src/components/Tabs/Tabs.tsx:44](../../../packages/react-ui-core/src/components/Tabs/Tabs.tsx#L44) |
| `TabsProps` | type | Keep type | 0 | [packages/react-ui-core/src/components/Tabs/Tabs.tsx:10](../../../packages/react-ui-core/src/components/Tabs/Tabs.tsx#L10) |
| `TabsTrigger` | value | Keep | 1 | [packages/react-ui-core/src/components/Tabs/Tabs.tsx:222](../../../packages/react-ui-core/src/components/Tabs/Tabs.tsx#L222) |
| `TabsTriggerProps` | type | Keep type | 0 | [packages/react-ui-core/src/components/Tabs/Tabs.tsx:210](../../../packages/react-ui-core/src/components/Tabs/Tabs.tsx#L210) |
| `Tag` | value | Keep | 4 | [packages/react-ui-core/src/components/Tag/Tag.tsx:31](../../../packages/react-ui-core/src/components/Tag/Tag.tsx#L31) |
| `TagBlock` | value | Keep | 1 | [packages/react-ui-core/src/components/TagBlock/TagBlock.tsx:12](../../../packages/react-ui-core/src/components/TagBlock/TagBlock.tsx#L12) |
| `TagBlockProps` | type | Keep type | 0 | [packages/react-ui-core/src/components/TagBlock/TagBlock.tsx:6](../../../packages/react-ui-core/src/components/TagBlock/TagBlock.tsx#L6) |
| `TagProps` | type | Keep type | 0 | [packages/react-ui-core/src/components/Tag/Tag.tsx:22](../../../packages/react-ui-core/src/components/Tag/Tag.tsx#L22) |
| `TagSize` | type | Keep type | 0 | [packages/react-ui-core/src/components/Tag/Tag.tsx:5](../../../packages/react-ui-core/src/components/Tag/Tag.tsx#L5) |
| `TagVariant` | type | Keep type | 0 | [packages/react-ui-core/src/components/Tag/Tag.tsx:6](../../../packages/react-ui-core/src/components/Tag/Tag.tsx#L6) |
| `TextArea` | value | Keep | 1 | [packages/react-ui-core/src/components/TextArea/TextArea.tsx:19](../../../packages/react-ui-core/src/components/TextArea/TextArea.tsx#L19) |
| `TextAreaProps` | type | Keep type | 0 | [packages/react-ui-core/src/components/TextArea/TextArea.tsx:9](../../../packages/react-ui-core/src/components/TextArea/TextArea.tsx#L9) |
| `TextBlockAlign` | type | Keep type | 0 | [packages/react-ui-core/src/components/TextBlock/TextBlock.tsx:18](../../../packages/react-ui-core/src/components/TextBlock/TextBlock.tsx#L18) |
| `TextBlockSecondaryTone` | type | Keep type | 0 | [packages/react-ui-core/src/components/TextBlock/TextBlock.tsx:19](../../../packages/react-ui-core/src/components/TextBlock/TextBlock.tsx#L19) |
| `TextBlockSize` | type | Keep type | 0 | [packages/react-ui-core/src/components/TextBlock/TextBlock.tsx:17](../../../packages/react-ui-core/src/components/TextBlock/TextBlock.tsx#L17) |
| `TextBlockType` | type | Keep type | 0 | [packages/react-ui-core/src/components/TextBlock/TextBlock.tsx:16](../../../packages/react-ui-core/src/components/TextBlock/TextBlock.tsx#L16) |
| `TextBlockVariant` | type | Keep type | 0 | [packages/react-ui-core/src/components/TextBlock/TextBlock.tsx:6](../../../packages/react-ui-core/src/components/TextBlock/TextBlock.tsx#L6) |
| `TextBlockView` | value | Keep | 2 | [packages/react-ui-core/src/components/TextBlock/TextBlock.tsx:39](../../../packages/react-ui-core/src/components/TextBlock/TextBlock.tsx#L39) |
| `TextBlockViewProps` | type | Keep type | 0 | [packages/react-ui-core/src/components/TextBlock/TextBlock.tsx:21](../../../packages/react-ui-core/src/components/TextBlock/TextBlock.tsx#L21) |
| `TextCallout` | value | Keep | 1 | [packages/react-ui-core/src/components/TextCallout/TextCallout.tsx:27](../../../packages/react-ui-core/src/components/TextCallout/TextCallout.tsx#L27) |
| `TextCalloutProps` | type | Keep type | 0 | [packages/react-ui-core/src/components/TextCallout/TextCallout.tsx:13](../../../packages/react-ui-core/src/components/TextCallout/TextCallout.tsx#L13) |
| `TextContent` | value | Keep | 0 | [packages/react-ui-core/src/components/TextContent/TextContent.tsx:20](../../../packages/react-ui-core/src/components/TextContent/TextContent.tsx#L20) |
| `TextContentCitation` | value | Keep | 0 | [packages/react-ui-core/src/components/Citation/TextContentCitation.tsx:26](../../../packages/react-ui-core/src/components/Citation/TextContentCitation.tsx#L26) |
| `TextContentCitationProps` | type | Keep type | 0 | [packages/react-ui-core/src/components/Citation/TextContentCitation.tsx:21](../../../packages/react-ui-core/src/components/Citation/TextContentCitation.tsx#L21) |
| `TextContentProps` | type | Keep type | 0 | [packages/react-ui-core/src/components/TextContent/TextContent.tsx:7](../../../packages/react-ui-core/src/components/TextContent/TextContent.tsx#L7) |
| `TextContentVariant` | type | Keep type | 0 | [packages/react-ui-core/src/components/TextContent/TextContent.tsx:5](../../../packages/react-ui-core/src/components/TextContent/TextContent.tsx#L5) |
| `TextContentWrapper` | value | Keep | 1 | [packages/react-ui-core/src/components/TextContentWrapper/TextContentWrapper.tsx:38](../../../packages/react-ui-core/src/components/TextContentWrapper/TextContentWrapper.tsx#L38) |
| `TextContentWrapperProps` | type | Keep type | 0 | [packages/react-ui-core/src/components/TextContentWrapper/TextContentWrapper.tsx:13](../../../packages/react-ui-core/src/components/TextContentWrapper/TextContentWrapper.tsx#L13) |
| `Theme` | type | Keep type | 0 | [packages/react-ui-core/src/components/ThemeProvider/types.ts:334](../../../packages/react-ui-core/src/components/ThemeProvider/types.ts#L334) |
| `THEME_MODE_ATTRIBUTE` | value | Keep | 0 | [packages/react-ui-core/src/components/ThemeProvider/useThemeModePreference.ts:20](../../../packages/react-ui-core/src/components/ThemeProvider/useThemeModePreference.ts#L20) |
| `THEME_MODE_STORAGE_KEY` | value | Keep | 0 | [packages/react-ui-core/src/components/ThemeProvider/useThemeModePreference.ts:13](../../../packages/react-ui-core/src/components/ThemeProvider/useThemeModePreference.ts#L13) |
| `ThemeMode` | type | Keep type | 1 | [packages/react-ui-core/src/components/ThemeProvider/types.ts:2](../../../packages/react-ui-core/src/components/ThemeProvider/types.ts#L2) |
| `ThemeModePreference` | type | Keep type | 0 | [packages/react-ui-core/src/components/ThemeProvider/useThemeModePreference.ts:10](../../../packages/react-ui-core/src/components/ThemeProvider/useThemeModePreference.ts#L10) |
| `ThemeProps` | type | Keep type | 0 | [packages/react-ui-core/src/components/ThemeProvider/ThemeProvider.tsx:9](../../../packages/react-ui-core/src/components/ThemeProvider/ThemeProvider.tsx#L9) |
| `ThemeProvider` | value | Keep | 0 | [packages/react-ui-core/src/components/ThemeProvider/ThemeProvider.tsx:148](../../../packages/react-ui-core/src/components/ThemeProvider/ThemeProvider.tsx#L148) |
| `ToggleGroup` | value | Keep | 0 | [packages/react-ui-core/src/components/ToggleGroup/ToggleGroup.tsx:18](../../../packages/react-ui-core/src/components/ToggleGroup/ToggleGroup.tsx#L18) |
| `ToggleGroupProps` | type | Keep type | 0 | [packages/react-ui-core/src/components/ToggleGroup/ToggleGroup.tsx:13](../../../packages/react-ui-core/src/components/ToggleGroup/ToggleGroup.tsx#L13) |
| `ToggleItem` | value | Keep | 0 | [packages/react-ui-core/src/components/ToggleItem/ToggleItem.tsx:14](../../../packages/react-ui-core/src/components/ToggleItem/ToggleItem.tsx#L14) |
| `ToggleItemProps` | type | Keep type | 0 | [packages/react-ui-core/src/components/ToggleItem/ToggleItem.tsx:9](../../../packages/react-ui-core/src/components/ToggleItem/ToggleItem.tsx#L9) |
| `TooltipWrapper` | value | Keep | 0 | [packages/react-ui-core/src/components/TooltipWrapper/TooltipWrapper.tsx:21](../../../packages/react-ui-core/src/components/TooltipWrapper/TooltipWrapper.tsx#L21) |
| `TooltipWrapperProps` | type | Keep type | 0 | [packages/react-ui-core/src/components/TooltipWrapper/TooltipWrapper.tsx:7](../../../packages/react-ui-core/src/components/TooltipWrapper/TooltipWrapper.tsx#L7) |
| `transformScatterData` | value | Keep | 0 | [packages/react-ui-core/src/components/Charts/ScatterChart/utils/scatterChartUtils.ts:22](../../../packages/react-ui-core/src/components/Charts/ScatterChart/utils/scatterChartUtils.ts#L22) |
| `TypographyTheme` | type | Keep type | 0 | [packages/react-ui-core/src/components/ThemeProvider/types.ts:188](../../../packages/react-ui-core/src/components/ThemeProvider/types.ts#L188) |
| `useCardSourceContext` | value | Keep | 0 | [packages/react-ui-core/src/components/Sources/SourceContext.tsx:77](../../../packages/react-ui-core/src/components/Sources/SourceContext.tsx#L77) |
| `useLayoutContext` | value | Keep | 0 | [packages/react-ui-core/src/context/LayoutContext.tsx:18](../../../packages/react-ui-core/src/context/LayoutContext.tsx#L18) |
| `useLegendEntry` | value | Keep | 0 | [packages/react-ui-core/src/components/Charts/shared/core/legend/LegendStoreProvider.tsx:63](../../../packages/react-ui-core/src/components/Charts/shared/core/legend/LegendStoreProvider.tsx#L63) |
| `usePrintContext` | value | Keep | 0 | [packages/react-ui-core/src/context/PrintContext.tsx:7](../../../packages/react-ui-core/src/context/PrintContext.tsx#L7) |
| `useSystemThemeMode` | value | Keep | 0 | [packages/react-ui-core/src/components/ThemeProvider/useSystemThemeMode.ts:18](../../../packages/react-ui-core/src/components/ThemeProvider/useSystemThemeMode.ts#L18) |
| `useTheme` | value | Keep | 1 | [packages/react-ui-core/src/components/ThemeProvider/ThemeProvider.tsx:73](../../../packages/react-ui-core/src/components/ThemeProvider/ThemeProvider.tsx#L73) |
| `useThemeModePreference` | value | Keep | 0 | [packages/react-ui-core/src/components/ThemeProvider/useThemeModePreference.ts:30](../../../packages/react-ui-core/src/components/ThemeProvider/useThemeModePreference.ts#L30) |
| `VisualCard` | value | Keep | 0 | [packages/react-ui-core/src/components/VisualCardBlock/VisualCardBlock.tsx:27](../../../packages/react-ui-core/src/components/VisualCardBlock/VisualCardBlock.tsx#L27) |
| `VisualCardBlock` | value | Keep | 1 | [packages/react-ui-core/src/components/VisualCardBlock/VisualCardBlock.tsx:80](../../../packages/react-ui-core/src/components/VisualCardBlock/VisualCardBlock.tsx#L80) |
| `VisualCardBlockItem` | type | Keep type | 0 | [packages/react-ui-core/src/components/VisualCardBlock/VisualCardBlock.tsx:8](../../../packages/react-ui-core/src/components/VisualCardBlock/VisualCardBlock.tsx#L8) |
| `VisualCardBlockProps` | type | Keep type | 0 | [packages/react-ui-core/src/components/VisualCardBlock/VisualCardBlock.tsx:67](../../../packages/react-ui-core/src/components/VisualCardBlock/VisualCardBlock.tsx#L67) |
| `VisualCardProps` | type | Keep type | 0 | [packages/react-ui-core/src/components/VisualCardBlock/VisualCardBlock.tsx:19](../../../packages/react-ui-core/src/components/VisualCardBlock/VisualCardBlock.tsx#L19) |
| `white` | value | Keep | 0 | [packages/react-ui-core/src/components/ThemeProvider/swatches.ts:348](../../../packages/react-ui-core/src/components/ThemeProvider/swatches.ts#L348) |
| `withAlpha` | value | Keep | 0 | [packages/react-ui-core/src/components/ThemeProvider/swatches.ts:363](../../../packages/react-ui-core/src/components/ThemeProvider/swatches.ts#L363) |
| `XAxisTickVariant` | type | Keep type | 0 | [packages/react-ui-core/src/components/Charts/types/common.ts:9](../../../packages/react-ui-core/src/components/Charts/types/common.ts#L9) |
