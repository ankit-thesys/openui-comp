"use client";

import { defineComponent, type ComponentRenderProps } from "@openuidev/react-lang";
import clsx from "clsx";
import { C1_CLASS_PREFIX } from "../../../shared/classPrefix";
import { filterBarPropsSchema, type FilterBarProps } from "./schema";
function FilterBarRenderer({ props, renderNode }: ComponentRenderProps<FilterBarProps>) {
  const children = props.children;
  const rightChildren = props.rightChildren;

  return (
    <div
      className={clsx(
        `${C1_CLASS_PREFIX}-filter-bar`,
        props.compact && `${C1_CLASS_PREFIX}-filter-bar--compact`,
      )}
    >
      <div
        className={`${C1_CLASS_PREFIX}-filter-bar__side ${C1_CLASS_PREFIX}-filter-bar__side--left`}
      >
        {renderNode(children)}
      </div>
      {rightChildren.length ? (
        <div
          className={`${C1_CLASS_PREFIX}-filter-bar__side ${C1_CLASS_PREFIX}-filter-bar__side--right`}
        >
          {renderNode(rightChildren)}
        </div>
      ) : null}
    </div>
  );
}

export const FilterBarComponent = defineComponent({
  name: "FilterBar",
  props: filterBarPropsSchema,
  description: "",
  component: FilterBarRenderer,
});
