"use client";

import * as ToggleGroupPrimitive from "@radix-ui/react-toggle-group";
import clsx from "clsx";
import { css } from "goober";
import { ReactElement } from "react";
import { ToggleItemProps } from "../ToggleItem";
import { componentStyles } from "./styles";

const stylesheetScope = css`
  :where(&:root) {
    .openui-toggle-group-root {
      ${componentStyles}
    }
  }
`;

if (typeof document !== "undefined") {
  document.documentElement.classList.add(stylesheetScope);
}

const componentClass = "openui-toggle-group-root";

type RadixToggleGroupProps =
  ToggleGroupPrimitive.ToggleGroupSingleProps | ToggleGroupPrimitive.ToggleGroupMultipleProps;

export type ToggleGroupProps = RadixToggleGroupProps & {
  className?: string;
  children: ReactElement<ToggleItemProps> | ReactElement<ToggleItemProps>[];
};

export const ToggleGroup = ({ children, className, ...props }: ToggleGroupProps) => {
  return (
    <ToggleGroupPrimitive.Root
      className={clsx(componentClass, "openui-toggle-group", className)}
      {...props}
    >
      {children}
    </ToggleGroupPrimitive.Root>
  );
};
