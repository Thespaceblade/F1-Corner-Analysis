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
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })
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

  // Extract track/year/session from context (use context as defaults only if not in query)
  // Note: We'll apply context after extracting from query, so context is used as fallback

  // Corner performance patterns - extract corner number
  // Handle patterns like "corner 1", "turn 2", "fastest corner 1", etc.
  const cornerMatch = lowerQuery.match(/\b(corner|turn)\s+(\d+)/i) || 
                     lowerQuery.match(/(\d+)\s+(?:st|nd|rd|th)?\s*(?:corner|turn)/i) ||
                     lowerQuery.match(/(?:fastest|slowest|best|worst)\s+(?:at\s+)?(?:corner|turn)\s+(\d+)/i)
  
  if (cornerMatch) {
    // Extract the number from the match (could be in different positions)
    const cornerNum = cornerMatch[2] || cornerMatch[1]
    if (cornerNum) {
      parameters.cornerNumber = parseInt(cornerNum, 10)
      if (!intent || intent === 'GENERAL') {
        intent = 'CORNER_PERFORMANCE'
      }
    }
  }
  
  // Also check for corner mentions and "fastest"/"slowest" patterns
  if (
    lowerQuery.includes('corner') ||
    lowerQuery.includes('turn') ||
    lowerQuery.includes('fastest') ||
    lowerQuery.includes('slowest') ||
    parameters.cornerNumber !== undefined
  ) {
    if (!intent || intent === 'GENERAL') {
      intent = 'CORNER_PERFORMANCE'
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

  // Comparison patterns - check before driver extraction to set intent correctly
  if (
    lowerQuery.includes('compare') ||
    lowerQuery.includes('vs') ||
    lowerQuery.includes('versus') ||
    lowerQuery.includes('difference') ||
    lowerQuery.includes('between') ||
    (lowerQuery.includes('and') && (lowerQuery.includes('ver') || lowerQuery.includes('ham') || lowerQuery.includes('nor') || lowerQuery.includes('lec')))
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
    lowerQuery.includes('what drivers') ||
    lowerQuery.includes('can you see') ||
    lowerQuery.includes('do you have') ||
    lowerQuery.includes('show me') && (lowerQuery.includes('track') || lowerQuery.includes('session'))
  ) {
    intent = 'SESSION_INFO'
  }

  // Extract driver codes (3-letter codes) and full names
  const driverNames: Record<string, string> = {
    verstappen: 'VER',
    ver: 'VER',
    max: 'VER',
    hamilton: 'HAM',
    ham: 'HAM',
    lewis: 'HAM',
    norris: 'NOR',
    nor: 'NOR',
    lando: 'NOR',
    leclerc: 'LEC',
    lec: 'LEC',
    charles: 'LEC',
    sainz: 'SAI',
    sai: 'SAI',
    carlos: 'SAI',
    perez: 'PER',
    per: 'PER',
    sergio: 'PER',
    alonso: 'ALO',
    alo: 'ALO',
    fernando: 'ALO',
    russell: 'RUS',
    rus: 'RUS',
    george: 'RUS',
    ocon: 'OCO',
    oco: 'OCO',
    esteban: 'OCO',
    stroll: 'STR',
    str: 'STR',
    lance: 'STR',
    gasly: 'GAS',
    gas: 'GAS',
    pierre: 'GAS',
    albon: 'ALB',
    alb: 'ALB',
    alexander: 'ALB',
    tsunoda: 'TSU',
    tsu: 'TSU',
    yuki: 'TSU',
    bottas: 'BOT',
    bot: 'BOT',
    valtteri: 'BOT',
    zhou: 'ZHO',
    zho: 'ZHO',
    guanyu: 'ZHO',
    magnussen: 'MAG',
    mag: 'MAG',
    kevin: 'MAG',
    hulkenberg: 'HUL',
    hul: 'HUL',
    nico: 'HUL',
    piastri: 'PIA',
    pia: 'PIA',
    oscar: 'PIA',
  }

  // Extract driver codes from full names and codes
  const foundDrivers: string[] = []
  for (const [name, code] of Object.entries(driverNames)) {
    if (lowerQuery.includes(name)) {
      if (!foundDrivers.includes(code)) {
        foundDrivers.push(code)
      }
    }
  }

  // Also extract 3-letter codes directly
  const driverCodeMatches = query.match(/\b([A-Z]{3})\b/g)
  if (driverCodeMatches) {
    for (const code of driverCodeMatches) {
      if (!foundDrivers.includes(code)) {
        foundDrivers.push(code)
      }
    }
  }

  // Set driver codes for comparison or single driver queries
  if (foundDrivers.length > 0) {
    if (intent === 'COMPARISON' && foundDrivers.length >= 2) {
      parameters.driverCodes = foundDrivers.slice(0, 2)
    } else if (foundDrivers.length === 1) {
      parameters.driverCode = foundDrivers[0]
    } else if (foundDrivers.length >= 2) {
      // If multiple drivers found but not explicitly comparison, treat as comparison
      intent = 'COMPARISON'
      parameters.driverCodes = foundDrivers.slice(0, 2)
    }
  }

  // Extract year
  const yearMatch = lowerQuery.match(/\b(20\d{2})\b/)
  if (yearMatch) {
    parameters.year = parseInt(yearMatch[1], 10)
  }

  // Extract track names (common F1 tracks) - handle variations
  const trackNames: Record<string, string> = {
    monaco: 'monaco',
    silverstone: 'silverstone',
    spa: 'spa',
    monza: 'monza',
    brazil: 'brazil',
    brazilian: 'brazil',
    australia: 'australia',
    australian: 'australia',
    bahrain: 'bahrain',
    china: 'china',
    chinese: 'china',
    spain: 'spain',
    spanish: 'spain',
    canada: 'canada',
    canadian: 'canada',
    austria: 'austria',
    austrian: 'austria',
    hungary: 'hungary',
    hungarian: 'hungary',
    belgium: 'spa',
    belgian: 'spa',
    italy: 'monza',
    italian: 'monza',
    japan: 'japan',
    japanese: 'japan',
    singapore: 'singapore',
    mexico: 'mexico',
    mexican: 'mexico',
    abu: 'abu-dhabi',
    'abu dhabi': 'abu-dhabi',
    'abu-dhabi': 'abu-dhabi',
    qatar: 'qatar',
    miami: 'miami',
    netherlands: 'netherlands',
    dutch: 'netherlands',
    'united states': 'united-states',
    'united-states': 'united-states',
    usa: 'united-states',
    'las vegas': 'las-vegas',
    'las-vegas': 'las-vegas',
    'emilia romagna': 'emilia-romagna',
    'emilia-romagna': 'emilia-romagna',
    imola: 'emilia-romagna',
    'great britain': 'great-britain',
    'great-britain': 'great-britain',
    saudi: 'saudi-arabia',
    'saudi arabia': 'saudi-arabia',
    'saudi-arabia': 'saudi-arabia',
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

  // Apply context as fallback if parameters weren't extracted from query
  if (context?.lastTrack && !parameters.track && !parameters.roundSlug) {
    parameters.track = context.lastTrack
  }
  if (context?.lastYear && !parameters.year) {
    parameters.year = context.lastYear
  }
  if (context?.lastSession && !parameters.session) {
    parameters.session = context.lastSession
  }
  if (context?.lastDriver && !parameters.driverCode && !parameters.driverCodes) {
    parameters.driverCode = context.lastDriver
  }
  if (context?.lastCorner && !parameters.cornerNumber) {
    parameters.cornerNumber = context.lastCorner
  }

  return {
    intent,
    parameters,
    confidence: 0.7,
    rawQuery: query,
  }
}

