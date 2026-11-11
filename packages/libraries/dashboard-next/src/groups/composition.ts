import { Donut, Flow, Funnel, SegmentedBar, Treemap, Waterfall } from "../composition/components";
import { compositionStyles } from "../composition/styles";
import type { Group } from "./group";

/** Composition and Flow (#223). Funnel's segments use the Series Trends registers. */
export const composition: Group = {
  components: [Donut, SegmentedBar, Treemap, Waterfall, Funnel, Flow],
  styles: [compositionStyles],
};
