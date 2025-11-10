# F1 Corner Analysis Chatbot Integration Plan

## Overview

This document outlines a comprehensive plan for integrating a chatbot into the F1 Corner Analysis application. The chatbot will query the PostgreSQL database (and JSON file fallback) to provide natural language analysis of corner performance, driver statistics, and session data.

**Key Requirements:**
- Hosted on Vercel (serverless functions)
- Uses Google Gemini API (Free Tier)
- Pulls data from PostgreSQL database (Neon) with JSON file fallback
- Provides basic analysis: "who won at this corner", corner performance comparisons, driver statistics, etc.
- **DO NOT IMPLEMENT** - This is a planning document only

---

## Architecture Overview

### High-Level Architecture

```
User Query (Frontend)
    ↓
Chatbot API Route (Next.js API Route)
    ↓
Query Understanding (Gemini API)
    ↓
Query Classification & Parameter Extraction
    ↓
Database Query Layer (PostgreSQL/JSON)
    ↓
Data Aggregation & Analysis
    ↓
Response Generation (Gemini API)
    ↓
Formatted Response (Frontend)
```

### Component Structure

```
app/
  api/
    chat/
      route.ts              # Main chatbot API endpoint
  lib/
    chatbot/
      queryClassifier.ts    # Classify user queries
      queryExecutor.ts      # Execute database queries
      responseGenerator.ts  # Generate responses using Gemini
      dataAnalyzer.ts       # Analyze corner/lap/driver data
      prompts.ts            # System prompts and templates
```

---

## Gemini API Free Tier Analysis

### Free Tier Limits (as of 2025)

**Gemini 1.5 Flash (Recommended for Free Tier):**
- **Rate Limits**: 15 requests per minute (RPM)
- **Daily Quota**: 1,500 requests per day
- **Context Window**: 1 million tokens
- **Input**: Free
- **Output**: Free

**Gemini 1.5 Pro (Limited Free Tier):**
- **Rate Limits**: 2 requests per minute
- **Daily Quota**: 50 requests per day
- **Context Window**: 2 million tokens

### Recommendations

1. **Use Gemini 1.5 Flash** for the chatbot (faster, higher rate limits)
2. **Implement rate limiting** on the client side (15 requests/minute max)
3. **Cache frequent queries** to reduce API calls
4. **Implement request queuing** for better user experience
5. **Monitor usage** and warn users approaching limits

### Cost Considerations

- **Free tier is sufficient** for development and moderate usage
- **Upgrade path**: Pay-as-you-go pricing available if needed
- **Estimated usage**: ~100-500 queries/day for typical usage
- **Stay within free tier** with proper caching and rate limiting

---

## Database Schema & Available Data

### PostgreSQL Tables

#### `sessions`
```sql
- id (BIGSERIAL PRIMARY KEY)
- year (INT)
- round_slug (TEXT) -- e.g., 'monaco', 'silverstone'
- session_code (TEXT) -- 'Q', 'R', 'FP1', etc.
- event_name (TEXT)
- country (TEXT)
- official_name (TEXT)
- generated_at (TIMESTAMPTZ)
```

#### `drivers`
```sql
- id (BIGSERIAL PRIMARY KEY)
- code (TEXT UNIQUE) -- e.g., 'VER', 'HAM'
- team (TEXT)
- number (INT)
```

#### `laps`
```sql
- id (BIGSERIAL PRIMARY KEY)
- session_id (BIGINT REFERENCES sessions)
- driver_code (TEXT REFERENCES drivers)
- lap_number (INT)
- stint (INT)
- compound (TEXT) -- 'SOFT', 'MEDIUM', 'HARD'
- tyre_life (INT)
- lap_time_seconds (DOUBLE PRECISION)
- sector1_seconds (DOUBLE PRECISION)
- sector2_seconds (DOUBLE PRECISION)
- sector3_seconds (DOUBLE PRECISION)
- track_status (TEXT)
- flags (TEXT[])
- is_valid (BOOLEAN)
```

### JSON File Structure (Fallback)

