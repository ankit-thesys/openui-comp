import clsx from "clsx";
import type { ReactNode } from "react";
import { C1_CLASS_PREFIX } from "../../shared/classPrefix";
import { filterBarClass } from "./filterBar.styles";

export interface FilterBarProps {
  children?: ReactNode;
  rightChildren?: ReactNode;
  compact?: boolean;
}

export function FilterBar({ children, rightChildren, compact }: FilterBarProps) {
  return (
    <div
      className={clsx(
        filterBarClass,
        `${C1_CLASS_PREFIX}-filter-bar`,
        compact && `${C1_CLASS_PREFIX}-filter-bar--compact`,
      )}
    >
      <div
        className={`${C1_CLASS_PREFIX}-filter-bar__side ${C1_CLASS_PREFIX}-filter-bar__side--left`}
      >
        {children}
      </div>
      {rightChildren ? (
        <div
          className={`${C1_CLASS_PREFIX}-filter-bar__side ${C1_CLASS_PREFIX}-filter-bar__side--right`}
        >
          {rightChildren}
        </div>
      ) : null}
    </div>
  );
}
