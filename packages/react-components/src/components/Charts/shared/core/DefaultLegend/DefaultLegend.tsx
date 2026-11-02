"use client";

import clsx from "clsx";
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import React, { Fragment, memo, useCallback, useState } from "react";
import { styleRules } from "../../../../../styles/css";
import { Button } from "../../../../Button";
import { type LegendItem } from "../../../types";
import { defaultLegendClasses, names } from "./defaultLegend.styles";
import { useDefaultLegend } from "./hooks/useDefaultLegend";

interface DefaultLegendProps {
  items: LegendItem[];
  className?: string;
  yAxisLabel?: React.ReactNode;
  xAxisLabel?: React.ReactNode;
  containerWidth?: number;
  isExpanded: boolean;
  setIsExpanded: (isExpanded: boolean) => void;
  style?: React.CSSProperties;
  onItemClick?: (key: string) => void;
  hiddenSeries?: Set<string>;
}

const DefaultLegend = memo(
  React.forwardRef<HTMLDivElement, DefaultLegendProps>(
    (
      {
        items,
        className,
        yAxisLabel,
        xAxisLabel,
        containerWidth,
        isExpanded,
        setIsExpanded,
        style,
        onItemClick,
        hiddenSeries,
      },
      ref,
    ) => {
      const styles = defaultLegendClasses;
      const [buttonWidth, setButtonWidth] = useState(0);
      const { displayItems, hasMoreItems, toggleButtonText } = useDefaultLegend({
        items,
        containerWidth,
        buttonWidth,
        isExpanded,
      });

      const buttonRef = useCallback(
        (node: HTMLButtonElement | null) => {
          if (node) {
            if (node.clientWidth !== buttonWidth) {
              setButtonWidth(node.clientWidth);
            }
          }
        },
        [buttonWidth],
      );

      const handleToggleExpanded = () => {
        setIsExpanded(!isExpanded);
      };

      const showToggleButton = hasMoreItems;

      const rootClass = clsx(styles.root, names.root, className);
      const listClass = clsx(styles.list, names.list);
      return (
        <>
          <div ref={ref} className={rootClass} style={style}>
            {(xAxisLabel || yAxisLabel) && (
              <>
                <div className={clsx(styles.axisLabelContainer, names.axisLabelContainer)}>
                  {xAxisLabel && (
                    <>
                      <span className={clsx(styles.axisLabel, names.axisLabel)}>
                        X-Axis:{" "}
                        <span className={clsx(styles.axisLabelText, names.axisLabelText)}>
                          {xAxisLabel}
                        </span>
                        {styleRules(clsx(styles.axisLabelText, names.axisLabelText))}
                      </span>
                      {styleRules(clsx(styles.axisLabel, names.axisLabel))}
                    </>
                  )}
                  {yAxisLabel && (
                    <>
                      <span className={clsx(styles.axisLabel, names.axisLabel)}>
                        Y-Axis:{" "}
                        <span className={clsx(styles.axisLabelText, names.axisLabelText)}>
                          {yAxisLabel}
                        </span>
                        {styleRules(clsx(styles.axisLabelText, names.axisLabelText))}
                      </span>
                      {styleRules(clsx(styles.axisLabel, names.axisLabel))}
                    </>
                  )}
                </div>
                {styleRules(clsx(styles.axisLabelContainer, names.axisLabelContainer))}
              </>
            )}
            <div
              className={listClass}
              data-state={isExpanded ? "expanded" : showToggleButton ? "collapsed" : undefined}
            >
              {displayItems.map((item) => {
                const isHidden = hiddenSeries?.has(item.key);
                const itemClass = clsx(styles.item, names.item);
                const labelContainerClass = clsx(styles.labelContainer, names.labelContainer);
                const labelClass = clsx(styles.label, names.label);
                return (
                  <Fragment key={item.key}>
                    <div
                      className={itemClass}
                      data-clickable={onItemClick ? "" : undefined}
                      style={
                        {
                          "--_openui-default-legend-item-opacity": isHidden ? 0.3 : 1,
                        } as React.CSSProperties
                      }
                      onClick={onItemClick ? () => onItemClick(item.key) : undefined}
                    >
                      {item.icon ? (
                        <>
                          <span className={clsx(styles.icon, names.icon)}>
                            <item.icon />
                          </span>
                          {styleRules(clsx(styles.icon, names.icon))}
                        </>
                      ) : (
                        <>
                          <div
                            className={clsx(styles.indicator, names.indicator)}
                            style={
                              {
                                "--_openui-default-legend-indicator-color": item.color,
                              } as React.CSSProperties
                            }
                          />
                          {styleRules(clsx(styles.indicator, names.indicator))}
                        </>
                      )}
                      <div className={labelContainerClass}>
                        <span className={labelClass}>{item.label}</span>
                        {styleRules(labelClass)}
                        {item.percentage !== undefined && (
                          <>
                            <span className={clsx(styles.percentage, names.percentage)}>
                              {item.percentage.toFixed(1)}%
                            </span>
                            {styleRules(clsx(styles.percentage, names.percentage))}
                          </>
                        )}
                      </div>
                      {styleRules(labelContainerClass)}
                    </div>
                    {styleRules(itemClass)}
                  </Fragment>
                );
              })}

              {showToggleButton && (
                <>
                  <Button
                    variant="tertiary"
                    size="small"
                    ref={buttonRef}
                    className={clsx(styles.toggleButton, names.toggleButton)}
                    onClick={handleToggleExpanded}
                    iconRight={
                      isExpanded ? (
                        <>
                          <ChevronUpIcon className={clsx(styles.toggleIcon, names.toggleIcon)} />
                          {styleRules(clsx(styles.toggleIcon, names.toggleIcon))}
                        </>
                      ) : (
                        <>
                          <ChevronDownIcon className={clsx(styles.toggleIcon, names.toggleIcon)} />
                          {styleRules(clsx(styles.toggleIcon, names.toggleIcon))}
                        </>
                      )
                    }
                  >
                    {toggleButtonText}
                  </Button>
                  {styleRules(clsx(styles.toggleButton, names.toggleButton))}
                </>
              )}
            </div>
            {styleRules(listClass)}
          </div>
          {styleRules(rootClass)}
        </>
      );
    },
  ),
);

DefaultLegend.displayName = "DefaultLegend";
export { DefaultLegend };
export type { DefaultLegendProps };
