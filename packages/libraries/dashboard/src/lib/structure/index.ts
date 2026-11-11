import { structureStyles } from "../../components/structure/styles";
import type { Group } from "../group";
import { CardComponent } from "./Card";
import { DashboardComponent } from "./Dashboard";
import { RowComponent } from "./Row";
import { SectionComponent } from "./Section";
export const structure: Group = {
  components: [DashboardComponent, SectionComponent, RowComponent, CardComponent],
  styles: [structureStyles],
};
