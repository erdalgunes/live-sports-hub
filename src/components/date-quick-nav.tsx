'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { format, subDays, addDays } from 'date-fns'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface DateQuickNavProps {
  currentDate: Date
}

export function DateQuickNav({ currentDate }: DateQuickNavProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const handleDateChange = (newDate: Date) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('date', format(newDate, 'yyyy-MM-dd'))
    params.set('view', 'date')
    router.push(`${pathname}?${params.toString()}`)
  }

  const yesterday = subDays(currentDate, 1)
  const tomorrow = addDays(currentDate, 1)
  const today = new Date()
  const isToday = format(currentDate, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')

  return (
    <div className="flex items-center justify-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleDateChange(yesterday)}
        className="h-9"
      >
        <ChevronLeft className="mr-1 h-4 w-4" />
        {format(yesterday, 'MMM d')}
      </Button>

      {!isToday && (
        <Button variant="outline" size="sm" onClick={() => handleDateChange(today)} className="h-9">
          Today
        </Button>
      )}

      <Button
        variant="outline"
        size="sm"
        onClick={() => handleDateChange(tomorrow)}
        className="h-9"
      >
        {format(tomorrow, 'MMM d')}
        <ChevronRight className="ml-1 h-4 w-4" />
      </Button>
    </div>
  )
}
