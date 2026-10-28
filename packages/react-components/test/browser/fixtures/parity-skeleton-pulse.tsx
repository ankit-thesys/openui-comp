// #90: every pulse user (bars, table bars, pie/donut shape, legend dots and bars) against #72.
// The parity harness pins infinite animations at 0%; shared-base.spec.ts tests the running pulse.
import { PieChartSkeleton, Skeleton, TableSkeleton, ThemeProvider } from "openui-under-test";
import { createRoot } from "react-dom/client";

const mode = new URLSearchParams(location.search).get("mode") === "dark" ? "dark" : "light";
const barParts = (count: number) =>
  Object.fromEntries(
    Array.from({ length: count }, (_, index) => [
      `bar${index}`,
      `.openui-skeleton-bar:nth-child(${index + 1})`,
    ]),
  );

createRoot(document.getElementById("root")!).render(
  <ThemeProvider mode={mode}>
    <div
      data-parity-case="skeleton/default"
      data-parity-parts={JSON.stringify({ root: ".openui-skeleton-stack", ...barParts(1) })}
    >
      <Skeleton />
    </div>
    <div
      data-parity-case="skeleton/custom"
      data-parity-parts={JSON.stringify({ root: ".openui-skeleton-stack", ...barParts(3) })}
    >
      <Skeleton count={3} height="20px" width="80px" borderRadius="12px" />
    </div>
    <div
      data-parity-case="table/default"
      data-parity-parts={JSON.stringify({
        root: ".openui-skeleton-table",
        header: ".openui-skeleton-table-row:first-child",
        bar: ".openui-skeleton-bar",
      })}
    >
      <TableSkeleton />
    </div>
    <div
      data-parity-case="table/custom"
      data-parity-parts={JSON.stringify({
        root: ".openui-skeleton-table",
        header: ".openui-skeleton-table-row:first-child",
        headerBar: ".openui-skeleton-table-row:first-child .openui-skeleton-bar",
        body: ".openui-skeleton-table-row:nth-child(2)",
        bodyBar: ".openui-skeleton-table-row:nth-child(2) .openui-skeleton-bar",
      })}
    >
      <TableSkeleton rows={2} columns={2} />
    </div>
    {(["pie", "donut"] as const).flatMap((variant) =>
      (["circular", "semiCircular"] as const).map((appearance) => (
        <div
          key={`${variant}/${appearance}`}
          data-parity-case={`pie/${variant}/${appearance}`}
          data-parity-parts={JSON.stringify({
            root: ".openui-skeleton-pie-chart-wrapper",
            container: ".openui-skeleton-pie-chart-container",
            shape: ".openui-skeleton-pie-chart-shape",
            legend: ".openui-skeleton-pie-chart-legend",
            item: ".openui-skeleton-pie-chart-legend-item",
            dot: ".openui-skeleton-pie-chart-legend-dot",
            bar: ".openui-skeleton-bar",
          })}
        >
          <PieChartSkeleton variant={variant} appearance={appearance} size={120} legendItems={2} />
        </div>
      )),
    )}
  </ThemeProvider>,
);
