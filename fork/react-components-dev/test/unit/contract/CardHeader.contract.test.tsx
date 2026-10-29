import { CardHeader } from "@openuidev/react-components";
import { renderToString } from "react-dom/server";
import { expect, it } from "vitest";
import { describeContract } from "./defineContract";
describeContract("CardHeader");

it("CardHeader exposes its owned parts under its exported family name", () => {
  const html = renderToString(<CardHeader title="Title" subtitle="Subtitle" icon={<svg />} />);
  expect(html).toContain("openui-card-header-top-left-icon");
  expect(html).not.toContain("openui-header");
});
