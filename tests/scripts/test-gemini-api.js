// Test script to verify Gemini API is working
// Run with: node test-gemini-api.js

const fs = require('fs');
const path = require('path');

// Read .env.local file
function loadEnv() {
  const envPath = path.join(__dirname, '.env.local');
  if (fs.existsSync(envPath)) {
    const envFile = fs.readFileSync(envPath, 'utf8');
    const lines = envFile.split('\n');
    for (const line of lines) {
      const match = line.match(/^([^=]+)=(.*)$/);
      if (match) {
        process.env[match[1].trim()] = match[2].trim();
      }
    }
  }
}

loadEnv();

const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testGeminiAPI() {
  console.log('Testing Gemini API...\n');
  
  // Check if API key is set
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('❌ ERROR: GEMINI_API_KEY not found in .env.local');
    console.log('Please add GEMINI_API_KEY to .env.local file');
    process.exit(1);
  }
  
  console.log('✅ API Key found:', apiKey.substring(0, 10) + '...');
  console.log('');
  
  try {
    // Initialize the client
    const genAI = new GoogleGenerativeAI(apiKey);
    console.log('✅ GoogleGenerativeAI client initialized');
    
    // Test different model names
    const modelsToTest = [
      'gemini-1.5-flash',
      'gemini-1.5-flash-latest',
      'gemini-2.5-flash',
      'gemini-2.5-flash-latest',
      'gemini-pro',
      'gemini-pro-latest'
    ];
    
    const prompt = 'Say "Hello, Gemini API is working!" in one sentence.';
    let workingModel = null;
    
    console.log('\nTesting available models...\n');
    
    for (const modelName of modelsToTest) {
      try {
        console.log(`Testing ${modelName}...`);
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        console.log(`✅ ${modelName} works!`);
        console.log(`📥 Response: ${text}`);
        console.log('');
        
        if (!workingModel) {
          workingModel = modelName;
        }
      } catch (error) {
        console.log(`❌ ${modelName} failed: ${error.message.substring(0, 100)}...`);
      }
    }
    
    if (workingModel) {
      console.log('\n✅ Found working model:', workingModel);
      console.log('\nSummary:');
      console.log('- API Key: ✅ Set');
      console.log('- SDK: ✅ Installed and working');
      console.log('- Working Model: ✅', workingModel);
      console.log('\n⚠️  IMPORTANT: Update your code to use:', workingModel);
    } else {
      console.log('\n❌ No working models found. Check your API key and permissions.');
    }
    
  } catch (error) {
    console.error('❌ ERROR:', error.message);
    console.error('');
    console.error('Common issues:');
    console.error('1. API key is invalid or expired');
    console.error('2. API key doesn\'t have proper permissions');
    console.error('3. Network connectivity issues');
    console.error('4. Rate limiting (wait a moment and try again)');
    console.error('');
    console.error('Full error:', error);
    process.exit(1);
  }
}

testGeminiAPI();

