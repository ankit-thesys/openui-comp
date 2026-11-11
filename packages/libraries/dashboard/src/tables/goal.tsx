"use client";

import { defineComponent, type ComponentRenderProps } from "@openuidev/react-lang";
import { z } from "zod/v4";
import { formatSchema, formatValue } from "../format";
import { goodWhenSchema } from "../schema";
import { StatusIcon, TickMark, TooltipCard, useRowHover } from "../shared";

/* ---------- Goal ---------- */

const goalSchema = z.object({
  label: z.string(),
  value: z.number(),
  target: z.number(),
  format: formatSchema.optional(),
  pace: z.number().optional(),
  goodWhen: goodWhenSchema.optional(),
});

export const Goal = defineComponent({
  name: "Goal",
  props: goalSchema,
  description:
    'Progress toward a target. pace (0–1) is how far through the period we are; the bar marks ahead/behind pace. goodWhen "down" makes target a ceiling (churn ≤ 2%). The bar takes the state\'s colour; past its target or limit, a tick marks it and the overrun shows beyond, with the amount named. Stack several in one Card. For a single headline number with a target, use a Kpi with target instead; Goal is for several targets stacked in one card.',
  component: function GoalView({ props }: ComponentRenderProps<z.infer<typeof goalSchema>>) {
    const hover = useRowHover();
    const noTarget = !(props.target > 0);
    const progress = noTarget ? (props.value > 0 ? 1 : 0) : props.value / props.target;
    const ceiling = props.goodWhen === "down";
    const pace =
      !ceiling && typeof props.pace === "number" ? Math.min(1, Math.max(0, props.pace)) : null;
    const state = ceiling
      ? props.value <= props.target
        ? "ahead"
        : "over"
      : pace === null
        ? "neutral"
        : progress >= pace
          ? "ahead"
          : "behind";
    // Past its target or limit, the track rescales to the value: a tick marks
    // the target, and the part beyond it is the overrun, in a second texture.
    const passed = !noTarget && props.value > props.target;
    const scale = passed ? props.value : props.target;
    const within = noTarget ? progress : Math.max(0, Math.min(props.value, props.target)) / scale;
    const beyond = passed ? (props.value - props.target) / scale : 0;
    const paceAt = pace !== null && !noTarget ? (pace * props.target) / scale : null;
    // The state alone: how far over or past is already in the header ("2.3% / 2%") and the tooltip.
    const stateText = ceiling
      ? state === "ahead"
        ? "Within limit"
        : "Over limit"
      : passed
        ? "Past target"
        : state === "ahead"
          ? "Ahead of pace"
          : "Behind pace";
    // The kit tooltip on the track: value, target or limit, and where the pace says it should be.
    const tip = () => (
      <TooltipCard
        title={props.label}
        format={props.format}
        rows={[
          { name: "Value", color: "var(--openui-dashboard-series-1)", value: props.value },
          ...(noTarget
            ? []
            : [
                {
                  name: ceiling ? "Limit" : "Target",
                  color: "var(--openui-dashboard-ink)",
                  value: props.target,
                  mark: <TickMark color="var(--openui-dashboard-ink)" />,
                },
              ]),
          ...(pace !== null && !noTarget
            ? [
                {
                  name: "Expected by now",
                  color: "var(--openui-dashboard-ink-muted)",
                  value: pace * props.target,
                  mark: <TickMark color="var(--openui-dashboard-ink-muted)" />,
                },
              ]
            : []),
        ]}
      />
    );
    return (
      <div className="openui-dashboard-goal openui-dashboard-rows" ref={hover.ref}>
        <div className="openui-dashboard-goal-top">
          <span>{props.label}</span>
          <span>
            <strong>{formatValue(props.value, props.format)}</strong>
            <span style={{ color: "var(--openui-dashboard-ink-muted)" }}>
              {" "}
              / {formatValue(props.target, props.format)}
            </span>
          </span>
        </div>
        <div
          className="openui-dashboard-goal-track"
          data-passed={passed ? "" : undefined}
          {...hover.rowProps(props.label, tip)}
        >
          <div
            className="openui-dashboard-goal-fill openui-dashboard-tex-0"
            data-state={state}
            style={{ width: `${within * 100}%` }}
          />
          {passed ? (
            <div
              className="openui-dashboard-goal-fill openui-dashboard-goal-beyond openui-dashboard-tex-1"
              data-state={state}
              style={{ width: `${beyond * 100}%` }}
            />
          ) : null}
          {passed ? (
            <span className="openui-dashboard-goal-mark" style={{ left: `${within * 100}%` }} />
          ) : null}
          {paceAt !== null ? (
            <span className="openui-dashboard-goal-pace" style={{ left: `${paceAt * 100}%` }} />
          ) : null}
        </div>
        <div className="openui-dashboard-goal-foot">
          {/* Only what the header and bar don't already say: the state. The value, target and how far past it
              are in the header ("2.3% / 2%"); the share of target is the bar's length (and in the tooltip). */}
          {noTarget ? <span>No target set</span> : null}
          {!noTarget && (ceiling || pace !== null || passed) ? (
            <span className="openui-dashboard-goal-state">
              <StatusIcon
                tone={
                  state === "ahead"
                    ? "good"
                    : state === "behind"
                      ? "warning"
                      : state === "over"
                        ? "bad"
                        : "good"
                }
              />
              {stateText}
            </span>
          ) : null}
        </div>
        {hover.tip}
      </div>
    );
  },
});
