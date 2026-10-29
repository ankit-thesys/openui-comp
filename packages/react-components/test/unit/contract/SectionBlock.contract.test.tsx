import {
  FoldableSectionContent,
  FoldableSectionItem,
  FoldableSectionRoot,
  FoldableSectionTrigger,
  SectionV2,
} from "@openuidev/react-components";
import { renderToString } from "react-dom/server";
import { expect, it } from "vitest";
import { describeContract } from "./defineContract";
describeContract("SectionBlock");

it("SectionBlock exposes the SectionV2 and foldable family roots without carrier aliases", () => {
  const html = renderToString(
    <>
      <SectionV2 trigger="Title">Body</SectionV2>
      <FoldableSectionRoot type="multiple" defaultValue={["one"]}>
        <FoldableSectionItem value="one">
          <FoldableSectionTrigger text="Title" />
          <FoldableSectionContent>Body</FoldableSectionContent>
        </FoldableSectionItem>
      </FoldableSectionRoot>
    </>,
  );
  expect(html).toMatch(/class="[^"]*\bopenui-foldable-section(?:\s|"|$)/);
  expect(html).not.toContain("openui-section-block-");
  expect(html).toContain('data-state="open"');
});
