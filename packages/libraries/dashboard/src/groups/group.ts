import type { DefinedComponent } from "@openuidev/react-lang";

/**
 * What one component group adds to the dashboard library. Each group ticket fills in only its
 * own file in this folder: the registry (./index.ts) already imports every group, and works out
 * from component names which slots (Card content, Card controls, Section rows, Dashboard
 * children) each component joins, where it sits in the prompt, and which prompt notes apply.
 */
export type Group = {
  /** The group's components, in any order: the prompt follows his library's order. Each has its own props schema. */
  components: readonly DefinedComponent<any>[];
  /** Class names from the css tag, applied on the dashboard root. */
  styles: readonly string[];
};

export const emptyGroup: Group = { components: [], styles: [] };
