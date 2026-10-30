import { TextBlockView } from "@openuidev/react-components";
import clsx from "clsx";
import { Children, type ReactNode } from "react";
import { C1_CLASS_PREFIX } from "../../shared/classPrefix";
import { dashboardCardHeaderClass } from "./dashboardCardHeader.styles";

export interface DashboardCardHeaderProps {
  title: string;
  subtitle?: string;
  titleType?: "text" | "number";
  controls?: ReactNode;
}

export function DashboardCardHeader({
  title,
  subtitle,
  titleType = "text",
  controls,
}: DashboardCardHeaderProps) {
  const controlCount = Children.count(controls);

  return (
    <div
      className={clsx(
        dashboardCardHeaderClass,
        `${C1_CLASS_PREFIX}-dashboard-card-header`,
        !subtitle && `${C1_CLASS_PREFIX}-dashboard-card-header--title-only`,
      )}
    >
      <div className={`${C1_CLASS_PREFIX}-dashboard-card-header__main`}>
        <div className={`${C1_CLASS_PREFIX}-dashboard-card-header__content`}>
          <TextBlockView
            variant={titleType === "number" ? "number-title-text" : "title-text"}
            primary={title}
            secondary={subtitle}
            type={titleType}
            size="xs"
            align="left"
          />
        </div>
      </div>
      {controlCount ? (
        <div
          className={clsx(
            `${C1_CLASS_PREFIX}-dashboard-card-header__controls`,
            controlCount > 1 && `${C1_CLASS_PREFIX}-dashboard-card-header__controls--grouped`,
          )}
        >
          {controls}
        </div>
      ) : null}
    </div>
  );
}
