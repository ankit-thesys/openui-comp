import clsx from "clsx";
import { css } from "goober";
import React, { forwardRef } from "react";
import { useFormControlContext } from "../context";
import { hintStyles } from "./hint.styles";

const componentClass = css(hintStyles);

export interface HintProps extends React.ComponentPropsWithoutRef<"div"> {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  hasError?: boolean;
}

const Hint = forwardRef<HTMLDivElement, HintProps>(
  ({ children, className, style, hasError, ...props }, ref) => {
    const ctx = useFormControlContext();
    const resolvedHasError = hasError ?? ctx?.hasError ?? false;
    return (
      <div
        ref={ref}
        className={clsx(componentClass, "openui-hint", className, {
          "openui-hint-error": resolvedHasError,
        })}
        style={style}
        {...props}
      >
        {children}
      </div>
    );
  },
);

Hint.displayName = "Hint";

export { Hint };
