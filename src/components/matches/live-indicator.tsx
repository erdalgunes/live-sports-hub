'use client'

import { Badge } from '@/components/ui/badge'
import { isLive } from '@/types/api-football'
import { Activity } from 'lucide-react'

interface LiveIndicatorProps {
  status: string
  elapsed?: number | null
}

export function LiveIndicator({ status, elapsed }: LiveIndicatorProps) {
  if (!isLive(status)) return null

  const getStatusText = () => {
    if (status === 'HT') return 'Half Time'
    return `${elapsed} minutes`
  }

  return (
    <Badge
      variant="destructive"
      className="gap-1 animate-pulse"
      aria-live="assertive"
      aria-atomic="true"
      role="status"
    >
      <Activity className="h-3 w-3" aria-hidden="true" />
      <span className="sr-only">{getStatusText()}</span>
      <span aria-hidden="true">{status === 'HT' ? 'HT' : `${elapsed}'`}</span>
    </Badge>
  )
}
