"use client";

import clsx from "clsx";
import type { ClassNames, DayPickerProps } from "react-day-picker";
import { calendarStyles, names } from "../calendar.styles";

// DayPicker's selection/flag class slots are empty: states live on the day part's attributes.
export const getDayPickerStyles = (styles: typeof calendarStyles): Partial<ClassNames> => ({
  root: clsx(styles.content, names.content),
  months: names.months,
  nav: clsx(styles.nav, names.nav),
  dropdowns: clsx(styles.dropdowns, names.dropdowns),
  month_caption: clsx(styles.monthCaption, names.monthCaption),
  caption_label: names.captionLabel,
  month_grid: clsx(styles.monthGrid, names.monthGrid),
  button_next: clsx(styles.buttonNext, names.buttonNext),
  button_previous: clsx(styles.buttonPrevious, names.buttonPrevious),
  weekdays: clsx(styles.weekdays, names.weekdays),
  weekday: clsx(styles.weekday, names.weekday),
  chevron: clsx(styles.chevron, names.chevron),
  month: clsx(styles.month, names.month),
  months_dropdown: clsx(styles.monthsDropdown, names.monthsDropdown),
  years_dropdown: clsx(styles.yearsDropdown, names.yearsDropdown),
  footer: clsx(styles.footer, names.footer),
  day_button: clsx(styles.dayButton, names.dayButton),
  day: clsx(styles.day, names.day),
  weeks: names.weeks,
  week: names.week,
  week_number: clsx(styles.weekNumber, names.weekNumber),
  week_number_header: clsx(styles.weekNumberHeader, names.weekNumberHeader),
  today: "",
  disabled: "",
  selected: "",
  range_start: "",
  range_middle: "",
  range_end: "",
  hidden: "",
  outside: "",
  focused: "",
});

/**
 * The classes of the DayPicker parts these props render, for server-rendered rules. The
 * codemod cannot see them: DayPicker puts each on its own element.
 */
export const renderedDayPickerClasses = (
  classes: Partial<ClassNames>,
  props: Pick<
    DayPickerProps,
    "captionLayout" | "footer" | "showWeekNumber" | "hideNavigation" | "hideWeekdays"
  >,
): Array<string | undefined> => {
  const dropdown = props.captionLayout?.startsWith("dropdown") ?? false;
  return [
    classes.root,
    classes.month,
    classes.month_caption,
    classes.month_grid,
    classes.day,
    classes.day_button,
    ...(props.hideNavigation
      ? []
      : [classes.nav, classes.button_previous, classes.button_next, classes.chevron]),
    ...(props.hideWeekdays ? [] : [classes.weekdays, classes.weekday]),
    ...(dropdown ? [classes.dropdowns, classes.chevron] : []),
    ...(props.captionLayout === "dropdown" || props.captionLayout === "dropdown-months"
      ? [classes.months_dropdown]
      : []),
    ...(props.captionLayout === "dropdown" || props.captionLayout === "dropdown-years"
      ? [classes.years_dropdown]
      : []),
    ...(props.footer ? [classes.footer] : []),
    ...(props.showWeekNumber ? [classes.week_number, classes.week_number_header] : []),
  ];
};
