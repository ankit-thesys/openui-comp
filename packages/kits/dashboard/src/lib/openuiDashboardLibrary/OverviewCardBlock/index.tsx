"use client";

import {
  IconWrapper,
  MetricIndicatorInline as MetricIndicatorInlineView,
} from "@openuidev/react-components";
import { defineComponent, type ComponentRenderProps } from "@openuidev/react-lang";
import clsx from "clsx";
import { type CSSProperties } from "react";
import { z } from "zod/v4";
import { TextBlockView } from "../../../components/TextBlockView";
import { C1_CLASS_PREFIX } from "../../../shared/classPrefix";
import { getRowConfiguration, useCarouselMask } from "../smallCardUtils";
import { overviewCardItemPropsSchema } from "./schema";
export const OverviewCardItemComponent = defineComponent({
  name: "OverviewCardItem",
  props: overviewCardItemPropsSchema,
  description: "",
  component: () => null,
});

const overviewCardBlockPropsSchema = z.object({
  items: z.array(OverviewCardItemComponent.ref).min(2),
  layout: z.enum(["grid", "carousel"]).default("grid"),
  responsive: z.boolean().default(true),
  gap: z.union([z.number(), z.string()]).optional(),
});

type OverviewCardBlockProps = z.infer<typeof overviewCardBlockPropsSchema>;
type OverviewCardItem = OverviewCardBlockProps["items"][number];
type SmallCardGapStyle = CSSProperties & {
  [key in `--${typeof C1_CLASS_PREFIX}-small-card-gap`]?: string;
};

function OverviewCardTopContent({ item }: { item: OverviewCardItem }) {
  const { title, subtitle, imageSrc, imageAlt, icon } = item.props;
  const hasVisual = Boolean(imageSrc || icon);

  const textBlock = (
    <TextBlockView
      variant={subtitle ? "text-subtext" : "text"}
      primary={title}
      secondary={subtitle}
      type="text"
      size="xs"
      align="left"
    />
  );

  if (!hasVisual) return textBlock;

  return (
    <div className={`${C1_CLASS_PREFIX}-image-text ${C1_CLASS_PREFIX}-image-text--horizontal`}>
      <div
        className={clsx(
          `${C1_CLASS_PREFIX}-image-text__image-container`,
          !imageSrc && icon && `${C1_CLASS_PREFIX}-overview-card__icon-badge`,
        )}
      >
        {imageSrc && (
          <img
            className={`${C1_CLASS_PREFIX}-image-text__image`}
            src={imageSrc}
            alt={imageAlt ?? title}
          />
        )}
        {!imageSrc && icon && (
          <span className={`${C1_CLASS_PREFIX}-overview-card__icon-badge-text`}>
            <IconWrapper name={icon} size={16} />
          </span>
        )}
      </div>
      <div className={`${C1_CLASS_PREFIX}-image-text__content`}>{textBlock}</div>
    </div>
  );
}

function OverviewCardBlockRenderer({ props }: ComponentRenderProps<OverviewCardBlockProps>) {
  const { scrollRef, maskLeft, maskRight } = useCarouselMask();

  const items = props.items ?? [];
  const finalLayout = props.layout ?? "grid";
  const rowConfiguration = getRowConfiguration(items.length, 3);
  const gapStyle: SmallCardGapStyle | undefined = props.gap
    ? ({
        [`--${C1_CLASS_PREFIX}-small-card-gap`]:
          typeof props.gap === "number" ? `${props.gap}px` : props.gap,
      } as SmallCardGapStyle)
    : undefined;

  const renderCard = (item: OverviewCardItem, itemIndex: number) => {
    const { id, value, valueSubtext, trend } = item.props;

    return (
      <div
        key={id ?? `${C1_CLASS_PREFIX}-overview-card-${itemIndex}`}
        className={
          finalLayout === "carousel"
            ? `${C1_CLASS_PREFIX}-small-card-block__carousel-item`
            : `${C1_CLASS_PREFIX}-small-card-block__item`
        }
      >
        <div className={`${C1_CLASS_PREFIX}-overview-card`}>
          <div className={`${C1_CLASS_PREFIX}-overview-card__vertical`}>
            <div className={`${C1_CLASS_PREFIX}-overview-card__top-row`}>
              <div
                className={`${C1_CLASS_PREFIX}-overview-card__slot ${C1_CLASS_PREFIX}-overview-card__slot--top`}
              >
                <OverviewCardTopContent item={item} />
              </div>
            </div>
            {(value || valueSubtext || trend) && (
              <div
                className={`${C1_CLASS_PREFIX}-overview-card__slot ${C1_CLASS_PREFIX}-overview-card__slot--bottom`}
              >
                <MetricIndicatorInlineView
                  value={value ?? ""}
                  subtext={valueSubtext}
                  trend={trend}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  let rowStartIndex = 0;

  return (
    <div
      className={clsx(
        `${C1_CLASS_PREFIX}-small-card-block`,
        `${C1_CLASS_PREFIX}-small-card-block--overview-card`,
        `${C1_CLASS_PREFIX}-small-card-block--${finalLayout}`,
      )}
      data-card-type="OverviewCard"
      data-layout={finalLayout}
      data-count={items.length}
      style={gapStyle}
    >
      {finalLayout === "carousel" ? (
        <div
          ref={scrollRef}
          className={clsx(
            `${C1_CLASS_PREFIX}-small-card-block__carousel`,
            props.responsive !== false &&
              `${C1_CLASS_PREFIX}-small-card-block__carousel--responsive`,
            maskLeft && `${C1_CLASS_PREFIX}-small-card-block__carousel--mask-left`,
            maskRight && `${C1_CLASS_PREFIX}-small-card-block__carousel--mask-right`,
          )}
        >
          <div className={`${C1_CLASS_PREFIX}-small-card-block__carousel-track`}>
            {items.map((item, index) => renderCard(item, index))}
          </div>
        </div>
      ) : (
        <div
          className={clsx(
            `${C1_CLASS_PREFIX}-small-card-block__grid`,
            props.responsive !== false && `${C1_CLASS_PREFIX}-small-card-block__grid--responsive`,
            props.responsive !== false &&
              items.length % 2 === 1 &&
              `${C1_CLASS_PREFIX}-small-card-block__grid--odd-count`,
          )}
        >
          {rowConfiguration.map((itemsInRow, rowIndex) => {
            const rowItems = items.slice(rowStartIndex, rowStartIndex + itemsInRow);
            const currentRowStartIndex = rowStartIndex;
            rowStartIndex += itemsInRow;

            return (
              <div
                key={`${C1_CLASS_PREFIX}-overview-card-row-${rowIndex}`}
                className={clsx(
                  `${C1_CLASS_PREFIX}-small-card-block__row`,
                  `${C1_CLASS_PREFIX}-small-card-block__row--${itemsInRow}`,
                )}
              >
                {rowItems.map((item, columnIndex) =>
                  renderCard(item, currentRowStartIndex + columnIndex),
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export const OverviewCardBlockComponent = defineComponent({
  name: "OverviewCardBlock",
  props: overviewCardBlockPropsSchema,
  description: "",
  component: OverviewCardBlockRenderer,
});
