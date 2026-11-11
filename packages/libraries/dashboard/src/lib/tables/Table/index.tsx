"use client";

import { defineComponent, type ComponentRenderProps } from "@openuidev/react-lang";
import { useMemo } from "react";
import { Table } from "../../../components/tables/Table";
import { nodeList } from "../../../shared/values";
import type { ColumnSchemaProps } from "../Column/schema";
import { tablePropsSchema, type TableSchemaProps } from "./schema";

export const TableComponent = defineComponent({
  name: "Table",
  props: tablePropsSchema,
  description:
    "Sortable, paged table (default pageSize 10). totals adds a totals row for Columns that set total. search takes a SearchFilter's $variable. groupBy names a column (usually a chip or badge column) to group rows under a heading with their count.",
  component: function TableView({ props }: ComponentRenderProps<TableSchemaProps>) {
    // Filtered values can be null for a render while $state settles; treat them as empty.
    const columns = useMemo(
      () =>
        nodeList<ColumnSchemaProps>(props.columns).map((column) => ({
          ...column,
          values: Array.isArray(column.values) ? column.values : [],
        })),
      [props.columns],
    );
    return <Table {...props} columns={columns} />;
  },
});
