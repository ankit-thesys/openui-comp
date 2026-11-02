"use client";

import clsx from "clsx";
import { ChevronRight } from "lucide-react";
import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { styleRules } from "../../styles/css";
import { CardBlockLayout, cardKeyDownHandler } from "../_shared/cards/CardBlockLayout";
import { TextFitContext } from "../TextBlock/TextFit";
import { TooltipWrapper } from "../TooltipWrapper";
import { names, snippetCardBlockStyles } from "./snippetCardBlock.styles";

export interface SnippetCardTooltip {
  heading?: string;
  content?: string;
}

export interface SnippetCardBlockItem {
  id?: string;
  /** Left-hand content (typically an IconText / ImageText). */
  lhs: ReactNode;
  /** Right-hand value content (typically a Text / BoldText). Chevron is shown instead when clickable and absent. */
  rhs?: ReactNode;
  /** Tooltip shown when the lhs text is truncated. */
  lhsTooltip?: SnippetCardTooltip;
  /** Tooltip shown when the rhs text is truncated. */
  rhsTooltip?: SnippetCardTooltip;
}

export interface SnippetCardBlockProps extends Omit<HTMLAttributes<HTMLDivElement>, "onClick"> {
  items: SnippetCardBlockItem[];
  /** Collapses the grid to 2 / 1 columns on narrow containers. */
  responsive?: boolean;
  /** Overrides the gap between cards (px number or any CSS length). */
  gap?: number | string;
  /** Renders the cards as buttons and fires `onItemClick`. */
  clickable?: boolean;
  onItemClick?: (item: SnippetCardBlockItem, index: number) => void;
  className?: string;
}

// The text in each slot keeps to one truncated line: the left fills its slot, the right aligns
// to the end.
const LHS_FIT = { overflow: "truncate", width: "fill" } as const;
const RHS_FIT = { overflow: "truncate", align: "right" } as const;

const TEXT_BLOCK_HEADING_SELECTOR = ".openui-text-block-primary";
const TEXT_BLOCK_CONTENT_SELECTOR = ".openui-text-block-secondary";

const SnippetCardBlock = forwardRef<HTMLDivElement, SnippetCardBlockProps>((props, ref) => {
  const styles = snippetCardBlockStyles;
  const {
    items,
    responsive = true,
    gap,
    clickable = false,
    onItemClick,
    className,
    ...rest
  } = props;

  const isClickable = clickable && Boolean(onItemClick);

  return (
    <CardBlockLayout
      ref={ref}
      size="small"
      cardType="value-card"
      data-card-type="SnippetCard"
      items={items ?? []}
      layout="grid"
      responsive={responsive}
      maxPerRow={2}
      gap={gap}
      className={clsx(names.root, className)}
      itemKey={(item, index) => item.id ?? `snippet-card-${index}`}
      renderItem={(item, index) => {
        const cardClass = clsx(
          names.card,
          styles.card,
          isClickable && [names.clickable.true, styles.clickable.true],
        );
        const rhsClass = clsx(names.rhs, styles.rhs);
        return (
          <>
            <div
              className={cardClass}
              role={isClickable ? "button" : undefined}
              tabIndex={isClickable ? 0 : undefined}
              onClick={isClickable ? () => onItemClick?.(item, index) : undefined}
              onKeyDown={
                isClickable ? cardKeyDownHandler(() => onItemClick?.(item, index)) : undefined
              }
            >
              {item.lhs != null && (
                <>
                  <TooltipWrapper
                    tooltipHeading={item.lhsTooltip?.heading}
                    tooltipContent={item.lhsTooltip?.content}
                    showOnlyWhenTruncated
                    headingSelector={TEXT_BLOCK_HEADING_SELECTOR}
                    contentSelector={TEXT_BLOCK_CONTENT_SELECTOR}
                  >
                    <div className={clsx(names.lhs, styles.lhs)}>
                      <TextFitContext.Provider value={LHS_FIT}>{item.lhs}</TextFitContext.Provider>
                    </div>
                  </TooltipWrapper>
                  {styleRules(clsx(names.lhs, styles.lhs))}
                </>
              )}
              <div className={rhsClass}>
                {item.rhs != null ? (
                  <>
                    <TooltipWrapper
                      tooltipHeading={item.rhsTooltip?.heading}
                      tooltipContent={item.rhsTooltip?.content}
                      showOnlyWhenTruncated
                      headingSelector={TEXT_BLOCK_HEADING_SELECTOR}
                      contentSelector={TEXT_BLOCK_CONTENT_SELECTOR}
                    >
                      <div className={clsx(names.rhsContent, styles.rhsContent)}>
                        <TextFitContext.Provider value={RHS_FIT}>
                          {item.rhs}
                        </TextFitContext.Provider>
                      </div>
                    </TooltipWrapper>
                    {styleRules(clsx(names.rhsContent, styles.rhsContent))}
                  </>
                ) : (
                  isClickable && (
                    <>
                      <div className={clsx(names.chevron, styles.chevron)} aria-hidden="true">
                        <ChevronRight
                          size={14}
                          className={clsx(names.chevronIcon, styles.chevronIcon)}
                        />
                        {styleRules(clsx(names.chevronIcon, styles.chevronIcon))}
                      </div>
                      {styleRules(clsx(names.chevron, styles.chevron))}
                    </>
                  )
                )}
              </div>
              {styleRules(rhsClass)}
            </div>
            {styleRules(cardClass)}
          </>
        );
      }}
      {...rest}
    />
  );
});

SnippetCardBlock.displayName = "SnippetCardBlock";

export { SnippetCardBlock };
