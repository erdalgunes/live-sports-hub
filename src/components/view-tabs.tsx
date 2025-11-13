'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface ViewTabsProps {
  defaultValue: string
}

export function ViewTabs({ defaultValue }: ViewTabsProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const handleViewChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('view', value)
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <TabsList className="grid w-full grid-cols-2 mb-6">
      <TabsTrigger
        value="date"
        onClick={() => handleViewChange('date')}
      >
        By Date
      </TabsTrigger>
      <TabsTrigger
        value="round"
        onClick={() => handleViewChange('round')}
      >
        By Round
      </TabsTrigger>
    </TabsList>
  )
}
