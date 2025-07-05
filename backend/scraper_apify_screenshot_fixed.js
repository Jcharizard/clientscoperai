const { ApifyClient } = require('apify-client');
const fs = require('fs');
const path = require('path');

// Configuration
const APIFY_API_TOKEN = 'apify_api_HJa9lcDjWnUnq9wrR2hRtahmdOMtfp2AHEtC';
const SCREENSHOTS_DIR = path.join(__dirname, 'screenshots');
const LOGS_DIR = path.join(__dirname, 'logs');
const ERROR_LOG = path.join(LOGS_DIR, 'screenshot_fixed_errors.log');

// Initialize Apify client
const apifyClient = new ApifyClient({
  token: APIFY_API_TOKEN
});

// Ensure directories exist
if (!fs.existsSync(SCREENSHOTS_DIR)) fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
if (!fs.existsSync(LOGS_DIR)) fs.mkdirSync(LOGS_DIR, { recursive: true });

function logError(msg) {
  try {
    fs.appendFileSync(ERROR_LOG, `[${new Date().toISOString()}] ${msg}\n`);
    console.log(`[FIXED_SCREENSHOT] ${msg}`);
  } catch (e) {
    console.error('Failed to write to error log:', e);
  }
}

// Test 1: Simple Website (not Instagram) - baseline test
async function testBasicWebsiteScreenshot() {
  try {
    logError(`🧪 BASELINE TEST: Testing screenshot on a simple website`);
    
    const input = {
      url: "https://example.com",
      waitUntil: "load",
      delay: 1000,
      viewportWidth: 1366
    };
    
    logError(`📡 Starting baseline screenshot test: ${JSON.stringify(input)}`);
    
    const run = await apifyClient.actor('apify/screenshot-url').call(input);
    logError(`✅ Baseline screenshot completed. Run ID: ${run.id}`);
    
    // Get the screenshot from key-value store
    const { items } = await apifyClient.keyValueStore(run.defaultKeyValueStoreId).listKeys();
    logError(`📋 Baseline KV items: ${JSON.stringify(items.map(item => item.key))}`);
    
    // Try to get OUTPUT
    try {
      const screenshotBuffer = await apifyClient.keyValueStore(run.defaultKeyValueStoreId).getRecord('OUTPUT');
      
      if (screenshotBuffer && screenshotBuffer.body) {
        const filename = `baseline_example.png`;
        const filepath = path.join(SCREENSHOTS_DIR, filename);
        
        fs.writeFileSync(filepath, screenshotBuffer.body);
        
        const stats = fs.statSync(filepath);
        logError(`📸 ✅ Baseline screenshot saved: ${filename} (${(stats.size/1024).toFixed(1)}KB)`);
        
        return filepath;
      }
    } catch (e) {
      logError(`⚠️ OUTPUT record error: ${e.message}`);
    }
    
    logError(`❌ No baseline screenshot found`);
    return null;
    
  } catch (error) {
    logError(`❌ Baseline test failed: ${error.message}`);
    return null;
  }
}

