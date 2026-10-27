import * as LabelPrimitive from "@radix-ui/react-label";
import clsx from "clsx";
import { css } from "goober";
import React, { forwardRef } from "react";
import { labelStyles } from "./label.styles";

const stylesheetScope = css`
  :where(&:root) {
    .openui-label-root {
      ${labelStyles}
    }
  }
`;

if (typeof document !== "undefined") {
  document.documentElement.classList.add(stylesheetScope);
}

const componentClass = "openui-label-root";

export interface LabelProps extends React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  disabled?: boolean;
  required?: boolean;
}

const Label = forwardRef<HTMLLabelElement, LabelProps>(
  ({ children, className, style, disabled, required, ...props }, ref) => {
    return (
      <LabelPrimitive.Root
        ref={ref}
        className={clsx(
          componentClass,
          "openui-label",
          {
            "openui-label-disabled": disabled,
          },
          className,
        )}
        style={style}
        {...props}
      >
        {children}
        {required && <span className="openui-label-required-asterisk">*</span>}
      </LabelPrimitive.Root>
    );
  },
);

Label.displayName = LabelPrimitive.Root.displayName;

export { Label };
