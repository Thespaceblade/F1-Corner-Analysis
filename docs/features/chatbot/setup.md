# Chatbot Setup - Next Steps

## ✅ What's Been Completed

1. **API Key Configured**: Your Gemini API key is set in `.env.local`
2. **Dependencies Installed**: `@google/generative-ai` package installed
3. **All Code Files Created**: 
   - `/app/api/chat/route.ts` - Main API endpoint
   - `/lib/chatbot/types.ts` - Type definitions
   - `/lib/chatbot/prompts.ts` - System prompts
   - `/lib/chatbot/queryClassifier.ts` - Query classification
   - `/lib/chatbot/queryExecutor.ts` - Data queries
   - `/lib/chatbot/responseGenerator.ts` - Response generation

4. **Import Paths Fixed**: Corrected relative import paths

## 🚀 Next Steps

### 1. Restart the Dev Server

The dev server needs to be restarted to pick up the new files. Run:

```bash
npm run dev
```

### 2. Test the API

Once the server is running, test the API with:

```bash
# Test with a simple query
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"query": "Hello, what can you help me with?"}'

# Test with a corner performance query
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"query": "Who was fastest at corner 8 at Monaco 2025?"}'
```

### 3. Set Up Vercel Environment Variables

For production deployment, add the API key to Vercel:

1. Go to your Vercel project dashboard
2. Navigate to **Settings → Environment Variables**
3. Add:
   - **Key**: `GEMINI_API_KEY`
   - **Value**: `AIzaSyBHdgoTranuOCDaIPUfVuucFmYmU3ADeZs`
   - **Environments**: Production, Preview, Development (check all)
4. Save and redeploy

## 📝 Current Status

- ✅ Backend API is ready
- ✅ All core functionality implemented
- ⏳ Frontend component (next step)
- ⏳ Integration with main page (next step)

## 🧪 Test Queries

Try these queries once the server is running:

1. **General**: "Hello, what can you help me with?"
2. **Corner Performance**: "Who was fastest at corner 8 at Monaco 2025?"
3. **Driver Comparison**: "Compare VER and HAM at corner 3 at Monaco 2025"
4. **Driver Performance**: "Which corner is VER strongest at Monaco 2025?"
5. **Session Info**: "What sessions are available for Monaco 2025?"

## 🐛 Troubleshooting

If you encounter errors:

1. **Module not found**: Make sure the dev server is restarted
2. **API key error**: Verify `.env.local` exists and contains `GEMINI_API_KEY`
3. **Data not found**: Ensure session data exists in `public/data/sessions/`
4. **Build errors**: Clear `.next` cache: `rm -rf .next`

## 📚 Documentation

- Full plan: `docs/chatbot-integration-plan.md`
- Use cases: `docs/chatbot-use-cases.md`
- Step-by-step guide: `docs/chatbot-implementation-steps.md`
- Setup status: `docs/chatbot-setup-status.md`

---

**Ready to test! Restart the dev server and try the API endpoint.**


