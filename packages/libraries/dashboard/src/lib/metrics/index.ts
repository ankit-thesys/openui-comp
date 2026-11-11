import { Kpi, Kpis, Stat } from "../../kpi";
import { kpiStyles } from "../../kpiStyles";
import { statStyles } from "../../statStyles";
import type { Group } from "../group";

/** The Kpis strip and Stat (#218). */
export const metrics: Group = {
  components: [Kpis, Kpi, Stat],
  styles: { kpi: kpiStyles, stat: statStyles },
};
