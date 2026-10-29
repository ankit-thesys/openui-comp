// #99 public SSR seam. Build, then run: pnpm exec vitest run test/unit/lists-tables.test.tsx.
// Styling contracts and Chromium fixtures cover selectors, modes, overrides and visual parity.
import {
  EditableTable,
  EditableTableChangesBar,
  EntityList,
  ListBlock,
  ListItem,
  MetricIndicatorInline,
  MetricIndicatorWithStrikethrough,
  ScrollableTable,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@openuidev/react-components";
import { renderToString } from "react-dom/server";
import { expect, it } from "vitest";

it("ListItem exposes default axes on the consumer root and classes on owned parts", () => {
  const html = renderToString(<ListItem title="First" />);
  expect(html).toMatch(/class="[^"]*openui-list-item--variant-number/);
  expect(html).toContain("openui-list-item--size-default");
  expect(html).not.toContain("openui-list-item-wrapper");
});

it("ListBlock exposes its default axes and passes subtitle presence to its items", () => {
  const html = renderToString(
    <ListBlock>
      <ListItem title="First" subtitle="Details" />
      <ListItem title="Second" />
    </ListBlock>,
  );
  expect(html).toContain("openui-list-block--size-default");
  expect(html).toContain("openui-list-block--variant-number");
  expect(html.match(/openui-list-item--list-has-subtitle/g)).toHaveLength(2);
});

it("EntityList documents row roles and rightVariant without compound legacy classes", () => {
  const html = renderToString(
    <EntityList
      rows={[{ left: "Name", right: "42", rightVariant: "number" }]}
      header={{ left: "Key", right: "Value" }}
      footer={{ left: "Total", right: "42" }}
    />,
  );
  expect(html).toContain("openui-entity-list--size-default");
  expect(html).toContain("openui-entity-list-row--row-type-body");
  expect(html).toContain("openui-entity-list-cell-right--right-variant-number");
  expect(html).not.toContain("openui-entity-list__");
});

it("MetricIndicator exposes trend direction as a prop axis and subtext presence as an attribute", () => {
  const html = renderToString(
    <>
      <MetricIndicatorInline value="42" subtext="Sales" trend={{ direction: "up", value: 5 }} />
      <MetricIndicatorWithStrikethrough
        value="40"
        previousValue="42"
        trend={{ direction: "down", value: 2 }}
      />
    </>,
  );
  expect(html).toContain("openui-metric-indicator-trend--direction-up");
  expect(html).toContain("openui-metric-indicator-trend--direction-down");
  expect(html).toContain('data-subtext="true"');
  expect(html).not.toContain("openui-metric-indicator__");
});

it("Table head and cell expose default and explicit alignment axes on their roots", () => {
  const html = renderToString(
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Head</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell align="right">Cell</TableCell>
        </TableRow>
      </TableBody>
    </Table>,
  );
  expect(html).toContain("openui-table-head--align-left");
  expect(html).toContain("openui-table-cell--align-right");
  expect(html).not.toContain("openui-table-alignment");
});

it("ScrollableTable exposes its root and measures width through state instead of inline styles", () => {
  const html = renderToString(
    <ScrollableTable>
      <TableBody>
        <TableRow>
          <TableCell>Cell</TableCell>
        </TableRow>
      </TableBody>
    </ScrollableTable>,
  );
  expect(html).toMatch(/<table[^>]*class="[^"]*openui-scrollable-table/);
  expect(html).toContain('data-scrollable="false"');
  expect(html).not.toContain('style="width:');
});

it("EditableTable owns flat cell, outline and select parts and hides an empty changes bar", () => {
  const html = renderToString(
    <EditableTable
      data={[{ id: "1", name: "Ada", status: "ready" }]}
      columns={[
        { key: "name", header: "Name" },
        {
          key: "status",
          header: "Status",
          type: "select",
          options: [{ value: "ready", label: "Ready" }],
        },
      ]}
    />,
  );
  expect(html).toMatch(/class="[^"]*openui-editable-table(?: |")/);
  expect(html).toContain('data-state="idle"');
  expect(html).toContain("openui-editable-table-cell-outline-top");
  expect(html).not.toContain("openui-select-trigger");
  expect(renderToString(<EditableTableChangesBar changedCellCount={0} />)).toBe("");
});
