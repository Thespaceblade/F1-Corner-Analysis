import { NextRequest, NextResponse } from 'next/server'
import { classifyQuery } from '../../../lib/chatbot/queryClassifier'
import { executeQuery } from '../../../lib/chatbot/queryExecutor'
import { generateResponse } from '../../../lib/chatbot/responseGenerator'
import type { ChatRequest, ChatError } from '../../../lib/chatbot/types'

// Mark this route as dynamic to prevent static generation
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json() as ChatRequest
    const { query, context } = body

    // Validate request
    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return NextResponse.json(
        {
          error: 'Invalid request',
          message: 'Query is required and must be a non-empty string',
        } as ChatError,
        { status: 400 }
      )
    }

    // Check if Gemini API key is configured
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        {
          error: 'Configuration error',
          message: 'GEMINI_API_KEY environment variable is not set',
        } as ChatError,
        { status: 500 }
      )
    }

    // Step 1: Classify the query
    let classifiedQuery
    try {
      classifiedQuery = await classifyQuery(query, context)
    } catch (error) {
      console.error('Error classifying query:', error)
      return NextResponse.json(
        {
          error: 'Classification error',
          message: 'Failed to classify query',
          details: error instanceof Error ? error.message : String(error),
        } as ChatError,
        { status: 500 }
      )
    }

    // Step 2: Execute the query to get data
    let queryResult
    try {
      // For GENERAL queries, skip data retrieval
      if (classifiedQuery.intent === 'GENERAL') {
        // Handle general queries (greetings, help, etc.)
        return NextResponse.json({
          answer: "I'm an F1 corner analysis chatbot. I can help you analyze corner performance, compare drivers, and answer questions about F1 sessions. Try asking me: 'Who was fastest at corner 8 at Monaco 2025?' or 'Compare VER and HAM at corner 3'.",
          data: undefined,
          sources: [],
          followUpSuggestions: [
            'Who was fastest at corner 8 at Monaco 2025?',
            'Compare VER and HAM at corner 3',
            'What sessions are available for Monaco 2025?',
          ],
        })
      }

      // Validate required parameters
      const track = classifiedQuery.parameters.track || classifiedQuery.parameters.roundSlug
      if (!track && classifiedQuery.intent !== 'SESSION_INFO') {
        return NextResponse.json({
          answer: "I need to know which track you're asking about. Please specify the track, for example: 'Who was fastest at corner 8 at Monaco 2025?'",
          data: undefined,
          sources: [],
          followUpSuggestions: [
            'Who was fastest at corner 8 at Monaco 2025?',
            'Compare VER and HAM at Monaco 2025',
            'What sessions are available for Monaco 2025?',
          ],
        })
      }

      queryResult = await executeQuery(
        classifiedQuery.intent,
        classifiedQuery.parameters,
        context
      )
    } catch (error) {
      console.error('Error executing query:', error)
      const errorMessage = error instanceof Error ? error.message : String(error)

      // Provide helpful error messages
      if (errorMessage.includes('not found') || errorMessage.includes('does not exist')) {
        return NextResponse.json({
          answer: `I don't have data for that request. ${errorMessage}. Please try a different track, year, or session.`,
          data: undefined,
          sources: [],
          followUpSuggestions: [
            'What sessions are available for Monaco 2025?',
            'Show me available tracks',
            'Try a different year or session',
          ],
        })
      }

      return NextResponse.json(
        {
          error: 'Query execution error',
          message: 'Failed to execute query',
          details: errorMessage,
        } as ChatError,
        { status: 500 }
      )
    }

    // Step 3: Generate response using Gemini
    let response
    try {
      response = await generateResponse(
        query,
        classifiedQuery,
        queryResult,
        context
      )
    } catch (error) {
      console.error('Error generating response:', error)
      return NextResponse.json(
        {
          error: 'Response generation error',
          message: 'Failed to generate response',
          details: error instanceof Error ? error.message : String(error),
        } as ChatError,
        { status: 500 }
      )
    }

    // Return success response
    return NextResponse.json(response)
  } catch (error) {
    console.error('Unexpected error in chat API:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'An unexpected error occurred',
        details: error instanceof Error ? error.message : String(error),
      } as ChatError,
      { status: 500 }
    )
  }
}

// Handle OPTIONS for CORS
export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 })
}

