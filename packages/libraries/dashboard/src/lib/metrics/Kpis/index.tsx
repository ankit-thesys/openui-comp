"use client";

import { defineComponent, useIsStreaming, type ComponentRenderProps } from "@openuidev/react-lang";
import { Kpis } from "../../../components/metrics/Kpis";
import { nodeList } from "../../../shared/values";
import type { KpiSchemaProps } from "../Kpi/schema";
import { kpisPropsSchema, type KpisSchemaProps } from "./schema";

export const KpisComponent = defineComponent({
  name: "Kpis",
  props: kpisPropsSchema,
  description:
    "A strip of Kpi tiles that lays itself out: up to 6 per row, wrapping into balanced rows when narrow. More than 6 render as compact items (value, then label and change) that wrap the same way; sparklines and hints are left out there. Tiles are equal width; just list them.",
  component: KpisView,
});

function KpisView({ props, renderNode }: ComponentRenderProps<KpisSchemaProps>) {
  const streaming = useIsStreaming();
  const items = Array.isArray(props.items) ? props.items : [];
  return (
    <Kpis
      items={items.length > 6 ? items.map(() => null) : items.map((item) => renderNode(item))}
      facts={items.length > 6 ? nodeList<KpiSchemaProps>(items) : []}
      streaming={streaming}
    />
  );
}
