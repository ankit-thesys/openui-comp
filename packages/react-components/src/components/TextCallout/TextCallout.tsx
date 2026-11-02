"use client";

import clsx from "clsx";
import React from "react";
import { styleRules } from "../../styles/css";
import { names, textCalloutStyles } from "./textCallout.styles";

type TextCalloutVariant = "neutral" | "info" | "warning" | "success" | "danger";

export interface TextCalloutProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  variant?: TextCalloutVariant;
  title?: React.ReactNode;
  description?: React.ReactNode;
}

export const TextCallout = React.forwardRef<HTMLDivElement, TextCalloutProps>((props, ref) => {
  const styles = textCalloutStyles;
  const { className, variant = "neutral", title, description, ...rest } = props;

  const rootClass = clsx(
    styles.root,
    names.root,
    styles.variant[variant],
    names.variant[variant],
    className,
  );
  const contentClass = clsx(styles.content, names.content);
  return (
    <>
      <div ref={ref} className={rootClass} {...rest}>
        <div className={contentClass}>
          {title && (
            <>
              <span className={clsx(styles.title, names.title)}>{title}</span>
              {styleRules(clsx(styles.title, names.title))}
            </>
          )}
          {description && (
            <>
              <span className={clsx(styles.description, names.description)}>{description}</span>
              {styleRules(clsx(styles.description, names.description))}
            </>
          )}
        </div>
        {styleRules(contentClass)}
      </div>
      {styleRules(rootClass)}
    </>
  );
});
