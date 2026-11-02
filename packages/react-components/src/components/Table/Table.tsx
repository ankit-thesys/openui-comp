"use client";

import clsx from "clsx";
import React from "react";
import { styleRules } from "../../styles/css";
import { names, tableStyles } from "./table.styles";
import { names as cellNames, tableCellStyles } from "./tableCell.styles";
import { names as headNames, tableHeadStyles } from "./tableHead.styles";

type TableAlignment = "left" | "center" | "right";

// ─── Primitives ───

const Table = React.forwardRef<
  HTMLTableElement,
  React.HTMLAttributes<HTMLTableElement> & {
    containerRef?: React.RefObject<HTMLDivElement>;
    containerClassName?: string;
    containerStyle?: React.CSSProperties;
  }
>(({ className, containerRef, containerClassName, containerStyle, ...props }, ref) => {
  const styles = tableStyles;
  const containerClass = clsx(styles.container, names.container, containerClassName);
  const rootClass = clsx(styles.root, names.root, className);
  return (
    <>
      <div ref={containerRef} className={containerClass} style={containerStyle}>
        <table ref={ref} className={rootClass} {...props} />
        {styleRules(rootClass)}
      </div>
      {styleRules(containerClass)}
    </>
  );
});
Table.displayName = "Table";

const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => {
  return <thead ref={ref} className={clsx(names.header, className)} {...props} />;
});
TableHeader.displayName = "TableHeader";

const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => {
  return <tbody ref={ref} className={clsx(names.body, className)} {...props} />;
});
TableBody.displayName = "TableBody";

const TableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => {
  const styles = tableStyles;
  const footerClass = clsx(styles.footer, names.footer, className);
  return (
    <>
      <tfoot ref={ref} className={footerClass} {...props} />
      {styleRules(footerClass)}
    </>
  );
});
TableFooter.displayName = "TableFooter";

const TableRow = React.forwardRef<HTMLTableRowElement, React.HTMLAttributes<HTMLTableRowElement>>(
  ({ className, ...props }, ref) => {
    const styles = tableStyles;
    const rowClass = clsx(styles.row, names.row, className);
    return (
      <>
        <tr ref={ref} className={rowClass} {...props} />
        {styleRules(rowClass)}
      </>
    );
  },
);
TableRow.displayName = "TableRow";

export interface TableHeadProps extends React.ThHTMLAttributes<HTMLTableCellElement> {
  icon?: React.ReactNode;
  align?: TableAlignment;
}

const TableHead = React.forwardRef<HTMLTableCellElement, TableHeadProps>(
  ({ className, children, icon, align, ...props }, ref) => {
    const styles = tableHeadStyles;
    const rootClass = clsx(
      styles.root,
      headNames.root,
      align && styles.align[align],
      headNames.align[align ?? "left"],
      className,
    );
    const contentClass = clsx(styles.content, headNames.content);
    const labelClass = clsx(styles.label, headNames.label);
    return (
      <>
        <th ref={ref} className={rootClass} {...props}>
          <div className={contentClass}>
            {icon && (
              <>
                <div className={clsx(styles.icon, headNames.icon)}>{icon}</div>
                {styleRules(clsx(styles.icon, headNames.icon))}
              </>
            )}
            <div className={labelClass}>{children}</div>
            {styleRules(labelClass)}
          </div>
          {styleRules(contentClass)}
        </th>
        {styleRules(rootClass)}
      </>
    );
  },
);
TableHead.displayName = "TableHead";

export interface TableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
  align?: TableAlignment;
}

const TableCell = React.forwardRef<HTMLTableCellElement, TableCellProps>(
  ({ className, align, ...props }, ref) => {
    const styles = tableCellStyles;
    const rootClass = clsx(
      styles.root,
      cellNames.root,
      styles.align[align ?? "left"],
      cellNames.align[align ?? "left"],
      className,
    );
    return (
      <>
        <td ref={ref} className={rootClass} {...props} />
        {styleRules(rootClass)}
      </>
    );
  },
);
TableCell.displayName = "TableCell";

export { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow };
