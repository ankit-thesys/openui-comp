import clsx from "clsx";
import { InlineMarkdownRenderer } from "../InlineMarkdownRenderer";
import { descriptionClass, headingClass, rootClass } from "./inlineHeader.styles";

export interface InlineHeaderProps {
  heading?: string;
  description?: string;
  className?: string;
}

export const InlineHeader = ({ heading, description, className }: InlineHeaderProps) => {
  if (!heading && !description) return null;

  return (
    <div className={clsx(rootClass, "openui-inline-header", className)}>
      {heading && (
        <div className={clsx(headingClass, "openui-inline-header-heading")}>
          <InlineMarkdownRenderer content={heading} />
        </div>
      )}
      {description && (
        <div className={clsx(descriptionClass, "openui-inline-header-description")}>
          <InlineMarkdownRenderer content={description} />
        </div>
      )}
    </div>
  );
};