```typescript
SessionPayload {
  meta: {
    year: number
    round: string
    session: string
    event: { name, country, officialName }
    availableDrivers: string[]
  }
  drivers: Record<string, {
    code: string
    team: string
    number: number
  }>
  laps: Array<{
    driver: string
    lapNumber: number
    lapTimeSeconds: number
    sectorTimesSeconds: [number, number, number]
    compound: string
    isValid: boolean
  }>
  corners: Record<string, CornerMetrics[]> // Driver code -> corner data
}

CornerMetrics {
  cornerNumber: number
  lapNumber: number
  entrySpeed: number
  apexSpeed: number
  exitSpeed: number
  cornerTime: number | null
  brakingDistance: number
  accelerationDistance: number
  minSpeed: number
  cornerType: 'slow' | 'medium' | 'fast' | 'unknown'
}
```

### Track Data (tracks.json)

```typescript
{
  tracks: {
    [trackId]: {
      id: string
      name: string
      corners: Array<{
        number: number
        type: 'slow' | 'medium' | 'fast'
        x: number
        y: number
        expectedDistanceRange: { min: number, max: number }
      }>
    }
  }
}
```

---

## Query Types & Use Cases

### 1. Corner Performance Queries

#### 1.1 "Who was fastest at corner X?"
**Intent**: Find the driver with the best corner time for a specific corner
**Parameters**: 
- Corner number (required)
- Track/round (required, from context or explicit)
- Year (optional, defaults to current/latest)
- Session (optional, defaults to 'Q' or 'R')

**Database Query**:
```sql
-- Get session ID
SELECT id FROM sessions 
WHERE year = ? AND round_slug = ? AND session_code = ?

-- Query corner data from JSON (or corner performance table if exists)
-- Aggregate by driver, find minimum cornerTime for corner X
```

**Response Format**:
```
"Max Verstappen (VER) was fastest at corner 8 with a time of 2.145s 
in the 2025 Monaco Grand Prix Qualifying session. He averaged 187 km/h 
through the corner."
```

#### 1.2 "Who won corner 5 at Monaco?"
**Intent**: Same as 1.1, but with track name
**Parameters**: Corner number, track name (monaco), optional year/session

#### 1.3 "Compare corner 3 performance between VER and HAM"
**Intent**: Compare two drivers at a specific corner
**Parameters**: Corner number, driver codes (2), track/round, year, session

**Response Format**:
```
"At corner 3 in the 2025 Monaco Grand Prix Qualifying:
- Max Verstappen (VER): 2.234s average, 192 km/h apex speed
- Lewis Hamilton (HAM): 2.287s average, 189 km/h apex speed
Verstappen was 0.053s faster on average."
```

#### 1.4 "What's the fastest corner time at turn 12?"
**Intent**: Get best time for a corner (may not specify driver)
**Parameters**: Corner number, track, year, session

#### 1.5 "Show me all corner times for corner 1"
**Intent**: List all drivers' performance at a corner
**Parameters**: Corner number, track, year, session

**Response Format**:
```
"Corner 1 performance in 2025 Monaco Grand Prix Qualifying:
1. Max Verstappen (VER): 2.145s (best), 2.167s (average)
2. Lando Norris (NOR): 2.156s (best), 2.178s (average)
3. Charles Leclerc (LEC): 2.162s (best), 2.184s (average)
..."
```

### 2. Driver Performance Queries

#### 2.1 "Which corner is VER strongest at?"
**Intent**: Find corner where driver has best relative performance
**Parameters**: Driver code, track, year, session

**Analysis**: Compare driver's corner times vs. field average, find largest delta

**Response Format**:
```
"Max Verstappen's strongest corner at Monaco 2025 Qualifying was corner 8, 
where he was 0.082s faster than the field average. His best time was 2.145s 
compared to the average of 2.227s."
```

#### 2.2 "Which corner is HAM weakest at?"
**Intent**: Find corner where driver struggles most
**Parameters**: Driver code, track, year, session

#### 2.3 "Compare VER and NOR overall corner performance"
**Intent**: Compare two drivers across all corners
**Parameters**: Driver codes (2), track, year, session

