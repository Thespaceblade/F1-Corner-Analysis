/**
 * Test script to verify Australia data loading works correctly
 * Tests loading all drivers, all sessions, and corner data
 */

const testApiEndpoint = async (url, description) => {
  console.log(`\n🧪 Testing: ${description}`);
  console.log(`   URL: ${url}`);
  
  const startTime = Date.now();
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 35000); // 35 second timeout
    
    const response = await fetch(url, { 
      signal: controller.signal,
      headers: {
        'Accept': 'application/json'
      }
    });
    
    clearTimeout(timeoutId);
    const elapsed = Date.now() - startTime;
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`   ❌ Failed: ${response.status} ${response.statusText}`);
      console.error(`   Error: ${errorText.substring(0, 200)}`);
      return false;
    }
    
    const data = await response.json();
    const dataSize = JSON.stringify(data).length;
    
    console.log(`   ✅ Success (${elapsed}ms, ${(dataSize / 1024).toFixed(2)}KB)`);
    
    // Check data structure
    if (data.meta) {
      console.log(`   📊 Meta: ${data.meta.year}/${data.meta.round}/${data.meta.session}`);
      console.log(`   👥 Drivers: ${Object.keys(data.drivers || {}).length}`);
      console.log(`   🏁 Laps: ${(data.laps || []).length}`);
      console.log(`   🎯 Corners: ${Object.keys(data.corners || {}).length} drivers with corner data`);
      
      if (data.meta.availableDrivers) {
        console.log(`   📋 Available drivers: ${data.meta.availableDrivers.length}`);
      }
      
      // Check if corners are loaded
      const driversWithCorners = Object.keys(data.corners || {}).filter(
        driver => data.corners[driver] && data.corners[driver].length > 0
      );
      console.log(`   🎯 Drivers with corner data: ${driversWithCorners.length}`);
      
      if (driversWithCorners.length === 0 && Object.keys(data.drivers || {}).length > 0) {
        console.warn(`   ⚠️  WARNING: No corner data found for any drivers!`);
      }
    }
    
    return true;
  } catch (error) {
    const elapsed = Date.now() - startTime;
    if (error.name === 'AbortError') {
      console.error(`   ❌ Timeout after ${elapsed}ms`);
    } else {
      console.error(`   ❌ Error: ${error.message}`);
    }
    return false;
  }
};

const runTests = async () => {
  console.log('🚀 Starting Australia Data Loading Tests\n');
  console.log('=' .repeat(60));
  
  const baseUrl = process.env.API_URL || 'http://localhost:3000';
  const year = '2025';
  const round = 'australia';
  
  const tests = [
    // Test session index
    {
      url: `${baseUrl}/api/sessions/index`,
      description: 'Session Index (all sessions)'
    },
    // Test loading Q session without driver filter (all drivers)
    {
      url: `${baseUrl}/api/sessions/${year}/${round}/Q`,
      description: 'Qualifying Session - All Drivers'
    },
    // Test loading Q session with specific drivers
    {
      url: `${baseUrl}/api/sessions/${year}/${round}/Q?drivers=VER,NOR`,
      description: 'Qualifying Session - VER, NOR only'
    },
    // Test loading R session (all drivers)
    {
      url: `${baseUrl}/api/sessions/${year}/${round}/R`,
      description: 'Race Session - All Drivers'
    },
    // Test loading FP1 session
    {
      url: `${baseUrl}/api/sessions/${year}/${round}/FP1`,
      description: 'Free Practice 1 - All Drivers'
    },
    // Test loading FP2 session
    {
      url: `${baseUrl}/api/sessions/${year}/${round}/FP2`,
      description: 'Free Practice 2 - All Drivers'
    },
    // Test loading FP3 session
    {
      url: `${baseUrl}/api/sessions/${year}/${round}/FP3`,
      description: 'Free Practice 3 - All Drivers'
    },
  ];
  
  const results = [];
  for (const test of tests) {
    const success = await testApiEndpoint(test.url, test.description);
    results.push({ ...test, success });
    
    // Small delay between tests to avoid overwhelming the server
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('\n📊 Test Results Summary:');
  console.log('='.repeat(60));
  
  const passed = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  console.log(`✅ Passed: ${passed}/${results.length}`);
  console.log(`❌ Failed: ${failed}/${results.length}`);
  
  if (failed > 0) {
    console.log('\n❌ Failed Tests:');
    results.filter(r => !r.success).forEach(r => {
      console.log(`   - ${r.description}`);
    });
    process.exit(1);
  } else {
    console.log('\n🎉 All tests passed!');
    process.exit(0);
  }
};

// Check if we're running in Node.js environment
if (typeof fetch === 'undefined') {
  console.error('❌ This script requires Node.js 18+ with fetch support');
  console.error('   Or install node-fetch: npm install node-fetch');
  process.exit(1);
}

runTests().catch(error => {
  console.error('❌ Test runner error:', error);
  process.exit(1);
});


