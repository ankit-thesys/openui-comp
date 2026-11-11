"use client";
import { defineComponent } from "@openuidev/react-lang";
import { Treemap, type TreemapProps } from "../../../components/composition/Treemap";
import type { Covered, SchemaCoverage } from "../../schemaCoverage";
import { treemapPropsSchema, type TreemapSchemaProps } from "./schema";
export const TreemapComponent = defineComponent({
  name: "Treemap",
  props: treemapPropsSchema,
  description:
    "Part to whole with many parts, or a hierarchy: area is size. groups (same length as labels) nests items under parents and colours by parent, e.g. category → product. Use Donut or SegmentedBar for ≤8 flat parts.",
  component: ({ props }) => <Treemap {...props} />,
});

// Every schema field reaches Treemap.
export type TreemapSchemaCovered = Covered<SchemaCoverage<TreemapSchemaProps, TreemapProps>>;
