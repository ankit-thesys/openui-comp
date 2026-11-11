import { Column, Table } from "../../tables/table";
import { tableStyles } from "../../tables/tableStyles";
import type { Group } from "../group";

/** Tables, KeyValues and Goal (#220). */
export const tables: Group = {
  components: [Table, Column],
  styles: { table: tableStyles },
};
