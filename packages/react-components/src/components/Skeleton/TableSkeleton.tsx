import clsx from "clsx";
import { css } from "goober";
import { SkeletonBar } from "./SkeletonBar";
import { tableStyles } from "./tableSkeleton.styles";
const componentClass = "openui-skeleton-table-skeleton-root";
export function TableSkeleton({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className={clsx(componentClass, "openui-skeleton-table")}>
      <div
        className="openui-skeleton-table-row"
        style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
      >
        {Array.from({ length: columns }, (_, i) => (
          <div
            key={`h-${i}`}
            className={clsx("openui-skeleton-table-cell", "openui-skeleton-table-cell-short")}
          >
            <SkeletonBar height="14px" width="100%" />
          </div>
        ))}
      </div>
      {Array.from({ length: rows }, (_, ri) => (
        <div
          key={`r-${ri}`}
          className="openui-skeleton-table-row"
          style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
        >
          {Array.from({ length: columns }, (_, ci) => (
            <div key={`c-${ri}-${ci}`} className="openui-skeleton-table-cell">
              <SkeletonBar height="14px" width={`${50 + ((ri * 7 + ci * 13) % 40)}%`} />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

const stylesheetScope = css`
  :where(&:root) {
    .openui-skeleton-table-skeleton-root {
      ${tableStyles}
    }
  }
`;

if (typeof document !== "undefined") {
  document.documentElement.classList.add(stylesheetScope);
}
