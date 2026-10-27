import clsx from "clsx";
import { css } from "goober";
import React, { forwardRef, useRef } from "react";
import { DayPicker } from "react-day-picker";
import { useLayoutContext } from "../../context/LayoutContext";
import { useMultipleRefs } from "../../hooks/useMultipleRefs";
import { calendarStyles } from "./calendar.styles";
import { MonthsDropdown, YearsDropdown } from "./components/helperComponents";
import { getDayPickerStyles } from "./utils/styles";
const stylesheetScope = css`
  :where(&:root) {
    .openui-calendar-container-root {
      ${calendarStyles}
    }
  }
`;

if (typeof document !== "undefined") {
  document.documentElement.classList.add(stylesheetScope);
}

const componentClass = "openui-calendar-container-root";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

export const Calendar = forwardRef<HTMLDivElement, CalendarProps>(
  ({ className, classNames, ...props }, ref) => {
    const { layout } = useLayoutContext();
    const { DateSingleClasses, DateRangeClasses } = getDayPickerStyles(layout);
    const containerRef = useRef<HTMLDivElement>(null);
    const assignRef = useMultipleRefs(ref, containerRef);

    const commonProps = {
      captionLayout: "dropdown" as const,
      components: {
        MonthsDropdown: (props: any) => (
          <MonthsDropdown {...props} container={containerRef.current} />
        ),
        YearsDropdown: (props: any) => (
          <YearsDropdown {...props} container={containerRef.current} />
        ),
      },
    };

    return (
      <div ref={assignRef} className={clsx(componentClass, "openui-calendar-container", className)}>
        <DayPicker
          {...commonProps}
          {...props}
          classNames={{
            ...(props.mode === "single" || props.mode === "multiple"
              ? DateSingleClasses
              : DateRangeClasses),
            ...classNames,
          }}
        />
      </div>
    );
  },
);
