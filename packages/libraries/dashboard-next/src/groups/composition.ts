import {
  Donut,
  Flow,
  Funnel,
  SegmentedBar,
  Series,
  Treemap,
  Waterfall,
} from "../composition/components";
import { compositionStyles } from "../composition/styles";
import type { Group } from "./group";
import { trends } from "./trends";

/** Composition and Flow (#223). */
export const composition: Group = {
  // Funnel accepts Series nodes. Keep it usable before #221 lands, without duplicating
  // the registered Series once the trends group supplies the canonical definition.
  components: [
    Donut,
    SegmentedBar,
    Treemap,
    Waterfall,
    Funnel,
    Flow,
    ...(trends.components.some((component) => component.name === "Series") ? [] : [Series]),
  ],
  styles: [compositionStyles],
};
