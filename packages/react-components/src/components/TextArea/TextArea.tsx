"use client";

import clsx from "clsx";
import { css } from "goober";
import React, { forwardRef } from "react";
import { useFormControlContext } from "../FormControl/context";
import { textAreaStyles } from "./textArea.styles";

const stylesheetScope = css`
  :where(&:root) {
    .openui-textarea-root {
      ${textAreaStyles}
    }
  }
`;

if (typeof document !== "undefined") {
  document.documentElement.classList.add(stylesheetScope);
}

const componentClass = "openui-textarea-root";

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
  const ctx = useFormControlContext();
  const resolvedHasError = hasError ?? ctx?.hasError ?? false;

  return (
    <textarea
      ref={ref}
      className={clsx(componentClass, "openui-textarea", className, {
        "openui-textarea-error": resolvedHasError,
      })}
      {...rest}
      rows={rows}
    />
  );
});

TextArea.displayName = "TextArea";

export { TextArea };
