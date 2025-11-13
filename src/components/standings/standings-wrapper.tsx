'use client'

import { useEffect, useState } from 'react'
import { StandingsTabs } from './standings-tabs'
import {
  getCachedStandingsData,
  setCachedStandingsData,
  getTeamFormFromCache,
  type CachedFixture,
  type StandingsCacheData,
  type CachedTeamData,
} from '@/lib/utils/standings-cache'

interface StandingsWrapperProps {
  initialStandings: any[]
  leagueId: number
  season: number
}

export function StandingsWrapper({
  initialStandings,
  leagueId,
  season,
}: StandingsWrapperProps) {
  const [standings, setStandings] = useState(initialStandings)
  const [isEnhancing, setIsEnhancing] = useState(false)

  useEffect(() => {
    enhanceStandingsWithCache()
  }, [leagueId, season])

  async function enhanceStandingsWithCache() {
    setIsEnhancing(true)

    try {
      // Check cache first
      const cached = getCachedStandingsData(leagueId, season)

      if (cached) {
        // Use cached data to enhance standings
        const enhanced = initialStandings.map((team) => {
          const formData = getTeamFormFromCache(cached, team.team.id)
          return {
            ...team,
            form: formData.allForm || team.form || '',
            homeForm: formData.homeForm || '',
            awayForm: formData.awayForm || '',
          }
        })
        setStandings(enhanced)
        setIsEnhancing(false)
        return
      }

      // No cache - fetch fixtures for all teams
      await fetchAndCacheFixtures()
    } catch (error) {
      console.error('Error enhancing standings:', error)
      setIsEnhancing(false)
    }
  }

  async function fetchAndCacheFixtures() {
    const teams: CachedTeamData[] = []

    // Fetch fixtures for each team with rate limiting
    for (let i = 0; i < initialStandings.length; i++) {
      const team = initialStandings[i]

      try {
        // Add delay between requests to avoid rate limiting
        if (i > 0) {
          await new Promise((resolve) => setTimeout(resolve, 500))
        }

        const response = await fetch(
          `/api/fixtures/team/${team.team.id}?season=${season}&league=${leagueId}&last=10`
        )

        if (!response.ok) {
          console.error(`Failed to fetch fixtures for team ${team.team.id}`)
          continue
        }

        const data = await response.json()
        const fixtures: CachedFixture[] =
          data.response?.map((f: any) => ({
            fixtureId: f.fixture.id,
            date: f.fixture.date,
            homeTeamId: f.teams.home.id,
            awayTeamId: f.teams.away.id,
            homeGoals: f.goals.home,
            awayGoals: f.goals.away,
            status: f.fixture.status.short,
          })) || []

        teams.push({
          teamId: team.team.id,
          fixtures,
          timestamp: Date.now(),
        })

        // Update standings progressively as we fetch data
        const cacheData: StandingsCacheData = {
          leagueId,
          season,
          teams,
          timestamp: Date.now(),
        }

        const enhanced = initialStandings.map((t) => {
          const formData = getTeamFormFromCache(cacheData, t.team.id)
          return {
            ...t,
            form: formData.allForm || t.form || '',
            homeForm: formData.homeForm || '',
            awayForm: formData.awayForm || '',
          }
        })

        setStandings(enhanced)
      } catch (error) {
        console.error(`Error fetching fixtures for team ${team.team.id}:`, error)
      }
    }

    // Save to cache when done
    if (teams.length > 0) {
      const cacheData: StandingsCacheData = {
        leagueId,
        season,
        teams,
        timestamp: Date.now(),
      }
      setCachedStandingsData(cacheData)
    }

    setIsEnhancing(false)
  }

  return (
    <div>
      {isEnhancing && (
        <div className="mb-4 text-sm text-muted-foreground text-center">
          Loading form data...
        </div>
      )}
      <StandingsTabs standings={standings} />
    </div>
  )
}
