/**
 * Query classification using Gemini API
 */

import { GoogleGenerativeAI } from '@google/generative-ai'
import {
  ClassifiedQuery,
  QueryIntent,
  QueryParameters,
  ConversationContext,
} from './types'
import { buildClassificationPrompt } from './prompts'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

export async function classifyQuery(
  query: string,
  context?: ConversationContext
): Promise<ClassifiedQuery> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY environment variable is not set')
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
    const prompt = buildClassificationPrompt(query, context)

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    // Parse JSON response from Gemini
    const parsed = parseIntentResponse(text)

    return {
      intent: parsed.intent,
      parameters: parsed.parameters,
      confidence: parsed.confidence || 0.8,
      rawQuery: query,
    }
  } catch (error) {
    console.error('Error classifying query:', error)
    // Fallback to basic classification
    return fallbackClassification(query, context)
  }
}

function parseIntentResponse(text: string): {
  intent: QueryIntent
  parameters: QueryParameters
  confidence: number
} {
  try {
    // Try to extract JSON from the response
    // Gemini might wrap JSON in markdown code blocks
    const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || 
                     text.match(/```\s*([\s\S]*?)\s*```/) ||
                     text.match(/\{[\s\S]*\}/)

    if (jsonMatch) {
      const jsonStr = jsonMatch[1] || jsonMatch[0]
      const parsed = JSON.parse(jsonStr)
      return {
        intent: parsed.intent || 'GENERAL',
        parameters: parsed.parameters || {},
        confidence: parsed.confidence || 0.8,
      }
    }

    // If no JSON found, try to parse the whole text as JSON
    const parsed = JSON.parse(text)
    return {
      intent: parsed.intent || 'GENERAL',
      parameters: parsed.parameters || {},
      confidence: parsed.confidence || 0.8,
    }
  } catch (error) {
    console.error('Error parsing intent response:', error)
    // Return default
    return {
      intent: 'GENERAL',
      parameters: {},
      confidence: 0.5,
    }
  }
}

function fallbackClassification(
  query: string,
  context?: ConversationContext
): ClassifiedQuery {
  const lowerQuery = query.toLowerCase()

  // Simple keyword-based classification
  let intent: QueryIntent = 'GENERAL'
  const parameters: QueryParameters = {}

  // Extract track/year/session from context
  if (context?.lastTrack) parameters.track = context.lastTrack
  if (context?.lastYear) parameters.year = context.lastYear
  if (context?.lastSession) parameters.session = context.lastSession
  if (context?.lastDriver) parameters.driverCode = context.lastDriver
  if (context?.lastCorner) parameters.cornerNumber = context.lastCorner

  // Corner performance patterns
  if (
    lowerQuery.includes('corner') ||
    lowerQuery.includes('turn') ||
    /\b(corner|turn)\s+\d+/.test(lowerQuery)
  ) {
    intent = 'CORNER_PERFORMANCE'
    const cornerMatch = lowerQuery.match(/\b(corner|turn)\s+(\d+)/i)
    if (cornerMatch) {
      parameters.cornerNumber = parseInt(cornerMatch[2], 10)
    }
  }

  // Driver performance patterns
  if (
    lowerQuery.includes('strongest') ||
    lowerQuery.includes('weakest') ||
    lowerQuery.includes('best corner') ||
    lowerQuery.includes('worst corner')
  ) {
    intent = 'DRIVER_PERFORMANCE'
  }

  // Comparison patterns
  if (
    lowerQuery.includes('compare') ||
    lowerQuery.includes('vs') ||
    lowerQuery.includes('versus') ||
    lowerQuery.includes('difference')
  ) {
    intent = 'COMPARISON'
  }

  // Statistical patterns
  if (
    lowerQuery.includes('average') ||
    lowerQuery.includes('mean') ||
    lowerQuery.includes('statistics') ||
    lowerQuery.includes('statistical')
  ) {
    intent = 'STATISTICAL'
  }

  // Session info patterns
  if (
    lowerQuery.includes('session') ||
    lowerQuery.includes('available') ||
    lowerQuery.includes('what tracks') ||
    lowerQuery.includes('what drivers')
  ) {
    intent = 'SESSION_INFO'
  }

  // Extract driver codes (3-letter codes)
  const driverCodeMatch = lowerQuery.match(/\b([A-Z]{3})\b/)
  if (driverCodeMatch) {
    parameters.driverCode = driverCodeMatch[1]
  }

  // Extract year
  const yearMatch = lowerQuery.match(/\b(20\d{2})\b/)
  if (yearMatch) {
    parameters.year = parseInt(yearMatch[1], 10)
  }

  // Extract track names (common F1 tracks)
  const trackNames: Record<string, string> = {
    monaco: 'monaco',
    silverstone: 'silverstone',
    spa: 'spa',
    monza: 'monza',
    brazil: 'brazil',
    australia: 'australia',
    bahrain: 'bahrain',
    china: 'china',
    spain: 'spain',
    canada: 'canada',
    austria: 'austria',
    hungary: 'hungary',
    belgium: 'spa',
    italy: 'monza',
  }

  for (const [key, value] of Object.entries(trackNames)) {
    if (lowerQuery.includes(key)) {
      parameters.track = value
      break
    }
  }

  // Extract session codes
  if (lowerQuery.includes('qualifying') || lowerQuery.includes(' q ')) {
    parameters.session = 'Q'
  } else if (lowerQuery.includes('race') || lowerQuery.includes(' r ')) {
    parameters.session = 'R'
  } else if (lowerQuery.includes('fp1')) {
    parameters.session = 'FP1'
  } else if (lowerQuery.includes('fp2')) {
    parameters.session = 'FP2'
  } else if (lowerQuery.includes('fp3')) {
    parameters.session = 'FP3'
  }

  return {
    intent,
    parameters,
    confidence: 0.7,
    rawQuery: query,
  }
}

