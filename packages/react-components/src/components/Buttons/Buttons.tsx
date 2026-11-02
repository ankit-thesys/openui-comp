"use client";

import clsx from "clsx";
import { CSSProperties, forwardRef, HTMLAttributes, ReactElement } from "react";
import { styleRules } from "../../styles/css";
import { ButtonProps } from "../Button";
import { IconButtonProps } from "../IconButton";
import { names as baseNames, baseStyles } from "../SharedBase/base.styles";
import { buttonsStyles, names } from "./buttons.styles";

type ButtonsVariant = "vertical" | "horizontal";

export interface ButtonsProps extends HTMLAttributes<HTMLDivElement> {
  variant?: ButtonsVariant;
  children:
    ReactElement<ButtonProps | IconButtonProps> | ReactElement<ButtonProps | IconButtonProps>[];
  className?: string;
  style?: CSSProperties;
}

export const Buttons = forwardRef<HTMLDivElement, ButtonsProps>((props, ref) => {
  const { className, style, variant = "horizontal", children, ...rest } = props;
  const styles = buttonsStyles;
  const base = baseStyles;
  const rootClass = clsx(
    styles.root,
    styles.variant[variant],
    names.root,
    names.variant[variant],
    base.root,
    baseNames.root,
    className,
  );
  return (
    <>
      <div ref={ref} className={rootClass} style={style} {...rest}>
        {children}
      </div>
      {styleRules(rootClass)}
    </>
  );
});

Buttons.displayName = "Buttons";
