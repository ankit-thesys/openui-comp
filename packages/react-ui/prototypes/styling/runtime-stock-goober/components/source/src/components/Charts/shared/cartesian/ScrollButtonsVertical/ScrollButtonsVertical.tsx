import {OwnedElement as __OwnedElement} from "../../../../../../../runtime/adapter";
import {styles as __styles0} from "../../../../../../../runtime/styles/ScrollButtonsVertical";
import clsx from "clsx";
import { ChevronDown, ChevronUp } from "lucide-react";
import React from "react";
import { IconButton } from "../../../../IconButton";
import { CHART_CLASS_PREFIX } from "../../../utils/constants";
interface ScrollButtonsVerticalProps {
    canScrollUp: boolean;
    canScrollDown: boolean;
    onScrollUp: () => void;
    onScrollDown: () => void;
}
export const ScrollButtonsVertical = React.memo(({ canScrollUp, canScrollDown, onScrollUp, onScrollDown }: ScrollButtonsVerticalProps) => {
    if (!canScrollUp && !canScrollDown) {
        return null;
    }
    return (<__OwnedElement $element="div" $styles={[__styles0]} className={`${CHART_CLASS_PREFIX}-chart-vertical-scroll-buttons-container`}>
        <__OwnedElement $element={IconButton} $styles={[__styles0]} className={clsx(`${CHART_CLASS_PREFIX}-chart-vertical-scroll-button ${CHART_CLASS_PREFIX}-chart-vertical-scroll-button--up`, {
            [`${CHART_CLASS_PREFIX}-chart-vertical-scroll-button--disabled`]: !canScrollUp,
        })} icon={<ChevronUp />} variant="secondary" onClick={onScrollUp} size="extra-small" disabled={!canScrollUp} aria-label="Scroll up"/>

        <__OwnedElement $element={IconButton} $styles={[__styles0]} className={clsx(`${CHART_CLASS_PREFIX}-chart-vertical-scroll-button ${CHART_CLASS_PREFIX}-chart-vertical-scroll-button--down`, {
            [`${CHART_CLASS_PREFIX}-chart-vertical-scroll-button--disabled`]: !canScrollDown,
        })} icon={<ChevronDown />} variant="secondary" size="extra-small" onClick={onScrollDown} disabled={!canScrollDown} aria-label="Scroll down"/>
      </__OwnedElement>);
});
ScrollButtonsVertical.displayName = "ScrollButtonsVertical";
