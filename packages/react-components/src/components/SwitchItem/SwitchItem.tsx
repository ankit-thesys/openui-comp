"use client";

import * as Switch from "@radix-ui/react-switch";
import clsx from "clsx";
import { CSSProperties, forwardRef, ReactNode, useId } from "react";
import { styleRules } from "../../styles/css";
import { names, switchItemStyles } from "./switchItem.styles";

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
  const styles = switchItemStyles;
  const containerClass = clsx(styles.container, names.container);
  const rootClass = clsx(styles.root, names.root, className);
  const thumbClass = clsx(styles.thumb, names.thumb);
  return (
    <>
      <div className={containerClass}>
        <Switch.Root
          ref={ref}
          onCheckedChange={onChange}
          id={id}
          className={rootClass}
          disabled={disabled}
          required={required}
          {...rest}
        >
          <Switch.Thumb className={thumbClass} />
          {styleRules(thumbClass)}
        </Switch.Root>
        {styleRules(rootClass)}
        <div className={names.content}>
          {label && (
            <>
              <label htmlFor={id} className={clsx(styles.label, names.label)}>
                {label}
              </label>
              {styleRules(clsx(styles.label, names.label))}
            </>
          )}
          {description && (
            <>
              <p className={clsx(styles.description, names.description)}>{description}</p>
              {styleRules(clsx(styles.description, names.description))}
            </>
          )}
        </div>
      </div>
      {styleRules(containerClass)}
    </>
  );
});

SwitchItem.displayName = "SwitchItem";

export { SwitchItem, type SwitchItemProps };
