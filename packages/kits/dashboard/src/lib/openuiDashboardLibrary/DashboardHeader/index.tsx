"use client";

import { defineComponent, type ComponentRenderProps } from "@openuidev/react-lang";
import clsx from "clsx";
import { Fragment, type ReactElement } from "react";
import { C1_CLASS_PREFIX } from "../../../shared/classPrefix";
import { dashboardHeaderClass } from "./dashboardHeader.styles";
import { dashboardHeaderPropsSchema, type DashboardHeaderProps } from "./schema";
function DashboardHeaderRenderer({
  props,
  renderNode,
}: ComponentRenderProps<DashboardHeaderProps>) {
  const controls = props.controls;

  return (
    <header className={clsx(dashboardHeaderClass, `${C1_CLASS_PREFIX}-dashboard-header`)}>
      <div className={`${C1_CLASS_PREFIX}-dashboard-header__content`}>
        <div className={`${C1_CLASS_PREFIX}-dashboard-header__title`}>{props.title}</div>
        {props.subtitle ? (
          <div className={`${C1_CLASS_PREFIX}-dashboard-header__subtitle`}>{props.subtitle}</div>
        ) : null}
      </div>
      {controls?.length ? (
        <div
          className={clsx(
            `${C1_CLASS_PREFIX}-dashboard-header__controls`,
            controls.length > 1 && `${C1_CLASS_PREFIX}-dashboard-header__controls--grouped`,
          )}
        >
          {controls.map((control, index) => (
            <Fragment key={`control-${index}`}>{renderNode(control) as ReactElement}</Fragment>
          ))}
        </div>
      ) : null}
    </header>
  );
}

export const DashboardHeaderComponent = defineComponent({
  name: "DashboardHeader",
  props: dashboardHeaderPropsSchema,
  description: "",
  component: DashboardHeaderRenderer,
});