**Response Format**:
```
"Corner-by-corner comparison: VER vs NOR at Monaco 2025 Qualifying:
- VER faster at: 12 corners (avg +0.045s advantage)
- NOR faster at: 4 corners (avg +0.032s advantage)
- VER's biggest advantage: Corner 8 (+0.087s)
- NOR's biggest advantage: Corner 3 (+0.051s)
Overall, VER was faster through corners by an average of 0.038s."
```

#### 2.4 "What's VER's average corner time?"
**Intent**: Get driver's overall corner performance
**Parameters**: Driver code, track, year, session

### 3. Track & Session Queries

#### 3.1 "What sessions are available for Monaco 2025?"
**Intent**: List available sessions for a track/year
**Parameters**: Track, year

**Database Query**:
```sql
SELECT DISTINCT session_code 
FROM sessions 
WHERE year = ? AND round_slug = ?
ORDER BY session_code
```

#### 3.2 "What drivers participated in Monaco 2025 Qualifying?"
**Intent**: List drivers in a session
**Parameters**: Track, year, session

#### 3.3 "How many corners does Monaco have?"
**Intent**: Get track corner count
**Parameters**: Track name

**Query**: Read from tracks.json

#### 3.4 "What's the fastest lap time at Monaco 2025?"
**Intent**: Get best lap time in a session
**Parameters**: Track, year, session (optional)

**Database Query**:
```sql
SELECT MIN(lap_time_seconds), driver_code
FROM laps
WHERE session_id = ? AND is_valid = true
GROUP BY driver_code
ORDER BY MIN(lap_time_seconds)
LIMIT 1
```

### 4. Comparative Analysis Queries

#### 4.1 "Which driver has the best corner 1 time across all sessions?"
**Intent**: Compare across multiple sessions
**Parameters**: Corner number, track, year (optional)

**Analysis**: Query multiple sessions, aggregate corner data

#### 4.2 "Compare corner performance between Q and R at Monaco"
**Intent**: Compare qualifying vs race performance
**Parameters**: Track, year, corner number (optional)

#### 4.3 "Who improved most at corner 5 between FP1 and Q?"
**Intent**: Find driver with biggest improvement
**Parameters**: Corner number, track, year, sessions (2)

### 5. Statistical Queries

#### 5.1 "What's the average corner time for slow corners at Monaco?"
**Intent**: Aggregate by corner type
**Parameters**: Corner type, track, year, session

#### 5.2 "Which corner type is fastest on average?"
**Intent**: Compare corner types
**Parameters**: Track, year, session

**Response Format**:
```
"Corner type performance at Monaco 2025 Qualifying:
- Fast corners: 1.845s average
- Medium corners: 2.234s average  
- Slow corners: 3.456s average
Fast corners are the quickest, as expected."
```

#### 5.3 "What's the speed difference between entry and exit at corner 8?"
**Intent**: Analyze corner speed profile
**Parameters**: Corner number, track, year, session, driver (optional)

### 6. Time-Based Queries

#### 6.1 "How did VER's corner 5 time improve over the session?"
**Intent**: Track performance over time
**Parameters**: Driver, corner number, track, year, session

**Analysis**: Group corner data by lap number, show trend

#### 6.2 "What was VER's best lap and which corners made it fast?"
**Intent**: Analyze best lap corner breakdown
**Parameters**: Driver, track, year, session

### 7. Compound/Tyre Queries

#### 7.1 "How do corner times differ between soft and medium tyres?"
**Intent**: Compare tyre compounds
**Parameters**: Track, year, session, corner number (optional)

**Database Query**:
```sql
SELECT compound, AVG(corner_time), driver_code
FROM laps l
JOIN corner_data c ON l.id = c.lap_id
WHERE l.session_id = ? AND c.corner_number = ?
GROUP BY compound, driver_code
```

#### 7.2 "Which compound is fastest at corner 3?"
**Intent**: Find best tyre for a corner
**Parameters**: Corner number, track, year, session

---

## Query Classification System

### Intent Classification

The chatbot will classify queries into the following intents:

