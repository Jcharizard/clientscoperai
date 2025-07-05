const { ApifyClient } = require('apify-client');
const fs = require('fs');
const path = require('path');

const APIFY_API_TOKEN = 'apify_api_HJa9lcDjWnUnq9wrR2hRtahmdOMtfp2AHEtC';
const SCREENSHOTS_DIR = path.join(__dirname, 'screenshots');
const LOGS_DIR = path.join(__dirname, 'logs');

const apifyClient = new ApifyClient({
  token: APIFY_API_TOKEN
});

// Ensure directories exist
if (!fs.existsSync(SCREENSHOTS_DIR)) fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
if (!fs.existsSync(LOGS_DIR)) fs.mkdirSync(LOGS_DIR, { recursive: true });

function log(msg) {
  console.log(`[WORKING_SCREENSHOT] ${msg}`);
}

// Test the working method with different Instagram approaches
async function testWorkingMethod(username) {
  try {
    const profileUrl = `https://www.instagram.com/${username}/`;
    
    log(`🎯 Testing WORKING method for Instagram user: ${username}`);
    log(`📡 URL: ${profileUrl}`);
    
    // This configuration WORKED in our test
    const input = {
      startUrls: [{ url: profileUrl }],
      crawlerType: "playwright:chrome",
      maxCrawlDepth: 0,
      maxCrawlPages: 1,
      proxyConfiguration: { 
        useApifyProxy: true,
        groups: ['RESIDENTIAL'] // Try residential proxy group
      },
      readableTextCharThreshold: 100,
      removeCookieWarnings: true,
              clickElementsCssSelector: "[aria-label*='Accept'], [aria-label*='allow'], [data-testid*='accept'], .cookie-accept",
      saveScreenshots: true,
      saveHtml: true,
      // NEW: Try to handle login redirect
      initialCookies: [], // Clean cookies
      sessionPoolOptions: {
        maxPoolSize: 1,
        sessionOptions: {
          maxUsageCount: 1
        }
      },
      // Try different browser settings
      launchContext: {
        launchOptions: {
          headless: true,
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-web-security',
            '--disable-features=VizDisplayCompositor',
            '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
          ]
        }
      },
      requestHandlerTimeoutSecs: 60
    };
    
    log(`📡 Starting Website Content Crawler with working config...`);
    
    const run = await apifyClient.actor('apify/website-content-crawler').call(input);
    log(`✅ Crawler completed. Run ID: ${run.id}`);
    
    // Check what we got
    const { items: datasetItems } = await apifyClient.dataset(run.defaultDatasetId).listItems();
    log(`📋 Dataset items found: ${datasetItems.length}`);
    
    if (datasetItems.length > 0) {
      const result = datasetItems[0];
      
      log(`🔍 Crawled URL: ${result.crawl.loadedUrl}`);
      log(`📄 Page title: ${result.metadata.title}`);
      log(`📸 Screenshot URL: ${result.screenshotUrl || 'Not found'}`);
      log(`📊 Text length: ${result.text ? result.text.length : 0} chars`);
      
      // If we have a screenshot URL, that means screenshot was taken
      if (result.screenshotUrl) {
        log(`🎯 SCREENSHOT CAPTURED! URL: ${result.screenshotUrl}`);
        
        // Try to download it
        try {
          const response = await fetch(result.screenshotUrl);
          if (response.ok) {
            const buffer = await response.arrayBuffer();
            const filename = `${username}_working_method.jpg`;
            const filepath = path.join(SCREENSHOTS_DIR, filename);
            
            fs.writeFileSync(filepath, Buffer.from(buffer));
            
            const stats = fs.statSync(filepath);
            log(`📸 ✅ Screenshot downloaded: ${filename} (${(stats.size/1024).toFixed(1)}KB)`);
            
            return {
              success: true,
              filepath,
              url: result.crawl.loadedUrl,
              title: result.metadata.title,
              size: stats.size
            };
          }
        } catch (e) {
          log(`⚠️ Download error: ${e.message}`);
        }
      }
      
      // Check KV store manually
      const { items: kvItems } = await apifyClient.keyValueStore(run.defaultKeyValueStoreId).listKeys();
      log(`📋 KV store items: ${kvItems.length}`);
      
      for (const item of kvItems) {
        log(`🔍 KV item: ${item.key} (${item.size} bytes)`);
        
        if (item.key.includes('SCREENSHOT') && item.size > 5000) {
          try {
            const data = await apifyClient.keyValueStore(run.defaultKeyValueStoreId).getRecord(item.key);
            
            if (data && data.body) {
              const filename = `${username}_kv_${item.key}`;
              const filepath = path.join(SCREENSHOTS_DIR, filename);
              
              fs.writeFileSync(filepath, data.body);
              
              const stats = fs.statSync(filepath);
              log(`📸 ✅ KV screenshot saved: ${filename} (${(stats.size/1024).toFixed(1)}KB)`);
              
              return {
                success: true,
                filepath,
                url: result.crawl.loadedUrl,
                title: result.metadata.title,
                size: stats.size
              };
            }
          } catch (e) {
            log(`⚠️ KV error: ${e.message}`);
          }
        }
      }
    }
    
    return { success: false };
    
  } catch (error) {
    log(`❌ Working method failed: ${error.message}`);
    return { success: false, error: error.message };
  }
}

