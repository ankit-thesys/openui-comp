"use client";

import * as Checkbox from "@radix-ui/react-checkbox";
import clsx from "clsx";
import { CSSProperties, forwardRef, ReactNode, useId } from "react";
import { styleRules } from "../../styles/css";
import { checkBoxItemStyles, names } from "./checkBoxItem.styles";

export interface CheckBoxItemProps {
  label?: ReactNode;
  description?: ReactNode;
  className?: string;
  style?: CSSProperties;
  checked?: boolean;
  defaultChecked?: boolean;
  disabled?: boolean;
  required?: boolean;
  name?: string;
  value?: string;
  onChange?: (checked: boolean) => void;
}

const CheckBoxItem = forwardRef<HTMLButtonElement, CheckBoxItemProps>((props, ref) => {
  const { label, description, onChange, className, disabled, required, ...rest } = props;
  const id = useId();
  const styles = checkBoxItemStyles;
  const containerClass = clsx(styles.container, names.container);
  const rootClass = clsx(styles.root, names.root, className);
  const indicatorClass = clsx(styles.indicator, names.indicator);
  const contentClass = clsx(styles.content, names.content);
  return (
    <>
      <label htmlFor={id} className={containerClass}>
        <Checkbox.Root
          {...rest}
          ref={ref}
          onCheckedChange={onChange}
          id={id}
          className={rootClass}
          disabled={disabled}
          required={required}
        >
          <Checkbox.Indicator className={indicatorClass}>
            <svg
              className={names.icon}
              width="10"
              height="8"
              viewBox="0 0 10 8"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                className={names.check}
                d="M9 1L3.5 6.5L1 4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Checkbox.Indicator>
          {styleRules(indicatorClass)}
        </Checkbox.Root>
        {styleRules(rootClass)}
        <div className={contentClass}>
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
        {styleRules(contentClass)}
      </label>
      {styleRules(containerClass)}
    </>
  );
});

CheckBoxItem.displayName = "CheckBoxItem";

export { CheckBoxItem };
