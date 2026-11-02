"use client";

import * as SliderPrimitive from "@radix-ui/react-slider";
import clsx from "clsx";
import { forwardRef, Fragment, ReactNode, useState } from "react";
import { styleRules } from "../../styles/css";
import { names, sliderStyles } from "./slider.styles";

const formatNumber = (num: number | undefined): string => {
  if (num === undefined) {
    return "";
  }
  // format number to k, m, b
  if (num >= 1000) {
    return new Intl.NumberFormat("en-US", {
      notation: "compact",
      compactDisplay: "short",
    })
      .format(num)
      .toLowerCase();
  }
  return String(num);
};

export interface SliderProps extends Omit<
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>,
  "value" | "defaultValue"
> {
  variant: "continuous" | "discrete";
  min: number;
  max: number;
  step?: number;
  disabled?: boolean;
  value?: number[];
  defaultValue?: number[];
  className?: string;
  style?: React.CSSProperties;
  leftContent?: ReactNode;
  rightContent?: ReactNode;
}

export const Slider = forwardRef<React.ComponentRef<typeof SliderPrimitive.Root>, SliderProps>(
  (
    {
      variant = "continuous",
      min,
      max,
      step,
      disabled,
      value,
      defaultValue,
      onValueChange,
      className,
      style,
      leftContent,
      rightContent,
      ...props
    },
    ref,
  ) => {
    const styles = sliderStyles;
    // used to show the correct value on thumb
    const [internalValue, setInternalValue] = useState(
      defaultValue && defaultValue.length > 0 ? defaultValue : [min],
    );

    const isControlled = value !== undefined;
    const valueToShow = isControlled ? value : internalValue;

    const isRange = valueToShow && valueToShow.length > 1;

    const thumbs = (isRange ? valueToShow : [valueToShow[0]]).map((v, i) => {
      const thumbClass = clsx(styles.thumb, names.thumb);
      const handleClass = clsx(styles.handle, names.handle);
      const handleInnerClass = clsx(styles.handleInner, names.handleInner);
      const handleDotClass = clsx(styles.handleDot, names.handleDot);
      return (
        <Fragment key={i}>
          <SliderPrimitive.Thumb className={thumbClass}>
            <div className={handleClass}>
              <div className={handleInnerClass}>
                <div className={handleDotClass} />
                {styleRules(handleDotClass)}
              </div>
              {styleRules(handleInnerClass)}
              {!disabled && (
                <>
                  <div className={clsx(styles.value, names.value)}>{formatNumber(v)}</div>
                  {styleRules(clsx(styles.value, names.value))}
                </>
              )}
            </div>
            {styleRules(handleClass)}
          </SliderPrimitive.Thumb>
          {styleRules(thumbClass)}
        </Fragment>
      );
    });

    const renderDots = () => {
      if (variant === "discrete" && step) {
        const numSteps = Math.floor((max - min) / step);
        const currentValue = valueToShow?.[0] ?? min;

        return Array.from({ length: numSteps + 1 }, (_, index) => {
          const value = min + step * index;
          const position = ((value - min) / (max - min)) * 100;
          const isActive = isRange
            ? value >= (valueToShow?.[0] ?? min) && value <= (valueToShow?.[1] ?? max)
            : value <= currentValue;

          const markClass = clsx(styles.mark, names.mark);
          return (
            <Fragment key={value}>
              <div
                className={markClass}
                data-state={isActive ? "active" : "inactive"}
                style={{ left: `${position}%` }}
              />
              {styleRules(markClass)}
            </Fragment>
          );
        });
      }
      return null;
    };

    const wrapperClass = clsx(styles.wrapper, names.wrapper);
    const containerWrapperClass = clsx(styles.containerWrapper, names.containerWrapper);
    const containerClass = clsx(styles.container, names.container);
    const rootClass = clsx(styles.root, names.root, names.variant[variant], className);
    const trackClass = clsx(styles.track, names.track);
    const rangeClass = clsx(styles.range, names.range);
    const labelsClass = clsx(styles.labels, names.labels);
    return (
      <>
        <div className={wrapperClass}>
          {leftContent && (
            <>
              <div className={clsx(styles.leftContent, names.leftContent)}>{leftContent}</div>
              {styleRules(clsx(styles.leftContent, names.leftContent))}
            </>
          )}
          <div className={containerWrapperClass}>
            <div className={containerClass}>
              <SliderPrimitive.Root
                ref={ref}
                className={rootClass}
                {...props}
                min={min}
                max={max}
                step={step}
                value={valueToShow}
                onValueChange={(val) => {
                  if (!isControlled) {
                    setInternalValue(val);
                  }
                  onValueChange?.(val);
                }}
                minStepsBetweenThumbs={1}
                disabled={disabled}
                key={variant}
                style={style}
              >
                <SliderPrimitive.Track className={trackClass}>
                  <SliderPrimitive.Range
                    className={rangeClass}
                    data-at-min={!isRange && valueToShow?.[0] === min ? "" : undefined}
                  />
                  {styleRules(rangeClass)}
                  {variant === "discrete" && renderDots()}
                </SliderPrimitive.Track>
                {styleRules(trackClass)}
                {thumbs}
              </SliderPrimitive.Root>
              {styleRules(rootClass)}
            </div>
            {styleRules(containerClass)}
            <div className={labelsClass}>
              <span className={names.label}>{formatNumber(min)}</span>
              <span className={names.label}>{formatNumber(max)}</span>
            </div>
            {styleRules(labelsClass)}
          </div>
          {styleRules(containerWrapperClass)}
          {rightContent && (
            <>
              <div className={clsx(styles.leftContent, names.rightContent)}>{rightContent}</div>
              {styleRules(clsx(styles.leftContent, names.rightContent))}
            </>
          )}
        </div>
        {styleRules(wrapperClass)}
      </>
    );
  },
);
