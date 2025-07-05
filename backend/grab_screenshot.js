const { ApifyClient } = require('apify-client');
const fs = require('fs');
const path = require('path');

const APIFY_API_TOKEN = 'apify_api_HJa9lcDjWnUnq9wrR2hRtahmdOMtfp2AHEtC';
const SCREENSHOTS_DIR = path.join(__dirname, 'screenshots');

const apifyClient = new ApifyClient({
  token: APIFY_API_TOKEN
});

async function grabScreenshot() {
  try {
    // From the test output, we know the key-value store ID and screenshot key
    const storeId = 'MFusWFGNqdM5w8mTZ';
    const screenshotKey = 'SCREENSHOT-www-instagram-com-nasa--2b954f8f.jpg';
    
    console.log('🎯 Grabbing the Instagram screenshot...');
    
    const screenshotData = await apifyClient.keyValueStore(storeId).getRecord(screenshotKey);
    
    if (screenshotData && screenshotData.body) {
      const filename = 'CAPTURED_INSTAGRAM_nasa.jpg';
      const filepath = path.join(SCREENSHOTS_DIR, filename);
      
      fs.writeFileSync(filepath, screenshotData.body);
      
      const stats = fs.statSync(filepath);
      console.log(`📸 ✅ INSTAGRAM SCREENSHOT SAVED: ${filename} (${(stats.size/1024).toFixed(1)}KB)`);
      console.log(`📁 File path: ${filepath}`);
      
      if (stats.size > 10000) {
        console.log('🎯 🎯 SUCCESS: This is a substantial screenshot!');
      }
      
      return filepath;
    } else {
      console.log('❌ No screenshot data found');
      return null;
    }
    
  } catch (error) {
    console.error('💥 Error grabbing screenshot:', error.message);
    return null;
  }
}

grabScreenshot().then(result => {
  if (result) {
    console.log('🚀 SCREENSHOT CAPTURE COMPLETE!');
    console.log('📸 Check your screenshots folder');
  }
}).catch(console.error); 