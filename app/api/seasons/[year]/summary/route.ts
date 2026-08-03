import { NextResponse } from 'next/server'
import { loadSeasonData } from '../../../../../lib/mockSeasonData'
import { loadSeasonDataFromCache } from '../../../../../lib/seasonCache'

export const dynamic = 'force-dynamic'

/**
 * GET /api/seasons/:year/summary
 *
 * Returns aggregated season data including driver standings, team standings,
 * and championship progression for the specified year.
 *
 * Prefers public/data/season-cache/{year}.json (deployable, ~100KB) so Vercel
 * does not depend on a stale REMOTE_DATA_URL / DB import, and does not parse
 * hundreds of MB of corner telemetry just to sum points.
 */
export async function GET(
  request: Request,
  context: { params?: { year?: string } }
) {
  try {
    const year = parseInt(context.params?.year ?? '', 10)
    
    if (isNaN(year) || year < 2024 || year > new Date().getFullYear()) {
      return NextResponse.json(
        { error: 'Invalid year. Must be between 2024 and current year.' },
        { status: 400 }
      )
    }

    const url = new URL(request.url)
    const forceLive =
      url.searchParams.get('fresh') === '1' ||
      url.searchParams.get('source') === 'live'

    const cached = forceLive ? null : await loadSeasonDataFromCache(year)
    const seasonData = cached ?? (await loadSeasonData(year))
    const fromCache = Boolean(cached)
    
    // Check if we have any data
    if (!seasonData || seasonData.rounds.length === 0) {
      return NextResponse.json(
        { 
          error: 'No data available',
          message: `No race results found for ${year}. See lib/mockSeasonData.ts for data structure.`,
          hint: 'Run `npm run build:data-caches` after fetching sessions, or populate RoundResult[] data.'
        },
        { status: 404 }
      )
    }
    
    return NextResponse.json(seasonData, {
      headers: {
        // Cache is content-addressed in git; allow short CDN/browser cache.
        'Cache-Control': fromCache
          ? 'public, s-maxage=300, stale-while-revalidate=3600'
          : 'no-store',
        'X-Season-Data-Source': fromCache ? 'cache' : 'live',
      },
    })
  } catch (error) {
    console.error('Error fetching season summary:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch season data',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
