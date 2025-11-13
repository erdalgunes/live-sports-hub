"use client"

import * as React from "react"
import { DayPicker } from "react-day-picker"
import { cn } from "@/lib/utils"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4 w-full",
        caption: "flex justify-center pt-1 relative items-center mb-4",
        caption_label: "text-base font-semibold",
        nav: "flex items-center justify-between w-full absolute left-0 right-0 px-1",
        nav_button: cn(
          "h-9 w-9 bg-transparent p-0 hover:bg-accent hover:text-accent-foreground rounded-md inline-flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        ),
        nav_button_previous: "relative",
        nav_button_next: "relative",
        table: "w-full border-collapse mt-1",
        head_row: "flex",
        head_cell:
          "text-muted-foreground rounded-md w-10 h-10 font-medium text-xs flex items-center justify-center",
        row: "flex w-full mt-0.5",
        cell: "h-10 w-10 text-center text-sm p-0 relative focus-within:relative focus-within:z-20",
        day: cn(
          "h-10 w-10 p-0 font-normal aria-selected:opacity-100 hover:bg-accent hover:text-accent-foreground rounded-lg transition-all"
        ),
        day_range_end: "day-range-end",
        day_selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground font-semibold",
        day_today: "bg-accent text-accent-foreground font-semibold border-2 border-primary",
        day_outside:
          "day-outside text-muted-foreground/40 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
        day_disabled: "text-muted-foreground/30 cursor-not-allowed",
        day_range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
