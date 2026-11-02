"use client";

import clsx from "clsx";
import { forwardRef } from "react";
import { styleRules } from "../../styles/css";
import { InlineMarkdownRenderer } from "../InlineMarkdownRenderer";
import { entityListStyles, names } from "./entityList.styles";

export interface EntityListRow {
  left: string;
  right: string;
  rightVariant?: "text" | "number";
}

export type EntityListSize = "small" | "default";

export interface EntityListProps {
  rows?: EntityListRow[];
  size?: EntityListSize;
  /** Only rendered when `size` is "default". */
  header?: EntityListRow;
  /** Only rendered when `size` is "default". */
  footer?: EntityListRow;
  className?: string;
}

type RowType = "header" | "body" | "footer";

function EntityListRowView({ row, rowType }: { row: EntityListRow; rowType: RowType }) {
  const styles = entityListStyles;
  const rightVariant = row.rightVariant ?? "text";
  const rowClass = clsx(styles.row, names.row, styles.rowType[rowType], names.rowType[rowType]);
  const cellLeftClass = clsx(styles.cellLeft, names.cellLeft);
  const cellRightClass = clsx(
    styles.cellRight,
    names.cellRight,
    styles.rightVariant[rightVariant],
    names.rightVariant[rightVariant],
  );
  return (
    <>
      <div className={rowClass}>
        <span className={cellLeftClass}>
          <InlineMarkdownRenderer content={row.left} />
        </span>
        {styleRules(cellLeftClass)}
        <span className={cellRightClass}>
          <InlineMarkdownRenderer content={row.right} />
        </span>
        {styleRules(cellRightClass)}
      </div>
      {styleRules(rowClass)}
    </>
  );
}

/** A two-column key/value list with optional header and footer rows. */
export const EntityList = forwardRef<HTMLDivElement, EntityListProps>(
  ({ rows = [], size = "default", header, footer, className }, ref) => {
    const styles = entityListStyles;
    const showHeaderFooter = size === "default";

    const rootClass = clsx(styles.root, names.root, styles.size[size], names.size[size], className);
    return (
      <>
        <div ref={ref} className={rootClass}>
          {showHeaderFooter && header && <EntityListRowView row={header} rowType="header" />}
          {rows.map((row, index) => (
            <EntityListRowView key={index} row={row} rowType="body" />
          ))}
          {showHeaderFooter && footer && <EntityListRowView row={footer} rowType="footer" />}
        </div>
        {styleRules(rootClass)}
      </>
    );
  },
);

EntityList.displayName = "EntityList";
