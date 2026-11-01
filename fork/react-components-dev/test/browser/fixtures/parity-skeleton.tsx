// All Skeleton family roots and owned parts; SkeletonBar is observed through public consumers.
import { PieChartSkeleton, Skeleton, TableSkeleton, ThemeProvider } from "openui-under-test";
import { createRoot } from "react-dom/client";

declare const __PARITY_BASELINE__: boolean;
const cls = (oldName: string, name: string) => `.${__PARITY_BASELINE__ ? oldName : name}`;
const mode = new URLSearchParams(location.search).get("mode") === "dark" ? "dark" : "light";
const tableParts = (rows: number, columns: number) => ({
  root: cls("openui-skeleton-table", "openui-table-skeleton"),
  ...Object.fromEntries(
    Array.from({ length: rows + 1 }, (_, row) => {
      const selector = `${cls("openui-skeleton-table-row", "openui-table-skeleton-row")}:nth-child(${row + 1})`;
      return [
        [`row${row}`, selector],
        ...Array.from({ length: columns }, (_, col) => [
          [
            `row${row}cell${col}`,
            `${selector} ${cls("openui-skeleton-table-cell", "openui-table-skeleton-cell")}:nth-child(${col + 1})`,
          ],
          [`row${row}bar${col}`, `${selector} > :nth-child(${col + 1}) .openui-skeleton-bar`],
        ]).flat(),
      ];
    }).flat(),
  ),
});

createRoot(document.getElementById("root")!).render(
  <ThemeProvider mode={mode}>
    <div
      data-parity-case="skeleton/default"
      data-parity-parts={JSON.stringify({
        root: cls("openui-skeleton-stack", "openui-skeleton"),
        bar: ".openui-skeleton-bar",
      })}
    >
      <Skeleton />
    </div>
    <div
      data-parity-case="skeleton/custom"
      data-parity-parts={JSON.stringify({
        root: cls("openui-skeleton-stack", "openui-skeleton"),
        ...Object.fromEntries(
          [1, 2, 3].map((index) => [`bar${index}`, `.openui-skeleton-bar:nth-child(${index})`]),
        ),
      })}
    >
      <Skeleton count={3} height="20px" width="80px" borderRadius="12px" />
    </div>
    <div data-parity-case="table/default" data-parity-parts={JSON.stringify(tableParts(5, 4))}>
      <TableSkeleton />
    </div>
    <div data-parity-case="table/custom" data-parity-parts={JSON.stringify(tableParts(2, 2))}>
      <TableSkeleton rows={2} columns={2} />
    </div>
    <div data-parity-case="table/no-body" data-parity-parts={JSON.stringify(tableParts(0, 1))}>
      <TableSkeleton rows={0} columns={1} />
    </div>
    <div
      data-parity-case="pie/default"
      data-parity-parts={JSON.stringify({
        root: cls("openui-skeleton-pie-chart-wrapper", "openui-pie-chart-skeleton"),
        shape: cls("openui-skeleton-pie-chart-shape", "openui-pie-chart-skeleton-shape"),
      })}
    >
      <PieChartSkeleton />
    </div>
    {(["pie", "donut"] as const).flatMap((variant) =>
      (["circular", "semiCircular"] as const).map((appearance) => (
        <div
          key={`${variant}/${appearance}`}
          data-parity-case={`pie/${variant}/${appearance}`}
          data-parity-parts={JSON.stringify({
            root: cls("openui-skeleton-pie-chart-wrapper", "openui-pie-chart-skeleton"),
            container: cls(
              "openui-skeleton-pie-chart-container",
              "openui-pie-chart-skeleton-container",
            ),
            shape: cls("openui-skeleton-pie-chart-shape", "openui-pie-chart-skeleton-shape"),
            legend: cls("openui-skeleton-pie-chart-legend", "openui-pie-chart-skeleton-legend"),
            ...Object.fromEntries(
              [1, 2].flatMap((index) => {
                const item = `${cls("openui-skeleton-pie-chart-legend-item", "openui-pie-chart-skeleton-legend-item")}:nth-child(${index})`;
                return [
                  [`item${index}`, item],
                  [`dot${index}`, `${item} > :first-child`],
                  [`bar${index}`, `${item} .openui-skeleton-bar`],
                ];
              }),
            ),
          })}
        >
          <PieChartSkeleton variant={variant} appearance={appearance} size={120} legendItems={2} />
        </div>
      )),
    )}
  </ThemeProvider>,
);
