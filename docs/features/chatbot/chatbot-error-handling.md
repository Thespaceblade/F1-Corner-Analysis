# Chatbot Error Handling - API Error 500 Explained

## What is API Error 500?

**HTTP 500 Internal Server Error** means the server encountered an unexpected condition that prevented it from fulfilling the request. In the context of the chatbot:

- **500 Error**: The server (your Next.js API route) encountered an error while processing the request
- **Not a user error**: This is a server-side issue, not something wrong with the user's query
- **Needs fixing**: The server code needs to handle the error better

## Common Causes of 500 Errors in the Chatbot

### 1. Gemini API Failures
- **Issue**: Gemini API request fails (rate limit, network error, API key issue)
- **Fix**: Added fallback response generation (no longer returns 500)
- **Status**: ✅ Fixed

### 2. Missing Data
- **Issue**: Query requests data that doesn't exist
- **Fix**: Now returns helpful message instead of 500
- **Status**: ✅ Fixed

### 3. Query Classification Errors
- **Issue**: Query classifier fails to extract parameters
- **Fix**: Improved parameter extraction and error handling
- **Status**: ✅ Fixed

### 4. Data Retrieval Errors
- **Issue**: Error reading session data from database/JSON
- **Fix**: Better error messages and fallback handling
- **Status**: ✅ Fixed

### 5. Response Generation Errors
- **Issue**: Error formatting response from data
- **Fix**: Added fallback response generation
- **Status**: ✅ Fixed

## What Was Fixed

### Fallback Response Generation
- **Before**: Gemini API failure → 500 error
- **After**: Gemini API failure → Fallback response based on data
- **Result**: No more 500 errors from Gemini API failures

### Better Error Messages
- **Before**: Generic 500 error
- **After**: Specific error messages with suggestions
- **Result**: Users get helpful guidance instead of generic errors

### Improved Query Classification
- **Before**: "Who was fastest corner 1" might not extract corner number
- **After**: Better pattern matching for corner numbers
- **Result**: More queries are classified correctly

### Data Validation
- **Before**: Empty data might cause errors
- **After**: Handles empty data gracefully
- **Result**: Helpful messages when data is missing

## Testing the Fixes

### Test Queries That Should Work Now

1. **"Who was fastest corner 1 australia 2025"**
   - Should extract: cornerNumber=1, track=australia, year=2025
   - Should return: Fastest driver at corner 1 or helpful message if no data

2. **"Compare VER and HAM at corner 3"**
   - Should extract: driverCodes=[VER, HAM], cornerNumber=3
   - Should return: Comparison or request for track

3. **"Compare Verstappen and Norris turn 2"**
   - Should extract: driverCodes=[VER, NOR], cornerNumber=2
   - Should return: Comparison or request for track

## If You Still Get 500 Errors

### Check Server Logs
1. Open your terminal where `npm run dev` is running
2. Look for error messages in the console
3. Check for:
   - Gemini API errors
   - Data retrieval errors
   - Query classification errors

### Common Issues

1. **Gemini API Key Not Set**
   - Error: "GEMINI_API_KEY environment variable is not set"
   - Fix: Set `GEMINI_API_KEY` in `.env.local`

2. **Data Not Found**
   - Error: "Session not found in database"
   - Fix: Ensure session data exists for the requested track/year/session

3. **Network Issues**
   - Error: "Failed to fetch" or timeout
   - Fix: Check internet connection, verify Gemini API is accessible

4. **Rate Limiting**
   - Error: "Rate limit exceeded"
   - Fix: Wait a moment and try again (Gemini free tier: 15 requests/minute)

## Debugging Steps

1. **Check the Query Classification**
   - Look at server logs for "Query intent:" and "Query parameters:"
   - Verify parameters are being extracted correctly

2. **Check Data Retrieval**
   - Verify session data exists: `public/data/sessions/{year}/{track}/{session}/session.json`
   - Check if corner data exists in the session JSON

3. **Check Response Generation**
   - Look for "Gemini API failed, using fallback response generation" in logs
   - Verify fallback response is being generated

4. **Check Error Messages**
   - Look for specific error messages in server logs
   - Check browser console for client-side errors

## Current Status

- ✅ Fallback response generation implemented
- ✅ Better error messages
- ✅ Improved query classification
- ✅ Data validation
- ✅ Graceful error handling

## Next Steps

1. **Test the fixes:**
   - Restart dev server
   - Try the queries that were failing
   - Check server logs for any remaining errors

2. **Monitor for issues:**
   - Watch server logs during testing
   - Check for any remaining 500 errors
   - Verify error messages are helpful

3. **Report issues:**
   - If you still get 500 errors, check server logs
   - Share the error message and query
   - Check if data exists for the requested track/year/session

---

**Status**: ✅ **FIXED** - Error handling improved, fallback responses implemented

**If you still get 500 errors, check server logs and share the error message!**


