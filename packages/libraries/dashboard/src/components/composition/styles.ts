import { segmentedBarRules } from "../composition/SegmentedBar/segmentedBar.styles";
import { treemapRules } from "../composition/Treemap/treemap.styles";
import { funnelRules } from "../flow/Funnel/funnel.styles";
export const compositionStyles = [
  funnelRules[0],
  segmentedBarRules[0],
  treemapRules[0],
  segmentedBarRules[1],
  treemapRules[1],
].join("");
