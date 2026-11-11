import { comparison } from "./comparison";
import { composition } from "./composition";
import { filters } from "./filters";
import { flow } from "./flow";
import type { Group } from "./group";
import { maps } from "./maps";
import { metrics } from "./metrics";
import { relationships } from "./relationships";
import { tables } from "./tables";
import { trends } from "./trends";

/** Non-Structure registrations initialize before Structure's slot schemas.
 * Kept separate from defineComponents to avoid a registry -> Structure -> registry cycle.
 * This order also preserves the original group's stylesheet order.
 */
export const groups: Group[] = [
  metrics,
  filters,
  tables,
  trends,
  comparison,
  composition,
  flow,
  relationships,
  maps,
];

export const groupComponents = groups.flatMap((group) => group.components);
export const groupStyles = groups.flatMap((group) => group.styles).join(" ");
