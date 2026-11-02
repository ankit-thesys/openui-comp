"use client";

import clsx from "clsx";
import { CSSProperties, ReactNode } from "react";
import { styleRules } from "../../styles/css";
import { names, textContentStyles } from "./textContent.styles";

export type TextContentVariant = "clear" | "card" | "sunk";

export interface TextContentProps {
  children: ReactNode;
  variant?: TextContentVariant;
  className?: string;
  style?: CSSProperties;
}

const TextContent = (props: TextContentProps) => {
  const { children, variant = "sunk", className, style } = props;

  const css = textContentStyles;
  const rootClass = clsx(
    css.root,
    names.root,
    css.variant[variant],
    names.variant[variant],
    className,
  );
  return (
    <>
      <div className={rootClass} style={style}>
        {children}
      </div>
      {styleRules(rootClass)}
    </>
  );
};

export { TextContent };
