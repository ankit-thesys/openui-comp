import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
  ThemeProvider,
} from "openui-under-test";
import { createRoot } from "react-dom/client";
import { Icon, mode, useReady } from "./lists-tables-parity-shared";
const parts = JSON.stringify({
  container: ".openui-table-container",
  table: ".openui-table",
  header: ".openui-table-header",
  body: ".openui-table-body",
  footer: ".openui-table-footer",
  firstRow: "tbody tr:first-child",
  evenRow: "tbody tr:nth-child(2)",
  lastRow: "tbody tr:last-child",
  footerRow: "tfoot tr",
  head: ".openui-table-head",
  content: ".openui-table-head-content",
  icon: ".openui-table-head-icon",
  label: ".openui-table-head-label",
  cell: ".openui-table-cell",
});
function Fixture() {
  useReady();
  return (
    <>
      {([undefined, "left", "center", "right"] as const).map((align) => (
        <div key={align ?? "default"} data-case={align ?? "default"} data-parity-parts={parts}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead align={align} icon={<Icon />}>
                  Header
                </TableHead>
                <TableHead align={align}>Next</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[1, 2, 3].map((i) => (
                <TableRow key={i}>
                  <TableCell align={align}>Cell {i}</TableCell>
                  <TableCell align={align}>Value {i}</TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell align={align}>Total</TableCell>
                <TableCell align={align}>6</TableCell>
              </TableRow>
            </TableFooter>
          </Table>
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
