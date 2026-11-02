"use client";

import clsx from "clsx";
import { CSSProperties, forwardRef, ReactElement } from "react";
import { styleRules } from "../../styles/css";
import { SwitchItemProps } from "../SwitchItem";
import { names, switchGroupStyles } from "./switchGroup.styles";

type SwitchGroupVariant = "clear" | "card" | "sunk";
export interface SwitchGroupProps {
  children: ReactElement<SwitchItemProps> | ReactElement<SwitchItemProps>[];
  className?: string;
  style?: CSSProperties;
  variant?: SwitchGroupVariant;
}

const SwitchGroup = forwardRef<HTMLDivElement, SwitchGroupProps>((props, ref) => {
  const { children, className, style, variant = "clear" } = props;
  const styles = switchGroupStyles;
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

SwitchGroup.displayName = "SwitchGroup";

export { SwitchGroup };
