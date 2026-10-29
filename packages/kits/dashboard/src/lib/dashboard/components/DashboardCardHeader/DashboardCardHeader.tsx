"use client";

import { defineComponent, type ComponentRenderProps } from "@openuidev/react-lang";
import clsx from "clsx";
import { Fragment, type ReactElement } from "react";
import { C1_CLASS_PREFIX } from "../../../shared/classPrefix";
import { TextBlockView } from "../TextBlock/TextBlockView";
import { dashboardCardHeaderPropsSchema, type DashboardCardHeaderProps } from "./schema";

function DashboardCardHeaderRenderer({
  props,
  renderNode,
}: ComponentRenderProps<DashboardCardHeaderProps>) {
  const controls = props.controls;

  return (
    <div
      className={clsx(
        `${C1_CLASS_PREFIX}-dashboard-card-header`,
        !props.subtitle && `${C1_CLASS_PREFIX}-dashboard-card-header--title-only`,
      )}
    >
      <div className={`${C1_CLASS_PREFIX}-dashboard-card-header__main`}>
        <div className={`${C1_CLASS_PREFIX}-dashboard-card-header__content`}>
          <TextBlockView
            variant={props.titleType === "number" ? "number-title-text" : "title-text"}
            primary={props.title}
            secondary={props.subtitle}
            type={props.titleType}
            size="xs"
            align="left"
          />
        </div>
      </div>
      {controls?.length ? (
        <div
          className={clsx(
            `${C1_CLASS_PREFIX}-dashboard-card-header__controls`,
            controls.length > 1 && `${C1_CLASS_PREFIX}-dashboard-card-header__controls--grouped`,
          )}
        >
          {controls.map((control, index) => (
            <Fragment key={`control-${index}`}>{renderNode(control) as ReactElement}</Fragment>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export const DashboardCardHeaderComponent = defineComponent({
  name: "DashboardCardHeader",
  props: dashboardCardHeaderPropsSchema,
  description:
    'Card header for MediumCard and LargeCard. If the card has a clear leading KPI or score, prefer making that value the title with titleType "number" and use the subtitle for the label; use titleType "text" for descriptive titles.',
  component: DashboardCardHeaderRenderer,
});
