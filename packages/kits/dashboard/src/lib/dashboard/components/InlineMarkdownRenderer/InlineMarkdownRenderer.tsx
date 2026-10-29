"use client";

import { MarkDownRenderer } from "@openuidev/react-components";
import { memo } from "react";
import remarkGfm from "remark-gfm";
import { C1_CLASS_PREFIX } from "../../../shared/classPrefix";

export interface InlineMarkdownRendererProps {
  content: string;
}

export const InlineMarkdownRenderer = memo(({ content }: InlineMarkdownRendererProps) => {
  if (!content) return null;

  return (
    <span className={`${C1_CLASS_PREFIX}-inline-markdown-renderer`}>
      <MarkDownRenderer
        textMarkdown={content}
        options={{
          // singleTilde: false → only ~~double tildes~~ render as strikethrough.
          remarkPlugins: [[remarkGfm, { singleTilde: false }]],
        }}
      />
    </span>
  );
});

InlineMarkdownRenderer.displayName = "InlineMarkdownRenderer";
