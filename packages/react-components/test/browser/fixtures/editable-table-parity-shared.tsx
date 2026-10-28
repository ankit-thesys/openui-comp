import { EditableTable, EditableTableChangesBar, ThemeProvider } from "openui-under-test";
import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { mode } from "./lists-tables-parity-shared";
declare const __PARITY_BASELINE__: boolean;
export type PinnedState = "idle" | "selected" | "editing" | "select";
export function renderEditableParity(state: PinnedState) {
  const parts = {
    root: __PARITY_BASELINE__ ? ".openui-editable-table-wrapper" : ".openui-editable-table",
    scroll: ".openui-editable-table-scroll-container",
    table: ".openui-editable-table-table",
    header: "thead",
    head: "th",
    headerContainer: ".openui-editable-table-header-container",
    headerIcon: ".openui-editable-table-header-icon",
    body: "tbody",
    row: "tbody tr",
    td: "td",
    cell: ".openui-editable-table-cell-base",
    input: ".openui-editable-table-cell-input",
    text: ".openui-editable-table-display-text",
    number: ".openui-editable-table-display-number",
    url: ".openui-editable-table-display-url",
    urlContainer: ".openui-editable-table-display-url-container",
    urlIcon: ".openui-editable-table-display-url-icon",
    warning: ".openui-editable-table-display-url-warning-icon",
    ...Object.fromEntries(
      ["top", "bottom", "left", "right"].map((side) => [
        side,
        `.openui-editable-table-cell-outline-${side}`,
      ]),
    ),
    trigger: ".openui-editable-table-select-trigger",
    triggerIcon: __PARITY_BASELINE__
      ? ".openui-select-trigger-icon"
      : ".openui-editable-table-select-icon",
    content: __PARITY_BASELINE__
      ? ".openui-select-content"
      : ".openui-editable-table-select-content",
    viewport: __PARITY_BASELINE__
      ? ".openui-select-viewport"
      : ".openui-editable-table-select-viewport",
    item: ".openui-editable-table-select-item",
    checked: '.openui-editable-table-select-item[data-state="checked"]',
    unchecked: '.openui-editable-table-select-item[data-state="unchecked"]',
    checkWrapper: __PARITY_BASELINE__
      ? ".openui-select-item-check-wrapper"
      : ".openui-editable-table-select-check-wrapper",
    checkIcon: __PARITY_BASELINE__
      ? ".openui-select-item-check-icon"
      : ".openui-editable-table-select-check-icon",
    itemText: __PARITY_BASELINE__
      ? '[role="option"] > span:last-child'
      : ".openui-editable-table-select-item-text",
    changes: ".openui-editable-table-changes-container",
    count: ".openui-editable-table-changes-count",
    buttons: ".openui-editable-table-changes-buttons",
  };
  function Fixture() {
    const [data, setData] = useState([
      {
        id: "1",
        name: "Ada",
        amount: 42,
        url: "https://example.com",
        status: "ready",
        date: "2026-01-15T12:00:00.000Z",
      },
      {
        id: "2",
        name: "Grace",
        amount: 43,
        url: "not a url",
        status: "pending",
        date: "2026-01-16T12:00:00.000Z",
      },
    ]);
    useEffect(() => {
      let frame = 0;
      let ticks = 0;
      const pin = () => {
        const cells = document.querySelectorAll<HTMLElement>(".openui-editable-table-cell-base");
        if (cells.length < 5 || ticks++ < 3) {
          frame = requestAnimationFrame(pin);
          return;
        }
        if (state !== "idle") {
          const cell = cells[state === "select" ? 3 : 0]!;
          cell.click();
        }
        const expose = () => {
          if (
            (state === "editing" &&
              !document.querySelector("input.openui-editable-table-cell-input")) ||
            (state === "select" && !document.querySelector('[role="option"]'))
          ) {
            frame = requestAnimationFrame(expose);
            return;
          }
          document.body.setAttribute("data-parity-parts", JSON.stringify(parts));
          document.body.setAttribute(
            "data-parity-target",
            state === "select"
              ? '.openui-editable-table-select-item[data-state="checked"]'
              : state === "editing"
                ? "input.openui-editable-table-cell-input"
                : state === "selected"
                  ? "tbody tr:first-child td:first-child .openui-editable-table-cell-base"
                  : "thead tr:first-child th:first-child .openui-editable-table-header-container",
          );
          document.body.setAttribute("data-parity-case", state);
        };
        // Discrete updates from an imperative click must render before the edit click.
        if (state === "editing" || state === "select") {
          frame = requestAnimationFrame(() => {
            cells[state === "select" ? 3 : 0]!.click();
            frame = requestAnimationFrame(expose);
          });
        } else frame = requestAnimationFrame(expose);
      };
      frame = requestAnimationFrame(pin);
      return () => {
        cancelAnimationFrame(frame);
        document.body.removeAttribute("data-parity-case");
      };
    }, []);
    return (
      <div style={{ width: 960 }}>
        <EditableTable
          data={data}
          onDataChange={(next) => setData(next as typeof data)}
          columns={[
            { key: "name", header: "Name", type: "text" },
            { key: "amount", header: "Amount", type: "number" },
            { key: "url", header: "URL", type: "url" },
            {
              key: "status",
              header: "Status",
              type: "select",
              options: [
                { value: "ready", label: "Ready" },
                { value: "pending", label: "Pending" },
              ],
            },
            { key: "date", header: "Date", type: "date-single" },
          ]}
        />
        <EditableTableChangesBar changedCellCount={2} />
      </div>
    );
  }
  createRoot(document.getElementById("root")!).render(
    <ThemeProvider mode={mode}>
      <Fixture />
    </ThemeProvider>,
  );
}
