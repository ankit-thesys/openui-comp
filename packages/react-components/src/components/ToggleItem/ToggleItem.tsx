"use client";

import * as ToggleGroupPrimitive from "@radix-ui/react-toggle-group";
import clsx from "clsx";
import { ReactNode } from "react";
import { styleRules } from "../../styles/css";
import { names, toggleItemStyles } from "./toggleItem.styles";

export interface ToggleItemProps extends ToggleGroupPrimitive.ToggleGroupItemProps {
  children: ReactNode;
  className?: string;
}

export const ToggleItem = ({ className, children, ...props }: ToggleItemProps) => {
  const styles = toggleItemStyles;
  const rootClass = clsx(styles.root, names.root, className);
  return (
    <>
      <ToggleGroupPrimitive.Item className={rootClass} {...props}>
        {children}
      </ToggleGroupPrimitive.Item>
      {styleRules(rootClass)}
    </>
  );
};
