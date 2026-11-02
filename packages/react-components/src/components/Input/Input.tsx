"use client";

import clsx from "clsx";
import React from "react";
import { styleRules } from "../../styles/css";
import { useFormControlContext } from "../FormControl/context";
import { inputStyles, names } from "./input.styles";

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  styles?: React.CSSProperties;
  className?: string;
  size?: "small" | "medium" | "large";
  hasError?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, styles, size = "medium", hasError, ...props }, ref) => {
    const css = inputStyles;
    const ctx = useFormControlContext();
    const resolvedHasError = hasError ?? ctx?.hasError ?? false;
    const rootClass = clsx(css.root, css.size[size], names.root, names.size[size], className);
    return (
      <>
        <input
          autoComplete="off"
          ref={ref}
          className={rootClass}
          aria-invalid={resolvedHasError || undefined}
          style={styles}
          {...props}
        />
        {styleRules(rootClass)}
      </>
    );
  },
);

Input.displayName = "Input";
