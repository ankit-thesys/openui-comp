"use client";

import clsx from "clsx";
import { forwardRef, ReactNode } from "react";
import { styleRules } from "../../styles/css";
import { buttonStyles, names } from "./button.styles";

type ButtonVariant = "primary" | "secondary" | "tertiary";
type ButtonSize = "extra-small" | "small" | "medium" | "large";
type ButtonTone = "default" | "destructive";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
  /** What the action means to the user; `destructive` colours it as a dangerous action. */
  tone?: ButtonTone;
}

// Values React renders as nothing get no icon part, as before the part existed.
const isRendered = (node: ReactNode) =>
  node !== undefined && node !== null && node !== false && node !== "";

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = "primary",
      size = "medium",
      iconLeft,
      iconRight,
      className,
      tone = "default",
      ...props
    },
    ref,
  ) => {
    const styles = buttonStyles;
    const iconClass = clsx(styles.icon, names.icon);
    const icon = (node: ReactNode) =>
      isRendered(node) ? (
        <>
          <span className={iconClass}>{node}</span>
          {styleRules(iconClass)}
        </>
      ) : null;
    const rootClass = clsx(
      styles.root,
      styles.variant[variant],
      styles.size[size],
      styles.tone[tone],
      names.root,
      names.variant[variant],
      names.size[size],
      names.tone[tone],
      className,
    );
    return (
      <>
        <button ref={ref} className={rootClass} {...props}>
          {icon(iconLeft)}
          {children}
          {icon(iconRight)}
        </button>
        {styleRules(rootClass)}
      </>
    );
  },
);

Button.displayName = "Button";
