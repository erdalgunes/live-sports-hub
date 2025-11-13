import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export default function MatchDetailLoading() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <Skeleton className="h-10 w-64" />
        </CardHeader>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex flex-col items-center gap-3 flex-1">
              <Skeleton className="h-20 w-20 rounded-full" />
              <Skeleton className="h-6 w-32" />
            </div>
            <Skeleton className="h-12 w-24" />
            <div className="flex flex-col items-center gap-3 flex-1">
              <Skeleton className="h-20 w-20 rounded-full" />
              <Skeleton className="h-6 w-32" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
