"use client";

import { defineComponent, type ComponentRenderProps } from "@openuidev/react-lang";
import { C1_CLASS_PREFIX } from "../../../shared/classPrefix";
import { DashboardThemeProvider } from "../../theme";
import { dashboardPropsSchema, type DashboardProps } from "./schema";

function DashboardRenderer({ props, renderNode }: ComponentRenderProps<DashboardProps>) {
  // DashboardThemeProvider owns the `-dashboard-theme` scope class (on a
  // `display: contents` wrapper, so it adds no box); this div keeps the
  // `-dashboard` layout class it always had.
  return (
    <DashboardThemeProvider>
      <div className={`${C1_CLASS_PREFIX}-dashboard`}>{renderNode(props.children)}</div>
    </DashboardThemeProvider>
  );
}

export const DashboardComponent = defineComponent({
  name: "Dashboard",
  props: dashboardPropsSchema,
  description:
    "Root component for dashboard apps. Use as Dashboard([DashboardHeader(...), Section(...), ...]).",
  component: DashboardRenderer,
});