1. **CORNER_PERFORMANCE** - Questions about specific corner performance
2. **DRIVER_PERFORMANCE** - Questions about driver performance
3. **COMPARISON** - Compare drivers/corners/sessions
4. **STATISTICAL** - Aggregate statistics and averages
5. **SESSION_INFO** - Information about sessions/tracks
6. **TREND_ANALYSIS** - Performance over time
7. **TYRE_ANALYSIS** - Tyre compound analysis
8. **GENERAL** - General questions, greetings, help

### Parameter Extraction

Extract the following parameters from user queries:

- **Corner Number**: Integer (1-20 typically)
- **Driver Code**: 3-letter code (VER, HAM, NOR, etc.)
- **Track/Round**: Track identifier (monaco, silverstone, etc.)
- **Year**: 4-digit year (2024, 2025, etc.)
- **Session**: Session code (Q, R, FP1, FP2, FP3, etc.)
- **Corner Type**: 'slow', 'medium', 'fast'
- **Tyre Compound**: 'SOFT', 'MEDIUM', 'HARD'
- **Comparison Type**: 'vs', 'compare', 'difference'

### Context Management

Maintain conversation context:
- Last mentioned track/year/session
- Last mentioned driver
- Last mentioned corner
- User preferences (default year, favorite drivers)

---

## Database Query Patterns

### Pattern 1: Corner Performance Query

```typescript
async function getCornerPerformance(
  cornerNumber: number,
  roundSlug: string,
  year: number,
  sessionCode: string,
  driverCode?: string
) {
  // 1. Get session ID
  const session = await db`
    SELECT id FROM sessions 
    WHERE year = ${year} 
    AND round_slug = ${roundSlug} 
    AND session_code = ${sessionCode.toUpperCase()}
    LIMIT 1
  `
  
  if (!session.length) {
    // Fallback to JSON file
    return getCornerPerformanceFromJSON(...)
  }
  
  // 2. Get corner data from JSON (corner data not in DB yet)
  // OR if corner table exists:
  // SELECT * FROM corner_performance 
  // WHERE session_id = ? AND corner_number = ?
  
  // 3. Aggregate and analyze
  return analyzeCornerData(...)
}
```

### Pattern 2: Driver Comparison Query

```typescript
async function compareDrivers(
  driver1: string,
  driver2: string,
  roundSlug: string,
  year: number,
  sessionCode: string,
  cornerNumber?: number
) {
  // Get session data
  const sessionData = await getSessionData(roundSlug, year, sessionCode)
  
  // Get corner data for both drivers
  const driver1Corners = sessionData.corners[driver1] || []
  const driver2Corners = sessionData.corners[driver2] || []
  
  // Filter by corner if specified
  if (cornerNumber) {
    driver1Corners = driver1Corners.filter(c => c.cornerNumber === cornerNumber)
    driver2Corners = driver2Corners.filter(c => c.cornerNumber === cornerNumber)
  }
  
  // Aggregate and compare
  return compareCornerPerformance(driver1Corners, driver2Corners)
}
```

### Pattern 3: Session Listing Query

```typescript
async function getAvailableSessions(
  roundSlug: string,
  year: number
) {
  if (isDatabaseEnabled()) {
    return await db`
      SELECT DISTINCT session_code, event_name, country
      FROM sessions
      WHERE year = ${year} AND round_slug = ${roundSlug}
      ORDER BY session_code
    `
  } else {
    // Read from file system
    const sessionsPath = path.join('public', 'data', 'sessions', year, roundSlug)
    const sessions = await fs.readdir(sessionsPath)
    return sessions.filter(s => {
      const sessionJson = path.join(sessionsPath, s, 'session.json')
      return fs.existsSync(sessionJson)
    })
  }
}
```

### Pattern 4: Lap Time Query

