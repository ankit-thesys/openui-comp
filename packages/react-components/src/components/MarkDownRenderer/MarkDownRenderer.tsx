"use client";

import clsx from "clsx";
import { memo } from "react";
import ReactMarkdown, { Components, type Options } from "react-markdown";
import oneLight from "react-syntax-highlighter/dist/cjs/styles/prism/one-light";
import vscDarkPlus from "react-syntax-highlighter/dist/cjs/styles/prism/vsc-dark-plus";
import { useStyles } from "../../styles/useStyles";
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

export interface MarkDownRendererProps {
  variant?: "clear" | "card" | "sunk";
  textMarkdown: string;
  options?: Options;
  className?: string;
}

export const MarkDownRenderer = memo((props: MarkDownRendererProps) => {
  const { variant = "clear" } = props;
  const styles = useStyles(markdownStyles);
  const { mode } = useTheme();
  const theme = mode === "dark" ? vscDarkPlus : oneLight;
  const components: Components = {
    code({ className, children, ...props }) {
      const match = /language-(\w+)/.exec(className || "");

      if (match || (!className && String(children).includes("\n"))) {
        const language = match?.[1] ?? "text";
        const codeString = String(children).trim();
        return (
          <CodeBlock
            language={language}
            codeString={codeString}
            theme={theme}
            className={clsx(styles.codeBlock, names.codeBlock)}
            syntaxHighlighterClassName=""
          />
        );
      }

      return (
        <code className={clsx(styles.code, names.code, className)} {...props}>
          {children}
        </code>
      );
    },
    a({ href, children, ...props }) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={clsx(styles.link, names.link)}
          {...props}
        >
          {children}
        </a>
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
  };

  const markdownProps = {
    ...props.options,
    components: { ...components, ...props.options?.components },
  };

  return (
    <div
      className={clsx(
        styles.root,
        styles.variant[variant],
        names.root,
        names.variant[variant],
        props.className,
      )}
    >
      <ReactMarkdown {...markdownProps}>{props.textMarkdown}</ReactMarkdown>
    </div>
  );
});
