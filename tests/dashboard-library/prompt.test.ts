import { library } from "@openuidev/dashboard-library-next";
import { expect, test } from "vitest";

test("layout library prompt", () => {
  expect(library.prompt()).toMatchSnapshot();
});
