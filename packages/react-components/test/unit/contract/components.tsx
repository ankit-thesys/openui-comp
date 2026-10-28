// Components converted to the flat styling convention, each rendered across every prop
// combination through public exports. Add a component here when it leaves the allowlist.
import { Button, IconButton } from "@openuidev/react-components";
import type { ReactElement } from "react";
import { readStableNames, type StableNames } from "../../../scripts/selector-reference.mjs";

export interface MigratedComponent {
  /** The component's folder under src/components. */
  folder: string;
  /** Its style modules' stable-class constants, the single source of the reference. */
  names: StableNames[];
  /** Elements covering every value of every prop that changes its classes. */
  elements: () => ReactElement[];
}

// Stable names as the reference generator reads them: every style module in the folder or below.
const stableNames = await readStableNames();
const namesOf = (folder: string) => {
  const names = stableNames
    .filter(({ component }) => component === folder || component.startsWith(`${folder}/`))
    .map((entry) => entry.names);
  if (names.length === 0) throw new Error(`No built style module of ${folder} exports names.`);
  return names;
};

const product = <T,>(...lists: T[][]): T[][] =>
  lists.reduce<T[][]>(
    (rows, list) => rows.flatMap((row) => list.map((item) => [...row, item])),
    [[]],
  );

export const migratedComponents: MigratedComponent[] = [
  {
    folder: "Button",
    names: namesOf("Button"),
    elements: () =>
      product<string>(
        ["primary", "secondary", "tertiary"],
        ["extra-small", "small", "medium", "large"],
        ["default", "destructive"],
      ).map(([variant, size, tone]) => (
        <Button
          key={`${variant}-${size}-${tone}`}
          variant={variant as "primary"}
          size={size as "small"}
          tone={tone as "default"}
          iconLeft={<svg />}
          iconRight={<svg />}
        >
          Label
        </Button>
      )),
  },
  {
    folder: "IconButton",
    names: namesOf("IconButton"),
    elements: () =>
      product<string>(
        ["primary", "secondary", "tertiary"],
        ["3-extra-small", "2-extra-small", "extra-small", "small", "medium", "large"],
        ["square", "circle"],
        ["default", "destructive"],
      ).map(([variant, size, shape, tone]) => (
        <IconButton
          key={`${variant}-${size}-${shape}-${tone}`}
          variant={variant as "primary"}
          size={size as "small"}
          shape={shape as "square"}
          tone={tone as "default"}
          icon={<svg />}
          aria-label="Action"
        />
      )),
  },
];
