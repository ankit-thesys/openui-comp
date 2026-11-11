"use client";
import { defineComponent, type ComponentRenderProps } from "@openuidev/react-lang";
import { useState } from "react";
import { z } from "zod/v4";
import { formatSchema } from "../format";
import { goodWhenSchema } from "../schema";
import {
  Empty,
  RankedList,
  rowsNote,
  toNumbers,
  TooltipCard,
  toStrings,
  useRowHover,
} from "../shared";
import { MUTED_COLOR } from "../theme";
/* ---------- Leaderboard ---------- */

const leaderboardSchema = z.object({
  labels: z.array(z.string()),
  values: z.array(z.number()),
  format: formatSchema.optional(),
  previous: z.array(z.number()).optional(),
  goodWhen: goodWhenSchema.optional(),
  limit: z.number().optional(),
});

export const Leaderboard = defineComponent({
  name: "Leaderboard",
  props: leaderboardSchema,
  description:
    "Ranked list with inline bars and change vs previous: top channels, pages, campaigns. Shows every item, sorted; a long list scrolls inside the card. limit keeps only the top N.",
  component: function LeaderboardView({
    props,
  }: ComponentRenderProps<z.infer<typeof leaderboardSchema>>) {
    const labels = toStrings(props.labels);
    const values = toNumbers(props.values);
    const previous = toNumbers(props.previous);
    // A missing value is not a zero: it is left out of the ranking and named in a note.
    const all = labels.map((label, i) => ({
      label,
      value: values[i],
      previous: previous[i] ?? null,
    }));
    const dropped = all.filter((item) => item.value === null).map((item) => item.label);
    const items = all
      .filter(
        (item): item is { label: string; value: number; previous: number | null } =>
          item.value !== null,
      )
      .sort((a, b) => b.value - a.value)
      // Every item by default: a long list scrolls inside the card (fade and stepper), so nothing is cut
      // silently. limit, when given, keeps only the top N.
      .slice(0, props.limit ?? undefined);
    const [desc, setDesc] = useState(true);
    const hover = useRowHover();
    if (!items.length) return <Empty />;
    const top = Math.max(...items.map((item) => item.value), 0);
    // Same list as the maps': sort toggle, delta before value, internal scroll once it outgrows its card.
    return (
      <RankedList
        hover={hover}
        items={items.map((item) => ({
          key: item.label,
          name: item.label,
          value: item.value,
          previous: item.previous,
          tip: () => (
            <TooltipCard
              title={item.label}
              format={props.format}
              goodWhen={props.goodWhen}
              rows={[
                {
                  name: "Now",
                  color: "var(--openui-dashboard-series-1)",
                  value: item.value,
                  previous: item.previous,
                },
                ...(item.previous !== null
                  ? [{ name: "Previous", color: MUTED_COLOR, value: item.previous }]
                  : []),
              ]}
            />
          ),
        }))}
        max={top}
        format={props.format}
        goodWhen={props.goodWhen}
        desc={desc}
        onSort={() => setDesc((value) => !value)}
      >
        {rowsNote(dropped)}
      </RankedList>
    );
  },
});
