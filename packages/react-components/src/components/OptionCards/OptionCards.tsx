"use client";

import clsx from "clsx";
import { forwardRef, Fragment, type HTMLAttributes, type ReactNode } from "react";
import { styleRules } from "../../styles/css";
import { InlineMarkdownRenderer } from "../InlineMarkdownRenderer";
import { getRowConfiguration } from "../_shared/cards/smallCardBlockUtils";
import { names, optionCardsStyles } from "./optionCards.styles";

export type OptionCardsSelectionType = "single" | "multiple";

export interface OptionCardsItem {
  value: string;
  /** Inline markdown supported. */
  title: string;
  /** Inline markdown supported. */
  subtitle?: string;
  topContent?: ReactNode;
  /** Controls the top slot sizing: a small icon tile or a larger image tile. */
  topContentVariant?: "icon" | "image";
  disabled?: boolean;
}

export interface OptionCardsProps extends Omit<HTMLAttributes<HTMLDivElement>, "onToggle"> {
  items: OptionCardsItem[];
  /** Currently selected item values. */
  selected?: string[];
  type?: OptionCardsSelectionType;
  /** Disables every card (e.g. while streaming). */
  disabled?: boolean;
  onToggle?: (value: string) => void;
  className?: string;
}

const OptionCards = forwardRef<HTMLDivElement, OptionCardsProps>((props, ref) => {
  const styles = optionCardsStyles;
  const {
    items,
    selected = [],
    type = "single",
    disabled = false,
    onToggle,
    className,
    ...rest
  } = props;

  // Items without a value have no stable identity to select or toggle by.
  const renderableItems = (items ?? []).filter((item) => Boolean(item?.value));
  const rowConfiguration = getRowConfiguration(renderableItems.length, 3);
  let cardIndex = 0;

  const rootClass = clsx(styles.root, names.root, className);
  const gridClass = clsx(names.grid, styles.grid);
  return (
    <>
      <div
        ref={ref}
        className={rootClass}
        role={type === "single" ? "radiogroup" : "group"}
        {...rest}
      >
        <div className={gridClass}>
          {rowConfiguration.map((itemsInRow, rowIndex) => {
            const rowItems = renderableItems.slice(cardIndex, cardIndex + itemsInRow);
            cardIndex += itemsInRow;

            const rowClass = clsx(names.row, styles.row);
            return (
              <Fragment key={`option-cards-row-${rowIndex}`}>
                <div className={rowClass} data-columns={itemsInRow}>
                  {rowItems.map((item, columnIndex) => {
                    const isSelected = selected.includes(item.value);
                    const isDisabled = disabled || item.disabled === true;
                    const hasTopContent = item.topContent != null;
                    const topVariant = item.topContentVariant ?? "icon";

                    const itemClass = clsx(names.item, styles.item);
                    const cardClass = clsx(names.card, styles.card);
                    const contentClass = clsx(names.content, styles.content);
                    const textClass = clsx(names.text, styles.text);
                    const titleClass = clsx(names.title, styles.title);
                    return (
                      <Fragment key={item.value}>
                        <div
                          className={itemClass}
                          data-span={
                            renderableItems.length % 2 === 1 &&
                            rowIndex === rowConfiguration.length - 1 &&
                            columnIndex === rowItems.length - 1
                              ? "full"
                              : undefined
                          }
                        >
                          <button
                            type="button"
                            role={type === "single" ? "radio" : "checkbox"}
                            aria-checked={isSelected}
                            disabled={isDisabled}
                            className={cardClass}
                            onClick={() => onToggle?.(item.value)}
                          >
                            <div className={contentClass}>
                              {hasTopContent ? (
                                <>
                                  <div
                                    className={clsx(
                                      names.top,
                                      styles.top,
                                      names.topContentVariant[topVariant],
                                      styles.topContentVariant[topVariant],
                                    )}
                                  >
                                    {item.topContent}
                                  </div>
                                  {styleRules(
                                    clsx(
                                      names.top,
                                      styles.top,
                                      names.topContentVariant[topVariant],
                                      styles.topContentVariant[topVariant],
                                    ),
                                  )}
                                </>
                              ) : null}
                              <div className={textClass}>
                                <div className={titleClass}>
                                  <InlineMarkdownRenderer content={item.title} />
                                </div>
                                {styleRules(titleClass)}
                                {item.subtitle ? (
                                  <>
                                    <div className={clsx(names.subtitle, styles.subtitle)}>
                                      <InlineMarkdownRenderer content={item.subtitle} />
                                    </div>
                                    {styleRules(clsx(names.subtitle, styles.subtitle))}
                                  </>
                                ) : null}
                              </div>
                              {styleRules(textClass)}
                            </div>
                            {styleRules(contentClass)}
                          </button>
                          {styleRules(cardClass)}
                        </div>
                        {styleRules(itemClass)}
                      </Fragment>
                    );
                  })}
                </div>
                {styleRules(rowClass)}
              </Fragment>
            );
          })}
        </div>
        {styleRules(gridClass)}
      </div>
      {styleRules(rootClass)}
    </>
  );
});

OptionCards.displayName = "OptionCards";

export { OptionCards };
