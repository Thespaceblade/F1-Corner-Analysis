/**
 * TypeScript types for the F1 Corner Analysis Chatbot
 */

export type QueryIntent =
  | 'CORNER_PERFORMANCE'
  | 'DRIVER_PERFORMANCE'
  | 'COMPARISON'
  | 'STATISTICAL'
  | 'SESSION_INFO'
  | 'TREND_ANALYSIS'
  | 'TYRE_ANALYSIS'
  | 'GENERAL'

export type QueryParameters = {
  cornerNumber?: number
  driverCode?: string
  driverCodes?: string[] // For comparisons
  track?: string // Track ID (e.g., 'monaco', 'silverstone')
  roundSlug?: string // Same as track
  year?: number
  session?: string // 'Q', 'R', 'FP1', 'FP2', 'FP3'
  cornerType?: 'slow' | 'medium' | 'fast'
  tyreCompound?: 'SOFT' | 'MEDIUM' | 'HARD'
  comparisonType?: 'vs' | 'compare' | 'difference'
}

export type ConversationContext = {
  lastTrack?: string
  lastYear?: number
  lastSession?: string
  lastDriver?: string
  lastCorner?: number
  messages?: Array<{
    role: 'user' | 'assistant'
    content: string
  }>
}

export type ClassifiedQuery = {
  intent: QueryIntent
  parameters: QueryParameters
  confidence: number
  rawQuery: string
}

export type CornerPerformanceData = {
  cornerNumber: number
  driverCode: string
  cornerTime: number | null
  entrySpeed: number
  apexSpeed: number
  exitSpeed: number
  lapNumber: number
  cornerType: 'slow' | 'medium' | 'fast' | 'unknown'
}

export type DriverCornerStats = {
  driverCode: string
  cornerNumber: number
  avgTime: number | null
  bestTime: number | null
  worstTime: number | null
  avgEntrySpeed: number
  avgApexSpeed: number
  avgExitSpeed: number
  sampleCount: number
}

export type QueryResult = {
  type: QueryIntent
  data: any // Will be typed based on query type
  metadata: {
    track?: string
    year?: number
    session?: string
    timestamp: string
  }
}

export type ChatbotResponse = {
  answer: string // Natural language answer
  data?: {
    cornerNumber?: number
    driverCode?: string
    driverCodes?: string[]
    track?: string
    year?: number
    session?: string
    metrics?: {
      cornerTime?: number
      speeds?: {
        entry: number
        apex: number
        exit: number
      }
      delta?: number
      average?: number
      best?: number
    }
  }
  sources?: string[] // Data sources referenced
  followUpSuggestions?: string[] // Suggested follow-up questions
  confidence?: number
}

export type ChatRequest = {
  query: string
  context?: ConversationContext
}

export type ChatError = {
  error: string
  message: string
  code?: string
  details?: any
}