```typescript
async function getBestLapTime(
  roundSlug: string,
  year: number,
  sessionCode: string,
  driverCode?: string
) {
  if (isDatabaseEnabled()) {
    const session = await getSession(roundSlug, year, sessionCode)
    const query = driverCode
      ? db`SELECT MIN(lap_time_seconds) as best_time, driver_code
          FROM laps
          WHERE session_id = ${session.id} 
          AND driver_code = ${driverCode}
          AND is_valid = true`
      : db`SELECT MIN(lap_time_seconds) as best_time, driver_code
          FROM laps
          WHERE session_id = ${session.id}
          AND is_valid = true
          GROUP BY driver_code
          ORDER BY MIN(lap_time_seconds)
          LIMIT 1`
    return query
  } else {
    // Read from JSON and find best lap
    const sessionData = await loadSessionData(...)
    const laps = driverCode
      ? sessionData.laps.filter(l => l.driver === driverCode)
      : sessionData.laps
    return laps.reduce((best, lap) => 
      !lap.lapTimeSeconds ? best :
      !best || lap.lapTimeSeconds < best.lapTimeSeconds ? lap : best
    , null)
  }
}
```

---

## Response Generation Strategy

### Two-Phase Approach

1. **Data Retrieval Phase**: Query database/JSON files, aggregate data
2. **Response Generation Phase**: Use Gemini API to generate natural language response

### System Prompt Template

```
You are an F1 data analyst chatbot specializing in corner performance analysis.

Your role:
- Answer questions about F1 corner performance, driver statistics, and session data
- Provide accurate, data-driven insights
- Use natural, conversational language
- Include specific numbers (times, speeds, deltas) when relevant
- Be concise but informative

Available data:
- Corner performance metrics (entry/apex/exit speeds, corner times)
- Lap times and sector times
- Driver information and team data
- Session information (qualifying, race, practice)
- Track corner definitions

Guidelines:
- Always specify the track, year, and session when providing data
- Include driver codes in parentheses when mentioning drivers
- Use appropriate units (seconds for times, km/h for speeds)
- Highlight significant differences (e.g., "0.087s faster")
- If data is not available, clearly state that

User query: {userQuery}

Data context: {dataContext}
```

### Response Format

```typescript
type ChatbotResponse = {
  answer: string                    // Natural language answer
  data?: {                          // Optional structured data
    cornerNumber?: number
    driverCode?: string
    track?: string
    year?: number
    session?: string
    metrics?: {
      cornerTime?: number
      speeds?: { entry: number, apex: number, exit: number }
      delta?: number
    }
  }
  sources?: string[]                // Data sources referenced
  followUpSuggestions?: string[]    // Suggested follow-up questions
}
```

---

## Error Handling & Edge Cases

### Case 1: No Data Available

**Scenario**: User asks about a corner/session that doesn't exist
**Response**: 
```
"I don't have data for corner 15 at Monaco 2025 Qualifying. 
Monaco has 19 corners. Would you like to know about a different corner?"
```

### Case 2: Ambiguous Query

**Scenario**: "Who won corner 5?" (no track/year specified)
**Response**:
```
"I need a bit more information. Which track and year are you asking about? 
For example, 'Who won corner 5 at Monaco 2025?'"
```

### Case 3: Multiple Matches

**Scenario**: "Who was fastest at Monaco?" (no corner specified)
**Response**:
```
"Which corner are you interested in? Monaco has 19 corners. 
You can ask about a specific corner, like 'Who was fastest at corner 8 at Monaco?'"
```

### Case 4: Invalid Driver Code

**Scenario**: "Who won corner 5 for XYZ?"
**Response**:
```
"I don't recognize driver code 'XYZ'. Available drivers for Monaco 2025 Qualifying 
include: VER, NOR, HAM, LEC, etc. Which driver would you like to know about?"
```

### Case 5: Database Unavailable, JSON Fallback

**Scenario**: Database is disabled, but JSON files exist
**Response**: Use JSON file fallback (already implemented in session API)

### Case 6: Rate Limiting

**Scenario**: Too many requests to Gemini API
**Response**:
```
"I'm processing a lot of requests right now. Please wait a moment and try again."
```
**Implementation**: Queue requests, return 429 status if queue is full

### Case 7: Incomplete Data

**Scenario**: Corner data exists but some metrics are missing
**Response**:
```
"Max Verstappen's best corner time at corner 8 was 2.145s, but speed data 
is not available for this corner in this session."
```

### Case 8: No Valid Laps

