"use client";

import { type ComponentRenderProps, defineComponent } from "@openuidev/react-lang";
import clsx from "clsx";
import { C1_CLASS_PREFIX } from "../../../shared/classPrefix";
import { type EntityListProps, entityListPropsSchema, type EntityListRow } from "./schema";

function EntityListRenderer({ props }: ComponentRenderProps<EntityListProps>) {
  const showHeaderFooter = props.size === "default";

  const renderRow = (row: EntityListRow, rowType: "header" | "body" | "footer", key: string) => {
    const rightVariant = row.rightVariant ?? "text";

    return (
      <div
        key={key}
        className={clsx(
          `${C1_CLASS_PREFIX}-entity-list__row`,
          `${C1_CLASS_PREFIX}-entity-list__row--${rowType}`,
        )}
      >
        <span
          className={clsx(
            `${C1_CLASS_PREFIX}-entity-list__cell-left`,
            `${C1_CLASS_PREFIX}-entity-list__cell-left--${rowType}`,
          )}
        >
          {row.left}
        </span>
        <span
          className={clsx(
            `${C1_CLASS_PREFIX}-entity-list__cell-right`,
            `${C1_CLASS_PREFIX}-entity-list__cell-right--${rightVariant}`,
            `${C1_CLASS_PREFIX}-entity-list__cell-right--${rowType}`,
          )}
        >
          {row.right}
        </span>
      </div>
    );
  };

  return (
    <div
      className={clsx(
        `${C1_CLASS_PREFIX}-entity-list`,
        `${C1_CLASS_PREFIX}-entity-list--${props.size ?? "default"}`,
      )}
    >
      {showHeaderFooter &&
        props.header &&
        renderRow(props.header, "header", "entity-list-header-row")}
      {(props.rows ?? []).map((row, index) => renderRow(row, "body", `entity-list-row-${index}`))}
      {showHeaderFooter &&
        props.footer &&
        renderRow(props.footer, "footer", "entity-list-footer-row")}
    </div>
  );
}

export const EntityListComponent = defineComponent({
  name: "EntityList",
  props: entityListPropsSchema,
  description: "",
  component: EntityListRenderer,
});
