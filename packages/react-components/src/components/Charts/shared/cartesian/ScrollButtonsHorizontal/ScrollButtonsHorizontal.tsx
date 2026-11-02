"use client";

import clsx from "clsx";
import { ChevronLeft, ChevronRight } from "lucide-react";
import React from "react";
import { styleRules } from "../../../../../styles/css";
import { IconButton } from "../../../../IconButton";
import { names, scrollButtonsHorizontalStyles } from "./scrollButtonsHorizontal.styles";

interface ScrollButtonsHorizontalProps {
  dataWidth: number;
  effectiveWidth: number;
  canScrollLeft: boolean;
  canScrollRight: boolean;
  onScrollLeft: () => void;
  onScrollRight: () => void;
}

export const ScrollButtonsHorizontal = React.memo(
  ({
    dataWidth,
    effectiveWidth,
    canScrollLeft,
    canScrollRight,
    onScrollLeft,
    onScrollRight,
  }: ScrollButtonsHorizontalProps) => {
    const styles = scrollButtonsHorizontalStyles;
    if (dataWidth <= effectiveWidth) {
      return null;
    }

    const rootClass = clsx(styles.root, names.root);
    const buttonClass = clsx(styles.button, styles.left, names.button, names.left);
    const buttonClass2 = clsx(styles.button, styles.right, names.button, names.right);
    return (
      <>
        <div className={rootClass}>
          <IconButton
            className={buttonClass}
            icon={<ChevronLeft className={names.icon} />}
            variant="secondary"
            aria-label="Scroll left"
            onClick={onScrollLeft}
            size="2-extra-small"
            disabled={!canScrollLeft}
          />
          {styleRules(buttonClass)}

          <IconButton
            className={buttonClass2}
            icon={<ChevronRight className={names.icon} />}
            variant="secondary"
            size="2-extra-small"
            aria-label="Scroll right"
            onClick={onScrollRight}
            disabled={!canScrollRight}
          />
          {styleRules(buttonClass2)}
        </div>
        {styleRules(rootClass)}
      </>
    );
  },
);

ScrollButtonsHorizontal.displayName = "ScrollButtonsHorizontal";
