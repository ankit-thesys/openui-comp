"use client";

import clsx from "clsx";
import React, { forwardRef } from "react";
import { styleRules } from "../../../styles/css";
import { useFormControlContext } from "../context";
import { hintStyles, names } from "./hint.styles";

export interface HintProps extends React.ComponentPropsWithoutRef<"div"> {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  hasError?: boolean;
}

const Hint = forwardRef<HTMLDivElement, HintProps>(
  ({ children, className, style, hasError, ...props }, ref) => {
    const styles = hintStyles;
    const ctx = useFormControlContext();
    const resolvedHasError = hasError ?? ctx?.hasError ?? false;
    const rootClass = clsx(styles.root, names.root, className);
    return (
      <>
        <div
          ref={ref}
          className={rootClass}
          data-invalid={resolvedHasError || undefined}
          style={style}
          {...props}
        >
          {children}
        </div>
        {styleRules(rootClass)}
      </>
    );
  },
);

Hint.displayName = "Hint";

export { Hint };
