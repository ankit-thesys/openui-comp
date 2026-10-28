"use client";

import clsx from "clsx";
import { css } from "goober";
import React from "react";
import { CheckBoxItemProps } from "../CheckBoxItem";
import { componentStyles } from "./styles";

const stylesheetScope = css`
  :where(&:root) {
    .openui-checkbox-group-root {
      ${componentStyles}
    }
  }
`;

if (typeof document !== "undefined") {
  document.documentElement.classList.add(stylesheetScope);
}

const componentClass = "openui-checkbox-group-root";

type CheckBoxGroupVariant = "clear" | "card" | "sunk";

interface CheckBoxGroupProps {
  children: React.ReactElement<CheckBoxItemProps> | React.ReactElement<CheckBoxItemProps>[];
  className?: string;
  style?: React.CSSProperties;
  variant?: CheckBoxGroupVariant;
}

const variantMap: Record<CheckBoxGroupVariant, string> = {
  clear: "openui-checkbox-group-clear",
  card: "openui-checkbox-group-card",
  sunk: "openui-checkbox-group-sunk",
};

const CheckBoxGroup = React.forwardRef<HTMLDivElement, CheckBoxGroupProps>((props, ref) => {
  const { children, className, style, variant = "clear" } = props;
  return (
    <div
      ref={ref}
      className={clsx(componentClass, "openui-checkbox-group", variantMap[variant], className)}
      style={style}
    >
      {children}
    </div>
  );
});

CheckBoxGroup.displayName = "CheckBoxGroup";

export { CheckBoxGroup, type CheckBoxGroupProps };
