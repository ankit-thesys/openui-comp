import {OwnedElement as __OwnedElement} from "../../../../runtime/adapter";
import {styles as __styles0} from "../../../../runtime/styles/Label";
import * as LabelPrimitive from "@radix-ui/react-label";
import clsx from "clsx";
import React, { forwardRef } from "react";
export interface LabelProps extends React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> {
    children: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
    disabled?: boolean;
    required?: boolean;
}
const Label = forwardRef<HTMLLabelElement, LabelProps>(({ children, className, style, disabled, required, ...props }, ref) => {
    return (<__OwnedElement $element={LabelPrimitive.Root} $styles={[__styles0]} ref={ref} className={clsx("openui-label", {
            "openui-label-disabled": disabled,
        }, className)} style={style} {...props}>
        {children}
        {required && <__OwnedElement $element="span" $styles={[__styles0]} className="openui-label-required-asterisk">*</__OwnedElement>}
      </__OwnedElement>);
});
Label.displayName = LabelPrimitive.Root.displayName;
export { Label };
