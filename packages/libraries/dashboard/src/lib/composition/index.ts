import { Donut, SegmentedBar, Treemap, Waterfall } from "../../composition/components";
import { compositionStyles } from "../../composition/styles";
import type { Group } from "../group";

/** Composition (#223); Flow has its own registration and shares these styles. */
export const composition: Group = {
  components: [Donut, SegmentedBar, Treemap, Waterfall],
  styles: { composition: compositionStyles },
};
