# Chatbot Implementation - Step-by-Step Guide

This document provides a step-by-step implementation guide with clear separation between user actions and AI implementation.

---

## Phase 1: Setup & Configuration

### Step 1: Get Gemini API Key

**What YOU do:**
1. Go to https://ai.google.dev/
2. Sign in with your Google account
3. Click "Get API Key" or go to https://aistudio.google.com/app/apikey
4. Create a new API key
5. Copy the API key (you'll need it in Step 2)

**What I do:**
- Nothing at this step

**Verification:**
- You have a Gemini API key (starts with `AIza...`)

---

### Step 2: Configure Environment Variables

**What YOU do:**
1. Go to your Vercel project dashboard
2. Navigate to Settings → Environment Variables
3. Add a new environment variable:
   - **Key**: `GEMINI_API_KEY`
   - **Value**: Your API key from Step 1
   - **Environment**: Production, Preview, Development (check all)
4. Save the environment variable
5. Also add to local `.env.local` file (for local development):
   ```
   GEMINI_API_KEY=your_api_key_here
   ```

**What I do:**
- Nothing at this step

**Verification:**
- Environment variable is set in Vercel
- `.env.local` file exists with the key (don't commit this file!)

---

### Step 3: Install Dependencies

**What YOU do:**
- Nothing (I'll handle this)

**What I do:**
1. Install Google Generative AI SDK:
   ```bash
   npm install @google/generative-ai
   ```
2. Update `package.json` with the new dependency
3. Verify installation

**Verification:**
- `@google/generative-ai` appears in `package.json`
- `node_modules` contains the package

---

## Phase 2: Core Infrastructure

### Step 4: Create Chatbot API Route Structure

**What YOU do:**
- Nothing (I'll create the files)

**What I do:**
1. Create `/app/api/chat/route.ts` - Main chatbot endpoint
2. Create `/lib/chatbot/` directory structure
3. Create placeholder files:
   - `queryClassifier.ts`
   - `queryExecutor.ts`
   - `responseGenerator.ts`
   - `dataAnalyzer.ts`
   - `prompts.ts`
   - `types.ts`

**Verification:**
- Files exist in the correct locations
- Basic structure is in place

---

### Step 5: Define TypeScript Types

**What YOU do:**
- Review the types (optional)

**What I do:**
1. Create `/lib/chatbot/types.ts` with:
   - `QueryIntent` type
   - `QueryParameters` type
   - `ChatbotResponse` type
   - `ConversationContext` type
   - `QueryResult` type

**Verification:**
- Types compile without errors
- Types cover all use cases

---

### Step 6: Implement Basic API Route

**What YOU do:**
- Test the endpoint (after I'm done)

**What I do:**
1. Implement `/app/api/chat/route.ts` with:
   - POST handler
   - Request validation
   - Error handling
   - Basic structure (returns placeholder for now)

**Verification:**
- API route is accessible at `/api/chat`
- Returns JSON response
- Handles errors gracefully

---

## Phase 3: Query Classification

### Step 7: Implement Query Classification

**What YOU do:**
- Test with sample queries

**What I do:**
1. Implement `/lib/chatbot/queryClassifier.ts`:
   - Gemini API integration for intent classification
   - Parameter extraction (corner number, driver code, track, etc.)
   - Intent mapping (CORNER_PERFORMANCE, DRIVER_PERFORMANCE, etc.)
   - Context management

**Verification:**
- Can classify simple queries correctly
- Extracts parameters accurately
- Handles ambiguous queries

---

### Step 8: Create System Prompts

**What YOU do:**
- Review prompts (optional)

**What I do:**
1. Implement `/lib/chatbot/prompts.ts` with:
   - Classification prompt template
   - Response generation prompt template
   - System instructions
   - Few-shot examples

**Verification:**
- Prompts are well-structured
- Cover all query types

---

## Phase 4: Data Query Layer

### Step 9: Implement Session Data Queries

**What YOU do:**
- Verify data is accessible

**What I do:**
1. Implement `/lib/chatbot/queryExecutor.ts`:
   - `getSessionData()` - Get session data from DB/JSON
   - `getAvailableSessions()` - List sessions for track/year
   - `getDriversInSession()` - Get drivers for a session
   - Database query helpers
   - JSON file fallback logic

**Verification:**
- Can retrieve session data
- Falls back to JSON when DB unavailable
- Handles missing data gracefully

---

### Step 10: Implement Corner Data Queries

**What YOU do:**
- Verify corner data is accessible

**What I do:**
1. Extend `/lib/chatbot/queryExecutor.ts`:
   - `getCornerPerformance()` - Get corner data for a specific corner
   - `getCornerDataForDriver()` - Get corner data for a driver
   - `getBestCornerTime()` - Find fastest corner time
   - Corner data aggregation functions

**Verification:**
- Can retrieve corner performance data
- Handles missing corner data
- Aggregates data correctly

---

### Step 11: Implement Driver Comparison Queries

**What YOU do:**
- Test driver comparisons

**What I do:**
1. Extend `/lib/chatbot/queryExecutor.ts`:
   - `compareDrivers()` - Compare two drivers
   - `getDriverBestCorners()` - Find driver's best corners
   - `getDriverWeakestCorners()` - Find driver's worst corners
   - Driver statistics functions

**Verification:**
- Can compare drivers correctly
- Calculates deltas accurately
- Handles missing data

---

## Phase 5: Data Analysis

### Step 12: Implement Data Analysis Functions

**What YOU do:**
- Review analysis results

**What I do:**
1. Implement `/lib/chatbot/dataAnalyzer.ts`:
   - `analyzeCornerPerformance()` - Analyze corner data
   - `calculateStatistics()` - Calculate averages, bests, etc.
   - `compareCornerTypes()` - Compare slow/medium/fast corners
   - `analyzeTrends()` - Analyze performance over time
   - `aggregateByDriver()` - Aggregate data by driver

**Verification:**
- Analysis functions work correctly
- Calculations are accurate
- Handles edge cases

---

## Phase 6: Response Generation

### Step 13: Implement Response Generation

**What YOU do:**
- Test responses for quality

**What I do:**
1. Implement `/lib/chatbot/responseGenerator.ts`:
   - `generateResponse()` - Main response generation function
   - Gemini API integration
   - Data formatting for prompts
   - Response parsing and validation
   - Follow-up suggestion generation

**Verification:**
- Generates natural language responses
- Includes relevant data
- Handles errors gracefully

---

### Step 14: Wire Everything Together

**What YOU do:**
- Test end-to-end

**What I do:**
1. Update `/app/api/chat/route.ts`:
   - Connect query classification
   - Connect query execution
   - Connect response generation
   - Add error handling
   - Add logging

**Verification:**
- End-to-end flow works
- Returns proper responses
- Handles errors

---

## Phase 7: Frontend Integration

### Step 15: Create Chatbot Component

**What YOU do:**
- Test the UI
- Provide feedback on design

**What I do:**
1. Create `/components/Chatbot.tsx`:
   - Chat interface
   - Message display
   - Input field
   - Send button
   - Loading states
   - Error handling

**Verification:**
- Component renders correctly
- Can send messages
- Displays responses

---

### Step 16: Add Chatbot to Main Page

**What YOU do:**
- Decide where to place chatbot (floating widget, sidebar, inline)
- Test integration

**What I do:**
1. Integrate chatbot into main page:
   - Add to `app/page.tsx` or `components/ClientPage.tsx`
   - Style appropriately
   - Handle state management
   - Add toggle/close functionality (if floating widget)

**Verification:**
- Chatbot appears on page
- Doesn't break existing functionality
- Styled appropriately

---

## Phase 8: Error Handling & Edge Cases

### Step 17: Implement Error Handling

**What YOU do:**
- Test error scenarios

**What I do:**
1. Add comprehensive error handling:
   - Invalid queries
   - Missing data
   - Database errors
   - API errors
   - Rate limiting
   - Timeout handling

**Verification:**
- Errors are handled gracefully
- User-friendly error messages
- No crashes

---

### Step 18: Handle Edge Cases

**What YOU do:**
- Test edge cases

**What I do:**
1. Implement edge case handling:
   - Ambiguous queries
   - Missing parameters
   - Invalid corner numbers
   - Invalid driver codes
   - Non-existent sessions
   - Empty data sets

**Verification:**
- Edge cases are handled
- Helpful error messages
- Suggestions for corrections

---

## Phase 9: Performance & Optimization

### Step 19: Implement Caching

**What YOU do:**
- Monitor cache effectiveness

**What I do:**
1. Add caching layer:
   - Cache frequent queries
   - Cache session data
   - Cache track data
   - Implement TTLs
   - Cache invalidation

**Verification:**
- Caching works correctly
- Reduces API calls
- Improves response times

---

### Step 20: Implement Rate Limiting

**What YOU do:**
- Test rate limiting

**What I do:**
1. Add rate limiting:
   - Per-IP rate limiting
   - Request queuing
   - Rate limit headers
   - User-friendly messages

**Verification:**
- Rate limiting works
- Doesn't block legitimate users
- Clear error messages

---

## Phase 10: Testing & Refinement

### Step 21: Test Core Use Cases

**What YOU do:**
- Test all major use cases
- Report issues

**What I do:**
1. Test and fix:
   - Corner performance queries
   - Driver comparison queries
   - Statistical queries
   - Session info queries
   - Fix any bugs found

**Verification:**
- All core use cases work
- Responses are accurate
- No major bugs

---

### Step 22: Test Edge Cases

**What YOU do:**
- Test edge cases
- Report issues

**What I do:**
1. Test and fix:
   - Missing data scenarios
   - Invalid inputs
   - Ambiguous queries
   - Error scenarios
   - Fix any bugs found

**Verification:**
- Edge cases handled correctly
- Helpful error messages
- No crashes

---

### Step 23: Performance Testing

**What YOU do:**
- Monitor performance
- Report slow queries

**What I do:**
1. Optimize performance:
   - Optimize database queries
   - Optimize JSON file reads
   - Optimize API calls
   - Add performance monitoring

**Verification:**
- Response times < 3 seconds
- No performance issues
- Efficient resource usage

---

## Phase 11: Deployment

### Step 24: Deploy to Vercel

**What YOU do:**
1. Commit all changes
2. Push to GitHub
3. Deploy to Vercel (automatic if connected)
4. Verify environment variables are set
5. Test on production

**What I do:**
- Ensure code is ready for deployment
- Fix any deployment issues

**Verification:**
- Deployed successfully
- Environment variables set
- Works on production

---

### Step 25: Monitor & Iterate

**What YOU do:**
1. Monitor usage
2. Monitor errors
3. Monitor API usage (Gemini)
4. Collect user feedback
5. Report issues

**What I do:**
- Fix bugs as reported
- Optimize based on usage patterns
- Add improvements

**Verification:**
- Monitoring in place
- Issues are tracked
- Improvements are made

---

## Quick Start Checklist

### Before Starting
- [ ] Gemini API key obtained
- [ ] Environment variables configured
- [ ] Dependencies installed
- [ ] Code reviewed and understood

### Phase 1: Setup
- [ ] Step 1: Get Gemini API Key ✅ (You)
- [ ] Step 2: Configure Environment Variables ✅ (You)
- [ ] Step 3: Install Dependencies ✅ (Me)

### Phase 2: Infrastructure
- [ ] Step 4: Create API Route Structure ✅ (Me)
- [ ] Step 5: Define Types ✅ (Me)
- [ ] Step 6: Implement Basic API Route ✅ (Me)

### Phase 3: Query Classification
- [ ] Step 7: Implement Query Classification ✅ (Me)
- [ ] Step 8: Create System Prompts ✅ (Me)

### Phase 4: Data Queries
- [ ] Step 9: Implement Session Data Queries ✅ (Me)
- [ ] Step 10: Implement Corner Data Queries ✅ (Me)
- [ ] Step 11: Implement Driver Comparison Queries ✅ (Me)

### Phase 5: Analysis
- [ ] Step 12: Implement Data Analysis ✅ (Me)

### Phase 6: Response Generation
- [ ] Step 13: Implement Response Generation ✅ (Me)
- [ ] Step 14: Wire Everything Together ✅ (Me)

### Phase 7: Frontend
- [ ] Step 15: Create Chatbot Component ✅ (Me)
- [ ] Step 16: Add Chatbot to Main Page ✅ (Me)

### Phase 8: Error Handling
- [ ] Step 17: Implement Error Handling ✅ (Me)
- [ ] Step 18: Handle Edge Cases ✅ (Me)

### Phase 9: Optimization
- [ ] Step 19: Implement Caching ✅ (Me)
- [ ] Step 20: Implement Rate Limiting ✅ (Me)

### Phase 10: Testing
- [ ] Step 21: Test Core Use Cases ✅ (You + Me)
- [ ] Step 22: Test Edge Cases ✅ (You + Me)
- [ ] Step 23: Performance Testing ✅ (You + Me)

### Phase 11: Deployment
- [ ] Step 24: Deploy to Vercel ✅ (You)
- [ ] Step 25: Monitor & Iterate ✅ (You + Me)

---

## Testing Guide

### Test Queries to Try

#### Basic Corner Queries
1. "Who was fastest at corner 8 at Monaco 2025?"
2. "What's the fastest corner time at turn 3?"
3. "Show me all corner times for corner 5"

#### Driver Queries
4. "Which corner is VER strongest at?"
5. "Compare VER and HAM at corner 8"
6. "What's VER's average corner time?"

#### Statistical Queries
7. "What's the average corner time for slow corners?"
8. "Which corner type is fastest on average?"
9. "Compare slow, medium, and fast corner performance"

#### Edge Cases
10. "Who won corner 50?" (Invalid corner)
11. "Who won corner 5?" (Missing track)
12. "Compare XYZ and ABC" (Invalid drivers)

### Expected Results
- ✅ Returns accurate data
- ✅ Handles missing data gracefully
- ✅ Provides helpful error messages
- ✅ Suggests corrections for invalid inputs
- ✅ Response time < 3 seconds

---

## Troubleshooting

### Common Issues

#### Issue: API Key Not Working
**Solution**: 
- Verify API key is correct
- Check environment variables are set
- Ensure key has proper permissions

#### Issue: Rate Limiting
**Solution**:
- Implement caching
- Reduce API calls
- Use request queuing

#### Issue: Slow Responses
**Solution**:
- Optimize database queries
- Add caching
- Optimize JSON file reads

#### Issue: Missing Data
**Solution**:
- Verify data exists in database/JSON
- Check session/track/year are correct
- Handle missing data gracefully

---

## Next Steps After Implementation

1. **Monitor Usage**: Track API usage, response times, errors
2. **Collect Feedback**: Get user feedback on responses
3. **Iterate**: Improve based on usage patterns
4. **Add Features**: Add more advanced features as needed
5. **Optimize**: Continue optimizing performance

---

## Support

If you encounter issues:
1. Check the troubleshooting section
2. Review error logs
3. Test with sample queries
4. Verify environment variables
5. Check API key permissions

---

**Ready to start? Begin with Step 1!**








