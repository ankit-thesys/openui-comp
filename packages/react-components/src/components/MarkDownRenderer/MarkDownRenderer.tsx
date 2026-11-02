"use client";

import clsx from "clsx";
import {
  createContext,
  memo,
  useContext,
  useMemo,
  type ComponentProps,
  type ElementType,
} from "react";
import ReactMarkdown, { Components, type Options } from "react-markdown";
import oneLight from "react-syntax-highlighter/dist/cjs/styles/prism/one-light";
import vscDarkPlus from "react-syntax-highlighter/dist/cjs/styles/prism/vsc-dark-plus";
import { styleRules } from "../../styles/css";
import { CodeBlock } from "../CodeBlock";
import {
  Table,
  TableBody,
  TableCell,
  TableCellProps,
  TableHead,
  TableHeadProps,
  TableHeader,
  TableRow,
} from "../Table";
import { useTheme } from "../ThemeProvider";
import { markdownStyles, names } from "./markdown.styles";

type TableAlignment = TableHeadProps["align"];

function toTableAlignment(align: string | undefined): TableAlignment {
  if (align === "left" || align === "center" || align === "right") return align;
  return undefined;
}

const MarkdownTableHead: Components["th"] = ({ align, ...props }) => (
  <TableHead {...(props as Omit<TableHeadProps, "align">)} align={toTableAlignment(align)} />
);

const MarkdownTableCell: Components["td"] = ({ align, ...props }) => (
  <TableCell {...(props as Omit<TableCellProps, "align">)} align={toTableAlignment(align)} />
);

// Links and inline code inside a blockquote carry `data-quoted`, so they inherit the quote's look.
const QuoteContext = createContext(false);

/** A blockquote renderer, the default or a caller's override, that marks what it holds quoted. */
const quoting = (Blockquote: ElementType): Components["blockquote"] =>
  function QuotedBlockquote(props) {
    return (
      <QuoteContext.Provider value={true}>
        <Blockquote {...props} />
      </QuoteContext.Provider>
    );
  };

const MarkdownBlockquote = quoting(
  ({
    node: _node,
    ...props
  }: ComponentProps<"blockquote"> & {
    node?: unknown;
  }) => <blockquote {...props} />,
);

const QuotableLink = (props: ComponentProps<"a">) => (
  <a {...props} data-quoted={useContext(QuoteContext) || undefined} />
);

const QuotableCode = (props: ComponentProps<"code">) => (
  <code {...props} data-quoted={useContext(QuoteContext) || undefined} />
);

export interface MarkDownRendererProps {
  variant?: "clear" | "card" | "sunk";
  /**
   * `"inherit"` gives bold and italic text the surrounding text's typography, at medium weight, and
   * sets inline code at the small code size, for markdown inside other text. InlineMarkdownRenderer
   * passes it on; omit it for the renderer's own typography.
   */
  typography?: "inherit";
  /** `"spaced"` puts 8px between a paragraph and the list that follows it. Omit it for none. */
  listLeadIn?: "spaced";
  textMarkdown: string;
  options?: Options;
  className?: string;
}

export const MarkDownRenderer = memo((props: MarkDownRendererProps) => {
  const { variant = "clear", typography, listLeadIn } = props;
  const styles = markdownStyles;
  const { mode } = useTheme();
  const theme = mode === "dark" ? vscDarkPlus : oneLight;
  const components: Components = {
    code({ className, children, ...props }) {
      const match = /language-(\w+)/.exec(className || "");

      if (match || (!className && String(children).includes("\n"))) {
        const language = match?.[1] ?? "text";
        const codeString = String(children).trim();
        const codeBlockClass = clsx(styles.codeBlock, names.codeBlock);
        return (
          <>
            <CodeBlock
              language={language}
              codeString={codeString}
              theme={theme}
              className={codeBlockClass}
              syntaxHighlighterClassName=""
            />
            {styleRules(codeBlockClass)}
          </>
        );
      }

      const codeClass = clsx(
        styles.code,
        names.code,
        typography && [styles.codeTypography[typography], names.codeTypography[typography]],
        className,
      );
      return (
        <>
          <QuotableCode className={codeClass} {...props}>
            {children}
          </QuotableCode>
          {styleRules(codeClass)}
        </>
      );
    },
    a({ href, children, ...props }) {
      const linkClass = clsx(styles.link, names.link);
      return (
        <>
          <QuotableLink
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={linkClass}
            {...props}
          >
            {children}
          </QuotableLink>
          {styleRules(linkClass)}
        </>
      );
    },
    table: ({ node: _node, className, ...props }) => (
      <Table
        {...props}
        className={clsx(names.table, className)}
        containerClassName={clsx(styles.tableContainer, names.tableContainer)}
      />
    ),
    thead: TableHeader,
    th: MarkdownTableHead,
    tbody: TableBody,
    tr: TableRow,
    td: MarkdownTableCell,
    blockquote: MarkdownBlockquote,
  };

  // A caller's own blockquote still marks the links and code inside it quoted.
  const customBlockquote = props.options?.components?.blockquote;
  const blockquote = useMemo(
    () => (customBlockquote ? quoting(customBlockquote) : MarkdownBlockquote),
    [customBlockquote],
  );
  const markdownProps = {
    ...props.options,
    components: { ...components, ...props.options?.components, blockquote },
  };

  const rootClass = clsx(
    styles.root,
    styles.variant[variant],
    names.root,
    names.variant[variant],
    typography && [styles.typography[typography], names.typography[typography]],
    listLeadIn && [styles.listLeadIn[listLeadIn], names.listLeadIn[listLeadIn]],
    props.className,
  );
  return (
    <>
      <div className={rootClass}>
        <ReactMarkdown {...markdownProps}>{props.textMarkdown}</ReactMarkdown>
      </div>
      {styleRules(rootClass)}
    </>
  );
});
