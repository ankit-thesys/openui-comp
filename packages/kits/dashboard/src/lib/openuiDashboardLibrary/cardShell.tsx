"use client";

import { Button, Card } from "@openuidev/react-components";
import { type ComponentRenderProps, useIsStreaming } from "@openuidev/react-lang";
import clsx from "clsx";
import { Maximize2, Minimize2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { z } from "zod/v4";
import { C1_CLASS_PREFIX } from "../../shared/classPrefix";
import { ButtonComponent } from "./Button";
import { ButtonGroupComponent } from "./ButtonGroup";
import { CalloutComponent } from "./Callout";
import { shellCardClass } from "./cardShell.styles";
import { AreaChartComponent } from "./Charts/AreaChart";
import { BarChartComponent } from "./Charts/BarChart";
import { HorizontalBarChartComponent } from "./Charts/HorizontalBarChart";
import { LineChartComponent } from "./Charts/LineChart";
import { PieChartComponent } from "./Charts/PieChart";
import { RadarChartComponent } from "./Charts/RadarChart";
import { RadialChartComponent } from "./Charts/RadialChart";
import { ScatterChartComponent } from "./Charts/ScatterChart";
import { DashboardCardHeaderComponent } from "./DashboardCardHeader";
import { EntityListComponent } from "./EntityList";
import { ImageBlockComponent } from "./ImageBlock";
import { ListComponent } from "./List";
import { MarkDownRendererComponent } from "./MarkDownRenderer";
import { MetricIndicatorComponent } from "./MetricIndicator";
import { TableComponent } from "./Table";
import { TagBlockComponent } from "./TagBlock";
import { TextCalloutComponent } from "./TextCallout";
import { TextContentComponent } from "./TextContent";
export const mediumCardChildSchema = z.union([
  DashboardCardHeaderComponent.ref,
  BarChartComponent.ref,
  LineChartComponent.ref,
  AreaChartComponent.ref,
  RadarChartComponent.ref,
  HorizontalBarChartComponent.ref,
  PieChartComponent.ref,
  RadialChartComponent.ref,
  ScatterChartComponent.ref,
  TableComponent.ref,
  MetricIndicatorComponent.ref,
  TextContentComponent.ref,
  MarkDownRendererComponent.ref,
  CalloutComponent.ref,
  TextCalloutComponent.ref,
  ImageBlockComponent.ref,
  TagBlockComponent.ref,
  ButtonComponent.ref,
  ButtonGroupComponent.ref,
  ListComponent.ref,
  EntityListComponent.ref,
]);

export const largeCardChildSchema = z.union([
  DashboardCardHeaderComponent.ref,
  BarChartComponent.ref,
  LineChartComponent.ref,
  AreaChartComponent.ref,
  HorizontalBarChartComponent.ref,
  ScatterChartComponent.ref,
  TableComponent.ref,
  MetricIndicatorComponent.ref,
  TextContentComponent.ref,
  MarkDownRendererComponent.ref,
  CalloutComponent.ref,
  TextCalloutComponent.ref,
  ImageBlockComponent.ref,
  TagBlockComponent.ref,
  ButtonComponent.ref,
  ButtonGroupComponent.ref,
  ListComponent.ref,
  EntityListComponent.ref,
]);

export const createCardPropsSchema = (childSchema: z.ZodTypeAny) =>
  z.object({
    children: z.array(childSchema).default([]),
    collapsed: z.boolean().default(false),
  });

type AppCardProps = {
  children: unknown[];
  collapsed: boolean;
};

export type AppCardSize = "small" | "medium" | "large";

function normalizeMediumCardChildren(children: unknown[], size: AppCardSize) {
  if (size !== "medium") {
    return children;
  }

  return children.map((child) => {
    if (
      typeof child !== "object" ||
      child === null ||
      (child as { type?: string }).type !== "element" ||
      (child as { typeName?: string }).typeName !== PieChartComponent.name
    ) {
      return child;
    }

    return {
      ...child,
      props: {
        ...(child as { props?: Record<string, unknown> }).props,
        legendVariant: "stacked",
      },
    };
  });
}

function getCardTitle(children: unknown[]) {
  const header = children.find(
    (child) =>
      typeof child === "object" &&
      child !== null &&
      (child as { typeName?: string }).typeName === DashboardCardHeaderComponent.name,
  ) as { props?: { title?: unknown } } | undefined;

  return typeof header?.props?.title === "string" ? header.props.title : "Card details";
}

export function AppCardRenderer({
  props,
  renderNode,
  size,
}: ComponentRenderProps<AppCardProps> & {
  size: AppCardSize;
}) {
  const isStreaming = useIsStreaming();
  const contentRef = useRef<HTMLDivElement>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const normalizedChildren = normalizeMediumCardChildren(props.children, size);
  const collapseRequested = size !== "small" && props.collapsed === true;
  const showCollapseControl = collapseRequested && isOverflowing;
  const isCollapsed = collapseRequested;
  const modalTitle = getCardTitle(props.children);

  useEffect(() => {
    if (!collapseRequested) {
      setIsModalOpen(false);
      setIsOverflowing(false);
      return;
    }

    const contentElement = contentRef.current;
    if (!contentElement) {
      return;
    }

    const wrapElement = contentElement.parentElement;

    const updateOverflowState = () => {
      if (!wrapElement) return;
      setIsOverflowing(
        wrapElement.clientHeight > 0 && contentElement.scrollHeight > wrapElement.clientHeight + 1,
      );
    };

    updateOverflowState();

    if (typeof ResizeObserver === "undefined") {
      return;
    }

    const resizeObserver = new ResizeObserver(updateOverflowState);
    resizeObserver.observe(contentElement);

    return () => resizeObserver.disconnect();
  }, [collapseRequested]);

  useEffect(() => {
    if (!showCollapseControl) {
      setIsModalOpen(false);
    }
  }, [showCollapseControl]);

  useEffect(() => {
    if (!isModalOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsModalOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isModalOpen]);

  return (
    <Card
      width="full"
      variant="card"
      className={clsx(
        shellCardClass,
        `${C1_CLASS_PREFIX}-shell-card`,
        `${C1_CLASS_PREFIX}-shell-card--${size}`,
        isStreaming && `${C1_CLASS_PREFIX}-shell-card--streaming`,
        collapseRequested && `${C1_CLASS_PREFIX}-shell-card--collapse-requested`,
        isCollapsed && `${C1_CLASS_PREFIX}-shell-card--collapsed`,
      )}
    >
      <div className={`${C1_CLASS_PREFIX}-shell-card__content-wrap`}>
        <div ref={contentRef} className={`${C1_CLASS_PREFIX}-shell-card__content`}>
          {renderNode(normalizedChildren)}
        </div>
        {showCollapseControl && (
          <div className={`${C1_CLASS_PREFIX}-shell-card__collapse-fade`} aria-hidden="true" />
        )}
      </div>
      {showCollapseControl && (
        <div className={`${C1_CLASS_PREFIX}-shell-card__collapse-control`}>
          <Button
            variant="secondary"
            size="small"
            buttonType="normal"
            iconLeft={<Maximize2 size={14} />}
            onClick={() => setIsModalOpen(true)}
          >
            Expand
          </Button>
        </div>
      )}
      {isModalOpen && (
        <div
          className={`${C1_CLASS_PREFIX}-shell-card-modal`}
          role="dialog"
          aria-modal="true"
          aria-label={modalTitle}
        >
          <button
            type="button"
            className={`${C1_CLASS_PREFIX}-shell-card-modal__overlay`}
            aria-label="Minimize expanded card"
            onClick={() => setIsModalOpen(false)}
          />
          <div className={`${C1_CLASS_PREFIX}-shell-card-modal__frame`}>
            <div className={`${C1_CLASS_PREFIX}-shell-card-modal__minimize`}>
              <Button
                variant="secondary"
                size="small"
                buttonType="normal"
                iconLeft={<Minimize2 size={14} />}
                onClick={() => setIsModalOpen(false)}
              >
                Minimize
              </Button>
            </div>
            <div className={`${C1_CLASS_PREFIX}-shell-card-modal__content`}>
              <div className={`${C1_CLASS_PREFIX}-shell-card-modal__body`}>
                <div className={`${C1_CLASS_PREFIX}-shell-card__content`}>
                  {renderNode(normalizedChildren)}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
