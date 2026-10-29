import { CompositeCard } from "@openuidev/react-components";
import { renderToString } from "react-dom/server";
import { expect, it } from "vitest";
import { describeContract } from "./defineContract";

it("CompositeCard exposes flat owned parts and only a true clickable modifier", () => {
  const html = renderToString(
    <CompositeCard item={{ header: "Header", body: ["Body"], footer: { price: "Price" } }} />,
  );
  expect(html).toContain("openui-composite-card-footer-content");
  expect(html).not.toContain("--static");
  expect(html).not.toContain("--clickable");
});

describeContract("CompositeCardBlock");
