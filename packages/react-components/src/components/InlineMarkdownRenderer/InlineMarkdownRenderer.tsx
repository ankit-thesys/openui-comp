"use client";

import clsx from "clsx";
import { memo, ReactNode } from "react";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";
import { useStyles } from "../../styles/useStyles";
import { remarkCitations } from "../_shared/remark/remarkCitations";
import { TextContentCitation } from "../Citation";
import { MarkDownRenderer } from "../MarkDownRenderer";
import { markdownStyles } from "../MarkDownRenderer/markdown.styles";
import { inlineMarkdownStyles, names } from "./inlineMarkdown.styles";

const Fragment = ({ children }: { children?: ReactNode }) => children;

export interface InlineMarkdownRendererProps {
  content: string;
  className?: string;
}

/**
 * Lightweight markdown renderer for inline text (bold, italic, links, code).
 * Block-level elements (paragraphs, headings, lists) are flattened so the
 * output stays inline.
 */
export const InlineMarkdownRenderer = memo(
  ({ content, className }: InlineMarkdownRendererProps) => {
    // Register the composed renderer first so the flat content reset follows its root rule,
    // even when inline markdown is the first markdown rendered on the page.
    useStyles(markdownStyles);
    const styles = useStyles(inlineMarkdownStyles);

    if (!content) {
      return null;
    }

    return (
      <span className={clsx(styles.root, names.root, className)}>
        <MarkDownRenderer
          className={clsx(styles.content, names.content)}
          textMarkdown={content}
          options={{
            remarkPlugins: [
              remarkCitations,
              [remarkBreaks, { breaks: false }],
              [remarkGfm, { singleTilde: false }],
            ],
            components: {
              p: Fragment,
              h1: Fragment,
              h2: Fragment,
              h3: Fragment,
              h4: Fragment,
              h5: Fragment,
              h6: Fragment,
              ul: Fragment,
              ol: Fragment,
              li: Fragment,
              span: TextContentCitation,
            },
          }}
        />
      </span>
    );
  },
);

InlineMarkdownRenderer.displayName = "InlineMarkdownRenderer";
