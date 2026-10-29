// #90: every pulse user (bars, table bars, pie/donut shape, legend dots and bars) against #72.
// The parity harness pins infinite animations at 0%; shared-base.spec.ts tests the running pulse.
import { PieChartSkeleton, Skeleton, TableSkeleton, ThemeProvider } from "openui-under-test";
import { createRoot } from "react-dom/client";

declare const __PARITY_BASELINE__: boolean;
const part = (oldName: string, name: string) => (__PARITY_BASELINE__ ? oldName : name);

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
      data-parity-parts={JSON.stringify({
        root: `${part(".openui-skeleton-stack", ".openui-skeleton")}`,
        ...barParts(1),
      })}
    >
      <Skeleton />
    </div>
    <div
      data-parity-case="skeleton/custom"
      data-parity-parts={JSON.stringify({
        root: `${part(".openui-skeleton-stack", ".openui-skeleton")}`,
        ...barParts(3),
      })}
    >
      <Skeleton count={3} height="20px" width="80px" borderRadius="12px" />
    </div>
    <div
      data-parity-case="table/default"
      data-parity-parts={JSON.stringify({
        root: `${part(".openui-skeleton-table", ".openui-table-skeleton")}`,
        header: `${part(".openui-skeleton-table-row", ".openui-table-skeleton-row")}:first-child`,
        bar: `.openui-skeleton-bar`,
      })}
    >
      <TableSkeleton />
    </div>
    <div
      data-parity-case="table/custom"
      data-parity-parts={JSON.stringify({
        root: `${part(".openui-skeleton-table", ".openui-table-skeleton")}`,
        header: `${part(".openui-skeleton-table-row", ".openui-table-skeleton-row")}:first-child`,
        headerBar: `${part(".openui-skeleton-table-row", ".openui-table-skeleton-row")}:first-child .openui-skeleton-bar`,
        body: `${part(".openui-skeleton-table-row", ".openui-table-skeleton-row")}:nth-child(2)`,
        bodyBar: `${part(".openui-skeleton-table-row", ".openui-table-skeleton-row")}:nth-child(2) .openui-skeleton-bar`,
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
            root: `${part(".openui-skeleton-pie-chart-wrapper", ".openui-pie-chart-skeleton")}`,
            container: `${part(".openui-skeleton-pie-chart-container", ".openui-pie-chart-skeleton-container")}`,
            shape: `${part(".openui-skeleton-pie-chart-shape", ".openui-pie-chart-skeleton-shape")}`,
            legend: `${part(".openui-skeleton-pie-chart-legend", ".openui-pie-chart-skeleton-legend")}`,
            item: `${part(".openui-skeleton-pie-chart-legend-item", ".openui-pie-chart-skeleton-legend-item")}`,
            dot: `${part(".openui-skeleton-pie-chart-legend-dot", ".openui-pie-chart-skeleton-legend-dot")}`,
            bar: `.openui-skeleton-bar`,
          })}
        >
          <PieChartSkeleton variant={variant} appearance={appearance} size={120} legendItems={2} />
        </div>
      )),
    )}
  </ThemeProvider>,
);
