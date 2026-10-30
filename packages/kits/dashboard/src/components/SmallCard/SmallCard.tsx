import { Card, IconTag, TextBlockView } from "@openuidev/react-components";
import clsx from "clsx";
import type { ComponentProps, ReactNode } from "react";
import { C1_CLASS_PREFIX } from "../../shared/classPrefix";
import { shellCardClass } from "../ShellCard/shellCard.styles";
import { smallCardClass, smallCardSnippetClass } from "./smallCard.styles";

type IconTagProps = ComponentProps<typeof IconTag>;

function SmallCardFrame({ snippet, children }: { snippet?: boolean; children: ReactNode }) {
  return (
    <Card
      width="full"
      variant="card"
      className={clsx(
        shellCardClass,
        `${C1_CLASS_PREFIX}-shell-card`,
        `${C1_CLASS_PREFIX}-shell-card--small`,
        snippet && `${C1_CLASS_PREFIX}-shell-card--small-snippet`,
      )}
    >
      {children}
    </Card>
  );
}

export interface SmallCardMetricProps {
  title: string;
  metric: string;
  trend?: { direction?: string; value?: number };
}

/** Overview form: a title above a metric with an optional trend. */
export function SmallCardMetric({ title, metric, trend }: SmallCardMetricProps) {
  const isPositive = trend?.direction === "up";
  const isNegative = trend?.direction === "down";

  return (
    <SmallCardFrame>
      <div
        className={clsx(
          smallCardClass,
          `${C1_CLASS_PREFIX}-small-card`,
          `${C1_CLASS_PREFIX}-small-card--title-metric`,
        )}
      >
        <div className={`${C1_CLASS_PREFIX}-small-card__title`}>{title}</div>
        <div className={`${C1_CLASS_PREFIX}-small-card__metric-row`}>
          <div className={`${C1_CLASS_PREFIX}-small-card__metric`}>{metric}</div>
          {trend?.value !== undefined && (
            <div
              className={clsx(
                `${C1_CLASS_PREFIX}-small-card__trend`,
                isPositive && `${C1_CLASS_PREFIX}-small-card__trend--success`,
                isNegative && `${C1_CLASS_PREFIX}-small-card__trend--danger`,
              )}
            >
              {isPositive ? "+" : isNegative ? "-" : ""}
              {trend.value}%
            </div>
          )}
        </div>
      </div>
    </SmallCardFrame>
  );
}

export interface SmallCardSnippetProps {
  lhs: {
    title: string;
    subtitle?: string;
    icon?: IconTagProps["icon"];
    iconVariant?: IconTagProps["variant"];
    imageSrc?: string;
    imageAlt?: string;
  };
  rhs: {
    value: string;
    subtext?: string;
    variant?: "text" | "number" | "textOnly";
    subtextVariant?: string;
  };
}

/** Snippet form: an identified item on the left, one emphasised value on the right. */
export function SmallCardSnippet({ lhs, rhs }: SmallCardSnippetProps) {
  const isMetric = rhs.subtextVariant === "metric";

  return (
    <SmallCardFrame snippet>
      <div
        className={clsx(
          smallCardSnippetClass,
          `${C1_CLASS_PREFIX}-small-card-snippet`,
          `${C1_CLASS_PREFIX}-small-card-snippet--static`,
        )}
      >
        <div className={`${C1_CLASS_PREFIX}-small-card-snippet__lhs`}>
          {lhs.icon ? (
            <IconTag icon={lhs.icon} variant={lhs.iconVariant ?? "neutral"} size="l" />
          ) : lhs.imageSrc ? (
            <img
              className={`${C1_CLASS_PREFIX}-small-card-snippet__image`}
              src={lhs.imageSrc}
              alt={lhs.imageAlt ?? lhs.title}
            />
          ) : null}
          <div className={`${C1_CLASS_PREFIX}-small-card-snippet__lhs-content`}>
            <TextBlockView
              variant="text-subtext"
              primary={lhs.title}
              secondary={lhs.subtitle}
              type="text"
              size="md"
              align="left"
            />
          </div>
        </div>
        <div className={`${C1_CLASS_PREFIX}-small-card-snippet__rhs`}>
          <div className={`${C1_CLASS_PREFIX}-small-card-snippet__rhs-content`}>
            <TextBlockView
              variant={isMetric ? "highlight-text-number-subtext" : "text-subtext"}
              primary={rhs.value}
              secondary={rhs.subtext}
              type={rhs.variant ?? "text"}
              size="md"
              align="right"
              secondaryTone={
                isMetric && rhs.subtext?.startsWith("+")
                  ? "positive"
                  : isMetric && rhs.subtext?.startsWith("-")
                    ? "negative"
                    : undefined
              }
            />
          </div>
        </div>
      </div>
    </SmallCardFrame>
  );
}

export interface SmallCardSlotsProps {
  top?: ReactNode;
  bottom?: ReactNode;
}

/** Icon form: free top and bottom slots. */
export function SmallCardSlots({ top, bottom }: SmallCardSlotsProps) {
  return (
    <SmallCardFrame>
      <div className={clsx(smallCardClass, `${C1_CLASS_PREFIX}-small-card`)}>
        <div
          className={`${C1_CLASS_PREFIX}-small-card__slot ${C1_CLASS_PREFIX}-small-card__slot--top`}
        >
          {top}
        </div>
        <div
          className={`${C1_CLASS_PREFIX}-small-card__slot ${C1_CLASS_PREFIX}-small-card__slot--bottom`}
        >
          {bottom}
        </div>
      </div>
    </SmallCardFrame>
  );
}
