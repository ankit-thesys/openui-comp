import {
  ScrollableTable,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  ThemeProvider,
} from "openui-under-test";
import { createRoot } from "react-dom/client";
import { mode, useReady } from "./lists-tables-parity-shared";
declare const __PARITY_BASELINE__: boolean;
const parts = JSON.stringify({
  wrapper: ".openui-scrollable-table-wrapper",
  container: ".openui-scrollable-table-scroll-container",
  table: ".openui-table",
  head: ".openui-table-head",
  cell: ".openui-table-cell",
  control: __PARITY_BASELINE__
    ? ".openui-scrollable-table-control-right"
    : '.openui-scrollable-table-control[data-side="right"]',
  button: '[aria-label="Scroll right"]',
  icon: '[aria-label="Scroll right"] svg',
});
function Fixture() {
  useReady();
  return (
    <>
      {[false, true].map((overflow) => (
        <div
          key={String(overflow)}
          style={{ width: overflow ? 240 : 720 }}
          data-case={overflow ? "overflow" : "fits"}
          data-parity-parts={parts}
          data-parity-target="thead tr:first-child th:first-child .openui-table-head-label"
        >
          <ScrollableTable>
            <TableHeader>
              <TableRow>
                {Array.from({ length: overflow ? 8 : 2 }, (_, i) => (
                  <TableHead key={i}>Column {i + 1}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                {Array.from({ length: overflow ? 8 : 2 }, (_, i) => (
                  <TableCell key={i}>Column content {i + 1}</TableCell>
                ))}
              </TableRow>
            </TableBody>
          </ScrollableTable>
        </div>
      ))}
    </>
  );
}
createRoot(document.getElementById("root")!).render(
  <ThemeProvider mode={mode}>
    <Fixture />
  </ThemeProvider>,
);
