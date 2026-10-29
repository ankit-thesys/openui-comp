import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  ThemeProvider,
} from "openui-under-test";
import { createRoot } from "react-dom/client";
const mode = new URLSearchParams(location.search).get("mode") === "dark" ? "dark" : "light";
const parts = JSON.stringify(
  Object.fromEntries(
    [
      "item",
      "header",
      "trigger",
      "trigger-content",
      "trigger-content-icon",
      "trigger-icon",
      "content",
      "content-wrapper",
    ].flatMap((part) =>
      [0, 1, 2].map((i) => [
        `${i}-${part}`,
        part === "item"
          ? `.openui-accordion-item:nth-child(${i + 1})`
          : `.openui-accordion-item:nth-child(${i + 1}) .openui-accordion-${part}`,
      ]),
    ),
  ),
);
createRoot(document.getElementById("root")!).render(
  <ThemeProvider mode={mode}>
    {(["clear", "card", "sunk"] as const).flatMap((variant) =>
      [false, true].map((open) => (
        <Accordion
          key={`${variant}/${open}`}
          variant={variant}
          type="multiple"
          value={open ? ["one", "two", "three"] : []}
          data-parity-case={`${variant}/${open ? "open" : "closed"}`}
          data-parity-parts={parts}
        >
          {["one", "two", "three"].map((value) => (
            <AccordionItem key={value} value={value}>
              <AccordionTrigger text="Title" icon={<svg width="16" height="16" />} />
              <AccordionContent>Body</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )),
    )}
  </ThemeProvider>,
);
