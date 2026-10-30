import { openuiDashboardExamples } from "../../lib";
import programs from "../fixtures/programs.json";

export interface Case {
  id: string;
  program: string;
}

/** The shipped examples plus programs that reach what the examples don't. */
export const cases: Case[] = [
  ...openuiDashboardExamples.map((example, i) => ({
    id: `example-${i + 1}`,
    program: example.replace(/^Example[^\n]*\n+/, "").trim(),
  })),
  ...programs,
];
