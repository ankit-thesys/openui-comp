import { Steps, StepsItem } from "@openuidev/react-components";
import { renderToString } from "react-dom/server";
import { expect, it } from "vitest";
import { describeContract } from "./defineContract";
describeContract("Steps");

it("Steps exposes family parts while retaining automatic and explicit numbering", () => {
  const html = renderToString(
    <Steps>
      <StepsItem title="First" details="Details" />
      <StepsItem title="Second" details="Details" number={7} />
    </Steps>,
  );
  expect(html).toContain("openui-steps-number-inner");
  expect(html).toContain(">1</div>");
  expect(html).toContain(">7</div>");
  expect(html).not.toContain("openui-steps-root");
});