**Scenario**: All laps in session are invalid
**Response**:
```
"I don't have valid lap data for Monaco 2025 Qualifying. The session may not 
have been completed or data may not be available yet."
```

---

## Implementation Structure

### API Route: `/app/api/chat/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { classifyQuery } from '@/lib/chatbot/queryClassifier'
import { executeQuery } from '@/lib/chatbot/queryExecutor'
import { generateResponse } from '@/lib/chatbot/responseGenerator'

export async function POST(request: NextRequest) {
  try {
    // 1. Get user query
    const { query, context } = await request.json()
    
    // 2. Rate limiting check
    if (await isRateLimited(request)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please wait a moment.' },
        { status: 429 }
      )
    }
    
    // 3. Classify query intent
    const intent = await classifyQuery(query, context)
    
    // 4. Execute database queries
    const data = await executeQuery(intent, context)
    
    // 5. Generate response using Gemini
    const response = await generateResponse(query, intent, data, context)
    
    // 6. Return response
    return NextResponse.json(response)
    
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to process query', details: error.message },
      { status: 500 }
    )
  }
}
```

### Query Classifier: `lib/chatbot/queryClassifier.ts`

```typescript
import { GoogleGenerativeAI } from '@google/generative-ai'

type QueryIntent = {
  type: 'CORNER_PERFORMANCE' | 'DRIVER_PERFORMANCE' | 'COMPARISON' | ...
  parameters: {
    cornerNumber?: number
    driverCode?: string
    track?: string
    year?: number
    session?: string
    // ...
  }
  confidence: number
}

export async function classifyQuery(
  query: string,
  context: ConversationContext
): Promise<QueryIntent> {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
  
  const prompt = buildClassificationPrompt(query, context)
  
  const result = await model.generateContent(prompt)
  const response = await result.response
  const text = response.text()
  
  return parseIntent(text)
}
```

### Query Executor: `lib/chatbot/queryExecutor.ts`

```typescript
export async function executeQuery(
  intent: QueryIntent,
  context: ConversationContext
): Promise<QueryResult> {
  switch (intent.type) {
    case 'CORNER_PERFORMANCE':
      return await getCornerPerformance(intent.parameters, context)
    case 'DRIVER_PERFORMANCE':
      return await getDriverPerformance(intent.parameters, context)
    case 'COMPARISON':
      return await compareDrivers(intent.parameters, context)
    // ...
  }
}
```

### Response Generator: `lib/chatbot/responseGenerator.ts`

```typescript
export async function generateResponse(
  userQuery: string,
  intent: QueryIntent,
  data: QueryResult,
  context: ConversationContext
): Promise<ChatbotResponse> {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
  
  const systemPrompt = buildSystemPrompt()
  const dataContext = formatDataContext(data)
  
  const prompt = `${systemPrompt}

User query: ${userQuery}

Data: ${dataContext}

Generate a natural, conversational response to the user's query using the provided data.`

  const result = await model.generateContent(prompt)
  const response = await result.response
  const text = response.text()
  
  return {
    answer: text,
    data: data,
    sources: extractSources(data),
    followUpSuggestions: generateFollowUpSuggestions(intent, data)
  }
}
```

---

## Frontend Integration

### Chatbot Component

```typescript
// components/Chatbot.tsx
'use client'

import { useState } from 'react'

