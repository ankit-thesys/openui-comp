"use client";

import clsx from "clsx";
import { css } from "goober";
import { forwardRef, ReactNode } from "react";
import { buttonStyles } from "./button.styles";

const stylesheetScope = css`
  :where(&:root) {
    .openui-button-root {
      ${buttonStyles}
    }
  }
`;

if (typeof document !== "undefined") {
  document.documentElement.classList.add(stylesheetScope);
}

type ButtonVariant = "primary" | "secondary" | "tertiary";
type ButtonSize = "extra-small" | "small" | "medium" | "large";
type ButtonType = "normal" | "destructive";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
  buttonType?: ButtonType;
}

const normalVariantMap: Record<ButtonVariant, string> = {
  primary: "openui-button-base-primary",
  secondary: "openui-button-base-secondary",
  tertiary: "openui-button-base-tertiary",
};

const destructiveVariantMap: Record<ButtonVariant, string> = {
  primary: "openui-button-base-destructive-primary",
  secondary: "openui-button-base-destructive-secondary",
  tertiary: "openui-button-base-destructive-tertiary",
};

const sizeMap: Record<ButtonSize, string> = {
  "extra-small": "openui-button-base-extra-small",
  small: "openui-button-base-small",
  medium: "openui-button-base-medium",
  large: "openui-button-base-large",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = "primary",
      size = "medium",
      iconLeft,
      iconRight,
      className,
      buttonType = "normal",
      ...props
    },
    ref,
  ) => {
    const variantMap = buttonType === "destructive" ? destructiveVariantMap : normalVariantMap;
    return (
      <button
        ref={ref}
        className={clsx(
          "openui-button-root",
          "openui-button-base",
          variantMap[variant],
          sizeMap[size],
          className,
        )}
        {...props}
      >
        {iconLeft}
        {children}
        {iconRight}
      </button>
    );
  },
);

Button.displayName = "Button";
