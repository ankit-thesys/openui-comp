import {OwnedElement as __OwnedElement} from "../../../../../runtime/adapter";
import {styles as __styles0} from "../../../../../runtime/styles/Hint";
import clsx from "clsx";
import React, { forwardRef } from "react";
import { useFormControlContext } from "../context";
export interface HintProps extends React.ComponentPropsWithoutRef<"div"> {
    children: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
    hasError?: boolean;
}
const Hint = forwardRef<HTMLDivElement, HintProps>(({ children, className, style, hasError, ...props }, ref) => {
    const ctx = useFormControlContext();
    const resolvedHasError = hasError ?? ctx?.hasError ?? false;
    return (<__OwnedElement $element="div" $styles={[__styles0]} ref={ref} className={clsx("openui-hint", className, {
            "openui-hint-error": resolvedHasError,
        })} style={style} {...props}>
        {children}
      </__OwnedElement>);
});
Hint.displayName = "Hint";
export { Hint };
