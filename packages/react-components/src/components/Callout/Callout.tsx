"use client";

import clsx from "clsx";
import React from "react";
import {
  descriptionClass,
  dismissClass,
  rootClass,
  titleClass,
  variantClasses,
} from "./callout.styles";

type CalloutVariant = "info" | "danger" | "warning" | "success" | "neutral";

export interface CalloutProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  variant?: CalloutVariant;
  title?: React.ReactNode;
  description?: React.ReactNode;
  /** Auto-dismiss after N milliseconds. CSS-only fade + collapse. */
  duration?: number;
}

const variantMap: Record<CalloutVariant, string> = {
  info: "openui-callout-info",
  danger: "openui-callout-danger",
  warning: "openui-callout-warning",
  success: "openui-callout-success",
  neutral: "openui-callout-neutral",
};

export const Callout = React.forwardRef<HTMLDivElement, CalloutProps>((props, ref) => {
  const { className, variant = "neutral", title, description, duration, style, ...rest } = props;

  const dismissStyle = duration
    ? ({ ...style, "--callout-duration": `${duration}ms` } as React.CSSProperties)
    : style;

  return (
    <div
      ref={ref}
      className={clsx(
        rootClass,
        "openui-callout",
        variantClasses[variant],
        variantMap[variant],
        duration && dismissClass,
        duration && "openui-callout-autodismiss",
        className,
      )}
      style={dismissStyle}
      {...rest}
    >
      {title && <span className={clsx(titleClass, "openui-callout-title")}>{title}</span>}
      {description && (
        <span className={clsx(descriptionClass, "openui-callout-description")}>{description}</span>
      )}
    </div>
  );
});
