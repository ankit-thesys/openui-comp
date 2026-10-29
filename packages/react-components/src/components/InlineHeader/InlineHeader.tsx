"use client";

import clsx from "clsx";
import { useStyles } from "../../styles/useStyles";
import { InlineMarkdownRenderer } from "../InlineMarkdownRenderer";
import { inlineHeaderStyles, names } from "./inlineHeader.styles";

export interface InlineHeaderProps {
  heading?: string;
  description?: string;
  className?: string;
}

export const InlineHeader = ({ heading, description, className }: InlineHeaderProps) => {
  const css = useStyles(inlineHeaderStyles);
  if (!heading && !description) return null;

  return (
    <div className={clsx(css.root, names.root, className)}>
      {heading && (
        <div className={clsx(css.heading, names.heading)}>
          <InlineMarkdownRenderer content={heading} />
        </div>
      )}
      {description && (
        <div className={clsx(css.description, names.description)}>
          <InlineMarkdownRenderer content={description} />
        </div>
      )}
    </div>
  );
};
