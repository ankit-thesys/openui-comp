import * as ToggleGroupPrimitive from "@radix-ui/react-toggle-group";
import clsx from "clsx";
import { css } from "goober";
import { ReactNode } from "react";
import { componentStyles } from "./styles";

const stylesheetScope = css`
  :where(&:root) {
    .openui-toggle-item-root {
      ${componentStyles}
    }
  }
`;

if (typeof document !== "undefined") {
  document.documentElement.classList.add(stylesheetScope);
}

const componentClass = "openui-toggle-item-root";

export interface ToggleItemProps extends ToggleGroupPrimitive.ToggleGroupItemProps {
  children: ReactNode;
  className?: string;
}

export const ToggleItem = ({ className, children, ...props }: ToggleItemProps) => {
  return (
    <ToggleGroupPrimitive.Item
      className={clsx(componentClass, "openui-toggle-item", className)}
      {...props}
    >
      {children}
    </ToggleGroupPrimitive.Item>
  );
};
