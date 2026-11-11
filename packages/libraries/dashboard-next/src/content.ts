/** Register new content here; layout internals do not need to change. */
import { z } from "zod/v4";
import { Kpi, Kpis, Stat } from "./kpi";
import { kpiStyles } from "./kpiStyles";
import { statStyles } from "./statStyles";

// Add components, their scoped styles, and refs for each allowed slot here.
export const contentStyles = [kpiStyles, statStyles].join(" ");
export const contentComponents = [Kpis, Kpi, Stat];

export const cardContent = z.union([Kpis.ref, Stat.ref]);
// Add filter refs here when their ticket lands. Empty unions accept no nodes.
export const cardControls = z.union([]);
export const sectionContent = z.union([Kpis.ref]);
// Layout refs are supplied here to keep the registry free of import cycles.
export const dashboardContent = <T extends z.core.$ZodType>(section: T) => z.union([section]);
