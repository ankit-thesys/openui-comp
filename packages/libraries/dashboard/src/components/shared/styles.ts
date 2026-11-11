import { css } from "@openuidev/react-components";
import { baseRules } from "./base.styles";
import { deltaBadgeRules } from "./DeltaBadge/deltaBadge.styles";
import { legendRules } from "./Legend/legend.styles";
import { partsLegendRules } from "./PartsLegend/partsLegend.styles";
import { rampKeyRules } from "./RampKey/rampKey.styles";
import { rankedListRules } from "./RankedList/rankedList.styles";
import { rowHoverRules } from "./RowHover/rowHover.styles";
import { rowMarksRules } from "./RowMarks/rowMarks.styles";
import { scrollAreaRules } from "./ScrollArea/scrollArea.styles";
import { sortToggleRules } from "./SortToggle/sortToggle.styles";
import { statesRules } from "./States/states.styles";
import { statusIconRules } from "./StatusIcon/statusIcon.styles";
import { tooltipCardRules } from "./TooltipCard/tooltipCard.styles";
import { viewSwitchRules } from "./ViewSwitch/viewSwitch.styles";

// Original sharedStyles.ts rule order, including intact responsive blocks.
// Compile once: goober merges repeated at-rules within one stylesheet.
export const sharedStyleRules = [
  viewSwitchRules[0],
  baseRules[0],
  viewSwitchRules[1],
  baseRules[1],
  legendRules[0],
  viewSwitchRules[2],
  statusIconRules[0],
  baseRules[2],
  deltaBadgeRules[0],
  legendRules[1],
  tooltipCardRules[0],
  rowHoverRules[0],
  rowMarksRules[0],
  baseRules[3],
  rowMarksRules[1],
  baseRules[4],
  scrollAreaRules[0],
  rankedListRules[0],
  scrollAreaRules[1],
  rankedListRules[1],
  sortToggleRules[0],
  rankedListRules[2],
  partsLegendRules[0],
  statesRules[0],
  baseRules[5],
  viewSwitchRules[3],
  rampKeyRules[0],
] as const;

export const sharedStyles = css(sharedStyleRules.join(""));
