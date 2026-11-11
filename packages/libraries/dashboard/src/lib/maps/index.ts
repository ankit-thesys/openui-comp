import { mapsRules } from "../../components/maps/maps.styles";
import type { Group } from "../group";
import { GeoMapComponent } from "./GeoMap";
import { PointMapComponent } from "./PointMap";
export const maps: Group = {
  components: [GeoMapComponent, PointMapComponent],
  styles: { maps: mapsRules.join("") },
};
