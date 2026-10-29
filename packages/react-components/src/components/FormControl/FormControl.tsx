"use client";

import clsx from "clsx";
import { css } from "goober";
import React, { forwardRef, useMemo } from "react";
import { names as baseNames, baseStyles } from "../../styles/base";
import { useStyles } from "../../styles/useStyles";
import { FormControlProvider } from "./context";
import { formControlStyles } from "./formControl.styles";
const stylesheetScope = css`
  :where(&:root) {
    .openui-form-control-root {
      ${formControlStyles}
    }
  }
`;

if (typeof document !== "undefined") {
  document.documentElement.classList.add(stylesheetScope);
}

const componentClass = "openui-form-control-root";

export interface FormControlProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  hasError?: boolean;
}

const FormControl = forwardRef<HTMLDivElement, FormControlProps>((props, ref) => {
  const { children, className, style, hasError = false } = props;
  const base = useStyles(baseStyles);
  const formControlContextValue = useMemo(() => ({ hasError }), [hasError]);
  return (
    <div
      ref={ref}
      className={clsx(componentClass, base.root, baseNames.root, "openui-form-control", className)}
      style={style}
    >
      <FormControlProvider value={formControlContextValue}>{children}</FormControlProvider>
    </div>
  );
});

FormControl.displayName = "FormControl";

export { FormControl };