// Test 2: Fixed Website Content Crawler
async function testFixedWebsiteContentCrawler(username) {
  try {
    const profileUrl = `https://www.instagram.com/${username}/`;
    
    logError(`🧪 FIXED TEST: Website Content Crawler for ${username}`);
    
    const input = {
      startUrls: [{ url: profileUrl }],
      crawlerType: "playwright:chrome", // Fixed: correct crawler type
      maxCrawlDepth: 0,
      maxCrawlPages: 1,
      proxyConfiguration: { useApifyProxy: true },
      readableTextCharThreshold: 100,
      removeCookieWarnings: true,
      clickElementsCssSelector: "[aria-label*='Accept'], [aria-label*='OK'], .cookie-accept",
      // Try different screenshot approaches
      saveScreenshots: true,
      saveHtml: true
    };
    
    logError(`📡 Starting fixed Website Content Crawler: ${JSON.stringify(input)}`);
    
    const run = await apifyClient.actor('apify/website-content-crawler').call(input);
    logError(`✅ Fixed crawler completed. Run ID: ${run.id}`);
    
    // Check dataset
    const { items: datasetItems } = await apifyClient.dataset(run.defaultDatasetId).listItems();
    logError(`📋 Dataset items: ${datasetItems.length}`);
    
    if (datasetItems.length > 0) {
      const result = datasetItems[0];
      logError(`📊 Crawler data keys: ${Object.keys(result)}`);
      logError(`📊 Full result: ${JSON.stringify(result, null, 2)}`);
    }
    
    // Check key-value store more thoroughly
    const { items: kvItems } = await apifyClient.keyValueStore(run.defaultKeyValueStoreId).listKeys();
    logError(`📋 KV store items: ${JSON.stringify(kvItems)}`);
    
    // Try all items in KV store
    for (const item of kvItems) {
      logError(`🔍 Checking KV item: ${item.key} (size: ${item.size})`);
      
      if (item.size > 10000) { // Likely an image if > 10KB
        try {
          const data = await apifyClient.keyValueStore(run.defaultKeyValueStoreId).getRecord(item.key);
          
          if (data && data.body) {
            const filename = `${username}_crawler_${item.key}.png`;
            const filepath = path.join(SCREENSHOTS_DIR, filename);
            
            fs.writeFileSync(filepath, data.body);
            
            const stats = fs.statSync(filepath);
            logError(`📸 ✅ Crawler file saved: ${filename} (${(stats.size/1024).toFixed(1)}KB)`);
            
            return filepath;
          }
        } catch (e) {
          logError(`⚠️ Error reading ${item.key}: ${e.message}`);
        }
      }
    }
    
    logError(`❌ No screenshot found in fixed crawler for ${username}`);
    return null;
    
  } catch (error) {
    logError(`❌ Fixed crawler failed: ${error.message}`);
    return null;
  }
}

