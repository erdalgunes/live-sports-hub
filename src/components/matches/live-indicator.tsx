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

  return (
    <Badge variant="destructive" className="gap-1 animate-pulse">
      <Activity className="h-3 w-3" />
      {status === 'HT' ? 'HT' : `${elapsed}'`}
    </Badge>
  )
}
