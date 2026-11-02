"use client";

import clsx from "clsx";
import React from "react";
import { styleRules } from "../../styles/css";
import { CheckBoxItemProps } from "../CheckBoxItem";
import { checkBoxGroupStyles, names } from "./checkBoxGroup.styles";

type CheckBoxGroupVariant = "clear" | "card" | "sunk";

interface CheckBoxGroupProps {
  children: React.ReactElement<CheckBoxItemProps> | React.ReactElement<CheckBoxItemProps>[];
  className?: string;
  style?: React.CSSProperties;
  variant?: CheckBoxGroupVariant;
}

const CheckBoxGroup = React.forwardRef<HTMLDivElement, CheckBoxGroupProps>((props, ref) => {
  const { children, className, style, variant = "clear" } = props;
  const styles = checkBoxGroupStyles;
  const rootClass = clsx(
    styles.root,
    names.root,
    styles.variant[variant],
    names.variant[variant],
    className,
  );
  return (
    <>
      <div ref={ref} className={rootClass} style={style}>
        {children}
      </div>
      {styleRules(rootClass)}
    </>
  );
});

CheckBoxGroup.displayName = "CheckBoxGroup";

export { CheckBoxGroup, type CheckBoxGroupProps };
