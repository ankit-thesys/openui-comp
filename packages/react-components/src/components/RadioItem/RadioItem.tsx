"use client";

import * as Radio from "@radix-ui/react-radio-group";
import clsx from "clsx";
import { CSSProperties, forwardRef, ReactNode, useId } from "react";
import { styleRules } from "../../styles/css";
import { names, radioItemStyles } from "./radioItem.styles";

export interface RadioItemProps {
  label?: ReactNode;
  description?: ReactNode;
  className?: string;
  style?: CSSProperties;
  disabled?: boolean;
  required?: boolean;
  value: string;
}

const RadioItem = forwardRef<HTMLButtonElement, RadioItemProps>((props, ref) => {
  const { label, description, className, style, disabled, required, value } = props;
  const id = useId();
  const styles = radioItemStyles;
  const containerClass = clsx(styles.container, names.container);
  const rootClass = clsx(styles.root, names.root, className);
  const svgClass = clsx(styles.svg, names.svg);
  const pathClass = clsx(styles.path, names.path);
  const borderClass = clsx(styles.border, names.border);
  const innerClass = clsx(styles.inner, names.inner);
  const contentClass = clsx(styles.content, names.content);
  return (
    <>
      <label htmlFor={id} className={containerClass}>
        <Radio.Item
          ref={ref}
          id={id}
          className={rootClass}
          value={value}
          disabled={disabled}
          required={required}
          style={style}
        >
          <svg width={16} height={16} fill="none" viewBox="0 0 16 16" className={svgClass}>
            <path // This is the circle that is filled between the border and the circle
              fill="currentColor"
              d="M1 8a7 7 0 1 1 14 0A7 7 0 0 1 1 8Z"
              className={pathClass}
            />
            <path // This is the border
              stroke="currentColor"
              d="M1.5 8a6.5 6.5 0 1 1 13 0 6.5 6.5 0 0 1-13 0Z"
              className={borderClass}
            />
            <path // This is the inner circle
              fill="currentColor"
              d="M4 8a4 4 0 1 1 8 0 4 4 0 0 1-8 0Z"
              className={innerClass}
            />
          </svg>
          {styleRules(svgClass)}
          {styleRules(pathClass)}
          {styleRules(borderClass)}
          {styleRules(innerClass)}
        </Radio.Item>
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

RadioItem.displayName = "RadioItem";

export { RadioItem };
