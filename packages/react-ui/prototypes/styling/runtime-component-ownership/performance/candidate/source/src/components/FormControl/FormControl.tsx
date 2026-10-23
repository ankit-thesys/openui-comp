import {OwnedElement as __OwnedElement} from "../../../../runtime/adapter";
import {styles as __styles0} from "../../../../runtime/styles/FormControl";
import clsx from "clsx";
import React, { forwardRef, useMemo } from "react";
import { FormControlProvider } from "./context";
export interface FormControlProps {
    children: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
    hasError?: boolean;
}
const FormControl = forwardRef<HTMLDivElement, FormControlProps>((props, ref) => {
    const { children, className, style, hasError = false } = props;
    const formControlContextValue = useMemo(() => ({ hasError }), [hasError]);
    return (<__OwnedElement $element="div" $styles={[__styles0]} ref={ref} className={clsx("openui-form-control", className)} style={style}>
      <FormControlProvider value={formControlContextValue}>{children}</FormControlProvider>
    </__OwnedElement>);
});
FormControl.displayName = "FormControl";
export { FormControl };
