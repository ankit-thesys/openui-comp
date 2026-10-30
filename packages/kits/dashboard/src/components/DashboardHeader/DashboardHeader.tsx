import clsx from "clsx";
import { Children, type ReactNode } from "react";
import { C1_CLASS_PREFIX } from "../../shared/classPrefix";
import { dashboardHeaderClass } from "./dashboardHeader.styles";

export interface DashboardHeaderProps {
  title: string;
  subtitle?: string;
  controls?: ReactNode;
}

export function DashboardHeader({ title, subtitle, controls }: DashboardHeaderProps) {
  const controlCount = Children.count(controls);

  return (
    <header className={clsx(dashboardHeaderClass, `${C1_CLASS_PREFIX}-dashboard-header`)}>
      <div className={`${C1_CLASS_PREFIX}-dashboard-header__content`}>
        <div className={`${C1_CLASS_PREFIX}-dashboard-header__title`}>{title}</div>
        {subtitle ? (
          <div className={`${C1_CLASS_PREFIX}-dashboard-header__subtitle`}>{subtitle}</div>
        ) : null}
      </div>
      {controlCount ? (
        <div
          className={clsx(
            `${C1_CLASS_PREFIX}-dashboard-header__controls`,
            controlCount > 1 && `${C1_CLASS_PREFIX}-dashboard-header__controls--grouped`,
          )}
        >
          {controls}
        </div>
      ) : null}
    </header>
  );
}
