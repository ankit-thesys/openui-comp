import { Steps, StepsItem, ThemeProvider } from "openui-under-test";
import { createRoot } from "react-dom/client";
declare const __PARITY_BASELINE__: boolean;
const mode = new URLSearchParams(location.search).get("mode") === "dark" ? "dark" : "light";
const item = __PARITY_BASELINE__ ? ".openui-step-item" : ".openui-steps-item";
const partPrefix = __PARITY_BASELINE__ ? ".openui-step-" : ".openui-steps-";
const parts = JSON.stringify(
  Object.fromEntries([
    ["root", __PARITY_BASELINE__ ? ".openui-steps-container" : ".openui-steps"],
    ["list", __PARITY_BASELINE__ ? ".openui-steps" : ".openui-steps-list"],
    ...[0, 1, 2].flatMap((i) => [
      [`${i}-item`, `${item}:nth-child(${i + 1})`],
      ...["connector", "number", "number-inner", "content", "title", "details"].map((part) => [
        `${i}-${part}`,
        `${item}:nth-child(${i + 1}) ${partPrefix}${part}`,
      ]),
      [
        `${i}-line`,
        `${item}:nth-child(${i + 1}) ${__PARITY_BASELINE__ ? ".openui-connector-line" : ".openui-steps-connector-line"}`,
      ],
    ]),
  ]),
);

createRoot(document.getElementById("root")!).render(
  <ThemeProvider mode={mode}>
    <div data-parity-case="numbering" data-parity-parts={parts}>
      <Steps>
        <StepsItem title="First" details="Details" />
        <StepsItem title="Second" details="Details" number={7} />
        <StepsItem title="Last" details="Details" />
      </Steps>
    </div>
  </ThemeProvider>,
);
