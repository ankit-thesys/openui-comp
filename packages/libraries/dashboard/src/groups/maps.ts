import { GeoMap, PointMap } from "../maps/geo";
import { mapStyles } from "../maps/mapStyles";
import type { Group } from "./group";

/** Maps (#225). */
export const maps: Group = {
  components: [GeoMap, PointMap],
  styles: [mapStyles],
};
