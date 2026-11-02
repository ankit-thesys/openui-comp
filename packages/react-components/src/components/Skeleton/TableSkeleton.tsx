"use client";

import clsx from "clsx";
import type { CSSProperties } from "react";
import { Fragment } from "react";
import { styleRules } from "../../styles/css";
import { SkeletonBar } from "./SkeletonBar";
import { names, tableSkeletonStyles } from "./tableSkeleton.styles";
export function TableSkeleton({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  const styles = tableSkeletonStyles;
  const rootClass = clsx(styles.root, names.root);
  const rowClass = clsx(styles.row, names.row);
  return (
    <>
      <div className={rootClass}>
        <div
          className={rowClass}
          style={{ "--_openui-table-skeleton-columns": columns } as CSSProperties}
        >
          {Array.from({ length: columns }, (_, i) => {
            const cellClass = clsx(styles.cell, styles.headerCell, names.cell, names.headerCell);
            return (
              <Fragment key={`h-${i}`}>
                <div className={cellClass}>
                  <SkeletonBar height="14px" width="100%" />
                </div>
                {styleRules(cellClass)}
              </Fragment>
            );
          })}
        </div>
        {styleRules(rowClass)}
        {Array.from({ length: rows }, (_, ri) => {
          const rowClass = clsx(styles.row, names.row);
          return (
            <Fragment key={`r-${ri}`}>
              <div
                className={rowClass}
                style={{ "--_openui-table-skeleton-columns": columns } as CSSProperties}
              >
                {Array.from({ length: columns }, (_, ci) => {
                  const cellClass = clsx(styles.cell, names.cell);
                  return (
                    <Fragment key={`c-${ri}-${ci}`}>
                      <div className={cellClass}>
                        <SkeletonBar height="14px" width={`${50 + ((ri * 7 + ci * 13) % 40)}%`} />
                      </div>
                      {styleRules(cellClass)}
                    </Fragment>
                  );
                })}
              </div>
              {styleRules(rowClass)}
            </Fragment>
          );
        })}
      </div>
      {styleRules(rootClass)}
    </>
  );
}