// Test 3: Instagram with different approach
async function testInstagramAlternativeUrls(username) {
  const alternativeUrls = [
    `https://www.instagram.com/${username}/`,
    `https://instagram.com/${username}/`,
    `https://www.instagram.com/${username}`,
    `https://instagram.com/${username}`,
    `https://m.instagram.com/${username}/`
  ];
  
  for (const url of alternativeUrls) {
    try {
      logError(`🧪 ALTERNATIVE TEST: Testing ${url}`);
      
      const input = {
        url: url,
        waitUntil: "load", // Change from networkidle0 to load
        delay: 2000,
        viewportWidth: 375, // Mobile width - might work better
        viewportHeight: 812,
        scrollToBottom: false // Don't scroll
      };
      
      logError(`📡 Starting alternative URL test: ${JSON.stringify(input)}`);
      
      const run = await apifyClient.actor('apify/screenshot-url').call(input);
      logError(`✅ Alternative test completed. Run ID: ${run.id}`);
      
      // Check everything in KV store
      const { items } = await apifyClient.keyValueStore(run.defaultKeyValueStoreId).listKeys();
      logError(`📋 KV items for ${url}: ${JSON.stringify(items)}`);
      
      for (const item of items) {
        if (item.size > 5000) { // Any reasonably sized file
          try {
            const data = await apifyClient.keyValueStore(run.defaultKeyValueStoreId).getRecord(item.key);
            
            if (data && data.body) {
              const urlSafe = url.replace(/[^a-zA-Z0-9]/g, '_');
              const filename = `${username}_alt_${urlSafe}_${item.key}.png`;
              const filepath = path.join(SCREENSHOTS_DIR, filename);
              
              fs.writeFileSync(filepath, data.body);
              
              const stats = fs.statSync(filepath);
              logError(`📸 ✅ Alternative screenshot saved: ${filename} (${(stats.size/1024).toFixed(1)}KB)`);
              
              if (stats.size > 20000) { // Substantial file
                logError(`🎯 PROMISING: ${filename} is substantial (${(stats.size/1024).toFixed(1)}KB)`);
                return filepath;
              }
            }
          } catch (e) {
            logError(`⚠️ Error with ${item.key}: ${e.message}`);
          }
        }
      }
      
    } catch (error) {
      logError(`❌ Alternative URL failed ${url}: ${error.message}`);
    }
    
    // Small delay between attempts
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  return null;
}

// Test 4: Try non-Instagram social media as comparison
async function testCompareSocialMedia() {
  const testUrls = [
    "https://twitter.com/nasa",
    "https://www.linkedin.com/company/nasa",
    "https://www.facebook.com/NASA"
  ];
  
  for (const url of testUrls) {
    try {
      logError(`🧪 COMPARE TEST: Testing ${url}`);
      
      const input = {
        url: url,
        waitUntil: "load",
        delay: 3000,
        viewportWidth: 1366
      };
      
      const run = await apifyClient.actor('apify/screenshot-url').call(input);
      logError(`✅ Compare test completed for ${url}. Run ID: ${run.id}`);
      
      const { items } = await apifyClient.keyValueStore(run.defaultKeyValueStoreId).listKeys();
      
      for (const item of items) {
        if (item.size > 10000) {
          try {
            const data = await apifyClient.keyValueStore(run.defaultKeyValueStoreId).getRecord(item.key);
            
            if (data && data.body) {
              const platform = url.includes('twitter') ? 'twitter' : url.includes('linkedin') ? 'linkedin' : 'facebook';
              const filename = `compare_${platform}_${item.key}.png`;
              const filepath = path.join(SCREENSHOTS_DIR, filename);
              
              fs.writeFileSync(filepath, data.body);
              
              const stats = fs.statSync(filepath);
              logError(`📸 ✅ Compare screenshot: ${filename} (${(stats.size/1024).toFixed(1)}KB)`);
            }
          } catch (e) {
            logError(`⚠️ Compare error: ${e.message}`);
          }
        }
      }
      
    } catch (error) {
      logError(`❌ Compare test failed: ${error.message}`);
    }
  }
}

// Main test function
async function runFixedScreenshotTests() {
  logError(`🚀 Starting FIXED Apify Screenshot Tests`);
  
  // Test 1: Baseline test with simple website
  logError(`\n=== BASELINE TEST ===`);
  const baselineResult = await testBasicWebsiteScreenshot();
  
  if (baselineResult) {
    logError(`✅ Baseline test PASSED - screenshot capability confirmed`);
  } else {
    logError(`❌ Baseline test FAILED - screenshot functionality may be broken`);
  }
  
  // Test 2: Compare with other social media
  logError(`\n=== SOCIAL MEDIA COMPARISON ===`);
  await testCompareSocialMedia();
  
  // Test 3: Fixed Instagram tests
  const username = 'nasa';
  logError(`\n=== INSTAGRAM TESTS for ${username} ===`);
  
  // Test fixed website content crawler
  const crawlerResult = await testFixedWebsiteContentCrawler(username);
  
  // Test alternative Instagram URLs
  const altResult = await testInstagramAlternativeUrls(username);
  
  // Summary
  const results = [baselineResult, crawlerResult, altResult].filter(r => r !== null);
  logError(`\n📊 FINAL SUMMARY: ${results.length}/3 main tests succeeded`);
  
  if (results.length > 0) {
    logError(`✅ Successful screenshots: ${results.join(', ')}`);
    
    // Analyze what worked
    for (const filepath of results) {
      const stats = fs.statSync(filepath);
      const filename = path.basename(filepath);
      
      logError(`📏 Analysis - ${filename}: ${(stats.size/1024).toFixed(1)}KB`);
      
      if (filename.includes('baseline')) {
        logError(`🔍 Baseline screenshot confirmed Apify can take screenshots`);
      }
      
      if (filename.includes('instagram') && stats.size > 50000) {
        logError(`🎯 🎯 POTENTIAL INSTAGRAM SUCCESS: ${filename} (${(stats.size/1024).toFixed(1)}KB)`);
      }
    }
  } else {
    logError(`❌ No screenshots captured`);
  }
  
  logError(`\n🏁 Fixed screenshot tests completed!`);
  logError(`📁 Check screenshots: ${SCREENSHOTS_DIR}`);
}

// Export for use
module.exports = {
  runFixedScreenshotTests,
  testBasicWebsiteScreenshot,
  testFixedWebsiteContentCrawler,
  testInstagramAlternativeUrls,
  testCompareSocialMedia
};

// Run tests if called directly
if (require.main === module) {
  runFixedScreenshotTests().catch(error => {
    logError(`💥 Fatal error: ${error.message}`);
    console.error(error);
    process.exit(1);
  });
} 