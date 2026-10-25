# Source-linked inventory (#31)

> **Generated** by `tools/inventory.mjs` — do not hand-edit. Regenerate with
> `node validation/friend-text-media-baseline/tools/inventory.mjs`.
> `tests/inventory.test.ts` fails if this drifts from the checked-out revision
> or names an export that cannot be imported.

| | |
|---|---|
| Revision | `433a0e31d7c54d1181a5bbf899faaa5be883077b` |
| Entry point | `packages/react-ui/src/index.ts` |
| TypeScript | 5.9.3 |
| Total package-root exports | 560 |
| In-scope families | 20 |
| In-scope exports | 80 |
| Discrepancies | none |

Derived with the TypeScript compiler, not by grepping barrels: `src/index.ts` is
a chain of `export *`, so a grep shows which barrel is forwarded, not which NAMES
the package root exposes. During setup a grep for "Markdown" missed
`MarkDownRenderer` entirely because of its capital D — exactly the failure #31
warns about. Subcomponents are attributed by DECLARATION SITE, not name prefix.

## text/presentation

| Family | Export | Kind | Declared at |
|---|---|---|---|
| `InlineMarkdownRenderer` | `InlineMarkdownRenderer` | value | [`InlineMarkdownRenderer/InlineMarkdownRenderer.tsx:22`](https://github.com/ankit-thesys/openui-comp/blob/433a0e31d7c54d1181a5bbf899faaa5be883077b/packages/react-ui/src/components/InlineMarkdownRenderer/InlineMarkdownRenderer.tsx#L22) |
|  | `InlineMarkdownRendererProps` | type | [`InlineMarkdownRenderer/InlineMarkdownRenderer.tsx:12`](https://github.com/ankit-thesys/openui-comp/blob/433a0e31d7c54d1181a5bbf899faaa5be883077b/packages/react-ui/src/components/InlineMarkdownRenderer/InlineMarkdownRenderer.tsx#L12) |
| `TextBlock` | `TextBlockAlign` | type | [`TextBlock/TextBlock.tsx:17`](https://github.com/ankit-thesys/openui-comp/blob/433a0e31d7c54d1181a5bbf899faaa5be883077b/packages/react-ui/src/components/TextBlock/TextBlock.tsx#L17) |
|  | `TextBlockSecondaryTone` | type | [`TextBlock/TextBlock.tsx:18`](https://github.com/ankit-thesys/openui-comp/blob/433a0e31d7c54d1181a5bbf899faaa5be883077b/packages/react-ui/src/components/TextBlock/TextBlock.tsx#L18) |
|  | `TextBlockSize` | type | [`TextBlock/TextBlock.tsx:16`](https://github.com/ankit-thesys/openui-comp/blob/433a0e31d7c54d1181a5bbf899faaa5be883077b/packages/react-ui/src/components/TextBlock/TextBlock.tsx#L16) |
|  | `TextBlockType` | type | [`TextBlock/TextBlock.tsx:15`](https://github.com/ankit-thesys/openui-comp/blob/433a0e31d7c54d1181a5bbf899faaa5be883077b/packages/react-ui/src/components/TextBlock/TextBlock.tsx#L15) |
|  | `TextBlockVariant` | type | [`TextBlock/TextBlock.tsx:5`](https://github.com/ankit-thesys/openui-comp/blob/433a0e31d7c54d1181a5bbf899faaa5be883077b/packages/react-ui/src/components/TextBlock/TextBlock.tsx#L5) |
|  | `TextBlockView` | value | [`TextBlock/TextBlock.tsx:38`](https://github.com/ankit-thesys/openui-comp/blob/433a0e31d7c54d1181a5bbf899faaa5be883077b/packages/react-ui/src/components/TextBlock/TextBlock.tsx#L38) |
|  | `TextBlockViewProps` | type | [`TextBlock/TextBlock.tsx:20`](https://github.com/ankit-thesys/openui-comp/blob/433a0e31d7c54d1181a5bbf899faaa5be883077b/packages/react-ui/src/components/TextBlock/TextBlock.tsx#L20) |
| `MarkDownRenderer` | `MarkDownRenderer` | value | [`MarkDownRenderer/MarkDownRenderer.tsx:46`](https://github.com/ankit-thesys/openui-comp/blob/433a0e31d7c54d1181a5bbf899faaa5be883077b/packages/react-ui/src/components/MarkDownRenderer/MarkDownRenderer.tsx#L46) |
|  | `MarkDownRendererProps` | type | [`MarkDownRenderer/MarkDownRenderer.tsx:39`](https://github.com/ankit-thesys/openui-comp/blob/433a0e31d7c54d1181a5bbf899faaa5be883077b/packages/react-ui/src/components/MarkDownRenderer/MarkDownRenderer.tsx#L39) |
| `CodeBlock` | `CodeBlock` | value | [`CodeBlock/CodeBlock.tsx:16`](https://github.com/ankit-thesys/openui-comp/blob/433a0e31d7c54d1181a5bbf899faaa5be883077b/packages/react-ui/src/components/CodeBlock/CodeBlock.tsx#L16) |
|  | `CodeBlockProps` | type | [`CodeBlock/CodeBlock.tsx:8`](https://github.com/ankit-thesys/openui-comp/blob/433a0e31d7c54d1181a5bbf899faaa5be883077b/packages/react-ui/src/components/CodeBlock/CodeBlock.tsx#L8) |
| `IconText` | `IconText` | value | [`IconText/IconText.tsx:31`](https://github.com/ankit-thesys/openui-comp/blob/433a0e31d7c54d1181a5bbf899faaa5be883077b/packages/react-ui/src/components/IconText/IconText.tsx#L31) |
|  | `IconTextIconVariant` | type | [`IconText/IconText.tsx:7`](https://github.com/ankit-thesys/openui-comp/blob/433a0e31d7c54d1181a5bbf899faaa5be883077b/packages/react-ui/src/components/IconText/IconText.tsx#L7) |
|  | `IconTextLayout` | type | [`IconText/IconText.tsx:8`](https://github.com/ankit-thesys/openui-comp/blob/433a0e31d7c54d1181a5bbf899faaa5be883077b/packages/react-ui/src/components/IconText/IconText.tsx#L8) |
|  | `IconTextProps` | type | [`IconText/IconText.tsx:10`](https://github.com/ankit-thesys/openui-comp/blob/433a0e31d7c54d1181a5bbf899faaa5be883077b/packages/react-ui/src/components/IconText/IconText.tsx#L10) |
| `IconTag` | `IconTag` | value | [`IconTag/IconTag.tsx:16`](https://github.com/ankit-thesys/openui-comp/blob/433a0e31d7c54d1181a5bbf899faaa5be883077b/packages/react-ui/src/components/IconTag/IconTag.tsx#L16) |
|  | `IconTagProps` | type | [`IconTag/IconTag.tsx:8`](https://github.com/ankit-thesys/openui-comp/blob/433a0e31d7c54d1181a5bbf899faaa5be883077b/packages/react-ui/src/components/IconTag/IconTag.tsx#L8) |
|  | `IconTagSize` | type | [`IconTag/IconTag.tsx:5`](https://github.com/ankit-thesys/openui-comp/blob/433a0e31d7c54d1181a5bbf899faaa5be883077b/packages/react-ui/src/components/IconTag/IconTag.tsx#L5) |
|  | `IconTagVariant` | type | [`IconTag/IconTag.tsx:6`](https://github.com/ankit-thesys/openui-comp/blob/433a0e31d7c54d1181a5bbf899faaa5be883077b/packages/react-ui/src/components/IconTag/IconTag.tsx#L6) |
| `InlineHeader` | `InlineHeader` | value | [`InlineHeader/InlineHeader.tsx:10`](https://github.com/ankit-thesys/openui-comp/blob/433a0e31d7c54d1181a5bbf899faaa5be883077b/packages/react-ui/src/components/InlineHeader/InlineHeader.tsx#L10) |
|  | `InlineHeaderProps` | type | [`InlineHeader/InlineHeader.tsx:4`](https://github.com/ankit-thesys/openui-comp/blob/433a0e31d7c54d1181a5bbf899faaa5be883077b/packages/react-ui/src/components/InlineHeader/InlineHeader.tsx#L4) |
| `ListBlock` | `ListBlock` | value | [`ListBlock/ListBlock.tsx:22`](https://github.com/ankit-thesys/openui-comp/blob/433a0e31d7c54d1181a5bbf899faaa5be883077b/packages/react-ui/src/components/ListBlock/ListBlock.tsx#L22) |
|  | `ListBlockProps` | type | [`ListBlock/ListBlock.tsx:12`](https://github.com/ankit-thesys/openui-comp/blob/433a0e31d7c54d1181a5bbf899faaa5be883077b/packages/react-ui/src/components/ListBlock/ListBlock.tsx#L12) |
| `ListItem` | `ListItem` | value | [`ListItem/ListItem.tsx:23`](https://github.com/ankit-thesys/openui-comp/blob/433a0e31d7c54d1181a5bbf899faaa5be883077b/packages/react-ui/src/components/ListItem/ListItem.tsx#L23) |
|  | `ListItemProps` | type | [`ListItem/ListItem.tsx:7`](https://github.com/ankit-thesys/openui-comp/blob/433a0e31d7c54d1181a5bbf899faaa5be883077b/packages/react-ui/src/components/ListItem/ListItem.tsx#L7) |
|  | `ListItemSize` | type | [`ListItem/ListItem.tsx:5`](https://github.com/ankit-thesys/openui-comp/blob/433a0e31d7c54d1181a5bbf899faaa5be883077b/packages/react-ui/src/components/ListItem/ListItem.tsx#L5) |
|  | `ListItemVariant` | type | [`ListItem/ListItem.tsx:4`](https://github.com/ankit-thesys/openui-comp/blob/433a0e31d7c54d1181a5bbf899faaa5be883077b/packages/react-ui/src/components/ListItem/ListItem.tsx#L4) |
| `Separator` | `Separator` | value | [`Separator/Separator.tsx:4`](https://github.com/ankit-thesys/openui-comp/blob/433a0e31d7c54d1181a5bbf899faaa5be883077b/packages/react-ui/src/components/Separator/Separator.tsx#L4) |
| `Steps` | `Steps` | value | [`Steps/Steps.tsx:15`](https://github.com/ankit-thesys/openui-comp/blob/433a0e31d7c54d1181a5bbf899faaa5be883077b/packages/react-ui/src/components/Steps/Steps.tsx#L15) |
|  | `StepsItem` | value | [`Steps/Steps.tsx:27`](https://github.com/ankit-thesys/openui-comp/blob/433a0e31d7c54d1181a5bbf899faaa5be883077b/packages/react-ui/src/components/Steps/Steps.tsx#L27) |
|  | `StepsItemProps` | type | [`Steps/Steps.tsx:3`](https://github.com/ankit-thesys/openui-comp/blob/433a0e31d7c54d1181a5bbf899faaa5be883077b/packages/react-ui/src/components/Steps/Steps.tsx#L3) |
|  | `StepsProps` | type | [`Steps/Steps.tsx:9`](https://github.com/ankit-thesys/openui-comp/blob/433a0e31d7c54d1181a5bbf899faaa5be883077b/packages/react-ui/src/components/Steps/Steps.tsx#L9) |

## images

| Family | Export | Kind | Declared at |
|---|---|---|---|
| `Image` | `Image` | value | [`Image/Image.tsx:30`](https://github.com/ankit-thesys/openui-comp/blob/433a0e31d7c54d1181a5bbf899faaa5be883077b/packages/react-ui/src/components/Image/Image.tsx#L30) |
|  | `ImageProps` | type | [`Image/Image.tsx:8`](https://github.com/ankit-thesys/openui-comp/blob/433a0e31d7c54d1181a5bbf899faaa5be883077b/packages/react-ui/src/components/Image/Image.tsx#L8) |
| `ImageBlock` | `ImageBlock` | value | [`ImageBlock/ImageBlock.tsx:11`](https://github.com/ankit-thesys/openui-comp/blob/433a0e31d7c54d1181a5bbf899faaa5be883077b/packages/react-ui/src/components/ImageBlock/ImageBlock.tsx#L11) |
|  | `ImageBlockProps` | type | [`ImageBlock/ImageBlock.tsx:5`](https://github.com/ankit-thesys/openui-comp/blob/433a0e31d7c54d1181a5bbf899faaa5be883077b/packages/react-ui/src/components/ImageBlock/ImageBlock.tsx#L5) |
| `ImageGallery` | `GalleryModal` | value | [`ImageGallery/GalleryModal.tsx:16`](https://github.com/ankit-thesys/openui-comp/blob/433a0e31d7c54d1181a5bbf899faaa5be883077b/packages/react-ui/src/components/ImageGallery/GalleryModal.tsx#L16) |
|  | `GalleryModalProps` | type | [`ImageGallery/GalleryModal.tsx:9`](https://github.com/ankit-thesys/openui-comp/blob/433a0e31d7c54d1181a5bbf899faaa5be883077b/packages/react-ui/src/components/ImageGallery/GalleryModal.tsx#L9) |
|  | `ImageGallery` | value | [`ImageGallery/ImageGallery.tsx:32`](https://github.com/ankit-thesys/openui-comp/blob/433a0e31d7c54d1181a5bbf899faaa5be883077b/packages/react-ui/src/components/ImageGallery/ImageGallery.tsx#L32) |
|  | `ImageItem` | type | [`ImageGallery/ImageGallery.tsx:6`](https://github.com/ankit-thesys/openui-comp/blob/433a0e31d7c54d1181a5bbf899faaa5be883077b/packages/react-ui/src/components/ImageGallery/ImageGallery.tsx#L6) |
|  | `OpenUIGalleryProps` | type | [`ImageGallery/ImageGallery.tsx:12`](https://github.com/ankit-thesys/openui-comp/blob/433a0e31d7c54d1181a5bbf899faaa5be883077b/packages/react-ui/src/components/ImageGallery/ImageGallery.tsx#L12) |
| `ImageText` | `ImageText` | value | [`ImageText/ImageText.tsx:20`](https://github.com/ankit-thesys/openui-comp/blob/433a0e31d7c54d1181a5bbf899faaa5be883077b/packages/react-ui/src/components/ImageText/ImageText.tsx#L20) |
|  | `ImageTextLayout` | type | [`ImageText/ImageText.tsx:5`](https://github.com/ankit-thesys/openui-comp/blob/433a0e31d7c54d1181a5bbf899faaa5be883077b/packages/react-ui/src/components/ImageText/ImageText.tsx#L5) |
|  | `ImageTextProps` | type | [`ImageText/ImageText.tsx:7`](https://github.com/ankit-thesys/openui-comp/blob/433a0e31d7c54d1181a5bbf899faaa5be883077b/packages/react-ui/src/components/ImageText/ImageText.tsx#L7) |
| `ImageTextLarge` | `ImageTextLarge` | value | [`ImageTextLarge/ImageTextLarge.tsx:14`](https://github.com/ankit-thesys/openui-comp/blob/433a0e31d7c54d1181a5bbf899faaa5be883077b/packages/react-ui/src/components/ImageTextLarge/ImageTextLarge.tsx#L14) |
|  | `ImageTextLargeProps` | type | [`ImageTextLarge/ImageTextLarge.tsx:5`](https://github.com/ankit-thesys/openui-comp/blob/433a0e31d7c54d1181a5bbf899faaa5be883077b/packages/react-ui/src/components/ImageTextLarge/ImageTextLarge.tsx#L5) |

## citations/sources

| Family | Export | Kind | Declared at |
|---|---|---|---|
| `Citation` | `Citation` | value | [`Citation/Citation.tsx:79`](https://github.com/ankit-thesys/openui-comp/blob/433a0e31d7c54d1181a5bbf899faaa5be883077b/packages/react-ui/src/components/Citation/Citation.tsx#L79) |
|  | `CitationItem` | value | [`Citation/CitationItem.tsx:10`](https://github.com/ankit-thesys/openui-comp/blob/433a0e31d7c54d1181a5bbf899faaa5be883077b/packages/react-ui/src/components/Citation/CitationItem.tsx#L10) |
|  | `CitationItemProps` | type | [`Citation/CitationItem.tsx:6`](https://github.com/ankit-thesys/openui-comp/blob/433a0e31d7c54d1181a5bbf899faaa5be883077b/packages/react-ui/src/components/Citation/CitationItem.tsx#L6) |
|  | `CitationProps` | type | [`Citation/Citation.tsx:10`](https://github.com/ankit-thesys/openui-comp/blob/433a0e31d7c54d1181a5bbf899faaa5be883077b/packages/react-ui/src/components/Citation/Citation.tsx#L10) |
|  | `TextContentCitation` | value | [`Citation/TextContentCitation.tsx:26`](https://github.com/ankit-thesys/openui-comp/blob/433a0e31d7c54d1181a5bbf899faaa5be883077b/packages/react-ui/src/components/Citation/TextContentCitation.tsx#L26) |
|  | `TextContentCitationProps` | type | [`Citation/TextContentCitation.tsx:21`](https://github.com/ankit-thesys/openui-comp/blob/433a0e31d7c54d1181a5bbf899faaa5be883077b/packages/react-ui/src/components/Citation/TextContentCitation.tsx#L21) |
| `Sources` | `CardSource` | type | [`Sources/SourceContext.tsx:11`](https://github.com/ankit-thesys/openui-comp/blob/433a0e31d7c54d1181a5bbf899faaa5be883077b/packages/react-ui/src/components/Sources/SourceContext.tsx#L11) |
|  | `CardSourceContext` | value | [`Sources/SourceContext.tsx:26`](https://github.com/ankit-thesys/openui-comp/blob/433a0e31d7c54d1181a5bbf899faaa5be883077b/packages/react-ui/src/components/Sources/SourceContext.tsx#L26) |
|  | `CardSourceProvider` | value | [`Sources/SourceContext.tsx:52`](https://github.com/ankit-thesys/openui-comp/blob/433a0e31d7c54d1181a5bbf899faaa5be883077b/packages/react-ui/src/components/Sources/SourceContext.tsx#L52) |
|  | `CardSourceSchema` | value | [`Sources/SourceContext.tsx:5`](https://github.com/ankit-thesys/openui-comp/blob/433a0e31d7c54d1181a5bbf899faaa5be883077b/packages/react-ui/src/components/Sources/SourceContext.tsx#L5) |
|  | `getFaviconUrl` | value | [`Sources/SourceContext.tsx:35`](https://github.com/ankit-thesys/openui-comp/blob/433a0e31d7c54d1181a5bbf899faaa5be883077b/packages/react-ui/src/components/Sources/SourceContext.tsx#L35) |
|  | `ListedSourceItem` | value | [`Sources/SourcesItem.tsx:11`](https://github.com/ankit-thesys/openui-comp/blob/433a0e31d7c54d1181a5bbf899faaa5be883077b/packages/react-ui/src/components/Sources/SourcesItem.tsx#L11) |
|  | `ListedSources` | value | [`Sources/ListedSources.tsx:13`](https://github.com/ankit-thesys/openui-comp/blob/433a0e31d7c54d1181a5bbf899faaa5be883077b/packages/react-ui/src/components/Sources/ListedSources.tsx#L13) |
|  | `ListedSourcesProps` | type | [`Sources/ListedSources.tsx:9`](https://github.com/ankit-thesys/openui-comp/blob/433a0e31d7c54d1181a5bbf899faaa5be883077b/packages/react-ui/src/components/Sources/ListedSources.tsx#L9) |
|  | `openSourceInNewTab` | value | [`Sources/SourceContext.tsx:18`](https://github.com/ankit-thesys/openui-comp/blob/433a0e31d7c54d1181a5bbf899faaa5be883077b/packages/react-ui/src/components/Sources/SourceContext.tsx#L18) |
|  | `Sources` | value | [`Sources/Sources.tsx:9`](https://github.com/ankit-thesys/openui-comp/blob/433a0e31d7c54d1181a5bbf899faaa5be883077b/packages/react-ui/src/components/Sources/Sources.tsx#L9) |
|  | `SourcesItemComponentProps` | type | [`Sources/SourcesItem.tsx:6`](https://github.com/ankit-thesys/openui-comp/blob/433a0e31d7c54d1181a5bbf899faaa5be883077b/packages/react-ui/src/components/Sources/SourcesItem.tsx#L6) |
|  | `SourceWithFavicon` | type | [`Sources/SourceContext.tsx:13`](https://github.com/ankit-thesys/openui-comp/blob/433a0e31d7c54d1181a5bbf899faaa5be883077b/packages/react-ui/src/components/Sources/SourceContext.tsx#L13) |
|  | `useCardSourceContext` | value | [`Sources/SourceContext.tsx:77`](https://github.com/ankit-thesys/openui-comp/blob/433a0e31d7c54d1181a5bbf899faaa5be883077b/packages/react-ui/src/components/Sources/SourceContext.tsx#L77) |
| `SourceFaviconImage` | `SourceFaviconImage` | value | [`SourceFaviconImage/SourceFaviconImage.tsx:15`](https://github.com/ankit-thesys/openui-comp/blob/433a0e31d7c54d1181a5bbf899faaa5be883077b/packages/react-ui/src/components/SourceFaviconImage/SourceFaviconImage.tsx#L15) |
|  | `SourceFaviconImageProps` | type | [`SourceFaviconImage/SourceFaviconImage.tsx:4`](https://github.com/ankit-thesys/openui-comp/blob/433a0e31d7c54d1181a5bbf899faaa5be883077b/packages/react-ui/src/components/SourceFaviconImage/SourceFaviconImage.tsx#L4) |

## table

| Family | Export | Kind | Declared at |
|---|---|---|---|
| `Table` | `ScrollableTable` | value | [`Table/Table.tsx:104`](https://github.com/ankit-thesys/openui-comp/blob/433a0e31d7c54d1181a5bbf899faaa5be883077b/packages/react-ui/src/components/Table/Table.tsx#L104) |
|  | `ScrollableTableProps` | type | [`Table/Table.tsx:99`](https://github.com/ankit-thesys/openui-comp/blob/433a0e31d7c54d1181a5bbf899faaa5be883077b/packages/react-ui/src/components/Table/Table.tsx#L99) |
|  | `Table` | value | [`Table/Table.tsx:16`](https://github.com/ankit-thesys/openui-comp/blob/433a0e31d7c54d1181a5bbf899faaa5be883077b/packages/react-ui/src/components/Table/Table.tsx#L16) |
|  | `TableBody` | value | [`Table/Table.tsx:42`](https://github.com/ankit-thesys/openui-comp/blob/433a0e31d7c54d1181a5bbf899faaa5be883077b/packages/react-ui/src/components/Table/Table.tsx#L42) |
|  | `TableCell` | value | [`Table/Table.tsx:86`](https://github.com/ankit-thesys/openui-comp/blob/433a0e31d7c54d1181a5bbf899faaa5be883077b/packages/react-ui/src/components/Table/Table.tsx#L86) |
|  | `TableCellProps` | type | [`Table/Table.tsx:82`](https://github.com/ankit-thesys/openui-comp/blob/433a0e31d7c54d1181a5bbf899faaa5be883077b/packages/react-ui/src/components/Table/Table.tsx#L82) |
|  | `TableFooter` | value | [`Table/Table.tsx:50`](https://github.com/ankit-thesys/openui-comp/blob/433a0e31d7c54d1181a5bbf899faaa5be883077b/packages/react-ui/src/components/Table/Table.tsx#L50) |
|  | `TableHead` | value | [`Table/Table.tsx:70`](https://github.com/ankit-thesys/openui-comp/blob/433a0e31d7c54d1181a5bbf899faaa5be883077b/packages/react-ui/src/components/Table/Table.tsx#L70) |
|  | `TableHeader` | value | [`Table/Table.tsx:34`](https://github.com/ankit-thesys/openui-comp/blob/433a0e31d7c54d1181a5bbf899faaa5be883077b/packages/react-ui/src/components/Table/Table.tsx#L34) |
|  | `TableHeadProps` | type | [`Table/Table.tsx:65`](https://github.com/ankit-thesys/openui-comp/blob/433a0e31d7c54d1181a5bbf899faaa5be883077b/packages/react-ui/src/components/Table/Table.tsx#L65) |
|  | `TableRow` | value | [`Table/Table.tsx:58`](https://github.com/ankit-thesys/openui-comp/blob/433a0e31d7c54d1181a5bbf899faaa5be883077b/packages/react-ui/src/components/Table/Table.tsx#L58) |

## Dependency-only (out of scope, recorded for #12)

| Family | Export | Kind | Declared at |
|---|---|---|---|
| `Carousel` | `Carousel` | value | [`Carousel/Carousel.tsx:48`](https://github.com/ankit-thesys/openui-comp/blob/433a0e31d7c54d1181a5bbf899faaa5be883077b/packages/react-ui/src/components/Carousel/Carousel.tsx#L48) |
|  | `CarouselContent` | value | [`Carousel/Carousel.tsx:190`](https://github.com/ankit-thesys/openui-comp/blob/433a0e31d7c54d1181a5bbf899faaa5be883077b/packages/react-ui/src/components/Carousel/Carousel.tsx#L190) |
|  | `CarouselItem` | value | [`Carousel/Carousel.tsx:219`](https://github.com/ankit-thesys/openui-comp/blob/433a0e31d7c54d1181a5bbf899faaa5be883077b/packages/react-ui/src/components/Carousel/Carousel.tsx#L219) |
|  | `CarouselNext` | value | [`Carousel/Carousel.tsx:250`](https://github.com/ankit-thesys/openui-comp/blob/433a0e31d7c54d1181a5bbf899faaa5be883077b/packages/react-ui/src/components/Carousel/Carousel.tsx#L250) |
|  | `CarouselPrevious` | value | [`Carousel/Carousel.tsx:227`](https://github.com/ankit-thesys/openui-comp/blob/433a0e31d7c54d1181a5bbf899faaa5be883077b/packages/react-ui/src/components/Carousel/Carousel.tsx#L227) |
|  | `CarouselProps` | type | [`Carousel/Carousel.tsx:34`](https://github.com/ankit-thesys/openui-comp/blob/433a0e31d7c54d1181a5bbf899faaa5be883077b/packages/react-ui/src/components/Carousel/Carousel.tsx#L34) |
|  | `CarouselRef` | type | [`Carousel/Carousel.tsx:43`](https://github.com/ankit-thesys/openui-comp/blob/433a0e31d7c54d1181a5bbf899faaa5be883077b/packages/react-ui/src/components/Carousel/Carousel.tsx#L43) |
| `IconButton` | `IconButton` | value | [`IconButton/IconButton.tsx:52`](https://github.com/ankit-thesys/openui-comp/blob/433a0e31d7c54d1181a5bbf899faaa5be883077b/packages/react-ui/src/components/IconButton/IconButton.tsx#L52) |
|  | `IconButtonProps` | type | [`IconButton/IconButton.tsx:11`](https://github.com/ankit-thesys/openui-comp/blob/433a0e31d7c54d1181a5bbf899faaa5be883077b/packages/react-ui/src/components/IconButton/IconButton.tsx#L11) |

## Adjacent, deliberately unclaimed

| Family | Export | Kind | Declared at |
|---|---|---|---|
| `EditableTable` | `EditableCellType` | type | [`EditableTable/base/components/CellTypes.ts:3`](https://github.com/ankit-thesys/openui-comp/blob/433a0e31d7c54d1181a5bbf899faaa5be883077b/packages/react-ui/src/components/EditableTable/base/components/CellTypes.ts#L3) |
|  | `EditableTable` | value | [`EditableTable/EditableTable.tsx:125`](https://github.com/ankit-thesys/openui-comp/blob/433a0e31d7c54d1181a5bbf899faaa5be883077b/packages/react-ui/src/components/EditableTable/EditableTable.tsx#L125) |
|  | `EditableTableChangesBar` | value | [`EditableTable/EditableTable.tsx:466`](https://github.com/ankit-thesys/openui-comp/blob/433a0e31d7c54d1181a5bbf899faaa5be883077b/packages/react-ui/src/components/EditableTable/EditableTable.tsx#L466) |
|  | `EditableTableChangesBarProps` | type | [`EditableTable/EditableTable.tsx:452`](https://github.com/ankit-thesys/openui-comp/blob/433a0e31d7c54d1181a5bbf899faaa5be883077b/packages/react-ui/src/components/EditableTable/EditableTable.tsx#L452) |
|  | `EditableTableColumn` | type | [`EditableTable/EditableTable.tsx:40`](https://github.com/ankit-thesys/openui-comp/blob/433a0e31d7c54d1181a5bbf899faaa5be883077b/packages/react-ui/src/components/EditableTable/EditableTable.tsx#L40) |
|  | `EditableTableProps` | type | [`EditableTable/EditableTable.tsx:49`](https://github.com/ankit-thesys/openui-comp/blob/433a0e31d7c54d1181a5bbf899faaa5be883077b/packages/react-ui/src/components/EditableTable/EditableTable.tsx#L49) |
|  | `EditableTableRow` | type | [`EditableTable/EditableTable.tsx:35`](https://github.com/ankit-thesys/openui-comp/blob/433a0e31d7c54d1181a5bbf899faaa5be883077b/packages/react-ui/src/components/EditableTable/EditableTable.tsx#L35) |

## Discrepancies

None: every claimed family resolves to real package-root exports.