export default function Chatbot() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  
  const sendMessage = async (query: string) => {
    setLoading(true)
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          context: extractContext(messages)
        })
      })
      
      const data = await response.json()
      setMessages([...messages, 
        { role: 'user', content: query },
        { role: 'assistant', content: data.answer, data: data.data }
      ])
    } catch (error) {
      // Handle error
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <div className="chatbot-container">
      {/* Chat UI */}
    </div>
  )
}
```

### UI Placement Options

1. **Floating Chat Widget**: Bottom-right corner, expandable
2. **Sidebar Panel**: Fixed sidebar on the right
3. **Inline Section**: Embedded in main page
4. **Modal/Dialog**: Open on button click

**Recommendation**: Floating chat widget for non-intrusive access

---

## Security Considerations

### 1. API Key Security

- Store `GEMINI_API_KEY` in Vercel environment variables
- Never expose API key in client-side code
- Use server-side API routes only

### 2. Rate Limiting

- Implement rate limiting per IP/user
- Use Vercel's edge middleware for rate limiting
- Cache responses to reduce API calls

### 3. Input Validation

- Sanitize user queries
- Validate parameters (corner numbers, driver codes, etc.)
- Prevent SQL injection (use parameterized queries)
- Limit query length

### 4. Data Privacy

- Don't log sensitive user queries
- Don't store conversation history without consent
- Comply with data protection regulations

### 5. Error Handling

- Don't expose internal errors to users
- Log errors server-side only
- Return user-friendly error messages

---

## Performance Optimization

### 1. Caching Strategy

- **Cache frequent queries**: Corner performance, driver stats (5-10 min TTL)
- **Cache session data**: Session metadata (1 hour TTL)
- **Cache track data**: Track definitions (24 hour TTL)
- Use Vercel's edge caching where possible

### 2. Database Optimization

- Index frequently queried columns (year, round_slug, session_code, driver_code)
- Use connection pooling (Neon supports this)
- Optimize JSON file reads (cache in memory)

### 3. API Call Optimization

- Batch similar queries when possible
- Use streaming responses for long answers
- Implement request queuing to avoid rate limits

### 4. Response Time Targets

- Simple queries: < 2 seconds
- Complex queries: < 5 seconds
- Database queries: < 1 second
- Gemini API calls: < 3 seconds

---

## Testing Strategy

### Unit Tests

- Query classification accuracy
- Parameter extraction correctness
- Database query functions
- Data aggregation logic

### Integration Tests

- End-to-end query processing
- Database + JSON fallback
- Gemini API integration
- Error handling

### User Acceptance Tests

- Common query scenarios
- Edge cases
- Error scenarios
- Performance under load

### Test Cases

1. **Happy Path**: "Who won corner 8 at Monaco 2025?"
2. **Ambiguous Query**: "Who won corner 5?"
3. **No Data**: "Who won corner 50 at Monaco?"
4. **Invalid Driver**: "Who won corner 5 for XYZ?"
5. **Comparison**: "Compare VER and HAM at corner 8"
6. **Statistics**: "What's the average corner time for slow corners?"
7. **Multiple Sessions**: "Compare Q and R at Monaco"

---

## Deployment Considerations

### Vercel Configuration

1. **Environment Variables**:
   - `GEMINI_API_KEY`: Google Gemini API key
   - `DATABASE_URL`: Neon PostgreSQL connection string
   - `DATA_SOURCE`: 'database' or 'files'

2. **Serverless Function Limits**:
   - Function timeout: 10 seconds (default)
   - Memory: 1024 MB (default)
   - Request size: 4.5 MB (default)

3. **Edge Functions** (Optional):
   - Use for rate limiting
   - Use for caching
   - Faster response times

### Monitoring & Logging

1. **Vercel Analytics**: Track API usage, response times
2. **Error Tracking**: Log errors to monitoring service
3. **Usage Metrics**: Track Gemini API usage
4. **Performance Monitoring**: Monitor database query times

### Scaling Considerations

1. **Database Connection Pooling**: Use Neon's connection pooling
2. **CDN Caching**: Cache static responses
3. **Request Queuing**: Queue requests if rate limited
4. **Horizontal Scaling**: Vercel handles this automatically

---

## Future Enhancements

### Phase 2 Features

1. **Visual Responses**: Include charts/graphs in responses
2. **Voice Input**: Speech-to-text for queries
3. **Multi-language Support**: Support multiple languages
4. **Conversation History**: Store and recall previous conversations
5. **Personalized Recommendations**: Suggest queries based on user interests

### Phase 3 Features

1. **Predictive Analysis**: Predict corner performance
2. **Trend Analysis**: Analyze performance trends over time
3. **Comparative Analytics**: Compare across seasons
4. **Advanced Statistics**: Advanced statistical analysis
5. **Export Functionality**: Export analysis to PDF/CSV

---

## Limitations & Constraints

### Current Limitations

1. **Corner Data Not in Database**: Corner metrics are in JSON files only
   - **Solution**: Either query JSON files or create corner_performance table

2. **Limited Historical Data**: Data availability depends on what's been processed
   - **Solution**: Process more historical sessions

3. **Free Tier Rate Limits**: 15 requests/minute may be limiting
   - **Solution**: Implement caching and request queuing

4. **No Real-time Data**: Data is static (processed sessions only)
   - **Solution**: Add real-time data processing pipeline

### Technical Constraints

1. **Serverless Function Timeout**: 10 seconds max
   - **Solution**: Optimize queries, use streaming for long responses

2. **Database Connection Limits**: Neon free tier has connection limits
   - **Solution**: Use connection pooling, optimize queries

3. **JSON File Size**: Large session JSON files may be slow to parse
   - **Solution**: Cache parsed data, optimize file structure

---

## Success Metrics

### Key Performance Indicators (KPIs)

1. **Response Accuracy**: > 90% correct answers
2. **Response Time**: < 3 seconds average
3. **User Satisfaction**: > 4/5 rating
4. **API Usage**: Stay within free tier limits
5. **Error Rate**: < 5% error rate

### Monitoring Metrics

1. **Query Volume**: Number of queries per day
2. **Query Types**: Distribution of query types
3. **Response Times**: P50, P95, P99 response times
4. **Error Rates**: Error rate by type
5. **API Usage**: Gemini API usage and costs

---

## Conclusion

This chatbot integration will provide users with natural language access to F1 corner performance data, making it easier to analyze and understand driver performance. The implementation uses Google Gemini API's free tier, which should be sufficient for moderate usage, and leverages the existing PostgreSQL database and JSON file structure.

**Key Takeaways**:
- Use Gemini 1.5 Flash for better rate limits
- Implement caching to reduce API calls
- Handle edge cases gracefully
- Optimize database queries
- Monitor usage to stay within free tier
- Provide clear, data-driven responses

**Next Steps** (When Ready to Implement):
1. Set up Gemini API key
2. Create chatbot API route structure
3. Implement query classification
4. Implement query execution
5. Implement response generation
6. Create frontend chatbot component
7. Test with various queries
8. Deploy to Vercel
9. Monitor usage and optimize

---

## Appendix: Example Queries & Responses

### Example 1: Corner Performance
**Query**: "Who was fastest at corner 8 at Monaco 2025 Qualifying?"
**Response**: 
```
"Max Verstappen (VER) was fastest at corner 8 in the 2025 Monaco Grand Prix 
Qualifying session with a time of 2.145s. He averaged 187 km/h through the 
corner, which is a medium-speed corner. Lando Norris (NOR) was second fastest 
with 2.156s, just 0.011s behind."
```

### Example 2: Driver Comparison
**Query**: "Compare VER and HAM at corner 3"
**Response**:
```
"At corner 3 in the 2025 Monaco Grand Prix Qualifying:
- Max Verstappen (VER): 2.234s average, 192 km/h apex speed, best time 2.201s
- Lewis Hamilton (HAM): 2.287s average, 189 km/h apex speed, best time 2.245s

Verstappen was faster by an average of 0.053s and had a higher apex speed. 
His best time was 0.044s faster than Hamilton's best."
```

### Example 3: Statistical Query
**Query**: "What's the average corner time for slow corners at Monaco?"
**Response**:
```
"At Monaco 2025 Qualifying, the average corner time for slow corners is 3.456s 
across all drivers. The slowest corner is corner 10 with an average of 3.892s, 
while the fastest slow corner is corner 2 with an average of 3.123s."
```

### Example 4: Trend Analysis
**Query**: "How did VER's corner 5 time improve over the session?"
**Response**:
```
"Max Verstappen's corner 5 times improved throughout the Monaco 2025 Qualifying 
session:
- Early laps (1-5): 2.456s average
- Middle laps (6-10): 2.389s average
- Late laps (11-15): 2.312s average

His best time was 2.289s on lap 12, showing a steady improvement as the session 
progressed and track conditions improved."
```

---

**Document Version**: 1.0
**Last Updated**: 2025-01-XX
**Status**: Planning Phase - DO NOT IMPLEMENT








