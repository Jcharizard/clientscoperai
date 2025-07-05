// 🍪 Instagram Cookie Extractor
// Run this script to automatically extract your Instagram cookies

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

class CookieExtractor {
  constructor() {
    this.cookies = [];
  }

  async extractCookies() {
    console.log('🚀 Starting Instagram cookie extraction...');
    console.log('⚠️  You will need to manually login to Instagram');
    
    const browser = await puppeteer.launch({
      headless: false, // Show browser for manual login
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage'
      ]
    });

    try {
      const page = await browser.newPage();
      
      // Go to Instagram login
      console.log('📱 Opening Instagram login page...');
      await page.goto('https://www.instagram.com/accounts/login/', {
        waitUntil: 'networkidle2'
      });

      console.log('🔐 Please login to Instagram in the browser window that opened');
      console.log('⏳ Waiting for successful login...');
      
      // Wait for login success (redirect to main page)
      await page.waitForNavigation({
        waitUntil: 'networkidle2',
        timeout: 300000 // 5 minutes to login
      });

      // Check if we're actually logged in
      const currentUrl = page.url();
      if (currentUrl.includes('/accounts/login') || currentUrl.includes('/challenge')) {
        throw new Error('Login was not successful. Please try again.');
      }

      console.log('✅ Login successful! Extracting cookies...');

      // Extract cookies
      const allCookies = await page.cookies();
      const instagramDomain = allCookies.filter(cookie => 
        cookie.domain.includes('instagram.com')
      );

      // Find the important cookies
      const sessionid = instagramDomain.find(c => c.name === 'sessionid')?.value;
      const ds_user_id = instagramDomain.find(c => c.name === 'ds_user_id')?.value;
      const csrftoken = instagramDomain.find(c => c.name === 'csrftoken')?.value;

      if (!sessionid || !ds_user_id || !csrftoken) {
        throw new Error('Could not find required Instagram cookies. Please ensure you are fully logged in.');
      }

      console.log('🍪 Extracted cookies:');
      console.log(`   sessionid: ${sessionid.substring(0, 20)}...`);
      console.log(`   ds_user_id: ${ds_user_id}`);
      console.log(`   csrftoken: ${csrftoken.substring(0, 20)}...`);

      // Create cookie object
      const extractedCookie = {
        sessionid,
        ds_user_id,
        csrftoken
      };

      // Save to settings.json
      await this.updateSettingsFile(extractedCookie);
      
      console.log('✅ Cookies successfully saved to settings.json!');
      console.log('🚀 You can now run your scraper - it should work perfectly!');

    } catch (error) {
      console.error('❌ Cookie extraction failed:', error.message);
      console.log('💡 Manual extraction instructions:');
      console.log('   1. Open Instagram in Chrome');
      console.log('   2. Login to your account');
      console.log('   3. Press F12 → Application → Cookies → instagram.com');
      console.log('   4. Copy sessionid, ds_user_id, and csrftoken values');
      console.log('   5. Paste them into backend/settings.json');
    } finally {
      await browser.close();
    }
  }

  async updateSettingsFile(newCookie) {
    const settingsPath = path.join(__dirname, 'settings.json');
    
    try {
      // Read current settings
      const settingsData = fs.readFileSync(settingsPath, 'utf8');
      const settings = JSON.parse(settingsData);

      // Update first cookie slot with extracted data
      if (settings.cookies && settings.cookies.length > 0) {
        settings.cookies[0] = newCookie;
        console.log('🔄 Updated first cookie slot in settings.json');
      } else {
        // Create cookies array if it doesn't exist
        settings.cookies = [newCookie];
        console.log('🆕 Created cookies array in settings.json');
      }

      // Write back to file
      fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
      console.log('💾 Settings.json updated successfully!');
      
    } catch (error) {
      console.error('❌ Failed to update settings.json:', error.message);
      
      // Fallback: print the cookie for manual copying
      console.log('\n📋 Copy this cookie data manually:');
      console.log(JSON.stringify(newCookie, null, 2));
    }
  }
}

// Run the extractor
if (require.main === module) {
  const extractor = new CookieExtractor();
  extractor.extractCookies().catch(console.error);
}

module.exports = CookieExtractor; 