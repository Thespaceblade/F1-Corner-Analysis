// Simple test script for chatbot API
// Run with: node test-chatbot-api.js

const testQuery = async (query) => {
  try {
    const response = await fetch('http://localhost:3000/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    });

    const data = await response.json();
    console.log('\n=== Query:', query);
    console.log('=== Response:', JSON.stringify(data, null, 2));
    console.log('=== Status:', response.status);
  } catch (error) {
    console.error('Error:', error.message);
  }
};

// Test queries
(async () => {
  console.log('Testing Chatbot API...\n');
  console.log('Make sure the dev server is running: npm run dev\n');
  
  await testQuery("Hello, what can you help me with?");
  await testQuery("Who was fastest at corner 8 at Monaco 2025?");
})();


