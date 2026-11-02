"use client";

import clsx from "clsx";
import { styleRules } from "../../styles/css";
import { InlineMarkdownRenderer } from "../InlineMarkdownRenderer";
import { inlineHeaderStyles, names } from "./inlineHeader.styles";

export interface InlineHeaderProps {
  heading?: string;
  description?: string;
  className?: string;
}

export const InlineHeader = ({ heading, description, className }: InlineHeaderProps) => {
  const css = inlineHeaderStyles;
  if (!heading && !description) return null;

  const rootClass = clsx(css.root, names.root, className);
  return (
    <>
      <div className={rootClass}>
        {heading && (
          <>
            <div className={clsx(css.heading, names.heading)}>
              <InlineMarkdownRenderer content={heading} />
            </div>
            {styleRules(clsx(css.heading, names.heading))}
          </>
        )}
        {description && (
          <>
            <div className={clsx(css.description, names.description)}>
              <InlineMarkdownRenderer content={description} />
            </div>
            {styleRules(clsx(css.description, names.description))}
          </>
        )}
      </div>
      {styleRules(rootClass)}
    </>
  );
};
