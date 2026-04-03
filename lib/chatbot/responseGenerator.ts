/**
 * Response generation using deterministic insight builders.
 */

import type { ChatbotResponse, QueryResult, ClassifiedQuery } from './types'
import {
  generateComparisonInsights,
  generateCornerPerformanceInsights,
  generateDriverPerformanceInsights,
  formatInsightsAsBullets,
} from './insightGenerator'

export async function generateResponse(
  _query: string,
  classifiedQuery: ClassifiedQuery,
  queryResult: QueryResult,
  _context?: any
): Promise<ChatbotResponse> {
  const answer = generateConciseResponse(classifiedQuery, queryResult)
  const data = extractResponseData(queryResult, classifiedQuery)
  const followUpSuggestions = generateFollowUpSuggestions(
    classifiedQuery,
    queryResult
  )

  return {
    answer,
    data,
    sources: [`${queryResult.metadata.track} ${queryResult.metadata.year} ${queryResult.metadata.session || ''}`.trim()],
    followUpSuggestions,
    confidence: classifiedQuery.confidence,
  }
}

/**
 * Generate a concise, insight-focused response
 * Uses insight generator to create bullet-point responses instead of paragraphs
 */
function generateConciseResponse(
  classifiedQuery: ClassifiedQuery,
  queryResult: QueryResult
): string {
  const track = queryResult.metadata.track || ''
  const year = queryResult.metadata.year || new Date().getFullYear()
  const session = queryResult.metadata.session || 'Q'

  switch (queryResult.type) {
    case 'CORNER_PERFORMANCE': {
      const cornerData = queryResult.data as any[]
      if (cornerData.length === 0) {
        return `No corner performance data for corner ${classifiedQuery.parameters.cornerNumber} at ${track} ${year} ${session}`
      }

      const insights = generateCornerPerformanceInsights(cornerData)
      const header = `Corner ${classifiedQuery.parameters.cornerNumber} - ${track} ${session}`
      return formatInsightsAsBullets(insights, header)
    }

    case 'DRIVER_PERFORMANCE': {
      const stats = queryResult.data as any[]
      if (stats.length === 0) {
        return `No performance data for ${classifiedQuery.parameters.driverCode} at ${track} ${year} ${session}`
      }

      const insights = generateDriverPerformanceInsights(
        stats,
        classifiedQuery.parameters.driverCode || ''
      )
      const header = `${classifiedQuery.parameters.driverCode} - ${track} ${session}`
      return formatInsightsAsBullets(insights, header)
    }

    case 'COMPARISON': {
      const comparisonData = queryResult.data as any
      if (!comparisonData.deltas || comparisonData.deltas.length === 0) {
        const driver1 = classifiedQuery.parameters.driverCodes?.[0] || 'Driver 1'
        const driver2 = classifiedQuery.parameters.driverCodes?.[1] || 'Driver 2'
        return `No comparison data for ${driver1} vs ${driver2} at ${track} ${year} ${session}`
      }

      const driver1 = classifiedQuery.parameters.driverCodes?.[0] || 'Driver 1'
      const driver2 = classifiedQuery.parameters.driverCodes?.[1] || 'Driver 2'

      const insights = generateComparisonInsights(
        comparisonData,
        driver1,
        driver2
      )
      const header = `${driver1} vs ${driver2} - ${track} ${session}`
      return formatInsightsAsBullets(insights, header)
    }

    case 'SESSION_INFO': {
      const sessions = queryResult.data as any[]
      if (Array.isArray(sessions) && sessions.length > 0) {
        const sessionList = sessions.map((s) => s.session).join(', ')
        return `Available sessions for ${track} ${year}: ${sessionList}`
      }
      return `No session information for ${track} ${year}`
    }

    default:
      return `No data available for ${track || 'this track'}`
  }
}

function extractResponseData(
  queryResult: QueryResult,
  classifiedQuery: ClassifiedQuery
): ChatbotResponse['data'] {
  const data: ChatbotResponse['data'] = {
    track: queryResult.metadata.track,
    year: queryResult.metadata.year,
    session: queryResult.metadata.session,
  }

  if (classifiedQuery.parameters.cornerNumber) {
    data.cornerNumber = classifiedQuery.parameters.cornerNumber
  }

  if (classifiedQuery.parameters.driverCode) {
    data.driverCode = classifiedQuery.parameters.driverCode
  }

  if (classifiedQuery.parameters.driverCodes) {
    data.driverCodes = classifiedQuery.parameters.driverCodes
  }

  // Extract metrics from query result data
  if (queryResult.type === 'CORNER_PERFORMANCE' && Array.isArray(queryResult.data)) {
    const cornerData = queryResult.data as any[]
    if (cornerData.length > 0) {
      const bestCorner = cornerData.reduce((best, current) => {
        if (!best.cornerTime) return current
        if (!current.cornerTime) return best
        return current.cornerTime < best.cornerTime ? current : best
      })

      data.metrics = {
        cornerTime: bestCorner.cornerTime || undefined,
        speeds: {
          entry: bestCorner.entrySpeed,
          apex: bestCorner.apexSpeed,
          exit: bestCorner.exitSpeed,
        },
        best: bestCorner.cornerTime || undefined,
      }
    }
  }

  if (queryResult.type === 'DRIVER_PERFORMANCE' && Array.isArray(queryResult.data)) {
    const stats = queryResult.data as any[]
    if (stats.length > 0) {
      const avgTime = stats
        .map((s) => s.avgTime)
        .filter((t): t is number => t !== null)
      if (avgTime.length > 0) {
        data.metrics = {
          average: avgTime.reduce((a: number, b: number) => a + b, 0) / avgTime.length,
          best: Math.min(...avgTime),
        }
      }
    }
  }

  if (queryResult.type === 'COMPARISON' && queryResult.data) {
    const comparisonData = queryResult.data as any
    if (comparisonData.deltas && comparisonData.deltas.length > 0) {
      const avgDelta = comparisonData.deltas
        .map((d: any) => d.timeDelta)
        .filter((d: number | null): d is number => d !== null)
      if (avgDelta.length > 0) {
        data.metrics = {
          delta: avgDelta.reduce((a: number, b: number) => a + b, 0) / avgDelta.length,
        }
      }
    }
  }

  return data
}

function generateFollowUpSuggestions(
  classifiedQuery: ClassifiedQuery,
  _queryResult: QueryResult
): string[] {
  const suggestions: string[] = []

  if (classifiedQuery.intent === 'CORNER_PERFORMANCE') {
    if (classifiedQuery.parameters.cornerNumber) {
      suggestions.push(
        `Compare drivers at corner ${classifiedQuery.parameters.cornerNumber}`
      )
      suggestions.push(
        `Show me all corner times for corner ${classifiedQuery.parameters.cornerNumber}`
      )
    }
  }

  if (classifiedQuery.intent === 'DRIVER_PERFORMANCE') {
    if (classifiedQuery.parameters.driverCode) {
      suggestions.push(
        `Which corner is ${classifiedQuery.parameters.driverCode} strongest at?`
      )
      suggestions.push(
        `Compare ${classifiedQuery.parameters.driverCode} to another driver`
      )
    }
  }

  if (classifiedQuery.intent === 'COMPARISON') {
    suggestions.push('Compare these drivers at a different corner')
    suggestions.push('Show me overall corner performance comparison')
  }

  return suggestions.slice(0, 3) // Limit to 3 suggestions
}
