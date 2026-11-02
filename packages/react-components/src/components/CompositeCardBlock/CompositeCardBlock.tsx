"use client";

import clsx from "clsx";
import { forwardRef, type ReactNode } from "react";
import { styleRules } from "../../styles/css";
import { InlineTypographyContext } from "../InlineMarkdownRenderer/InlineTypography";
import { CardBlockLayout, cardKeyDownHandler } from "../_shared/cards/CardBlockLayout";
import { compositeCardStyles, names } from "./card.styles";

export interface CompositeCardBlockItem {
  id?: string;
  header?: ReactNode;
  body?: ReactNode[];
  footer?: {
    price?: ReactNode;
    button?: ReactNode;
  };
}

export interface CompositeCardProps {
  item: CompositeCardBlockItem;
  clickable?: boolean;
  onClick?: () => void;
  className?: string;
}

/** A bordered card with header, stacked body content and a price/button footer. */
export const CompositeCard = forwardRef<HTMLDivElement, CompositeCardProps>((props, ref) => {
  const styles = compositeCardStyles;
  const { item, clickable = false, onClick, className } = props;
  const { header, body, footer } = item;
  const bodyItems = body ?? [];
  const hasFooter = Boolean(footer?.price || footer?.button);

  const wrapperClass = clsx(names.wrapper, styles.wrapper);
  const cardClass = clsx(
    names.card,
    styles.card,
    clickable && [names.clickable.true, styles.clickable.true],
    className,
  );
  return (
    <>
      <div className={wrapperClass}>
        <div
          ref={ref}
          className={cardClass}
          role={clickable ? "button" : undefined}
          tabIndex={clickable ? 0 : undefined}
          onClick={clickable ? onClick : undefined}
          onKeyDown={clickable && onClick ? cardKeyDownHandler(onClick) : undefined}
        >
          {/* Inline markdown in the card keeps the surrounding text's typography. */}
          <InlineTypographyContext.Provider value="inherit">
            {header && (
              <>
                <div className={clsx(names.header, styles.header)}>{header}</div>
                {styleRules(clsx(names.header, styles.header))}
              </>
            )}

            {bodyItems.length > 0 && (
              <>
                <div className={clsx(names.body, styles.body)}>{bodyItems}</div>
                {styleRules(clsx(names.body, styles.body))}
              </>
            )}

            {hasFooter && (
              <>
                <div className={clsx(names.footer, styles.footer)}>
                  <div className={clsx(names.footerContent, styles.footerContent)}>
                    {footer?.price ?? null}
                    {footer?.button ?? null}
                  </div>
                  {styleRules(clsx(names.footerContent, styles.footerContent))}
                </div>
                {styleRules(clsx(names.footer, styles.footer))}
              </>
            )}
          </InlineTypographyContext.Provider>
        </div>
        {styleRules(cardClass)}
      </div>
      {styleRules(wrapperClass)}
    </>
  );
});

CompositeCard.displayName = "CompositeCard";

export interface CompositeCardBlockProps {
  items: CompositeCardBlockItem[];
  layout?: "grid" | "carousel";
  responsive?: boolean;
  /** Overrides the CSS gap variable (numbers are treated as px). */
  gap?: number | string;
  /** Makes every card focusable/clickable; `onItemClick` receives the item index. */
  clickable?: boolean;
  onItemClick?: (index: number) => void;
  className?: string;
}

/** A two-per-row grid or carousel of CompositeCards. */
export const CompositeCardBlock = forwardRef<HTMLDivElement, CompositeCardBlockProps>(
  (props, ref) => {
    const { items, layout, responsive, gap, clickable = false, onItemClick, className } = props;

    return (
      <CardBlockLayout
        ref={ref}
        size="medium"
        cardType="composite-card"
        data-card-type="CompositeCard"
        items={items}
        layout={layout}
        responsive={responsive}
        maxPerRow={2}
        gap={gap}
        className={clsx(names.root, className)}
        itemKey={(item, index) => {
          const itemId = item.id?.trim();
          return itemId ? `composite-card-${itemId}-${index}` : `composite-card-${index}`;
        }}
        renderItem={(item, index) => (
          <CompositeCard item={item} clickable={clickable} onClick={() => onItemClick?.(index)} />
        )}
      />
    );
  },
);

CompositeCardBlock.displayName = "CompositeCardBlock";
