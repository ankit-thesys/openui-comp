import { smallMultiplesRules } from "./SmallMultiples/smallMultiples.styles";
import { statusTimelineRules } from "./StatusTimeline/statusTimeline.styles";
import { timeSeriesRules } from "./TimeSeries/timeSeries.styles";
export const trendsStyles = [
  ...timeSeriesRules,
  ...statusTimelineRules,
  ...smallMultiplesRules,
].join("");
