"use client";

import clsx from "clsx";
import { ChevronDown, ChevronUp } from "lucide-react";
import React from "react";
import { styleRules } from "../../../../../styles/css";
import { IconButton } from "../../../../IconButton";
import { names, scrollButtonsVerticalStyles } from "./scrollButtonsVertical.styles";

interface ScrollButtonsVerticalProps {
  canScrollUp: boolean;
  canScrollDown: boolean;
  onScrollUp: () => void;
  onScrollDown: () => void;
}

export const ScrollButtonsVertical = React.memo(
  ({ canScrollUp, canScrollDown, onScrollUp, onScrollDown }: ScrollButtonsVerticalProps) => {
    const styles = scrollButtonsVerticalStyles;
    if (!canScrollUp && !canScrollDown) {
      return null;
    }

    const rootClass = clsx(styles.root, names.root);
    const buttonClass = clsx(styles.button, names.button, names.up);
    const buttonClass2 = clsx(styles.button, names.button, names.down);
    return (
      <>
        <div className={rootClass}>
          <IconButton
            className={buttonClass}
            icon={<ChevronUp className={names.icon} />}
            variant="secondary"
            onClick={onScrollUp}
            size="extra-small"
            disabled={!canScrollUp}
            aria-label="Scroll up"
          />
          {styleRules(buttonClass)}

          <IconButton
            className={buttonClass2}
            icon={<ChevronDown className={names.icon} />}
            variant="secondary"
            size="extra-small"
            onClick={onScrollDown}
            disabled={!canScrollDown}
            aria-label="Scroll down"
          />
          {styleRules(buttonClass2)}
        </div>
        {styleRules(rootClass)}
      </>
    );
  },
);

ScrollButtonsVertical.displayName = "ScrollButtonsVertical";
