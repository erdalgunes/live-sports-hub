'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { format, startOfMonth } from 'date-fns'
import { Calendar as CalendarIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

interface DatePickerProps {
  defaultDate?: Date
  season?: number
}

export function DatePicker({ defaultDate = new Date(), season }: DatePickerProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const dateParam = searchParams.get('date')
  const [date, setDate] = useState<Date | undefined>(
    dateParam ? new Date(dateParam) : defaultDate
  )
  const [matchDays, setMatchDays] = useState<Date[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [currentMonth, setCurrentMonth] = useState<Date>(date || defaultDate)

  // Sync state with URL changes from other components
  useEffect(() => {
    const newDate = dateParam ? new Date(dateParam) : defaultDate
    setDate(newDate)
  }, [dateParam, defaultDate])

  // Fetch match days when calendar opens or month changes
  useEffect(() => {
    if (!isOpen || !season) return

    const fetchMatchDays = async () => {
      try {
        const start = startOfMonth(currentMonth)

        // Fetch fixtures for the month
        const response = await fetch(
          `/api/fixtures/month?year=${start.getFullYear()}&month=${start.getMonth() + 1}&season=${season}`
        )

        if (response.ok) {
          const data = await response.json()
          const daysWithMatches = data.dates.map((d: string) => new Date(d))
          setMatchDays(daysWithMatches)
        }
      } catch (error) {
        console.error('Error fetching match days:', error)
      }
    }

    fetchMatchDays()
  }, [isOpen, currentMonth, season])

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      setDate(selectedDate)
      const params = new URLSearchParams(searchParams.toString())
      params.set('date', format(selectedDate, 'yyyy-MM-dd'))
      params.set('view', 'date')
      router.push(`${pathname}?${params.toString()}`)
    }
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'w-[240px] justify-start text-left font-normal',
            !date && 'text-muted-foreground'
          )}
          aria-label={date ? `Change date. Currently selected: ${format(date, 'PPPP')}` : 'Choose date'}
          aria-haspopup="dialog"
          aria-expanded={isOpen}
        >
          <CalendarIcon className="mr-2 h-4 w-4" aria-hidden="true" />
          {date ? format(date, 'PPP') : <span>Pick a date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto p-0"
        align="start"
        aria-label="Choose date"
      >
        <style jsx global>{`
          /* Days with matches styling */
          .rdp-day_button.has-matches {
            position: relative;
            font-weight: 600;
          }

          /* Match indicator dot */
          .rdp-day_button.has-matches::after {
            content: '';
            position: absolute;
            bottom: 3px;
            left: 50%;
            transform: translateX(-50%);
            width: 4px;
            height: 4px;
            border-radius: 50%;
            background-color: hsl(var(--primary));
            transition: all 0.2s ease;
          }

          /* Hover state for match indicator */
          .rdp-day_button.has-matches:hover::after {
            width: 5px;
            height: 5px;
            bottom: 2px;
          }

          /* Selected day with matches */
          .rdp-day_button.has-matches[aria-selected="true"]::after {
            background-color: hsl(var(--primary-foreground));
          }

          /* Today with matches */
          .rdp-today .rdp-day_button.has-matches::after {
            background-color: hsl(var(--primary));
          }
        `}</style>
        <div>
          <output className="sr-only" aria-live="polite">
            Use arrow keys to navigate dates. Press Enter to select. Days with matches are indicated.
          </output>
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleDateSelect}
            onMonthChange={setCurrentMonth}
            month={currentMonth}
            modifiers={{
              hasMatches: matchDays
            }}
            modifiersClassNames={{
              hasMatches: 'has-matches'
            }}
            labels={{
              labelPrevious: (month) => `Go to previous month`,
              labelNext: (month) => `Go to next month`,
            }}
            initialFocus
          />
          {matchDays.length > 0 && (
            <div className="px-3 pb-3 pt-0">
              <p className="text-xs text-muted-foreground">
                <span className="inline-block w-2 h-2 rounded-full bg-primary mr-1.5 align-middle" aria-hidden="true"></span>
                {' '}
                Days with scheduled matches
              </p>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
