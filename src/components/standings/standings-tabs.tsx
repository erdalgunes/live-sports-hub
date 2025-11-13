'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { StandingsTable } from './standings-table'

interface StandingsTabsProps {
  standings: any[]
}

export function StandingsTabs({ standings }: StandingsTabsProps) {
  return (
    <Tabs defaultValue="all" className="w-full">
      <div className="flex justify-center mb-6">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="home">Home</TabsTrigger>
          <TabsTrigger value="away">Away</TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="all" className="mt-0">
        <StandingsTable standings={standings} type="all" />
      </TabsContent>

      <TabsContent value="home" className="mt-0">
        <StandingsTable standings={standings} type="home" />
      </TabsContent>

      <TabsContent value="away" className="mt-0">
        <StandingsTable standings={standings} type="away" />
      </TabsContent>
    </Tabs>
  )
}
