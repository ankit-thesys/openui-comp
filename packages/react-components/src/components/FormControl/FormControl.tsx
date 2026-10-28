import clsx from "clsx";
import { css } from "goober";
import React, { forwardRef, useMemo } from "react";
import { FormControlProvider } from "./context";
import { formControlStyles } from "./formControl.styles";
const componentClass = css`
  ${formControlStyles}
`;

export interface FormControlProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  hasError?: boolean;
}

const FormControl = forwardRef<HTMLDivElement, FormControlProps>((props, ref) => {
  const { children, className, style, hasError = false } = props;
  const formControlContextValue = useMemo(() => ({ hasError }), [hasError]);
  return (
    <div ref={ref} className={clsx(componentClass, "openui-form-control", className)} style={style}>
      <FormControlProvider value={formControlContextValue}>{children}</FormControlProvider>
    </div>
  );
});

FormControl.displayName = "FormControl";

export { FormControl };
