"use client";

import clsx from "clsx";
import { css } from "goober";
import { CSSProperties, forwardRef, ReactElement } from "react";
import { SwitchItemProps } from "../SwitchItem";
import { componentStyles } from "./styles";

const stylesheetScope = css`
  :where(&:root) {
    .openui-switch-group-root {
      ${componentStyles}
    }
  }
`;

if (typeof document !== "undefined") {
  document.documentElement.classList.add(stylesheetScope);
}

const componentClass = "openui-switch-group-root";

type SwitchGroupVariant = "clear" | "card" | "sunk";
export interface SwitchGroupProps {
  children: ReactElement<SwitchItemProps> | ReactElement<SwitchItemProps>[];
  className?: string;
  style?: CSSProperties;
  variant?: SwitchGroupVariant;
}

const variants: Record<SwitchGroupVariant, string> = {
  clear: "openui-switch-group-clear",
  card: "openui-switch-group-card",
  sunk: "openui-switch-group-sunk",
};

const SwitchGroup = forwardRef<HTMLDivElement, SwitchGroupProps>((props, ref) => {
  const { children, className, style, variant = "clear" } = props;
  return (
    <div
      ref={ref}
      className={clsx(componentClass, "openui-switch-group", variants[variant], className)}
      style={style}
    >
      {children}
    </div>
  );
});

SwitchGroup.displayName = "SwitchGroup";

export { SwitchGroup };
