import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export default function MatchDetailLoading() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div>
        <Skeleton className="mb-2 h-9 w-48" />
        <Skeleton className="h-5 w-64" />
      </div>

      {/* Match overview card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-5 w-24" />
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Teams and score */}
          <div className="flex items-center justify-between">
            <div className="flex flex-col items-center gap-2">
              <Skeleton className="h-16 w-16 rounded-full" />
              <Skeleton className="h-5 w-32" />
            </div>
            <div className="text-center">
              <Skeleton className="mx-auto h-12 w-24" />
              <Skeleton className="mx-auto mt-2 h-4 w-16" />
            </div>
            <div className="flex flex-col items-center gap-2">
              <Skeleton className="h-16 w-16 rounded-full" />
              <Skeleton className="h-5 w-32" />
            </div>
          </div>

          {/* Match info */}
          <div className="space-y-2 border-t pt-4">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-44" />
          </div>
        </CardContent>
      </Card>

      {/* Statistics card */}
      <Card>
        <CardHeader>
          <CardTitle>
            <Skeleton className="h-6 w-32" />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-12" />
              </div>
              <Skeleton className="h-2 w-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
