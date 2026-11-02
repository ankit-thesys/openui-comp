"use client";

import clsx from "clsx";
import { forwardRef } from "react";
import type { RootProps } from "react-day-picker";
import { styleRules } from "../../../../styles/css";
import { Calendar } from "../../../Calendar";
import { CalendarDefaultsContext } from "../../../Calendar/CalendarDefaultsContext";
import { datePickerCalendarStyles, datePickerStyles, names } from "../../datePicker.styles";
import { useDatePicker } from "../context/DatePickerContext";

const CalendarRoot = ({ rootRef, className, ...props }: RootProps) => {
  const styles = datePickerCalendarStyles;
  const contentClass = clsx(className, styles.content, names.calendarContent);
  return (
    <>
      <div {...props} ref={rootRef} className={contentClass} />
      {styleRules(contentClass)}
    </>
  );
};

const DatepickerRenderer = forwardRef<
  HTMLDivElement,
  { className?: string; style?: React.CSSProperties }
>(({ className, style }, ref) => {
  const styles = datePickerStyles;
  const { selectedDate, selectedRange, mode, setSelectedDate, setSelectedRange } = useDatePicker();
  const calendarClass = clsx(styles.calendar, names.calendar, className);
  return (
    <>
      <div ref={ref} className={calendarClass} style={style}>
        <CalendarDefaultsContext.Provider value={true}>
          {mode === "single" ? (
            <Calendar
              components={{ Root: CalendarRoot }}
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              startMonth={new Date(1900, 0)}
              endMonth={new Date(2100, 11)}
            />
          ) : (
            <Calendar
              components={{ Root: CalendarRoot }}
              mode="range"
              selected={selectedRange}
              onSelect={setSelectedRange}
              startMonth={new Date(1900, 0)}
              endMonth={new Date(2100, 11)}
            />
          )}
        </CalendarDefaultsContext.Provider>
      </div>
      {styleRules(calendarClass)}
    </>
  );
});
export { DatepickerRenderer };
