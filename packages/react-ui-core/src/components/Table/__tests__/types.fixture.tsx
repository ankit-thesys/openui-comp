import {
  CardSourceProvider,
  CodeBlock,
  InlineMarkdownRenderer,
  MarkDownRenderer,
  safeOpenUrl,
  safeUrl,
  ScrollableTable,
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
  type CardSource,
  type CodeBlockProps,
  type InlineMarkdownRendererProps,
  type MarkDownRendererProps,
  type ScrollableTableProps,
  type TableCellProps,
  type TableHeadProps,
} from "@openuidev/react-ui-core";
import { createRef } from "react";
const head: TableHeadProps = { align: "right", scope: "col", icon: "USD" };
const cell: TableCellProps = { align: "center", colSpan: 2 };
const scroll: ScrollableTableProps = {
  containerClassName: "custom",
  containerStyle: { maxWidth: 400 },
  id: "orders",
};
const code: CodeBlockProps = {
  language: "javascript",
  codeString: "const value = 42;",
  theme: { 'pre[class*="language-"]': { color: "red" } },
};
const markdown: MarkDownRendererProps = {
  variant: "sunk",
  textMarkdown: "# Title",
  options: { skipHtml: true },
  className: "custom",
};
const inline: InlineMarkdownRendererProps = { content: "**Bold**", className: "custom" };
const sources: CardSource[] = [
  { title: "Docs", sourceName: "Reference", url: "https://example.com" },
];
export const accepted = (
  <CardSourceProvider sources={sources}>
    <Table ref={createRef<HTMLTableElement>()}>
      <TableHeader>
        <TableRow>
          <TableHead {...head}>Heading</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell {...cell}>42</TableCell>
        </TableRow>
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell>Total</TableCell>
        </TableRow>
      </TableFooter>
    </Table>
    <ScrollableTable {...scroll} ref={createRef<HTMLTableElement>()} />
    <CodeBlock {...code} />
    <MarkDownRenderer {...markdown} />
    <InlineMarkdownRenderer {...inline} />
  </CardSourceProvider>
);
// @ts-expect-error Preserve the existing alignment union.
export const invalidAlign: TableCellProps = { align: "around" };
// @ts-expect-error No new styling API.
export const noSx: CodeBlockProps = { ...code, sx: { color: "red" } };
// @ts-expect-error Content stays required.
export const missingContent: InlineMarkdownRendererProps = { className: "custom" };
void [safeUrl, safeOpenUrl];
