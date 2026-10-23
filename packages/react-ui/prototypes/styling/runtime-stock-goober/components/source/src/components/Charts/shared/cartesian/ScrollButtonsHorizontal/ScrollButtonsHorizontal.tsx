import {OwnedElement as __OwnedElement} from "../../../../../../../runtime/adapter";
import {styles as __styles0} from "../../../../../../../runtime/styles/ScrollButtonsHorizontal";
import clsx from "clsx";
import { ChevronLeft, ChevronRight } from "lucide-react";
import React from "react";
import { IconButton } from "../../../../IconButton";
import { CHART_CLASS_PREFIX } from "../../../utils/constants";
interface ScrollButtonsHorizontalProps {
    dataWidth: number;
    effectiveWidth: number;
    canScrollLeft: boolean;
    canScrollRight: boolean;
    onScrollLeft: () => void;
    onScrollRight: () => void;
}
export const ScrollButtonsHorizontal = React.memo(({ dataWidth, effectiveWidth, canScrollLeft, canScrollRight, onScrollLeft, onScrollRight, }: ScrollButtonsHorizontalProps) => {
    if (dataWidth <= effectiveWidth) {
        return null;
    }
    return (<__OwnedElement $element="div" $styles={[__styles0]} className={`${CHART_CLASS_PREFIX}-chart-horizontal-scroll-buttons-container`}>
        <__OwnedElement $element={IconButton} $styles={[__styles0]} className={clsx(`${CHART_CLASS_PREFIX}-chart-horizontal-scroll-button ${CHART_CLASS_PREFIX}-chart-horizontal-scroll-button--left`, {
            [`${CHART_CLASS_PREFIX}-chart-horizontal-scroll-button--disabled`]: !canScrollLeft,
        })} icon={<ChevronLeft />} variant="secondary" onClick={onScrollLeft} size="2-extra-small" disabled={!canScrollLeft}/>

        <__OwnedElement $element={IconButton} $styles={[__styles0]} className={clsx(`${CHART_CLASS_PREFIX}-chart-horizontal-scroll-button ${CHART_CLASS_PREFIX}-chart-horizontal-scroll-button--right`, {
            [`${CHART_CLASS_PREFIX}-chart-horizontal-scroll-button--disabled`]: !canScrollRight,
        })} icon={<ChevronRight />} variant="secondary" size="2-extra-small" onClick={onScrollRight} disabled={!canScrollRight}/>
      </__OwnedElement>);
});
ScrollButtonsHorizontal.displayName = "ScrollButtonsHorizontal";
