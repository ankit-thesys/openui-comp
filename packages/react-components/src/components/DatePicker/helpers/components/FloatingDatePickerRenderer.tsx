"use client";

import { autoUpdate, flip, offset, useFloating } from "@floating-ui/react-dom";
import clsx from "clsx";
import { ChevronDown } from "lucide-react";
import { forwardRef, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useMultipleRefs } from "../../../../hooks/useMultipleRefs";
import { styleRules } from "../../../../styles/css";
import { useTheme } from "../../../ThemeProvider";
import { datePickerStyles, names } from "../../datePicker.styles";
import { useDatePicker } from "../context/DatePickerContext";
import { formatDateRange, formatSingleDate } from "../utils/helperFn";
import { DatepickerRenderer } from "./DatePickerRenderer";

const FloatingDateInput = () => {
  const styles = datePickerStyles;
  const { mode, selectedDate, selectedRange, isOpen, setIsOpen } = useDatePicker();
  const hasSelectedDate =
    mode === "single"
      ? !!selectedDate
      : !!(selectedRange && selectedRange.from && selectedRange.to);

  const triggerClass = clsx(styles.trigger, names.trigger);
  const textClass = clsx(styles.text, names.text);
  const iconClass = clsx(styles.icon, names.icon);
  return (
    <>
      <div
        className={triggerClass}
        data-state={isOpen ? "open" : "closed"}
        data-placeholder={!hasSelectedDate || undefined}
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
      >
        <span className={textClass}>
          {mode === "single" ? formatSingleDate(selectedDate) : formatDateRange(selectedRange)}
        </span>
        {styleRules(textClass)}
        <ChevronDown size={16} className={iconClass} />
        {styleRules(iconClass)}
      </div>
      {styleRules(triggerClass)}
    </>
  );
};

const FloatingDatePicker = forwardRef<HTMLDivElement>((_, ref) => {
  const { isOpen } = useDatePicker();
  const styles = datePickerStyles;
  const menuPositionDivRef = useRef<HTMLDivElement>(null);
  const { portalThemeClassName } = useTheme();

  const {
    refs: { setFloating, setReference },
    floatingStyles,
  } = useFloating({
    strategy: "absolute",
    placement: "bottom-start",
    whileElementsMounted: autoUpdate,
    middleware: [offset(5), flip()],
  });

  const menuPositionDivRefs = useMultipleRefs(setReference, menuPositionDivRef);
  const floatingRef = useMultipleRefs(setFloating, ref);

  if (!isOpen || typeof document === "undefined") {
    return null;
  }

  const referenceClass = clsx(styles.reference, names.reference);
  return (
    <>
      <div ref={menuPositionDivRefs} className={referenceClass} />
      {styleRules(referenceClass)}
      {createPortal(
        <div
          ref={floatingRef}
          style={floatingStyles}
          className={clsx(styles.content, names.content, portalThemeClassName)}
        >
          <div className={clsx(styles.menu, names.menu)}>
            <DatepickerRenderer />
          </div>
        </div>,
        document.body,
      )}
    </>
  );
});

export const FloatingDatePickerRenderer = ({
  className,
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) => {
  const { isOpen, setIsOpen, mode } = useDatePicker();
  const styles = datePickerStyles;
  const menuRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleInteraction = (e: MouseEvent | TouchEvent) => {
      const targetNode = e.target as Node;
      if (menuRef.current?.contains(targetNode) || containerRef.current?.contains(targetNode)) {
        return;
      }
      setIsOpen(false);
    };

    document.body.addEventListener("mousedown", handleInteraction);
    document.body.addEventListener("touchstart", handleInteraction);

    return () => {
      document.body.removeEventListener("mousedown", handleInteraction);
      document.body.removeEventListener("touchstart", handleInteraction);
    };
  }, [isOpen, setIsOpen]);

  const rootClass = clsx(styles.root, names.root, names.mode[mode], className);
  return (
    <>
      <div ref={containerRef} className={rootClass} style={style}>
        <FloatingDateInput />
        <FloatingDatePicker ref={menuRef} />
      </div>
      {styleRules(rootClass)}
    </>
  );
};
