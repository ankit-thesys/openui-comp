import {
  FoldableSectionContent,
  FoldableSectionItem,
  FoldableSectionRoot,
  FoldableSectionTrigger,
  SectionV2,
  ThemeProvider,
} from "openui-under-test";
import { createRoot } from "react-dom/client";
declare const __PARITY_BASELINE__: boolean;
const mode = new URLSearchParams(location.search).get("mode") === "dark" ? "dark" : "light";
const sectionParts = JSON.stringify(
  Object.fromEntries(
    ["root", "wrapper", "header", "header-trigger", "content"].map((part) => [
      part,
      part === "root" ? ".openui-section-v2" : `.openui-section-v2-${part}`,
    ]),
  ),
);
const foldableParts = JSON.stringify(
  Object.fromEntries(
    [
      "root",
      "item",
      "header",
      "trigger",
      "content",
      "trigger-content-wrapper",
      "trigger-content-separator",
      "trigger-content-icon-button-wrapper",
      "trigger-content-icon-button",
      "trigger-content-icon-button-icon",
      "trigger-content-text",
    ].map((part) => [
      part,
      part === "root"
        ? __PARITY_BASELINE__
          ? ".openui-foldable-section-root"
          : ".openui-foldable-section"
        : `.openui-foldable-section-${part}`,
    ]),
  ),
);
createRoot(document.getElementById("root")!).render(
  <ThemeProvider mode={mode}>
    <div data-parity-case="section-v2" data-parity-parts={sectionParts}>
      <SectionV2 trigger="Title">Body</SectionV2>
    </div>
    {[false, true].map((open) => (
      <div
        key={String(open)}
        data-parity-case={`foldable/${open ? "open" : "closed"}`}
        data-parity-parts={foldableParts}
      >
        <FoldableSectionRoot type="multiple" value={open ? ["one"] : []}>
          <FoldableSectionItem value="one">
            <FoldableSectionTrigger text="Title" />
            <FoldableSectionContent>Body</FoldableSectionContent>
          </FoldableSectionItem>
        </FoldableSectionRoot>
      </div>
    ))}
  </ThemeProvider>,
);
