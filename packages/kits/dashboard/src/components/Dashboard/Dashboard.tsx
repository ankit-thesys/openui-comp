"use client";

import clsx from "clsx";
import type { ReactNode } from "react";
import { C1_CLASS_PREFIX } from "../../shared/classPrefix";
import { DashboardThemeProvider } from "../DashboardThemeProvider";
import { dashboardClass } from "./dashboard.styles";

export interface DashboardProps {
  children?: ReactNode;
}

export function Dashboard({ children }: DashboardProps) {
  // DashboardThemeProvider owns the `-dashboard-theme` scope class (on a
  // `display: contents` wrapper, so it adds no box); this div keeps the
  // `-dashboard` layout class it always had.
  return (
    <DashboardThemeProvider>
      <div className={clsx(dashboardClass, `${C1_CLASS_PREFIX}-dashboard`)}>{children}</div>
    </DashboardThemeProvider>
  );
}
