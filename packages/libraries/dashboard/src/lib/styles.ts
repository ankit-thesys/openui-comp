import { sharedStyles } from "../components/shared/styles";
import { structureStyles } from "../components/structure/styles";
import { groupStyles } from "./registeredGroups";

// Fixed root class order: structure, shared, metrics, filters, tables, trends,
// comparison, composition (including Flow), relationships, maps.
export const dashboardStyles = `${structureStyles} ${sharedStyles} ${groupStyles}`;
