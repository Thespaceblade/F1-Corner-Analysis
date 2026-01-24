import { NextRequest, NextResponse } from 'next/server'
import { loadSeasonData } from '../../../../../lib/mockSeasonData'

/**
 * GET /api/seasons/:year/summary
 * 
 * Returns aggregated season data including driver standings, team standings,
 * and championship progression for the specified year.
 * 
 * Example: GET /api/seasons/2025/summary
 * 
 * TO INTEGRATE WITH YOUR DATA:
 * 1. Update lib/mockSeasonData.ts to load from your actual race results
 * 2. Ensure you have RoundResult data for each race in the season
 * 3. The aggregator will automatically calculate all statistics
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { year: string } }
) {
  try {
    const year = parseInt(params.year, 10)
    
    if (isNaN(year) || year < 2024 || year > new Date().getFullYear()) {
      return NextResponse.json(
        { error: 'Invalid year. Must be between 2024 and current year.' },
        { status: 400 }
      )
    }

    // Load season data (currently returns empty/mock data)
    // TODO: Implement in lib/mockSeasonData.ts to load your actual race results
    const seasonData = await loadSeasonData(year)
    
    // Check if we have any data
    if (!seasonData || seasonData.rounds.length === 0) {
      return NextResponse.json(
        { 
          error: 'No data available',
          message: `No race results found for ${year}. See lib/mockSeasonData.ts for data structure.`,
          hint: 'You need to populate RoundResult[] data from your race results database/files'
        },
        { status: 404 }
      )
    }
    
    return NextResponse.json(seasonData, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
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
