import { createLibrary, tagSchemaId } from "@openuidev/react-lang";
import { Card, Dashboard, Row, Section } from "./layout";
import { WIDTHS, widthSchema } from "./schema";

tagSchemaId(widthSchema, "Width");
export const library = createLibrary({
  root: "Dashboard",
  components: [Dashboard, Section, Row, Card],
  componentGroups: [
    {
      name: "Structure",
      components: ["Dashboard", "Section", "Row", "Card"],
      notes: [
        `Shared argument types: Width = ${WIDTHS.map((width) => `"${width}"`).join(" | ")}.`,
        "Rows hold Cards only; their widths add up to a full row.",
        'To skip an optional argument before one you need, pass null: Card("Overview", [], null, "Last 30 days").',
      ],
    },
  ],
});
export { ThemeProvider } from "./ThemeProvider";
