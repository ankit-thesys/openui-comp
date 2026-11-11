import { library } from "@openuidev/dashboard-library";
import { expect, test } from "vitest";

test("layout library prompt", () => {
  expect(library.prompt()).toMatchSnapshot();
});
