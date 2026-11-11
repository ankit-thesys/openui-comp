import { Marker, Reference, Series, TimeSeries } from "../../trends/charts";
import { SmallMultiples, StatusTimeline } from "../../trends/specialized";
import { trendsStyles } from "../../trends/styles";
import type { Group } from "../group";

export const trends: Group = {
  components: [TimeSeries, Series, Reference, Marker, SmallMultiples, StatusTimeline],
  styles: [trendsStyles],
};
