'use client'

import * as React from 'react'
import { DayPicker } from 'react-day-picker'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({ className, classNames, showOutsideDays = true, ...props }: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn('p-3', className)}
      classNames={{
        months: 'flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0',
        month: 'space-y-4 w-full',
        month_caption: 'flex justify-center pt-1 relative items-center mb-4 h-10',
        caption_label: 'text-base font-semibold',
        nav: 'flex items-center justify-between w-full absolute left-0 right-0 top-0 px-1 h-10',
        button_previous: cn(
          'h-9 w-9 bg-transparent p-0 hover:bg-accent hover:text-accent-foreground rounded-md inline-flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed transition-all'
        ),
        button_next: cn(
          'h-9 w-9 bg-transparent p-0 hover:bg-accent hover:text-accent-foreground rounded-md inline-flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed transition-all'
        ),
        month_grid: 'w-full border-collapse mt-2',
        weekdays: 'flex',
        weekday:
          'text-muted-foreground rounded-md w-10 h-10 font-medium text-xs flex items-center justify-center',
        week: 'flex w-full mt-0.5',
        day: 'h-10 w-10 text-center text-sm p-0 relative focus-within:relative focus-within:z-20',
        day_button: cn(
          'h-10 w-10 p-0 font-normal aria-selected:opacity-100 hover:bg-accent hover:text-accent-foreground rounded-lg transition-all inline-flex items-center justify-center w-full'
        ),
        range_end: 'day-range-end',
        selected:
          'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground font-semibold',
        today: 'bg-accent text-accent-foreground font-semibold border-2 border-primary',
        outside:
          'day-outside text-muted-foreground/40 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30',
        disabled: 'text-muted-foreground/30 cursor-not-allowed',
        range_middle: 'aria-selected:bg-accent aria-selected:text-accent-foreground',
        hidden: 'invisible',
        ...classNames,
      }}
      components={{
        Chevron: (props: {
          className?: string
          size?: number
          disabled?: boolean
          orientation?: 'left' | 'right' | 'up' | 'down'
        }) => {
          if (props.orientation === 'left') {
            return <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          }
          return <ChevronRight className="h-4 w-4" aria-hidden="true" />
        },
      }}
      {...props}
    />
  )
}
Calendar.displayName = 'Calendar'

export { Calendar }
