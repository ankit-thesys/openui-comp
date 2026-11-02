"use client";

import clsx from "clsx";
import React, { forwardRef } from "react";
import { styleRules } from "../../styles/css";
import { useFormControlContext } from "../FormControl/context";
import { names, textAreaStyles } from "./textArea.styles";

export interface TextAreaProps extends Omit<
  React.TextareaHTMLAttributes<HTMLTextAreaElement>,
  "size"
> {
  className?: string;
  placeholder?: string;
  rows?: number;
  hasError?: boolean;
}

const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>((props, ref) => {
  const { className, rows = 3, hasError, ...rest } = props;
  const styles = textAreaStyles;
  const ctx = useFormControlContext();
  const resolvedHasError = hasError ?? ctx?.hasError ?? false;

  const rootClass = clsx(styles.root, names.root, className);
  return (
    <>
      <textarea
        ref={ref}
        className={rootClass}
        aria-invalid={resolvedHasError || undefined}
        {...rest}
        rows={rows}
      />
      {styleRules(rootClass)}
    </>
  );
});

TextArea.displayName = "TextArea";

export { TextArea };
