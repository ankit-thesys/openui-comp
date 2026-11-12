import { filtersStyles } from "../../components/filters/styles";
import type { Group } from "../group";
import { ChipFilterComponent } from "./ChipFilter";
import { CompareToggleComponent } from "./CompareToggle";
import { DateRangeFilterComponent } from "./DateRangeFilter";
import { FilterBarComponent } from "./FilterBar";
import { MultiSelectFilterComponent } from "./MultiSelectFilter";
import { PeriodPickerComponent } from "./PeriodPicker";
import { SelectFilterComponent } from "./SelectFilter";
export const filters: Group = {
  components: [
    FilterBarComponent,
    PeriodPickerComponent,
    DateRangeFilterComponent,
    ChipFilterComponent,
    SelectFilterComponent,
    MultiSelectFilterComponent,
    // SearchFilter is left out of the schema for now; its component and definition stay in
    // components/filters/SearchFilter and lib/filters/SearchFilter, ready to register again.
    CompareToggleComponent,
  ],
  styles: { filters: filtersStyles },
};
