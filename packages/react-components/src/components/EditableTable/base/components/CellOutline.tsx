import clsx from "clsx";
import React from "react";
import { horizontalOutlineClass, verticalOutlineClass } from "./editableCell.styles";

export interface CellOutlineProps {
  isSelected: boolean;
  isEditing: boolean;
}

const SIDES = ["top", "bottom", "left", "right"] as const;

export const CellOutline: React.FC<CellOutlineProps> = ({ isSelected, isEditing }) => {
  return (
    <>
      {SIDES.map((side) => (
        <div
          key={side}
          className={clsx(
            side === "top" || side === "bottom" ? horizontalOutlineClass : verticalOutlineClass,
            `openui-editable-table-cell-outline-${side}`,
            isSelected && `openui-editable-table-cell-outline-${side}-selected`,
            isEditing && `openui-editable-table-cell-outline-${side}-editing`,
          )}
        />
      ))}
    </>
  );
};

export default CellOutline;
