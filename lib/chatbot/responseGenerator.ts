/**
 * Response generation using Gemini API
 */

import { GoogleGenerativeAI } from '@google/generative-ai'
import { buildResponsePrompt } from './prompts'
import type { ChatbotResponse, QueryResult, ClassifiedQuery } from './types'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

export async function generateResponse(
  query: string,
  classifiedQuery: ClassifiedQuery,
  queryResult: QueryResult,
  context?: any
): Promise<ChatbotResponse> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY environment variable is not set')
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })
    const prompt = buildResponsePrompt(
      query,
      classifiedQuery.intent,
      classifiedQuery.parameters,
      queryResult.data
    )

    const result = await model.generateContent(prompt)
    const response = await result.response
    const answer = response.text()

    // Extract structured data from query result
    const data = extractResponseData(queryResult, classifiedQuery)

    // Generate follow-up suggestions
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
  } catch (error) {
    console.error('Error generating response:', error)
    const errorMessage = error instanceof Error ? error.message : String(error)
    
    // If Gemini API fails, provide a fallback response based on the data
    console.warn('Gemini API failed, using fallback response generation')
    return generateFallbackResponse(query, classifiedQuery, queryResult, errorMessage)
  }
}

/**
 * Generate a fallback response when Gemini API fails
 */
function generateFallbackResponse(
  query: string,
  classifiedQuery: ClassifiedQuery,
  queryResult: QueryResult,
  errorMessage: string
): ChatbotResponse {
  let answer = ''
  const data = extractResponseData(queryResult, classifiedQuery)

  switch (queryResult.type) {
    case 'CORNER_PERFORMANCE': {
      const cornerData = queryResult.data as any[]
      if (cornerData.length === 0) {
        answer = `I don't have corner performance data for corner ${classifiedQuery.parameters.cornerNumber} at ${queryResult.metadata.track} ${queryResult.metadata.year} ${queryResult.metadata.session || ''}. The corner data may not be available for this session.`
      } else {
        // Find the fastest corner time
        const fastest = cornerData.reduce((best, current) => {
          if (!best.cornerTime) return current
          if (!current.cornerTime) return best
          return current.cornerTime < best.cornerTime ? current : best
        })

        answer = `The fastest driver at corner ${classifiedQuery.parameters.cornerNumber} at ${queryResult.metadata.track} ${queryResult.metadata.year} ${queryResult.metadata.session || ''} was ${fastest.driverCode} with a time of ${fastest.cornerTime?.toFixed(3)}s. `
        if (fastest.apexSpeed) {
          answer += `They averaged ${fastest.apexSpeed.toFixed(0)} km/h through the corner.`
        }
      }
      break
    }

    case 'DRIVER_PERFORMANCE': {
      const stats = queryResult.data as any[]
      if (stats.length === 0) {
        answer = `I don't have performance data for ${classifiedQuery.parameters.driverCode} at ${queryResult.metadata.track} ${queryResult.metadata.year} ${queryResult.metadata.session || ''}.`
      } else {
        const avgTime = stats
          .map((s) => s.avgTime)
          .filter((t): t is number => t !== null)
        if (avgTime.length > 0) {
          const overallAvg = avgTime.reduce((a, b) => a + b, 0) / avgTime.length
          answer = `${classifiedQuery.parameters.driverCode}'s average corner time at ${queryResult.metadata.track} ${queryResult.metadata.year} ${queryResult.metadata.session || ''} was ${overallAvg.toFixed(3)}s across ${stats.length} corners.`
        } else {
          answer = `I have performance data for ${classifiedQuery.parameters.driverCode} at ${queryResult.metadata.track}, but corner times are not available.`
        }
      }
      break
    }

    case 'COMPARISON': {
      const comparisonData = queryResult.data as any
      if (comparisonData.deltas && comparisonData.deltas.length > 0) {
        const avgDelta = comparisonData.deltas
          .map((d: any) => d.timeDelta)
          .filter((d: number | null): d is number => d !== null)
        if (avgDelta.length > 0) {
          const overallDelta = avgDelta.reduce((a, b) => a + b, 0) / avgDelta.length
          const driver1 = classifiedQuery.parameters.driverCodes?.[0] || 'Driver 1'
          const driver2 = classifiedQuery.parameters.driverCodes?.[1] || 'Driver 2'
          if (overallDelta > 0) {
            answer = `${driver2} was faster than ${driver1} by an average of ${Math.abs(overallDelta).toFixed(3)}s per corner at ${queryResult.metadata.track} ${queryResult.metadata.year} ${queryResult.metadata.session || ''}.`
          } else {
            answer = `${driver1} was faster than ${driver2} by an average of ${Math.abs(overallDelta).toFixed(3)}s per corner at ${queryResult.metadata.track} ${queryResult.metadata.year} ${queryResult.metadata.session || ''}.`
          }
        } else {
          answer = `I have comparison data for ${classifiedQuery.parameters.driverCodes?.[0]} and ${classifiedQuery.parameters.driverCodes?.[1]} at ${queryResult.metadata.track}, but corner time data is not available.`
        }
      } else {
        answer = `I don't have comparison data for ${classifiedQuery.parameters.driverCodes?.[0]} and ${classifiedQuery.parameters.driverCodes?.[1]} at ${queryResult.metadata.track} ${queryResult.metadata.year} ${queryResult.metadata.session || ''}.`
      }
      break
    }

    case 'SESSION_INFO': {
      const sessions = queryResult.data as any[]
      if (Array.isArray(sessions) && sessions.length > 0) {
        const sessionList = sessions.map((s) => s.session).join(', ')
        answer = `Available sessions for ${queryResult.metadata.track} ${queryResult.metadata.year}: ${sessionList}`
      } else {
        answer = `I don't have session information for ${queryResult.metadata.track} ${queryResult.metadata.year}.`
      }
      break
    }

    default:
      answer = `I processed your query about ${queryResult.metadata.track || 'the track'} but encountered an issue generating a detailed response. The data is available, but I couldn't format it properly.`
  }

  return {
    answer,
    data,
    sources: [`${queryResult.metadata.track} ${queryResult.metadata.year} ${queryResult.metadata.session || ''}`.trim()],
    followUpSuggestions: generateFollowUpSuggestions(classifiedQuery, queryResult),
    confidence: classifiedQuery.confidence || 0.7,
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
  queryResult: QueryResult
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

