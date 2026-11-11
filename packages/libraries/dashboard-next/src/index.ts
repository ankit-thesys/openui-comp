import { createLibrary, tagSchemaId } from "@openuidev/react-lang";
import { contentComponents } from "./content";
import { FORMAT_PRESETS, formatSchema } from "./format";
import { Card, Dashboard, Row, Section } from "./layout";
import { goodWhenSchema, WIDTHS, widthSchema } from "./schema";

tagSchemaId(formatSchema, "Format");
tagSchemaId(widthSchema, "Width");
tagSchemaId(goodWhenSchema, "GoodWhen");
export const components = [Dashboard, Section, Row, Card, ...contentComponents];
export const componentGroups = [
  {
    name: "Structure",
    components: ["Dashboard", "Section", "Row", "Card"],
    notes: [
      `Shared argument types: Format = ${FORMAT_PRESETS.map((preset) => `"${preset}"`).join(" | ")}, or {type, currency?, decimals?, prefix?, suffix?} to override, e.g. {type: "number", suffix: " seats"}. Width = ${WIDTHS.map((width) => `"${width}"`).join(" | ")}. GoodWhen = "up" | "down" | "neutral": which direction of change is good news.`,
      'Numbers are raw with a Format; never formatted strings like "$1.2K" or "12%". percent values are already percentages (18.4 = 18.4%); ratio is for fractions; duration is seconds, ms milliseconds, days days. A Kpi\'s text value is for words (a plan, a status, a version), never a number.',
      'To skip an optional argument before one you need, pass null: Kpi("Signups", 2227, "number", null, null, "Last 30 days").',
      "Story order: a lead Section with one Kpis strip of 3–6 headline numbers, then Rows of Cards. Don't size Kpis: the strip lays them out. A number that needs a chart beside it is a Card with a Stat.",
      "Rows hold Cards only; their widths add up to a full row.",
    ],
  },
  {
    name: "Metrics",
    components: ["Kpis", "Kpi", "Stat"],
    notes: [
      "Give previous-period values wherever they exist (Kpi, Stat).",
      'Set goodWhen "down" for metrics where lower is better: costs, CAC, churn, latency, errors.',
    ],
  },
];
export const library = createLibrary({ root: "Dashboard", components, componentGroups });
export * from "./format";
export { CompareOverride, DashboardError, StateOverride, type ViewState } from "./shared";
export { SERIES_COLORS } from "./theme";
export { ThemeProvider } from "./ThemeProvider";
