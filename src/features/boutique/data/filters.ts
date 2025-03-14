import type { FiltersInterface } from "../../../shared/interfaces/Filters.interface";

export const DEFAULT_FILTERS: FiltersInterface = {
  search: "",
  priceRange: [0, 10000],
  category: "all",
};
