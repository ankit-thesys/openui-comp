"use client";

import * as Switch from "@radix-ui/react-switch";
import clsx from "clsx";
import { css } from "goober";
import { CSSProperties, forwardRef, ReactNode, useId } from "react";
import { componentStyles } from "./styles";

const stylesheetScope = css`
  :where(&:root) {
    .openui-switch-item-container-root {
      ${componentStyles}
    }
  }
`;

if (typeof document !== "undefined") {
  document.documentElement.classList.add(stylesheetScope);
}

const componentClass = "openui-switch-item-container-root";

interface SwitchItemProps {
  label?: ReactNode;
  description?: ReactNode;
  className?: string;
  style?: CSSProperties;
  checked?: boolean;
  disabled?: boolean;
  defaultChecked?: boolean;
  required?: boolean;
  name?: string;
  value?: string;
  onChange?: (value: boolean) => void;
}

const SwitchItem = forwardRef<HTMLButtonElement, SwitchItemProps>((props, ref) => {
  const { label, description, onChange, className, disabled, required, ...rest } = props;
  const id = useId();
  return (
    <div className={clsx(componentClass, "openui-switch-item-container")}>
      <Switch.Root
        ref={ref}
        onCheckedChange={onChange}
        id={id}
        className={clsx("openui-switch-item-root", className)}
        disabled={disabled}
        required={required}
        {...rest}
      >
        <Switch.Thumb className="openui-switch-item-thumb" />
      </Switch.Root>
      <div className="openui-switch-item-content">
        {label && (
          <label htmlFor={id} className="openui-switch-item-label">
            {label}
          </label>
        )}
        {description && <p className="openui-switch-item-description">{description}</p>}
      </div>
    </div>
  );
});

SwitchItem.displayName = "SwitchItem";

export { SwitchItem, type SwitchItemProps };
