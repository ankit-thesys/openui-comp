import { createLibrary, tagSchemaId } from "@openuidev/react-lang";
import { formatSchema } from "./format";
import { groupComponents, inPromptOrder } from "./groups";
import { Card, Dashboard, Row, Section } from "./layout";
import { promptGroups } from "./prompt";
import { goodWhenSchema, widthSchema } from "./schema";

// Name the shared types so each signature prints "Format" instead of the whole
// union (it appears ~20 times); the Structure notes define them once.
tagSchemaId(formatSchema, "Format");
tagSchemaId(widthSchema, "Width");
tagSchemaId(goodWhenSchema, "GoodWhen");

export const library = createLibrary({
  root: "Dashboard",
  components: inPromptOrder([Dashboard, Section, Row, Card, ...groupComponents]),
  componentGroups: promptGroups(),
});
export { ThemeProvider } from "./ThemeProvider";
