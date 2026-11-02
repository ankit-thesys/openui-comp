"use client";

import clsx from "clsx";
import React, { Fragment } from "react";
import { styleRules } from "../../../../styles/css";
import { editableCellStyles, names } from "./editableCell.styles";

export interface CellOutlineProps {
  isSelected: boolean;
  isEditing: boolean;
}

const SIDES = ["top", "bottom", "left", "right"] as const;

export const CellOutline: React.FC<CellOutlineProps> = ({ isSelected, isEditing }) => {
  const styles = editableCellStyles;
  return (
    <>
      {SIDES.map((side) => {
        const horizontalOutlineClass = clsx(
          side === "top" || side === "bottom" ? styles.horizontalOutline : styles.verticalOutline,
          styles[side],
          names[side],
        );
        return (
          <Fragment key={side}>
            <div
              data-state={isEditing ? "editing" : isSelected ? "selected" : "idle"}
              className={horizontalOutlineClass}
            />
            {styleRules(horizontalOutlineClass)}
          </Fragment>
        );
      })}
    </>
  );
};

export default CellOutline;
