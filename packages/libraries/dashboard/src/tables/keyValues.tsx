"use client";

import { defineComponent, type ComponentRenderProps } from "@openuidev/react-lang";
import { z } from "zod/v4";
import { formatSchema, formatValue } from "../format";
import { goodWhenSchema } from "../schema";
import { DeltaBadge, Empty } from "../shared";

/* ---------- KeyValues ---------- */

const keyValueSchema = z.object({
  label: z.string(),
  value: z.union([z.number(), z.string(), z.literal(null)]),
  format: formatSchema.optional(),
  previous: z.number().nullable().optional(),
  goodWhen: goodWhenSchema.optional(),
});

const keyValuesSchema = z.object({
  rows: z.array(keyValueSchema),
});

export const KeyValues = defineComponent({
  name: "KeyValues",
  props: keyValuesSchema,
  description:
    'Label/value fact rows, e.g. [{label: "Trials", value: 572, format: "number", previous: 547}, {label: "Owner", value: "Growth team"}].',
  component: function KeyValuesView({
    props,
  }: ComponentRenderProps<z.infer<typeof keyValuesSchema>>) {
    const rows = Array.isArray(props.rows) ? props.rows.filter(Boolean) : [];
    if (!rows.length) return <Empty />;
    return (
      <dl className="openui-dashboard-kv">
        {rows.map((row) => (
          <div key={row.label} className="openui-dashboard-kv-row">
            <dt>{row.label}</dt>
            {/* Change first, value last: values sit flush right in one column. */}
            <dd>
              {typeof row.value === "number" ? (
                <DeltaBadge
                  current={row.value}
                  previous={row.previous}
                  format={row.format}
                  goodWhen={row.goodWhen}
                  inline
                />
              ) : null}
              <span className="openui-dashboard-kv-value">
                {typeof row.value === "number"
                  ? formatValue(row.value, row.format)
                  : row.value || "—"}
              </span>
            </dd>
          </div>
        ))}
      </dl>
    );
  },
});
