// #93: public SSR classes include the resolved size, including its default.
// Run after build: pnpm exec vitest run test/unit/contract/Select.contract.test.tsx.
import {
  Select,
  SelectGroup,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@openuidev/react-components";
import { renderToString } from "react-dom/server";
import { expect, it } from "vitest";
import { describeContract } from "./defineContract";

it("documents the default Select trigger size on its public root", () => {
  const html = renderToString(
    <Select>
      <SelectTrigger>
        <SelectValue placeholder="Choose" />
      </SelectTrigger>
    </Select>,
  );
  expect(html).toContain("openui-select-trigger--size-md");
  expect(html).not.toContain("openui-select-trigger-root");
});

describeContract("Select");

it("gives Select label, group, separator and value their own flat override classes", () => {
  const html = renderToString(
    <Select>
      <SelectTrigger>
        <SelectValue placeholder="Choose" />
      </SelectTrigger>
      <SelectGroup>
        <SelectLabel>Group</SelectLabel>
        <SelectSeparator />
      </SelectGroup>
    </Select>,
  );
  expect(html).toContain("openui-select-value");
  expect(html).not.toMatch(/openui-select-(group|label|separator)-root/);
});

it("lets the trigger size override the family size", () => {
  const html = renderToString(
    <Select size="sm">
      <SelectTrigger size="lg">
        <SelectValue placeholder="Choose" />
      </SelectTrigger>
    </Select>,
  );
  expect(html).toContain("openui-select-trigger--size-lg");
  expect(html).not.toContain("openui-select-trigger--size-sm");
});
