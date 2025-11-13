import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export default function StandingsLoading() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div>
        <Skeleton className="mb-2 h-9 w-72" />
        <Skeleton className="h-5 w-96" />
      </div>

      {/* Tabs skeleton */}
      <Skeleton className="h-10 w-80" />

      {/* Table skeleton */}
      <Card>
        <CardHeader>
          <div className="grid grid-cols-12 gap-4 text-sm font-semibold">
            <Skeleton className="col-span-1 h-4 w-8" />
            <Skeleton className="col-span-4 h-4 w-24" />
            <Skeleton className="col-span-1 h-4 w-8" />
            <Skeleton className="col-span-1 h-4 w-8" />
            <Skeleton className="col-span-1 h-4 w-8" />
            <Skeleton className="col-span-1 h-4 w-8" />
            <Skeleton className="col-span-1 h-4 w-8" />
            <Skeleton className="col-span-2 h-4 w-16" />
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20].map((i) => (
            <div key={i} className="grid grid-cols-12 gap-4 border-t py-3">
              <Skeleton className="col-span-1 h-5 w-8" />
              <div className="col-span-4 flex items-center gap-2">
                <Skeleton className="h-6 w-6 rounded-full" />
                <Skeleton className="h-4 w-32" />
              </div>
              <Skeleton className="col-span-1 h-4 w-8" />
              <Skeleton className="col-span-1 h-4 w-8" />
              <Skeleton className="col-span-1 h-4 w-8" />
              <Skeleton className="col-span-1 h-4 w-8" />
              <Skeleton className="col-span-1 h-4 w-8" />
              <Skeleton className="col-span-2 h-4 w-16" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
