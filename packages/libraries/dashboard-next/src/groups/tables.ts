import { Goal } from "../tables/goal";
import { goalStyles } from "../tables/goalStyles";
import { KeyValues } from "../tables/keyValues";
import { keyValuesStyles } from "../tables/keyValuesStyles";
import { Column, Table } from "../tables/table";
import { tableStyles } from "../tables/tableStyles";
import type { Group } from "./group";

/** Tables, KeyValues and Goal (#220). */
export const tables: Group = {
  components: [Table, Column, KeyValues, Goal],
  styles: [tableStyles, keyValuesStyles, goalStyles],
};
