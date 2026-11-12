import type { RenderFixture } from "./catalog";
import { comparisonFixtures } from "./comparison";
import { compositionFixtures } from "./composition";
import { filtersFixtures } from "./filters";
import { mapsFixtures } from "./maps";
import { metricFixtures } from "./metrics";
import { relationshipsFixtures } from "./relationships";
import { tablesFixtures } from "./tables";
import { trendsFixtures } from "./trends";

/**
 * Every group's catalog programs. One file per group, as in the library's src/groups, so the
 * group tickets each add fixtures to their own file and never edit this list.
 */
export const catalogFixtures: RenderFixture[] = [
  ...metricFixtures,
  ...filtersFixtures,
  ...tablesFixtures,
  ...trendsFixtures,
  ...comparisonFixtures,
  ...compositionFixtures,
  ...relationshipsFixtures,
  ...mapsFixtures,
];
