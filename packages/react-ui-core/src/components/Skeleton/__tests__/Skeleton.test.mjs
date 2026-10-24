import assert from "node:assert/strict";
import test from "node:test";
import { core, mount, React } from "../../Button/__tests__/consumer.mjs";
const { createElement: h } = React;
test("Skeleton preserves bar dimensions, table grids and pie/donut variants", async () => {
  assert(
    core.Skeleton && core.TableSkeleton && core.PieChartSkeleton,
    "Skeleton public variants must be exported",
  );
  const view = await mount(
    h(core.Skeleton, {
      count: 3,
      height: "20px",
      width: "70%",
      borderRadius: "2px",
      className: "custom",
    }),
  );
  try {
    assert(view.container.firstElementChild.classList.contains("custom"));
    const bars = view.container.querySelectorAll(".openui-skeleton-bar");
    assert.equal(bars.length, 3);
    assert.equal(bars[0].style.height, "20px");
    assert.equal(bars[0].style.width, "70%");
    assert.equal(bars[0].style.borderRadius, "2px");
    await view.render(h(core.TableSkeleton, { rows: 2, columns: 3 }));
    const rows = view.container.querySelectorAll(".openui-skeleton-table-row");
    assert.equal(rows.length, 3);
    assert.equal(rows[0].style.gridTemplateColumns, "repeat(3, 1fr)");
    assert.equal(view.container.querySelectorAll(".openui-skeleton-bar").length, 9);
    await view.render(
      h(core.PieChartSkeleton, {
        size: 160,
        legendItems: 2,
        variant: "donut",
        appearance: "semiCircular",
      }),
    );
    const shape = view.container.querySelector(".openui-skeleton-pie-chart-semi-donut");
    assert(shape);
    assert.equal(shape.style.width, "160px");
    assert.equal(shape.style.height, "80px");
    assert.equal(
      view.container.querySelectorAll(".openui-skeleton-pie-chart-legend-item").length,
      2,
    );
  } finally {
    await view.close();
  }
});
