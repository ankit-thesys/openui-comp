import { defineComponent } from "@openuidev/react-lang";
import { columnPropsSchema } from "./schema";

export const ColumnComponent = defineComponent({
  name: "Column",
  props: columnPropsSchema,
  description:
    'kind: "primary" (bold first column), "text", "number", "bar" (number with inline bar), "delta" (signed change coloured by goodWhen), "badge" (tones maps statuses to good/bad/warning/info/neutral; plain categories stay neutral), "sparkline" (values are number arrays), "chip" (a category such as plan, channel or region as a neutral chip; an array gives several tags), "date" ("2026-11-08" shown as Nov 8), "progress" (0–100, a share of a goal with a bar to 100%), "states" (one status dot per period: arrays of "good" | "warning" | "bad" | null), "link" (a URL, shown without https:// and opened in a new tab), "person" (a name with an initials avatar, for owners and assignees). total "sum" or "average" only for amounts, never rates or per-unit values like CAC.',
  component: () => null,
});
