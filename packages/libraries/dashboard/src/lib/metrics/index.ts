import { goalRules } from "../../components/metrics/Goal/goal.styles";
import { keyValuesRules } from "../../components/metrics/KeyValues/keyValues.styles";
import { kpiRules } from "../../components/metrics/Kpi/kpi.styles";
import { kpisRules } from "../../components/metrics/Kpis/kpis.styles";
import { metricsRules } from "../../components/metrics/metrics.styles";
import { statRules } from "../../components/metrics/Stat/stat.styles";
import type { Group } from "../group";
import { GoalComponent } from "./Goal";
import { KeyValuesComponent } from "./KeyValues";
import { KpiComponent } from "./Kpi";
import { KpisComponent } from "./Kpis";
import { StatComponent } from "./Stat";

export const metrics: Group = {
  components: [KpisComponent, KpiComponent, StatComponent, KeyValuesComponent, GoalComponent],
  styles: {
    kpi: [
      kpisRules[0],
      kpisRules[1],
      kpisRules[2],
      kpisRules[3],
      kpisRules[4],
      kpisRules[5],
      kpisRules[6],
      kpisRules[7],
      kpisRules[8],
      kpisRules[9],
      kpisRules[10],
      kpisRules[11],
      kpisRules[12],
      kpiRules[0],
      kpiRules[1],
      kpiRules[2],
      kpiRules[3],
      kpiRules[4],
      kpiRules[5],
      kpiRules[6],
      kpiRules[7],
      kpiRules[8],
      kpisRules[13],
      metricsRules[0],
      kpiRules[9],
      kpiRules[10],
      kpiRules[11],
      kpiRules[12],
      kpiRules[13],
      kpiRules[14],
      kpiRules[15],
      kpiRules[16],
      kpiRules[17],
      kpiRules[18],
      kpiRules[19],
      kpiRules[20],
      kpiRules[21],
      kpiRules[22],
      kpiRules[23],
      kpiRules[24],
      kpiRules[25],
      kpiRules[26],
      kpiRules[27],
      kpiRules[28],
      metricsRules[1],
      metricsRules[2],
      metricsRules[3],
      metricsRules[4],
      metricsRules[5],
      metricsRules[6],
      metricsRules[7],
      metricsRules[8],
      metricsRules[9],
      metricsRules[10],
      metricsRules[11],
      metricsRules[12],
    ].join(""),
    stat: statRules.join(""),
    keyValues: keyValuesRules.join(""),
    goal: goalRules.join(""),
  },
};