// Test with alternative Instagram URLs and mobile
async function testAlternativeApproaches(username) {
  const approaches = [
    {
      name: 'Mobile Instagram',
      url: `https://m.instagram.com/${username}/`,
      config: {
        crawlerType: "playwright:chrome",
        launchContext: {
          launchOptions: {
            args: ['--user-agent=Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15']
          }
        }
      }
    },
    {
      name: 'Instagram without www',
      url: `https://instagram.com/${username}/`,
      config: {
        crawlerType: "playwright:chrome"
      }
    },
    {
      name: 'With your Webshare proxy',
      url: `https://www.instagram.com/${username}/`,
      config: {
        crawlerType: "playwright:chrome",
        proxyConfiguration: {
          useApifyProxy: false,
          proxyUrls: ["http://cwqmeinh-rotate:vd77k4jhsq9q@proxy.webshare.io:80"]
        }
      }
    }
  ];
  
  const results = [];
  
  for (const approach of approaches) {
    try {
      log(`\n🧪 Testing: ${approach.name}`);
      log(`📡 URL: ${approach.url}`);
      
      const input = {
        startUrls: [{ url: approach.url }],
        maxCrawlDepth: 0,
        maxCrawlPages: 1,
        readableTextCharThreshold: 100,
        removeCookieWarnings: true,
        saveScreenshots: true,
        saveHtml: true,
        requestHandlerTimeoutSecs: 30,
        ...approach.config
      };
      
      const run = await apifyClient.actor('apify/website-content-crawler').call(input);
      log(`✅ ${approach.name} completed. Run ID: ${run.id}`);
      
      const { items: datasetItems } = await apifyClient.dataset(run.defaultDatasetId).listItems();
      
      if (datasetItems.length > 0) {
        const result = datasetItems[0];
        
        log(`🔍 Loaded: ${result.crawl.loadedUrl}`);
        log(`📄 Title: ${result.metadata.title}`);
        
        if (result.screenshotUrl) {
          log(`🎯 Screenshot found: ${result.screenshotUrl}`);
          results.push({
            approach: approach.name,
            url: result.crawl.loadedUrl,
            screenshotUrl: result.screenshotUrl,
            title: result.metadata.title
          });
        }
      }
      
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 3000));
      
    } catch (error) {
      log(`❌ ${approach.name} failed: ${error.message}`);
    }
  }
  
  return results;
}

// Main test function
async function runWorkingScreenshotTest() {
  log(`🚀 Testing the WORKING screenshot method`);
  log(`🎯 Focus: Website Content Crawler (confirmed working)`);
  
  const username = 'nasa';
  
  // Test 1: The method that worked
  log(`\n=== MAIN TEST ===`);
  const mainResult = await testWorkingMethod(username);
  
  if (mainResult.success) {
    log(`🎉 SUCCESS! Screenshot captured: ${mainResult.filepath}`);
    log(`📏 Size: ${(mainResult.size/1024).toFixed(1)}KB`);
    log(`🔗 URL: ${mainResult.url}`);
    log(`📄 Title: ${mainResult.title}`);
  } else {
    log(`⚠️ Main test didn't capture screenshot`);
  }
  
  // Test 2: Alternative approaches
  log(`\n=== ALTERNATIVE APPROACHES ===`);
  const altResults = await testAlternativeApproaches(username);
  
  if (altResults.length > 0) {
    log(`✅ Alternative results: ${altResults.length}`);
    altResults.forEach((result, i) => {
      log(`${i+1}. ${result.approach}: "${result.title}" → ${result.screenshotUrl}`);
    });
  } else {
    log(`❌ No alternative screenshots captured`);
  }
  
  // Summary
  const totalSuccess = (mainResult.success ? 1 : 0) + altResults.length;
  log(`\n📊 FINAL SUMMARY: ${totalSuccess} screenshot(s) captured`);
  
  if (totalSuccess > 0) {
    log(`🎯 🎯 BREAKTHROUGH: We have working screenshot capability!`);
    log(`📁 Check screenshots directory: ${SCREENSHOTS_DIR}`);
  } else {
    log(`❌ Still investigating screenshot capture`);
  }
}

// Export for use
module.exports = {
  runWorkingScreenshotTest,
  testWorkingMethod,
  testAlternativeApproaches
};

// Run if called directly
if (require.main === module) {
  runWorkingScreenshotTest().catch(error => {
    log(`💥 Fatal error: ${error.message}`);
    console.error(error);
    process.exit(1);
  });
} 