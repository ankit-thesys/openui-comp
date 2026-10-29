import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@openuidev/react-components";
import { renderToString } from "react-dom/server";
import { expect, it } from "vitest";
import { describeContract } from "./defineContract";
describeContract("Accordion");

it("Accordion exposes its default variant and open state without legacy root carriers", () => {
  const html = renderToString(
    <Accordion type="single" defaultValue="one">
      <AccordionItem value="one">
        <AccordionTrigger text="Title" />
        <AccordionContent>Body</AccordionContent>
      </AccordionItem>
    </Accordion>,
  );
  expect(html).toContain("openui-accordion--variant-clear");
  expect(html).toContain('data-state="open"');
  expect(html).not.toContain("openui-accordion-root");
});
