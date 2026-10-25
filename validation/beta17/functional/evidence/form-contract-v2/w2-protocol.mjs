export const workloads = ["chat", "dashboard"];
export const loads = ["paced", "stress"];
export const arms = ["baseline", "runtime"];
export const thresholds = Object.freeze({
  pairsPerCell: 10,
  medianRegressionPercent: 10,
  p95RegressionPercent: 15,
  inputCommandP95Ms: 100,
  retainedHeapGrowthMiB: 5,
  soakMs: 600_000,
  sampleEveryMs: 30_000,
  warmupCycles: 12,
  rssInvestigationGrowthMiB: 100,
});

export function pairOrder(pair) {
  return pair % 2 ? ["runtime", "baseline"] : ["baseline", "runtime"];
}
