"use client";

import clsx from "clsx";
import { css } from "goober";
import { CSSProperties, forwardRef, HTMLAttributes, ReactElement } from "react";
import { borderBoxClass } from "../../styles/base";
import { ButtonProps } from "../Button";
import { IconButtonProps } from "../IconButton";
import { buttonsStyles } from "./buttons.styles";

const componentClass = "openui-buttons-root";

type ButtonsVariant = "vertical" | "horizontal";

export interface ButtonsProps extends HTMLAttributes<HTMLDivElement> {
  variant?: ButtonsVariant;
  children:
    ReactElement<ButtonProps | IconButtonProps> | ReactElement<ButtonProps | IconButtonProps>[];
  className?: string;
  style?: CSSProperties;
}

const variantMap: Record<ButtonsVariant, string> = {
  vertical: "openui-buttons-vertical",
  horizontal: "openui-buttons-horizontal",
};

export const Buttons = forwardRef<HTMLDivElement, ButtonsProps>((props, ref) => {
  const { className, style, variant = "horizontal", children, ...rest } = props;
  return (
    <div
      ref={ref}
      className={clsx(
        componentClass,
        borderBoxClass,
        "openui-buttons",
        variantMap[variant],
        className,
      )}
      style={style}
      {...rest}
    >
      {children}
    </div>
  );
});

Buttons.displayName = "Buttons";

const stylesheetScope = css`
  :where(&:root) {
    .openui-buttons-root {
      ${buttonsStyles}
    }
  }
`;

if (typeof document !== "undefined") {
  document.documentElement.classList.add(stylesheetScope);
}
