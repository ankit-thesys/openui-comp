import {
  ChipFilter,
  CompareToggle,
  DateRangeFilter,
  FilterBar,
  MultiSelectFilter,
  PeriodPicker,
  SearchFilter,
  SelectFilter,
} from "../filters/filters";
import { filtersStyles } from "../filters/styles";
import type { Group } from "./group";

export const filters: Group = {
  components: [
    FilterBar,
    PeriodPicker,
    DateRangeFilter,
    ChipFilter,
    SelectFilter,
    MultiSelectFilter,
    SearchFilter,
    CompareToggle,
  ],
  styles: [filtersStyles],
};
