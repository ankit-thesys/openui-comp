import { css } from "@openuidev/react-components";
import { baseRules } from "./base.styles";
import { cardRules } from "./Card/card.styles";
import { dashboardRules } from "./Dashboard/dashboard.styles";
import { rowRules } from "./Row/row.styles";
import { sectionRules } from "./Section/section.styles";

// Original layoutStyles order, with responsive blocks intact. Compile exactly once.
export const structureStyleRules = [
  baseRules[0],
  dashboardRules[0],
  sectionRules[0],
  rowRules[0],
  baseRules[1],
  cardRules[0],
  baseRules[2],
  dashboardRules[1],
  baseRules[3],
] as const;
export const structureStyles = css(structureStyleRules.join(""));
