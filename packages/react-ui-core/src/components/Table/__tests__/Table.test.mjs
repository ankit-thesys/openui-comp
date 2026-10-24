import assert from "node:assert/strict";
import test from "node:test";
import { act, core, mount, React } from "../../Button/__tests__/consumer.mjs";
const { createElement: h, createRef } = React;
test("Table parts preserve refs, native props, alignment, icon content and container customization", async () => {
  assert(core.Table, "Table must be exported");
  const ref = createRef(),
    containerRef = createRef(),
    headRef = createRef(),
    cellRef = createRef();
  let clicks = 0;
  const view = await mount(
    h(
      core.Table,
      {
        ref,
        containerRef,
        containerClassName: "outer",
        containerStyle: { maxWidth: 350 },
        className: "inner",
        id: "orders",
        style: { color: "red" },
        onClick: () => clicks++,
      },
      h("caption", null, "Orders"),
      h(
        core.TableHeader,
        null,
        h(
          core.TableRow,
          null,
          h(
            core.TableHead,
            {
              ref: headRef,
              align: "right",
              scope: "col",
              icon: h("span", { "data-icon": true }, "USD"),
            },
            "Amount",
          ),
        ),
      ),
      h(
        core.TableBody,
        null,
        h(
          core.TableRow,
          null,
          h(core.TableCell, { ref: cellRef, align: "center", colSpan: 2 }, "42"),
        ),
      ),
      h(core.TableFooter, null, h(core.TableRow, null, h(core.TableCell, null, "Total"))),
    ),
  );
  try {
    const table = view.container.querySelector("table");
    assert.equal(ref.current, table);
    assert.equal(containerRef.current, table.parentElement);
    assert.equal(table.id, "orders");
    assert(table.classList.contains("inner"));
    assert.equal(table.style.color, "red");
    assert(table.parentElement.classList.contains("outer"));
    assert.equal(table.parentElement.style.maxWidth, "350px");
    assert.equal(table.querySelector("caption").textContent, "Orders");
    assert.equal(table.querySelector("tfoot").textContent, "Total");
    assert.equal(headRef.current, table.querySelector("th"));
    assert.equal(headRef.current.scope, "col");
    assert(
      headRef.current
        .querySelector(".openui-table-head-content")
        .classList.contains("openui-table-align-right"),
    );
    assert.equal(headRef.current.querySelector(".openui-table-head-icon").textContent, "USD");
    assert.equal(cellRef.current.colSpan, 2);
    assert(cellRef.current.classList.contains("openui-table-align-center"));
    await act(() => cellRef.current.click());
    assert.equal(clicks, 1);
    await view.render(
      h(
        core.Table,
        { ref },
        h(
          core.TableBody,
          null,
          h(core.TableRow, null, h(core.TableCell, { ref: cellRef, align: "left" }, "Updated")),
        ),
      ),
    );
    assert.equal(ref.current, table);
    assert.equal(cellRef.current.textContent, "Updated");
    assert(cellRef.current.classList.contains("openui-table-align-left"));
  } finally {
    await view.close();
  }
});
