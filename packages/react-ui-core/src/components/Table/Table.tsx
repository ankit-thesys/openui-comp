import clsx from "clsx";
import React from "react";
import {
  alignmentClass,
  cellClass,
  containerClass,
  footerClass,
  headClass,
  rowClass,
  tableClass,
} from "./table.styles";

type TableAlignment = "left" | "center" | "right";

const alignmentClasses: Record<TableAlignment, string> = {
  left: "openui-table-align-left",
  center: "openui-table-align-center",
  right: "openui-table-align-right",
};

// ─── Primitives ───

const Table = React.forwardRef<
  HTMLTableElement,
  React.HTMLAttributes<HTMLTableElement> & {
    containerRef?: React.RefObject<HTMLDivElement>;
    containerClassName?: string;
    containerStyle?: React.CSSProperties;
  }
>(({ className, containerRef, containerClassName, containerStyle, ...props }, ref) => (
  <div
    ref={containerRef}
    className={clsx(containerClass, "openui-table-container", containerClassName)}
    style={containerStyle}
  >
    <table ref={ref} className={clsx(tableClass, "openui-table", className)} {...props} />
  </div>
));
Table.displayName = "Table";

const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead ref={ref} className={clsx("openui-table-header", className)} {...props} />
));
TableHeader.displayName = "TableHeader";

const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody ref={ref} className={clsx("openui-table-body", className)} {...props} />
));
TableBody.displayName = "TableBody";

const TableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tfoot ref={ref} className={clsx(footerClass, "openui-table-footer", className)} {...props} />
));
TableFooter.displayName = "TableFooter";

const TableRow = React.forwardRef<HTMLTableRowElement, React.HTMLAttributes<HTMLTableRowElement>>(
  ({ className, ...props }, ref) => (
    <tr ref={ref} className={clsx(rowClass, "openui-table-row", className)} {...props} />
  ),
);
TableRow.displayName = "TableRow";

export interface TableHeadProps extends React.ThHTMLAttributes<HTMLTableCellElement> {
  icon?: React.ReactNode;
  align?: TableAlignment;
}

const TableHead = React.forwardRef<HTMLTableCellElement, TableHeadProps>(
  ({ className, children, icon, align, ...props }, ref) => (
    <th
      ref={ref}
      className={clsx(headClass, alignmentClass, "openui-table-head", className)}
      {...props}
    >
      <div
        className={clsx(
          alignmentClass,
          "openui-table-head-content",
          align && alignmentClasses[align],
        )}
      >
        {icon && <div className="openui-table-head-icon">{icon}</div>}
        <div className="openui-table-head-label">{children}</div>
      </div>
    </th>
  ),
);
TableHead.displayName = "TableHead";

export interface TableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
  align?: TableAlignment;
}

const TableCell = React.forwardRef<HTMLTableCellElement, TableCellProps>(
  ({ className, align, ...props }, ref) => (
    <td
      ref={ref}
      className={clsx(
        cellClass,
        alignmentClass,
        "openui-table-cell",
        align && alignmentClasses[align],
        className,
      )}
      {...props}
    />
  ),
);
TableCell.displayName = "TableCell";

export { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow };
