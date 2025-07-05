const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const fs = require('fs');
const path = require('path');

puppeteer.use(StealthPlugin());

// 🚀 SPEED-OPTIMIZED INSTAGRAM BYPASS SCRAPER
class InstagramBypassOptimized {
  constructor() {
    this.screenshotsDir = path.join(__dirname, 'screenshots');
    this.logFile = path.join(__dirname, 'logs', 'bypass_optimized.log');
    
    // Browser pool for speed optimization - SINGLE BROWSER ONLY
    this.browserPool = [];
    this.maxBrowsers = 1; // FIXED: Only 1 browser to avoid popup issues
    this.browserInUse = new Set();
    
    // Enhanced session persistence
    this.sessionCookies = new Map();
    this.sessionHeaders = new Map();
    this.lastRequestTime = new Map();
    
    // 🍪 Cookie management for authenticated sessions
    this.currentCookie = null;
    this.cookieExpiry = null;
    
    // 🧠 SMART RATE LIMITING: Adaptive delays based on success patterns
    this.rateLimitStats = {
      successCount: 0,
      failureCount: 0,
      lastSuccessTime: 0,
      lastFailureTime: 0,
      consecutiveFailures: 0,
      consecutiveSuccesses: 0,
      baseDelay: 1000,
      maxDelay: 5000,
      minDelay: 500
    };
    
    // Proxy support removed - using Apify for proxy management
    
    if (!fs.existsSync(this.screenshotsDir)) fs.mkdirSync(this.screenshotsDir, { recursive: true });
    if (!fs.existsSync(path.dirname(this.logFile))) fs.mkdirSync(path.dirname(this.logFile), { recursive: true });
    
    // Initialize browser pool (will be dynamically resized based on workload)
    this.initializeBrowserPool(1); // Start with 1 browser
  }

  log(message) {
    const timestamp = new Date().toISOString();
    const logMsg = `[${timestamp}] ${message}`;
    console.log(logMsg);
    try {
      fs.appendFileSync(this.logFile, logMsg + '\n');
    } catch (e) {
      console.error('Failed to write log:', e);
    }
  }

  // 🍪 Set Instagram cookie for authenticated sessions
  setCookie(cookieData) {
    this.currentCookie = cookieData;
    this.cookieExpiry = Date.now() + (2 * 60 * 60 * 1000); // 2 hour expiry
    this.log(`🍪 Cookie set for authenticated Instagram access`);
  }

  // 🍪 Apply cookies to page
  async applyCookiesToPage(page) {
    if (!this.currentCookie || Date.now() > this.cookieExpiry) {
      this.log(`🔓 No valid cookie available - using anonymous session`);
      return false;
    }

    try {
      // Handle both string and object cookie formats
      let cookieData = this.currentCookie;
      
      // If it's a string, parse it
      if (typeof cookieData === 'string') {
        const tempData = {};
        const pairs = cookieData.split(';');
        for (const pair of pairs) {
          const [name, value] = pair.trim().split('=');
          if (name && value) {
            // 🔥 FIX: Decode URL-encoded values (Instagram often URL-encodes sessionid)
            const decodedValue = decodeURIComponent(value.trim());
            tempData[name.trim()] = decodedValue;
          }
        }
        cookieData = tempData;
      }
      
      // Parse cookie data and set on page
      const cookiesToSet = [];
      
      if (cookieData.sessionid) {
        cookiesToSet.push({
          name: 'sessionid',
          value: cookieData.sessionid,
          domain: '.instagram.com',
          path: '/',
          httpOnly: true,
          secure: true,
          sameSite: 'None'
        });
      }
      
      if (cookieData.ds_user_id) {
        cookiesToSet.push({
          name: 'ds_user_id',
          value: cookieData.ds_user_id,
          domain: '.instagram.com',
          path: '/',
          secure: true,
          sameSite: 'None'
        });
      }
      
      if (cookieData.csrftoken) {
        cookiesToSet.push({
          name: 'csrftoken',
          value: cookieData.csrftoken,
          domain: '.instagram.com',
          path: '/',
          secure: true,
          sameSite: 'None'
        });
      }

      // Set additional Instagram cookies for better stealth
      cookiesToSet.push(
        { name: 'ig_cb', value: '1', domain: '.instagram.com', path: '/', secure: true },
        { name: 'ig_did', value: Date.now().toString(36) + Math.random().toString(36).substr(2), domain: '.instagram.com', path: '/', secure: true }
      );

      if (cookiesToSet.length > 0) {
        await page.setCookie(...cookiesToSet);
        this.log(`🍪 Applied ${cookiesToSet.length} cookies to page`);
        
        // 🔥 DEBUG: Log what cookies were actually applied for troubleshooting
        const appliedCookieNames = cookiesToSet.map(c => c.name).join(', ');
        this.log(`🍪 Cookie names applied: ${appliedCookieNames}`);
        
        // 🔥 DEBUG: Check if essential cookies are present
        const hasSession = cookiesToSet.some(c => c.name === 'sessionid');
        const hasUserId = cookiesToSet.some(c => c.name === 'ds_user_id');
        const hasCsrf = cookiesToSet.some(c => c.name === 'csrftoken');
        
        this.log(`🍪 Essential cookies status: sessionid=${hasSession}, ds_user_id=${hasUserId}, csrftoken=${hasCsrf}`);
        
        if (!hasSession) {
          this.log(`⚠️ WARNING: No sessionid cookie found - this might cause login issues`);
        }
        
        return true;
      }
      
    } catch (error) {
      this.log(`❌ Failed to apply cookies: ${error.message}`);
    }
    
    return false;
  }

  // 🔥 ULTRA-CONSERVATIVE BROWSER POOL - Dynamic Scaling
  async initializeBrowserPool(expectedProfiles = 1) {
    // CRITICAL: Only initialize if we don't already have a browser
    if (this.browserPool.length > 0) {
      this.log(`🔄 Browser pool already has ${this.browserPool.length} browsers - skipping initialization`);
      return;
    }
    
    // 🧠 DYNAMIC POOL SIZING: Scale based on expected workload and success rate
    const successRate = this.rateLimitStats.successCount / (this.rateLimitStats.successCount + this.rateLimitStats.failureCount) || 0.5;
    const dynamicPoolSize = Math.min(
      Math.max(1, Math.ceil(expectedProfiles / 3)), // 1 browser per 3 profiles
      successRate > 0.7 ? 2 : 1 // Use 2 browsers only if success rate is high
    );
    
    this.log(`🚀 Initializing ${dynamicPoolSize} browser for ${expectedProfiles} profiles (success rate: ${(successRate * 100).toFixed(1)}%)`);
    
    try {
      for (let i = 0; i < dynamicPoolSize; i++) {
        const browser = await this.createStealthBrowser();
        this.browserPool.push(browser);
        this.log(`✅ Browser ${i + 1} ready`);
      }
      this.browserInUse.clear(); // Clear usage tracking
      this.log(`🎉 Browser pool initialized with ${this.browserPool.length} browser (dynamic scaling)`);
      } catch (error) {
      this.log(`❌ Failed to create browser: ${error.message}`);
      }
  }

  // Get available browser from pool
  async getBrowser() {
    // Find available browser
    for (let i = 0; i < this.browserPool.length; i++) {
      if (!this.browserInUse.has(i)) {
        this.browserInUse.add(i);
        return { browser: this.browserPool[i], id: i };
      }
    }
    
    // If all busy, create temporary browser
    this.log('⚠️ All browsers busy, creating temporary browser...');
    const tempBrowser = await this.createStealthBrowser();
    
    return { browser: tempBrowser, id: -1 }; // -1 indicates temporary
  }

  // Release browser back to pool
  releaseBrowser(browserId) {
    if (browserId >= 0) {
      this.browserInUse.delete(browserId);
    }
    // Temporary browsers (id: -1) will be closed by caller
  }

  // 🚀 ULTRA-FAST Random User Agent Method (2-3 seconds)
  async takeScreenshotFast(username) {
    const { browser, id: browserId } = await this.getBrowser();
    
    try {
      this.log(`⚡ Ultra-fast method for ${username}`);
      
      const userAgents = [
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      ];
      
      const randomUA = userAgents[Math.floor(Math.random() * userAgents.length)];
      const page = await browser.newPage();
      
      // Minimal setup for maximum speed
      await page.setViewport({ width: 1366, height: 768 });
      await page.setUserAgent(randomUA);
      
      // 🍪 Apply cookies if available
      const cookieApplied = await this.applyCookiesToPage(page);
      if (cookieApplied) {
        this.log(`🍪 Using authenticated session for ${username}`);
      }
      
      // Remove automation with minimal overhead
      await page.evaluateOnNewDocument(() => {
        Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
      });

      // 🚀 SPEED OPTIMIZATION: Reduced timeout and waits
      const profileUrl = `https://www.instagram.com/${username}/`;
      
      // 🔧 ENHANCED: Add random delay before navigation to seem more human
      await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 1000));
      
      await page.goto(profileUrl, { 
        waitUntil: 'domcontentloaded', // Faster than networkidle2
        timeout: 8000 // Reduced from 20000
      });
      
      // 🚀 ENHANCED: Wait for Instagram content to fully load
      await new Promise(resolve => setTimeout(resolve, 4000)); // Even longer wait for full content
      
      // 🔍 ENHANCED: Wait for actual profile content to appear
      try {
        await page.waitForSelector('article, main, [data-testid="user-avatar"], img[alt*="profile"], h1, h2, header', { 
          timeout: 8000 
        });
        this.log(`✅ Profile content detected for ${username}`);
        
        // Additional wait for images to load
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Wait for profile image specifically
        try {
          await page.waitForSelector('img[alt*="profile"], header img, [data-testid="user-avatar"] img', {
            timeout: 3000
          });
          this.log(`✅ Profile image loaded for ${username}`);
        } catch (e) {
          this.log(`⚠️ Profile image not found, but continuing for ${username}`);
        }
        
      } catch (e) {
        this.log(`⚠️ No profile content selector found, proceeding anyway for ${username}`);
      }
      
      // Enhanced content check and bypass attempt
      const content = await page.content();
      const filename = `${username}_fast.png`;
      const filepath = path.join(this.screenshotsDir, filename);
      
      // 🚨 ENHANCED LOGIN DETECTION - Check for various Instagram login/signup indicators
      const loginIndicators = [
        'log in to instagram',
        'sign up',
        'phone number, username, or email',
        'password',
        'log in with facebook',
        'forgot password',
        'don\'t have an account',
        'get the app',
        'Log in',
        'Sign up',
        'Phone number, username, or email',
        'Password',
        'Log in with Facebook',
        'Forgot password',
        'Don\'t have an account',
        'Get the app',
        'Create an account',
        'Log In',
        'Sign Up'
      ];
      
      const hasLoginContent = loginIndicators.some(indicator => 
        content.toLowerCase().includes(indicator.toLowerCase())
      );
      
      // Check for very short content (likely error/login page)
      const isShortContent = content.length < 5000;
      
      // Check for Instagram restriction messages
      const restrictionMessages = [
        'Please wait a few minutes before you try again',
        'Sorry, this page isn\'t available',
        'User not found',
        'This account is private',
        'Challenge required',
        'Suspected automated behavior'
      ];
      
      const hasRestriction = restrictionMessages.some(msg => 
        content.toLowerCase().includes(msg.toLowerCase())
      );
      
      const isBlocked = hasLoginContent || hasRestriction || isShortContent;
      
      if (!isBlocked) {
        // 🎯 CRITICAL: Close Instagram login/signup popups before screenshot
        try {
          this.log(`🔍 Checking for Instagram popups to close...`);
          
          // Wait for potential popups to appear
          await new Promise(resolve => setTimeout(resolve, 600));
          
          // Valid CSS selectors only
          const validPopupSelectors = [
            // Instagram-specific modal close buttons
            'div[role="dialog"] button[aria-label="Close"]',
            'div[role="dialog"] svg[aria-label="Close"]',
            'div[role="dialog"] button:has(svg)',
            '[data-testid="modal-close-button"]',
            
            // General popup patterns
            'button[aria-label="Close"]',
            'svg[aria-label="Close"]', 
            'div[role="dialog"] button',
            'button[tabindex="0"]:has(svg)',
            
            // Generic close button patterns
            '.close',
            '.modal-close',
            '[aria-label="Close"]',
            
            // X button in top right
            'button[style*="position: absolute"][style*="right"]',
            'svg[style*="position: absolute"][style*="right"]'
          ];
          
          // XPath selectors for text-based buttons
          const xpathPopupSelectors = [
            "//button[contains(text(), '×')]",
            "//span[contains(text(), '×')]"
          ];
          
          let popupClosed = false;
          
          // Try CSS selectors first
          for (const selector of validPopupSelectors) {
            try {
              const elements = await page.$$(selector);
              if (elements.length > 0) {
                this.log(`🎯 Found popup close button: ${selector}`);
                await elements[0].click();
                await new Promise(resolve => setTimeout(resolve, 300));
                popupClosed = true;
                this.log(`✅ Popup closed successfully!`);
                break;
              }
            } catch (e) {
              // Continue to next selector
            }
          }
          
          // Try XPath selectors if CSS didn't work
          if (!popupClosed) {
            for (const xpath of xpathPopupSelectors) {
              try {
                const [element] = await page.$x(xpath);
                if (element) {
                  this.log(`🎯 Found popup close button (XPath): ${xpath}`);
                  await element.click();
                  await new Promise(resolve => setTimeout(resolve, 300));
                  popupClosed = true;
                  this.log(`✅ Popup closed successfully!`);
                  break;
                }
              } catch (e) {
                // Continue to next XPath
              }
            }
          }
          
          // Alternative: Press Escape key to close modals
          if (!popupClosed) {
            try {
              await page.keyboard.press('Escape');
              await new Promise(resolve => setTimeout(resolve, 300));
              this.log(`⌨️ Pressed Escape to close popups`);
            } catch (e) {
              // Continue anyway
            }
          }
          
          // Additional wait for popup to fully disappear
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // 🔍 VERIFY: Check content again after popup closing
          const updatedContent = await page.content();
          const stillHasLogin = loginIndicators.some(indicator => 
            updatedContent.toLowerCase().includes(indicator.toLowerCase())
          );
          
          if (stillHasLogin) {
            this.log(`❌ Still showing login page after popup closing for ${username}`);
            await page.close();
            this.releaseBrowser(browserId);
            return null;
          }
          
        } catch (popupError) {
          this.log(`⚠️ Popup closing failed: ${popupError.message.substring(0, 30)}...`);
          // Continue with screenshot anyway
        }
        
        await page.screenshot({
          path: filepath,
          fullPage: false, // 🚀 SPEED: Only visible area
          type: 'png'
        });
        
        // 🔍 FINAL VERIFICATION: Check screenshot file size
        const fs = require('fs');
        if (fs.existsSync(filepath)) {
          const stats = fs.statSync(filepath);
          const sizeKB = stats.size / 1024;
          
          // If screenshot is too small (likely login page), reject it
          if (sizeKB < 10) {
            this.log(`❌ Screenshot too small (${sizeKB.toFixed(1)}KB) - likely login page for ${username}`);
            await page.close();
            this.releaseBrowser(browserId);
            return null;
          }
        }
        
        await page.close();
        this.releaseBrowser(browserId);
        
        this.log(`✅ Ultra-fast success: ${filename}`);
        return filepath;
      } else {
        this.log(`❌ Instagram login/restriction detected for ${username}: ${hasLoginContent ? 'login page' : hasRestriction ? 'restricted' : 'short content'}`);
      }
      
      await page.close();
      this.releaseBrowser(browserId);
      this.log(`❌ Ultra-fast blocked for ${username}`);
      return null;
      
    } catch (error) {
      if (browserId === -1) await browser.close(); // Close temporary browser
      else this.releaseBrowser(browserId);
      this.log(`❌ Ultra-fast failed: ${error.message}`);
      return null;
    }
  }

  // 🚀 SPEED-OPTIMIZED Mobile Method (3-4 seconds)
  async takeScreenshotMobileFast(username) {
    const { browser, id: browserId } = await this.getBrowser();
    
    try {
      this.log(`📱 Mobile-fast method for ${username}`);
      
      const page = await browser.newPage();
      await page.setViewport({ width: 414, height: 896 });
      await page.setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 15_6 like Mac OS X) AppleWebKit/605.1.15');
      
      // 🍪 Apply cookies if available
      const cookieApplied = await this.applyCookiesToPage(page);
      if (cookieApplied) {
        this.log(`🍪 Using authenticated mobile session for ${username}`);
      }
      
      const mobileUrl = `https://www.instagram.com/${username}/`;
      await page.goto(mobileUrl, { 
        waitUntil: 'domcontentloaded',
        timeout: 6000 // Reduced timeout
      });
      
      // 🚀 ENHANCED: Wait for mobile content to load
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // 🔍 ENHANCED: Wait for mobile profile content to appear
      try {
        await page.waitForSelector('article, main, section, img[alt*="profile"], h1, h2', { 
          timeout: 3000 
        });
        this.log(`✅ Mobile profile content detected for ${username}`);
      } catch (e) {
        this.log(`⚠️ No mobile profile content found, proceeding anyway for ${username}`);
      }

      const content = await page.content();
      
      // 🚨 MOBILE LOGIN DETECTION - Same enhanced detection as desktop
      const loginIndicators = [
        'log in to instagram', 'sign up', 'phone number, username, or email',
        'password', 'log in with facebook', 'forgot password', 'don\'t have an account',
        'get the app', 'Log in', 'Sign up', 'Phone number, username, or email',
        'Password', 'Log in with Facebook', 'Forgot password', 'Don\'t have an account',
        'Get the app', 'Create an account', 'Log In', 'Sign Up'
      ];
      
      const hasLoginContent = loginIndicators.some(indicator => 
        content.toLowerCase().includes(indicator.toLowerCase())
      );
      
      const isShortContent = content.length < 5000;
      const isMobileBlocked = hasLoginContent || isShortContent;
      
      if (!isMobileBlocked) {
        const filename = `${username}_mobile_fast.png`;
        const filepath = path.join(this.screenshotsDir, filename);
        
        // 🎯 MOBILE: Close Instagram popups before screenshot
        try {
          this.log(`📱 Checking for mobile Instagram popups...`);
          
          // Mobile popups might appear faster
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Mobile-specific popup selectors
          const mobilePopupSelectors = [
            'button[aria-label="Close"]',
            'svg[aria-label="Close"]',
            '[role="dialog"] button',
            'button:has(svg)',
            // Mobile specific
            'div[role="dialog"] div[role="button"]',
            'div[role="dialog"] svg'
          ];
          
          for (const selector of mobilePopupSelectors) {
            try {
              const elements = await page.$$(selector);
              if (elements.length > 0) {
                this.log(`📱 Closing mobile popup: ${selector}`);
                await elements[0].click();
                await new Promise(resolve => setTimeout(resolve, 200));
                break;
              }
            } catch (e) {
              // Continue
            }
          }
          
          // Escape key for mobile
          try {
            await page.keyboard.press('Escape');
            await new Promise(resolve => setTimeout(resolve, 200));
          } catch (e) {
            // Continue anyway
          }
          
        } catch (error) {
          this.log(`⚠️ Mobile popup closing failed, continuing...`);
        }
        
        await page.screenshot({
          path: filepath,
          fullPage: false, // Faster
          type: 'png'
        });
        
        // 🔍 MOBILE VERIFICATION: Check screenshot file size
        const fs = require('fs');
        if (fs.existsSync(filepath)) {
          const stats = fs.statSync(filepath);
          const sizeKB = stats.size / 1024;
          
          // If screenshot is too small (likely login page), reject it
          if (sizeKB < 10) {
            this.log(`❌ Mobile screenshot too small (${sizeKB.toFixed(1)}KB) - likely login page for ${username}`);
            await page.close();
            this.releaseBrowser(browserId);
            return null;
          }
        }
        
        await page.close();
        this.releaseBrowser(browserId);
        
        this.log(`✅ Mobile-fast success: ${filename}`);
        return filepath;
      }
      
      await page.close();
      this.releaseBrowser(browserId);
      return null;
      
    } catch (error) {
      if (browserId === -1) await browser.close();
      else this.releaseBrowser(browserId);
      this.log(`❌ Mobile-fast failed: ${error.message}`);
      return null;
    }
  }

  // 🚀 PARALLEL SCREENSHOT CAPTURE - Optimized for speed + reliability
  async takeMultipleScreenshotsFast(usernames, maxConcurrent = 2) { // 🚀 INCREASED: 2 concurrent for better speed
    this.log(`🚀 Starting optimized parallel screenshot capture for ${usernames.length} profiles`);
    
    const results = [];
    let consecutiveFailures = 0;
    
    // Process in chunks for better control
    const chunkSize = maxConcurrent;
    for (let i = 0; i < usernames.length; i += chunkSize) {
      const chunk = usernames.slice(i, i + chunkSize);
      this.log(`📊 Processing chunk: ${chunk.join(', ')}`);
      
      // Process chunk in parallel
      const chunkPromises = chunk.map(async (username, index) => {
        const delay = index * 500; // Stagger requests within chunk
        await new Promise(resolve => setTimeout(resolve, delay));
        return await this.takeSingleScreenshotOptimized(username);
      });
      
      const chunkResults = await Promise.all(chunkPromises);
      results.push(...chunkResults);
      
      // Count failures in this chunk
      const chunkFailures = chunkResults.filter(r => !r.success).length;
      if (chunkFailures === chunk.length) {
        consecutiveFailures += chunkFailures;
      } else {
        consecutiveFailures = 0;
      }
        
        // Early termination if too many consecutive failures
      if (consecutiveFailures >= 8) {
          this.log(`⚠️ Too many consecutive failures (${consecutiveFailures}), stopping early`);
          break;
        }
        
      // Smart delay between chunks based on success rate
      const successRate = chunkResults.filter(r => r.success).length / chunkResults.length;
      const delay = successRate > 0.5 ? 1000 : 2000; // Shorter delay if successful
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    
    const successCount = results.filter(r => r.success).length;
    this.log(`🎯 Parallel capture complete: ${successCount}/${results.length} successful`);
    
    return results;
  }

  // Single optimized screenshot with smart retry logic
  async takeSingleScreenshotOptimized(username) {
    const startTime = Date.now();
    
    // 🧠 SMART DELAY: Adaptive timing based on success patterns
    await this.smartDelay(username);
    
    // Mobile-first screenshot strategy (desktop removed for reliability)
    try {
      // Removed: this.log(`📱 Skipping desktop (always fails), going straight to mobile for ${username}`);
      const mobileResult = await this.takeScreenshotMobileOptimized(username);
      if (mobileResult) {
        const duration = Date.now() - startTime;
        let screenshotPath, sizeKB, enhancedData;
        if (typeof mobileResult === 'string') {
          screenshotPath = mobileResult;
        const stats = fs.statSync(mobileResult);
          sizeKB = (stats.size/1024).toFixed(1);
          enhancedData = {};
        } else {
          screenshotPath = mobileResult.screenshotPath;
          sizeKB = (mobileResult.fileSize/1024).toFixed(1);
          enhancedData = mobileResult.enhancedData || {};
        }
        this.log(`📊 Screenshot created: ${username} - ${sizeKB}KB`);
        this.log(`⚡ SUCCESS: ${username} (${duration}ms, ${sizeKB}KB)`);
        if (enhancedData && Object.keys(enhancedData).length > 0) {
          this.log(`🎯 Enhanced: ${JSON.stringify(enhancedData)}`);
        }
        this.updateSuccessRate(true);
        return { 
          username, 
          screenshotPath, 
          success: true, 
          duration, 
          enhancedData: enhancedData 
        };
      }
      } catch (error) {
      this.log(`❌ Profile failed: ${username} - ${error.message}`);
      if (error.message.includes('rate limit') || error.message.includes('429')) {
        this.log(`⚠️ Rate limit detected for ${username}, skipping`);
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    const duration = Date.now() - startTime;
    this.updateSuccessRate(false);
    return { username, screenshotPath: null, success: false, duration };
  }

  // 🚀 OPTIMIZED: Fast direct screenshot method (replaces 6 complex methods)
  async takeScreenshotDirectOptimized(username) {
    let browser = null;
    let browserId = -1;
    let cookieId = null; // Move cookie tracking to top level
    
    try {
      this.log(`🚀 Direct optimized method for ${username}`);
      
      // Get browser from pool quickly
      const browserData = await this.getBrowser();
      browser = browserData.browser;
      browserId = browserData.id;
      
      const page = await browser.newPage();
      
      // 🍪 CRITICAL: Get fresh cookies for this session
      const cookieManager = require('./cookie_manager');
      const settingsManager = require('./settings');
      try {
        const availableCookie = await cookieManager.getAvailableCookie(settingsManager);
        if (availableCookie) {
          cookieId = availableCookie.cookieId; // Store for release
          this.setCookie(availableCookie.cookie);
          await this.applyCookiesToPage(page);
          this.log(`🍪 Session cookies injected for ${username} (cookie ${availableCookie.index + 1})`);
          } else {
          this.log(`🔓 No cookies available for ${username} - using anonymous session`);
        }
      } catch (error) {
        this.log(`🔓 Cookie error for ${username}: ${error.message} - using anonymous session`);
      }
      
      // Fast setup - minimal headers and viewport
      await page.setViewport({ width: 1366, height: 768 });
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
      
      const profileUrl = `https://www.instagram.com/${username}/`;
      this.log(`📡 Loading: ${profileUrl}`);
      
      // Quick navigation with short timeout
      await page.goto(profileUrl, { 
        waitUntil: 'domcontentloaded',
        timeout: 8000
      });
      
      // Minimal wait for content
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Fast content check
      const [title, content] = await Promise.all([
        page.title(),
        page.content()
      ]);
      
      // Quick login/rate limit detection
      const isLoginPage = content.includes('Log in') || 
                         content.includes('Sign up') || 
                         content.includes('password') ||
                         title.includes('Login') ||
                         page.url().includes('/accounts/login');
      
      const isRateLimit = content.includes('Take a quick pause') ||
                         content.includes('Try again later');
      
      if (isRateLimit) {
        this.log(`⚠️ Rate limit detected for ${username} - waiting 30s before retry`);
        await page.close();
        this.releaseBrowser(browserId);
        // Wait 30 seconds before retrying
        await new Promise(resolve => setTimeout(resolve, 30000));
        throw new Error('Rate limit detected');
      }
      
      if (isLoginPage) {
        this.log(`❌ Login page detected for ${username} (cookies may be invalid)`);
        await page.close();
        this.releaseBrowser(browserId);
        return null;
      }
      
      // Fast popup closing (single attempt)
      try {
        const closeBtn = await page.$('svg[aria-label="Close"]');
        if (closeBtn) {
          await closeBtn.click();
          await new Promise(resolve => setTimeout(resolve, 300));
        }
      } catch (e) {
        // Ignore popup errors
      }
      
      // Take screenshot quickly
      const filename = `${username}_fast.png`;
      const filepath = path.join(this.screenshotsDir, filename);
      
      await page.screenshot({
        path: filepath,
        fullPage: false,
        type: 'png'
      });
      
      await page.close();
      this.releaseBrowser(browserId);
      
      // Quick verification
      if (fs.existsSync(filepath)) {
        const stats = fs.statSync(filepath);
        if (stats.size > 8000) { // 8KB minimum
          this.log(`✅ Fast screenshot success: ${filename} (${(stats.size/1024).toFixed(1)}KB)`);
          return filepath;
        }
      }
      
      return null;
        
      } catch (error) {
      if (browser && browserId !== -1) {
        this.releaseBrowser(browserId);
      } else if (browser) {
        await browser.close();
      }
      
      this.log(`❌ Fast method failed for ${username}: ${error.message}`);
      return null;
    } finally {
      // 🍪 CRITICAL: Always release cookie regardless of success/failure
      if (cookieId) {
        const cookieManager = require('./cookie_manager');
        cookieManager.releaseCookie(cookieId);
        this.log(`🍪 Released cookie ${cookieId} for ${username}`);
      }
    }
  }

  // 🚀 MOBILE OPTIMIZED: Fast mobile viewport method
  async takeScreenshotMobileOptimized(username) {
    let browser = null;
    let browserId = -1;
    let cookieId = null; // Move cookie tracking to top level
    
    try {
      this.log(`📱 Mobile optimized method for ${username}`);
      
      // Get browser from pool
      const browserData = await this.getBrowser();
      browser = browserData.browser;
      browserId = browserData.id;
      
      const page = await browser.newPage();
      
      // 🍪 CRITICAL: Get fresh cookies for this mobile session
      const cookieManager = require('./cookie_manager');
      const settingsManager = require('./settings');
      try {
        const availableCookie = await cookieManager.getAvailableCookie(settingsManager);
        if (availableCookie) {
          cookieId = availableCookie.cookieId; // Store for release
          this.setCookie(availableCookie.cookie);
          await this.applyCookiesToPage(page);
          this.log(`🍪 Mobile cookies injected for ${username} (cookie ${availableCookie.index + 1})`);
        } else {
          this.log(`🔓 No mobile cookies available for ${username}`);
        }
      } catch (error) {
        this.log(`🔓 Mobile cookie error for ${username}: ${error.message}`);
      }
      
      // Mobile viewport and user agent
      await page.setViewport({ width: 375, height: 667 });
      await page.setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.2 Mobile/15E148 Safari/604.1');
      
      const mobileUrl = `https://www.instagram.com/${username}/`;
      this.log(`📱 Mobile loading: ${mobileUrl}`);
      
      // Quick navigation
      await page.goto(mobileUrl, { 
        waitUntil: 'domcontentloaded',
        timeout: 8000
      });
      
      // Mobile-specific wait
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mobile content check
      const [title, content] = await Promise.all([
        page.title(),
        page.content()
      ]);
      
      const isLoginPage = content.includes('Log in') || 
                         content.includes('Sign up') || 
                         title.includes('Login') ||
                         page.url().includes('/accounts/login');
      
      if (isLoginPage) {
        this.log(`❌ Mobile login page detected for ${username}`);
        await page.close();
        this.releaseBrowser(browserId);
        return null;
      }
      
      // 🔥 CRITICAL: Handle "Save login info" popup and other Instagram popups
      try {
        this.log(`🔍 Checking for Instagram popups...`);
        await new Promise(resolve => setTimeout(resolve, 1500)); // Wait for popup to appear
        
        // Strategy 1: Find and click X button (dismiss popup)
        const xButtonSelectors = [
          // Instagram's standard close button
          'svg[aria-label="Close"]',
          'button[aria-label="Close"]',
          // Modal close buttons
          'div[role="dialog"] svg[aria-label="Close"]',
          'div[role="dialog"] button[aria-label="Close"]',
          // Generic X buttons
          'button[aria-label="Close Modal"]',
          'button[data-testid="modal-close-button"]',
          // SVG X icons
          'svg[role="img"][aria-label="Close"]',
          // Any button containing an X-like SVG
          'button:has(svg[aria-label="Close"])',
          'div[role="button"]:has(svg[aria-label="Close"])'
        ];
        
        let popupClosed = false;
        for (const selector of xButtonSelectors) {
          try {
            const closeButton = await page.$(selector);
            if (closeButton) {
              // Check if button is visible
              const isVisible = await closeButton.isIntersectingViewport();
              if (isVisible) {
                this.log(`🎯 Found close button: ${selector} - clicking X to dismiss popup`);
                await closeButton.click();
                
                // 🔥 ENHANCED: Wait longer and verify popup is actually gone
                this.log(`⏳ Waiting for popup to fully disappear...`);
                await new Promise(resolve => setTimeout(resolve, 2500)); // Increased from 1000ms to 2500ms
                
                // Verify popup is actually gone by checking if the close button still exists
                const stillExists = await page.$(selector);
                if (!stillExists) {
                  popupClosed = true;
                  this.log(`✅ Successfully dismissed popup - X button no longer present`);
                  break;
                } else {
                  this.log(`⚠️ Popup still present after clicking X, trying next method...`);
                }
              }
      }
      } catch (e) {
            // Continue to next selector
          }
        }
        
        // Strategy 2: PREFERRED - Click "Save Info" to prevent future popups
        if (!popupClosed) {
          try {
            this.log(`🎯 Looking for "Save Info" button to prevent future popups...`);
            // Use XPath to find buttons containing specific text - PRIORITIZE "Save Info"
            const textButtonSelectors = [
              "//button[contains(text(), 'Save Info')]",
              "//button[contains(text(), 'Save info')]",
              "//button[contains(text(), 'Save')]",
              "//div[@role='button'][contains(text(), 'Save Info')]",
              "//div[@role='button'][contains(text(), 'Save')]",
              // Fallback options
              "//button[contains(text(), 'Not Now')]",
              "//button[contains(text(), 'Not now')]", 
              "//button[contains(text(), 'Cancel')]",
              "//button[contains(text(), 'Dismiss')]",
              "//div[@role='button'][contains(text(), 'Not Now')]"
            ];
            
            for (const xpath of textButtonSelectors) {
              try {
                const [button] = await page.$x(xpath);
                if (button) {
                  const isVisible = await button.isIntersectingViewport();
                  if (isVisible) {
                    this.log(`🎯 Found text button via XPath: ${xpath}`);
                    await button.click();
                    
                    // 🔥 ENHANCED: Wait longer and verify popup is gone
                    this.log(`⏳ Waiting for text button popup to disappear...`);
                    await new Promise(resolve => setTimeout(resolve, 2500)); // Increased wait time
                    
                    // Verify popup is gone by checking if button still exists
                    const [stillExists] = await page.$x(xpath);
                    if (!stillExists) {
                      popupClosed = true;
                      this.log(`✅ Successfully dismissed popup - text button no longer present`);
                      break;
                    } else {
                      this.log(`⚠️ Text button popup still present, trying next method...`);
                    }
                  }
                }
              } catch (e) {
                // Continue to next XPath
              }
            }
          } catch (e) {
            this.log(`⚠️ XPath button search failed: ${e.message}`);
          }
        }
        
                 // Strategy 3: Advanced popup detection using content analysis
         if (!popupClosed) {
           try {
             this.log(`🔍 Advanced popup detection - checking page content...`);
             
             // Check if page content indicates a popup is present
             const hasPopupContent = await page.evaluate(() => {
               const content = document.body.textContent.toLowerCase();
               const popupTexts = [
                 'save your login info',
                 'save info',
                 'not now',
                 'turn on notifications',
                 'allow notifications',
                 'add to home screen',
                 'install app',
                 'get the app'
               ];
               return popupTexts.some(text => content.includes(text));
             });
             
             if (hasPopupContent) {
               this.log(`🎯 Popup content detected, trying additional selectors...`);
               
               // More aggressive popup selectors
               const aggressiveSelectors = [
                 'div[role="dialog"]',
                 'div[role="presentation"]',
                 '[data-testid*="modal"]',
                 '[data-testid*="dialog"]',
                 'div[style*="position: fixed"]',
                 'div[style*="z-index"]'
               ];
               
               for (const selector of aggressiveSelectors) {
                 try {
                   const popupContainer = await page.$(selector);
                   if (popupContainer) {
                     // Look for any clickable element within the popup
                     const clickableElements = await popupContainer.$$('button, div[role="button"], [tabindex="0"]');
                     for (const element of clickableElements) {
                       try {
                         const isVisible = await element.isIntersectingViewport();
                         if (isVisible) {
                           this.log(`🎯 Clicking element in popup container: ${selector}`);
                           await element.click();
                           await new Promise(resolve => setTimeout(resolve, 500));
                           popupClosed = true;
                           this.log(`✅ Successfully closed popup via container click`);
                           break;
                         }
                       } catch (e) {
                         // Continue to next element
                       }
                     }
                     if (popupClosed) break;
                   }
                 } catch (e) {
                   // Continue to next selector
                 }
               }
             }
           } catch (e) {
             this.log(`⚠️ Advanced popup detection failed: ${e.message}`);
           }
         }
         
         // Strategy 4: Escape key as final fallback
         if (!popupClosed) {
           try {
             this.log(`⌨️ Trying Escape key to dismiss popup`);
             await page.keyboard.press('Escape');
             await new Promise(resolve => setTimeout(resolve, 500));
             this.log(`✅ Pressed Escape key`);
           } catch (e) {
             this.log(`⚠️ Escape key failed: ${e.message}`);
           }
         }
        
        // 🔥 FINAL VERIFICATION: Make absolutely sure popup is gone before proceeding
        this.log(`🔍 Final verification - ensuring no popups remain...`);
        await new Promise(resolve => setTimeout(resolve, 1500)); // Additional wait
        
        // Check one more time for any remaining popups
        const finalPopupCheck = await page.evaluate(() => {
          const popupIndicators = [
            'save your login info',
            'not now',
            'save info',
            'turn on notifications'
          ];
          const bodyText = document.body.textContent.toLowerCase();
          return popupIndicators.some(indicator => bodyText.includes(indicator));
        });
        
        if (finalPopupCheck) {
          this.log(`⚠️ Popup content still detected, attempting final cleanup...`);
          // Try pressing Escape as final cleanup
          try {
            await page.keyboard.press('Escape');
            await new Promise(resolve => setTimeout(resolve, 1000));
            this.log(`✅ Final Escape key pressed`);
          } catch (e) {
            this.log(`⚠️ Final Escape failed: ${e.message}`);
          }
        } else {
          this.log(`✅ No popup content detected - ready for screenshot`);
        }
        
        this.log(`✅ Popup handling complete for ${username}`);
      } catch (e) {
        this.log(`⚠️ Popup handling error: ${e.message}`);
      }

      // 🔥 HIDE BROWSER SUPPORT MESSAGE AND CONSISTENT SCROLLING
      try {
        console.log(`📍 Positioning ${username}...`);
        
        // Hide "browser is no longer supported" message
        await page.evaluate(() => {
          const supportMessages = document.querySelectorAll('[role="dialog"], div[style*="position: fixed"], div[style*="z-index"]');
          supportMessages.forEach(msg => {
            if (msg.textContent && msg.textContent.includes('browser is no longer supported')) {
              msg.remove();
            }
          });
          
          // Also hide any bottom banners
          const bottomBanners = document.querySelectorAll('div[style*="bottom"], div[style*="position: fixed"]');
          bottomBanners.forEach(banner => {
            if (banner.textContent && (banner.textContent.includes('supported') || banner.textContent.includes('update'))) {
              banner.style.display = 'none';
            }
          });
        });
        
        // CONSISTENT SCROLL: Position to show posts properly
        await page.evaluate(() => {
          // Find the posts section and scroll to it consistently
          const postsSection = document.querySelector('article, div[style*="display: flex"][style*="flex-direction: column"]');
          if (postsSection) {
            postsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
          } else {
            // Fallback: scroll to specific position to show posts, hide followers
            window.scrollTo(0, 400);
          }
        });
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Ensure we're showing posts grid, not header/followers
        await page.evaluate(() => {
          const profileHeader = document.querySelector('header');
          const postsContainer = document.querySelector('article, div[role="tabpanel"]');
          
          if (profileHeader && postsContainer) {
            const headerHeight = profileHeader.offsetHeight;
            window.scrollTo(0, headerHeight - 50); // Show just below header
          }
        });
        
        console.log(`✅ ${username} positioned`);
      } catch (e) {
        console.log(`⚠️ Positioning failed for ${username}`);
      }

      // 🚀 COMPREHENSIVE DATA EXTRACTION WITH RECENT POSTS
      let enhancedData = {};
      try {
        console.log(`📊 Extracting data for ${username}...`);
        
        enhancedData = await page.evaluate(() => {
          const data = {};
          
          // Extract follower/following/posts counts
          const statElements = document.querySelectorAll('a[href*="/followers/"], a[href*="/following/"], div[class*="css-"] span');
          const stats = Array.from(statElements).map(el => el.textContent?.trim()).filter(text => text && /\d/.test(text));
          
          // Try to get specific stats
          const followersEl = document.querySelector('a[href*="/followers/"]');
          const followingEl = document.querySelector('a[href*="/following/"]');
          
          if (followersEl) {
            const followersText = followersEl.textContent?.trim();
            data.followers = followersText?.match(/[\d,]+/)?.[0]?.replace(/,/g, '') || followersText;
          }
          
          if (followingEl) {
            const followingText = followingEl.textContent?.trim();
            data.following = followingText?.match(/[\d,]+/)?.[0]?.replace(/,/g, '') || followingText;
          }
          
          // Get posts count
          const postsElements = document.querySelectorAll('div, span');
          for (const el of postsElements) {
            const text = el.textContent?.trim();
            if (text && text.includes('posts')) {
              const match = text.match(/(\d[\d,]*)\s*posts?/i);
              if (match) {
                data.postsCount = match[1].replace(/,/g, '');
                break;
              }
            }
          }
          
          // 🔥 NEW: Extract recent post engagement data
          const postElements = document.querySelectorAll('article a[href*="/p/"]');
          const recentPosts = [];
          
          for (let i = 0; i < Math.min(6, postElements.length); i++) {
            const postEl = postElements[i];
            const postData = {};
            
            // Try to get post engagement from image alt text or nearby elements
            const imgEl = postEl.querySelector('img');
            if (imgEl && imgEl.alt) {
              const altText = imgEl.alt;
              // Instagram often includes engagement info in alt text
              const likesMatch = altText.match(/(\d+)\s*likes?/i);
              const commentsMatch = altText.match(/(\d+)\s*comments?/i);
              
              if (likesMatch) postData.likes = parseInt(likesMatch[1]);
              if (commentsMatch) postData.comments = parseInt(commentsMatch[1]);
            }
            
            // Get post URL
            postData.url = postEl.href;
            
            // Try to extract post timestamp
            const timeEl = postEl.querySelector('time, [datetime]');
            if (timeEl) {
              postData.timestamp = timeEl.getAttribute('datetime') || timeEl.textContent;
            }
            
            if (Object.keys(postData).length > 1) {
              recentPosts.push(postData);
            }
          }
          
          if (recentPosts.length > 0) {
            data.recentPosts = recentPosts;
            
            // Calculate engagement metrics
            const totalLikes = recentPosts.reduce((sum, post) => sum + (post.likes || 0), 0);
            const totalComments = recentPosts.reduce((sum, post) => sum + (post.comments || 0), 0);
            const postsWithEngagement = recentPosts.filter(post => post.likes || post.comments).length;
            
            if (postsWithEngagement > 0) {
              data.avgLikesPerPost = Math.round(totalLikes / postsWithEngagement);
              data.avgCommentsPerPost = Math.round(totalComments / postsWithEngagement);
              
              // Calculate engagement rate if we have followers
              if (data.followers) {
                const followersNum = parseInt(data.followers.replace(/[^0-9]/g, ''));
                if (followersNum > 0) {
                  const avgEngagement = (totalLikes + totalComments) / postsWithEngagement;
                  data.engagementRate = ((avgEngagement / followersNum) * 100).toFixed(2) + '%';
                }
              }
            }
          }
          
          // 🔥 NEW: Extract hashtag patterns
          const bioElement = document.querySelector('div[data-testid="user-bio"] span, section div span');
          if (bioElement) {
            const bioText = bioElement.textContent || '';
            const hashtags = bioText.match(/#[\w]+/g);
            if (hashtags && hashtags.length > 0) {
              data.bioHashtags = hashtags;
            }
          }
          
          // 🔥 NEW: Extract business information
          const businessElements = document.querySelectorAll('a[href*="mailto:"], a[href*="tel:"], a[href*="http"]');
          const businessInfo = [];
          
          businessElements.forEach(el => {
            const href = el.href;
            const text = el.textContent?.trim();
            
            if (href.includes('mailto:')) {
              businessInfo.push({ type: 'email', value: href.replace('mailto:', ''), text });
            } else if (href.includes('tel:')) {
              businessInfo.push({ type: 'phone', value: href.replace('tel:', ''), text });
            } else if (href.includes('http') && !href.includes('instagram.com')) {
              businessInfo.push({ type: 'website', value: href, text });
            }
          });
          
          if (businessInfo.length > 0) {
            data.businessContacts = businessInfo;
          }
          
          // 🔥 NEW: ADVANCED LINK ANALYSIS & TRACKING
          const allLinks = document.querySelectorAll('a[href]');
          const linkAnalysis = {
            totalLinks: 0,
            externalLinks: [],
            linkTypes: {},
            ecommerceIndicators: [],
            socialMediaLinks: []
          };

          allLinks.forEach(link => {
            const href = link.href;
            const text = link.textContent?.trim() || '';
            const domain = href.match(/https?:\/\/([^\/]+)/)?.[1]?.toLowerCase();
            
            // Skip Instagram internal links
            if (href.includes('instagram.com') || href.startsWith('/')) return;
            
            linkAnalysis.totalLinks++;
            
            const linkData = {
              url: href,
              domain: domain,
              text: text,
              category: 'unknown'
            };

            // 🎯 CATEGORIZE LINKS BY TYPE
            if (href.includes('mailto:')) {
              linkData.category = 'email';
            } else if (href.includes('tel:')) {
              linkData.category = 'phone';
            } else if (domain) {
              // E-commerce platforms
              const ecommercePlatforms = ['shopify', 'etsy', 'amazon', 'ebay', 'woocommerce', 'square', 'gumroad', 'bigcommerce'];
              if (ecommercePlatforms.some(platform => domain.includes(platform))) {
                linkData.category = 'ecommerce';
                linkAnalysis.ecommerceIndicators.push(domain);
              }
              
              // Booking/Service platforms  
              else if (['calendly', 'acuity', 'booksy', 'styleseat', 'mindbody', 'vagaro'].some(platform => domain.includes(platform))) {
                linkData.category = 'booking';
              }
              
              // Social media platforms
              else if (['tiktok', 'youtube', 'twitter', 'facebook', 'linkedin', 'pinterest', 'snapchat'].some(platform => domain.includes(platform))) {
                linkData.category = 'social';
                linkAnalysis.socialMediaLinks.push(domain);
              }
              
              // Link aggregators
              else if (['linktr.ee', 'linktree', 'bio.link', 'shorby', 'lnk.bio', 'carrd.co'].some(platform => domain.includes(platform))) {
                linkData.category = 'linktree';
              }
              
              // Portfolio/Professional
              else if (['behance', 'dribbble', 'github', 'portfolio', 'website', 'blog'].some(keyword => domain.includes(keyword) || text.toLowerCase().includes(keyword))) {
                linkData.category = 'portfolio';
              }
              
              // Business/Commercial
              else if (text.toLowerCase().includes('shop') || text.toLowerCase().includes('store') || text.toLowerCase().includes('buy')) {
                linkData.category = 'commerce';
              }
              
              // Default to website
              else {
                linkData.category = 'website';
              }
            }

            linkAnalysis.externalLinks.push(linkData);
            
            // Count by category
            linkAnalysis.linkTypes[linkData.category] = (linkAnalysis.linkTypes[linkData.category] || 0) + 1;
          });

          // 🔥 BUSINESS OPPORTUNITY SCORING
          let businessOpportunityScore = 0;
          const businessIndicators = [];

          if (linkAnalysis.ecommerceIndicators.length > 0) {
            businessOpportunityScore += 25;
            businessIndicators.push(`💰 E-commerce: ${linkAnalysis.ecommerceIndicators.join(', ')}`);
          }

          if (linkAnalysis.linkTypes.booking > 0) {
            businessOpportunityScore += 20;
            businessIndicators.push(`📅 Booking System Available`);
          }

          if (linkAnalysis.linkTypes.email > 0 || linkAnalysis.linkTypes.phone > 0) {
            businessOpportunityScore += 15;
            businessIndicators.push(`📞 Direct Contact Available`);
          }

          if (linkAnalysis.socialMediaLinks.length > 2) {
            businessOpportunityScore += 10;
            businessIndicators.push(`🌐 Multi-platform Presence`);
          }

          if (linkAnalysis.linkTypes.linktree > 0) {
            businessOpportunityScore += 5;
            businessIndicators.push(`🔗 Link Aggregator Used`);
          }

                     // Add link analysis to data
           if (linkAnalysis.totalLinks > 0) {
             data.linkAnalysis = linkAnalysis;
             data.businessOpportunityScore = businessOpportunityScore;
             data.businessIndicators = businessIndicators;
           }

           // 🔥 NEW: GEOGRAPHIC INSIGHTS ANALYSIS
           const geographicData = {
             locations: [],
             primaryLocation: null,
             isLocalBusiness: false,
             serviceArea: [],
             locationStrength: 0
           };

           // Extract location from bio
           if (bioElement) {
             const bioText = bioElement.textContent || '';
             
             // Look for location indicators
             const locationPatterns = [
               /📍\s*([^,\n\|]+)/gi,  // Pin emoji
               /\b(located in|based in|from)\s+([^,\n\|]+)/gi,
               /\b([A-Z][a-zA-Z\s]+(?:,\s*[A-Z]{2}|,\s*[A-Z][a-zA-Z\s]+))\b/g, // City, State format
               /\b(NYC|LA|SF|CHI|MIA|NYC|ATL|BOS|SEA|DEN|LAS)\b/gi // Common city abbreviations
             ];

             locationPatterns.forEach(pattern => {
               const matches = bioText.match(pattern);
               if (matches) {
                 matches.forEach(match => {
                   let location = match.replace(/📍\s*/, '').replace(/located in|based in|from/gi, '').trim();
                   if (location.length > 2 && location.length < 50) {
                     geographicData.locations.push(location);
                   }
                 });
               }
             });

             // Look for service area indicators
             const serviceKeywords = ['serving', 'available in', 'delivery to', 'covering', 'throughout'];
             serviceKeywords.forEach(keyword => {
               const regex = new RegExp(`${keyword}\\s+([^,\n\|]+)`, 'gi');
               const matches = bioText.match(regex);
               if (matches) {
                 matches.forEach(match => {
                   const area = match.replace(new RegExp(keyword, 'gi'), '').trim();
                   if (area.length > 2 && area.length < 50) {
                     geographicData.serviceArea.push(area);
                   }
                 });
               }
             });
           }

           // Analyze hashtags for location
           if (data.bioHashtags) {
             data.bioHashtags.forEach(hashtag => {
               const tag = hashtag.toLowerCase();
               // Common location hashtags
               const locationHashtags = [
                 'losangeles', 'newyork', 'chicago', 'miami', 'atlanta', 'boston', 'seattle',
                 'denver', 'vegas', 'portland', 'austin', 'houston', 'dallas', 'phoenix',
                 'sandiego', 'sanfrancisco', 'washington', 'philadelphia', 'detroit', 'tampa'
               ];
               
               locationHashtags.forEach(city => {
                 if (tag.includes(city)) {
                   geographicData.locations.push(city);
                 }
               });
             });
           }

           // Clean and deduplicate locations
           geographicData.locations = [...new Set(geographicData.locations)];
           geographicData.serviceArea = [...new Set(geographicData.serviceArea)];
           
           if (geographicData.locations.length > 0) {
             geographicData.primaryLocation = geographicData.locations[0];
             geographicData.isLocalBusiness = true;
             geographicData.locationStrength = Math.min(25, geographicData.locations.length * 5 + geographicData.serviceArea.length * 3);
           }

           if (geographicData.isLocalBusiness) {
             data.geographicInsights = geographicData;
           }

           // 🔥 RE-ADD: Detect business category  
           const categoryIndicators = {
             'Restaurant/Food': ['restaurant', 'cafe', 'food', 'chef', 'menu', 'delivery'],
             'Fitness': ['fitness', 'gym', 'trainer', 'workout', 'health', 'nutrition'],
             'Fashion': ['fashion', 'style', 'clothing', 'brand', 'boutique', 'designer'],
             'Beauty': ['beauty', 'makeup', 'skincare', 'salon', 'cosmetics', 'spa'],
             'Business': ['entrepreneur', 'business', 'CEO', 'founder', 'company', 'startup'],
             'Influencer': ['influencer', 'creator', 'content', 'brand ambassador', 'collaboration']
           };
           
           const fullText = (bioElement?.textContent || '').toLowerCase();
           for (const [category, keywords] of Object.entries(categoryIndicators)) {
             if (keywords.some(keyword => fullText.includes(keyword))) {
               data.suggestedCategory = category;
               break;
             }
           }
           
           return data;
        });
        
        console.log(`📊 Data: ${enhancedData.followers} followers, ${enhancedData.recentPosts.length} posts visible`);
        
      } catch (e) {
        console.log(`⚠️ Data extraction failed for ${username}`);
        enhancedData = {
          followers: 'N/A',
          following: 'N/A',
          bioText: 'N/A',
          postsCount: 'N/A',
          isVerified: false,
          isBusiness: false,
          fullName: username,
          recentPosts: [],
          totalPosts: 0
        };
      }

      // 🔥 FINAL WAIT: Ensure profile content is fully loaded before screenshot
      this.log(`📸 Preparing for screenshot - final content load wait...`);
      await new Promise(resolve => setTimeout(resolve, 2000)); // Additional 2 seconds for content to stabilize
      
      // Double-check that we're looking at profile content, not a popup
      const isProfileReady = await page.evaluate(() => {
        const hasProfileContent = document.querySelector('img[alt*="profile picture"], h2, h1') !== null;
        const hasPopupContent = document.body.textContent.toLowerCase().includes('save your login info');
        return hasProfileContent && !hasPopupContent;
      });
      
      if (!isProfileReady) {
        this.log(`⚠️ Profile content not ready or popup still present, waiting additional time...`);
        await new Promise(resolve => setTimeout(resolve, 3000)); // Wait even longer if needed
      } else {
        this.log(`✅ Profile content confirmed ready for screenshot`);
      }
      
      // Mobile screenshot
      const filename = `${username}_mobile.png`;
      const filepath = path.join(this.screenshotsDir, filename);
      
      console.log(`📸 Capturing ${username}...`);
      await page.screenshot({
        path: filepath,
        fullPage: false,
        type: 'png'
      });
      
      await page.close();
      this.releaseBrowser(browserId);
      
      // Mobile verification
      if (fs.existsSync(filepath)) {
        const stats = fs.statSync(filepath);
        if (stats.size > 6000) { // 6KB minimum for mobile
          console.log(`✅ ${username} captured (${(stats.size/1024).toFixed(1)}KB)`);
          
          // Return enhanced data along with screenshot path
          return {
            screenshotPath: filepath,
            enhancedData: enhancedData,
            fileSize: stats.size,
            username: username,
            timestamp: new Date().toISOString()
          };
        }
      }
      
      return null;
      
    } catch (error) {
      if (browser && browserId !== -1) {
        this.releaseBrowser(browserId);
      } else if (browser) {
        await browser.close();
      }
      
      this.log(`❌ Mobile method failed for ${username}: ${error.message}`);
      return null;
    } finally {
      // 🍪 CRITICAL: Always release cookie regardless of success/failure
      if (cookieId) {
        const cookieManager = require('./cookie_manager');
        cookieManager.releaseCookie(cookieId);
        this.log(`🍪 Released cookie ${cookieId} for ${username}`);
      }
    }
  }

  // 🔄 NEW: Direct profile approach with better error handling
  async takeScreenshotDirectProfile(username) {
    const { browser, id: browserId } = await this.getBrowser();
    
    try {
      this.log(`🔄 Direct profile method for ${username}`);
      
      const page = await browser.newPage();
      await page.setViewport({ width: 1366, height: 768 });
      
      // Set better headers
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
      
      const profileUrl = `https://www.instagram.com/${username}/`;
      this.log(`📡 Loading direct profile: ${profileUrl}`);
      
      // Go to profile page with longer timeout
      await page.goto(profileUrl, { 
        waitUntil: 'domcontentloaded',
        timeout: 15000
      });
      
      // Wait for content to load
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Check if we actually got to Instagram
      const title = await page.title();
      const url = page.url();
      
      this.log(`📄 Page loaded: ${title} | URL: ${url}`);
      
      // 🔥 ENHANCED: Better popup detection and closing
      try {
        this.log(`🔄 Checking for popups...`);
        
        // Wait for popups to appear
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const validDirectSelectors = [
          // Instagram login modal
          'div[role="dialog"] button[aria-label="Close"]',
          'button[aria-label="Close"]',
          'svg[aria-label="Close"]',
          '[data-testid="modal-close-button"]',
          // Login/signup popups
          'div[role="dialog"] svg',
          'div[role="dialog"] button',
          // Generic close buttons
          '.close-button',
          '.modal-close',
          '[aria-label="Close"]'
        ];
        
        const xpathDirectSelectors = [
          "//button[contains(text(), 'OK')]",
          "//button[contains(text(), 'Try Again')]"
        ];
        
        let popupClosed = false;
        
        // Try CSS selectors
        for (const selector of validDirectSelectors) {
          try {
            const elements = await page.$$(selector);
            if (elements.length > 0) {
              this.log(`🔄 Found popup, closing with: ${selector}`);
              await elements[0].click();
              await new Promise(resolve => setTimeout(resolve, 1000));
              popupClosed = true;
              break;
            }
          } catch (e) {
            // Continue to next selector
          }
        }
        
        // Try XPath selectors if CSS didn't work
        if (!popupClosed) {
          for (const xpath of xpathDirectSelectors) {
            try {
              const [element] = await page.$x(xpath);
              if (element) {
                this.log(`🔄 Found popup (XPath), closing with: ${xpath}`);
                await element.click();
                await new Promise(resolve => setTimeout(resolve, 1000));
                popupClosed = true;
                break;
              }
            } catch (e) {
              // Continue to next XPath
            }
          }
        }
        
        // Try escape key as backup
        if (!popupClosed) {
          this.log(`🔄 Trying Escape key...`);
          await page.keyboard.press('Escape');
          await new Promise(resolve => setTimeout(resolve, 500));
        }
        
        // 🚨 ENHANCED LOGIN/RESTRICTION DETECTION
        const content = await page.content();
        
        const loginIndicators = [
          'log in to instagram', 'sign up', 'phone number, username, or email',
          'password', 'log in with facebook', 'forgot password', 'don\'t have an account',
          'get the app', 'Log in', 'Sign up', 'Phone number, username, or email',
          'Password', 'Log in with Facebook', 'Forgot password', 'Don\'t have an account',
          'Get the app', 'Create an account', 'Log In', 'Sign Up'
        ];
        
        const hasLoginContent = loginIndicators.some(indicator => 
          content.toLowerCase().includes(indicator.toLowerCase())
        );
        
        const isShortContent = content.length < 5000;
        
        if (content.includes('Take a quick pause') || content.includes('Try again')) {
          this.log(`⚠️ Rate limit detected, adding extra delay...`);
          await new Promise(resolve => setTimeout(resolve, 5000));
          return null; // Skip this screenshot
        }
        
        if (hasLoginContent || isShortContent) {
          this.log(`❌ Direct method showing login page or insufficient content for ${username}`);
          await page.close();
          this.releaseBrowser(browserId);
          return null;
        }
        
      } catch (e) {
        this.log(`⚠️ Popup closing failed: ${e.message}`);
      }
      
      // Take screenshot with better settings
      const filename = `${username}_direct.png`;
      const filepath = path.join(this.screenshotsDir, filename);
      
      await page.screenshot({
        path: filepath,
        fullPage: false,
        type: 'png',
        quality: 90,
        clip: {
          x: 0,
          y: 0,
          width: 1366,
          height: 768
        }
      });
      
      await page.close();
      this.releaseBrowser(browserId);
      
      // Verify the screenshot was created and has content
      if (fs.existsSync(filepath)) {
        const stats = fs.statSync(filepath);
        const sizeKB = stats.size / 1024;
        
        // Enhanced size check - reject login pages
        if (sizeKB > 10) {
          this.log(`✅ Direct profile success: ${filename} (${sizeKB.toFixed(1)}KB)`);
          return filepath;
        } else {
          this.log(`❌ Direct profile screenshot too small: ${sizeKB.toFixed(1)}KB - likely login page`);
        }
      }
      
      return null;
      
    } catch (error) {
      if (browserId === -1) await browser.close();
      else this.releaseBrowser(browserId);
      this.log(`❌ Direct profile failed: ${error.message}`);
      return null;
    }
  }

  // 🎯 MAIN OPTIMIZED METHOD
  async takeReliableScreenshotFast(username) {
    this.log(`🎯 Starting speed-optimized screenshot for ${username}`);
    
    const result = await this.takeSingleScreenshotOptimized(username);
    return result.success ? result.screenshotPath : null;
  }

  // Cleanup browser pool
  async cleanup() {
    this.log('🧹 Cleaning up browser pool...');
    for (const browser of this.browserPool) {
      try {
        await browser.close();
      } catch (e) {
        // Ignore close errors
      }
    }
    this.browserPool = [];
    this.browserInUse.clear();
  }

  // 🚀 OPTIMIZED BROWSER MANAGEMENT - Always ensure browser availability
  async getBrowserFromPool() {
    // Try to get an available browser from pool first
    if (this.browserPool.length > 0) {
      const browser = this.browserPool.pop();
      
      try {
        await browser.version(); // Quick health check
        return browser;
      } catch (error) {
        this.log('⚠️ Browser unhealthy, creating new one...');
        try {
          await browser.close();
        } catch (e) {}
      }
    }
    
    // Create new browser if pool is empty
    return await this.createSingleBrowser();
  }
  
  async returnBrowserToPool(browser) {
    try {
      // Clean up the browser before returning to pool
      const pages = await browser.pages();
      for (const page of pages) {
        if (page.url() !== 'about:blank') {
          await page.close();
        }
      }
      
      // Return to pool if we have space, otherwise close
      if (this.browserPool.length < 3) {
        this.browserPool.push(browser);
      } else {
        await browser.close();
      }
    } catch (error) {
      this.log(`⚠️ Error returning browser to pool: ${error.message}`);
      try {
        await browser.close();
      } catch (e) {}
    }
  }

  // Create a single optimized browser
  async createSingleBrowser() {
    return await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu',
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-renderer-backgrounding',
        '--memory-pressure-off', // Prevent memory throttling
        '--max_old_space_size=4096' // Increase memory limit
      ],
      defaultViewport: { width: 1920, height: 1080 }
    });
  }

  // 🔥 ADVANCED BYPASS TECHNIQUES - Multiple strategies to avoid login redirects
  
  // Strategy 1: Session Cookie Injection
  async injectSessionCookies(page) {
    try {
      // Inject common Instagram session cookies to appear logged in
      const sessionCookies = [
        {
          name: 'sessionid',
          value: 'IGSCf8f7d4e3-b2a1-4c6d-9e8f-1a2b3c4d5e6f',
          domain: '.instagram.com',
          path: '/',
          httpOnly: true,
          secure: true
        },
        {
          name: 'csrftoken',
          value: 'csrf_' + Math.random().toString(36).substring(2, 15),
          domain: '.instagram.com',
          path: '/',
          httpOnly: false,
          secure: true
        },
        {
          name: 'mid',
          value: 'Y' + Math.random().toString(36).substring(2, 15),
          domain: '.instagram.com',
          path: '/',
          httpOnly: false,
          secure: true
        }
      ];
      
      await page.setCookie(...sessionCookies);
      this.log(`🍪 Session cookies injected`);
    } catch (error) {
      this.log(`⚠️ Cookie injection failed: ${error.message}`);
    }
  }
  
  // Strategy 2: Request Interception to block login redirects
  async setupRequestInterception(page) {
    try {
      await page.setRequestInterception(true);
      
      page.on('request', (request) => {
        const url = request.url();
        
        // Block login redirects
        if (url.includes('/accounts/login/') || 
            url.includes('/accounts/signup/') ||
            url.includes('/challenge/') ||
            url.includes('/accounts/access_tool/')) {
          this.log(`🚫 Blocked login redirect: ${url}`);
          request.abort();
          return;
        }
        
        // Block unnecessary resources for speed
        if (url.includes('.jpg') || url.includes('.png') || 
            url.includes('.gif') || url.includes('.mp4') ||
            url.includes('static/') || url.includes('analytics')) {
          request.abort();
          return;
        }
        
        // Continue with other requests
        request.continue();
      });
      
      this.log(`🛡️ Request interception enabled`);
    } catch (error) {
      this.log(`⚠️ Request interception failed: ${error.message}`);
    }
  }
  
  // Strategy 3: Alternative Instagram endpoints
  async tryAlternativeEndpoints(username) {
    const endpoints = [
      `https://www.instagram.com/${username}/?__a=1&__d=dis`, // API endpoint
      `https://www.instagram.com/${username}/?__a=1`, // Alternative API
      `https://i.instagram.com/${username}/`, // Mobile endpoint
      `https://www.instagram.com/p/${username}/`, // Post endpoint fallback
      `https://www.instagram.com/${username}/?hl=en`, // Language specific
      `https://www.instagram.com/${username}/?variant=following` // Variant endpoint
    ];
    
    return endpoints;
  }
  
  // Strategy 4: Referrer spoofing to appear as internal navigation
  async setupReferrerSpoofing(page) {
    try {
      await page.setExtraHTTPHeaders({
        'Referer': 'https://www.instagram.com/',
        'Origin': 'https://www.instagram.com',
        'Sec-Fetch-Site': 'same-origin',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-User': '?1',
        'Sec-Fetch-Dest': 'document',
        'Upgrade-Insecure-Requests': '1',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Cache-Control': 'max-age=0'
      });
      
      this.log(`🎭 Referrer spoofing enabled`);
    } catch (error) {
      this.log(`⚠️ Referrer spoofing failed: ${error.message}`);
    }
  }
  
  // Strategy 5: Advanced stealth mode
  async enableAdvancedStealth(page) {
    try {
      // Remove webdriver traces
      await page.evaluateOnNewDocument(() => {
        Object.defineProperty(navigator, 'webdriver', {
          get: () => undefined,
        });
        
        // Override the `plugins` property to use a custom getter.
        Object.defineProperty(navigator, 'plugins', {
          get: () => [1, 2, 3, 4, 5],
        });
        
        // Override the `languages` property to use a custom getter.
        Object.defineProperty(navigator, 'languages', {
          get: () => ['en-US', 'en'],
        });
        
        // Override the `permissions` property to use a custom getter.
        Object.defineProperty(navigator, 'permissions', {
          get: () => ({
            query: () => Promise.resolve({ state: 'granted' }),
          }),
        });
        
        // Mock chrome object
        window.chrome = {
          runtime: {},
          loadTimes: function() {},
          csi: function() {},
          app: {}
        };
        
        // Hide automation indicators
        delete window.navigator.__proto__.webdriver;
      });
      
      this.log(`🥷 Advanced stealth mode enabled`);
    } catch (error) {
      this.log(`⚠️ Stealth mode failed: ${error.message}`);
    }
  }

  // 🚀 ULTRA-ADVANCED BYPASS METHOD - Combines all bypass techniques
  async takeScreenshotUltraBypass(username) {
    let browser = null;
    let page = null;
    
    try {
      this.log(`🔥 Ultra-advanced bypass for ${username}`);
      
      // Get browser from smart pool
      browser = await this.getBrowserFromPool();
      page = await browser.newPage();
      
      // Apply all bypass techniques
      await this.enableAdvancedStealth(page);
      await this.setupReferrerSpoofing(page);
      await this.injectSessionCookies(page);
      await this.setupRequestInterception(page);
      
      // Enhanced viewport and user agent rotation
      const viewports = [
        { width: 1920, height: 1080 },
        { width: 1366, height: 768 },
        { width: 1440, height: 900 },
        { width: 1536, height: 864 }
      ];
      
      const userAgents = [
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/121.0',
        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      ];
      
      const randomViewport = viewports[Math.floor(Math.random() * viewports.length)];
      const randomUA = userAgents[Math.floor(Math.random() * userAgents.length)];
      
      await page.setViewport(randomViewport);
      await page.setUserAgent(randomUA);
      
      // Try alternative endpoints first
      const endpoints = await this.tryAlternativeEndpoints(username);
      let success = false;
      let finalUrl = null;
      
      for (const endpoint of endpoints) {
        try {
          this.log(`🎯 Trying endpoint: ${endpoint}`);
          
          // Navigate with custom navigation strategy
          await page.goto(endpoint, { 
            waitUntil: 'domcontentloaded',
            timeout: 8000
          });
          
          // Quick wait for content
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const content = await page.content();
          const currentUrl = page.url();
          
          // Check if we avoided login redirect
          if (!currentUrl.includes('/accounts/login/') && 
              !currentUrl.includes('/accounts/signup/') &&
              !currentUrl.includes('/challenge/') &&
              content.length > 5000) {
            
            this.log(`✅ Bypass successful with endpoint: ${endpoint}`);
            finalUrl = currentUrl;
            success = true;
            break;
          } else {
            this.log(`❌ Endpoint redirected to login: ${currentUrl}`);
          }
          
        } catch (error) {
          this.log(`⚠️ Endpoint failed: ${endpoint} - ${error.message.substring(0, 30)}...`);
          continue;
        }
      }
      
      if (!success) {
        this.log(`❌ All endpoints failed for ${username}`);
        await this.returnBrowserToPool(browser);
        return null;
      }
      
      // Enhanced content verification
      const content = await page.content();
      
      // Login detection with bypass verification
      const loginIndicators = [
        'log in to instagram', 'sign up', 'phone number, username, or email',
        'password', 'log in with facebook', 'forgot password', 'don\'t have an account',
        'get the app', 'create an account'
      ];
      
      const hasLoginContent = loginIndicators.some(indicator => 
        content.toLowerCase().includes(indicator.toLowerCase())
      );
      
      if (hasLoginContent) {
        this.log(`❌ Still showing login content after bypass for ${username}`);
        await this.returnBrowserToPool(browser);
        return null;
      }
      
      // Advanced popup handling
      try {
        this.log(`🎯 Advanced popup detection and closing...`);
        
        // Wait for any remaining popups
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Valid CSS selectors
        const validAdvancedSelectors = [
          // Instagram specific
          'div[role="dialog"] button[aria-label="Close"]',
          'div[role="dialog"] svg[aria-label="Close"]',
          'button[aria-label="Close"]',
          'svg[aria-label="Close"]',
          
          // Modal patterns
          '[data-testid="modal-close-button"]',
          'div[role="dialog"] button:has(svg)',
          'button[tabindex="0"]:has(svg)',
          
          // Generic close patterns
          '.close',
          '.modal-close',
          '[aria-label="Close"]'
        ];
        
        // XPath selectors for text-based buttons
        const xpathAdvancedSelectors = [
          "//button[contains(text(), '×')]",
          "//span[contains(text(), '×')]",
          "//button[contains(text(), 'Not Now')]",
          "//button[contains(text(), 'Cancel')]",
          "//a[contains(text(), 'Get App')]",
          "//button[contains(text(), 'Accept')]",
          "//button[contains(text(), 'Allow')]",
          "//button[contains(text(), 'Continue')]",
          "//button[contains(text(), \"I'm 18 or older\")]"
        ];
        
        let popupsClosed = 0;
        
        // Try CSS selectors first
        for (const selector of validAdvancedSelectors) {
          try {
            const elements = await page.$$(selector);
            if (elements.length > 0) {
              this.log(`🎯 Closing popup (CSS): ${selector}`);
              await elements[0].click();
              await new Promise(resolve => setTimeout(resolve, 300));
              popupsClosed++;
            }
          } catch (e) {
            // Continue to next selector
          }
        }
        
        // Try XPath selectors
        for (const xpath of xpathAdvancedSelectors) {
          try {
            const [element] = await page.$x(xpath);
            if (element) {
              this.log(`🎯 Closing popup (XPath): ${xpath}`);
              await element.click();
              await new Promise(resolve => setTimeout(resolve, 300));
              popupsClosed++;
            }
          } catch (e) {
            // Continue to next XPath
          }
        }
        
        // Multiple escape key presses
        for (let i = 0; i < 3; i++) {
          try {
            await page.keyboard.press('Escape');
            await new Promise(resolve => setTimeout(resolve, 200));
          } catch (e) {
            // Continue
          }
        }
        
        this.log(`✅ Closed ${popupsClosed} popups`);
        
      } catch (popupError) {
        this.log(`⚠️ Advanced popup closing failed: ${popupError.message}`);
      }
      
      // Final wait for page to stabilize
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Take high-quality screenshot
      const filename = `${username}_ultra_bypass.png`;
      const filepath = path.join(this.screenshotsDir, filename);
      
      await page.screenshot({
        path: filepath,
        fullPage: false,
        type: 'png'
      });
      
      // Enhanced verification
      const fs = require('fs');
      if (fs.existsSync(filepath)) {
        const stats = fs.statSync(filepath);
        const sizeKB = stats.size / 1024;
        
        if (sizeKB > 15) { // Higher threshold for bypass method
          this.log(`🔥 Ultra-bypass SUCCESS: ${filename} (${sizeKB.toFixed(1)}KB)`);
          await this.returnBrowserToPool(browser);
          return filepath;
        } else {
          this.log(`❌ Ultra-bypass screenshot too small: ${sizeKB.toFixed(1)}KB`);
        }
      }
      
      await this.returnBrowserToPool(browser);
      return null;
      
    } catch (error) {
      if (browser) {
        try {
          await browser.close();
        } catch (e) {}
      }
      this.log(`❌ Ultra-bypass failed: ${error.message}`);
      return null;
    }
  }

  // Enhanced content validation
  isValidInstagramContent(content, title, username) {
    // Check for login/restriction indicators
    const loginIndicators = [
      'login_required',
      'Please log in to continue',
      'Log in to Instagram',
      'Sign up for Instagram',
      'Create an account',
      'accounts/login',
      'challenge_required',
      'checkpoint_required',
      'We restrict certain activity',
      'Try again later'
    ];
    
    const contentLower = content.toLowerCase();
    const titleLower = title.toLowerCase();
    
    // Check for login indicators
    for (const indicator of loginIndicators) {
      if (contentLower.includes(indicator.toLowerCase()) || titleLower.includes(indicator.toLowerCase())) {
        return false;
      }
    }
    
    // Check for positive indicators
    const positiveIndicators = [
      username.toLowerCase(),
      'instagram photos and videos',
      'followers',
      'following',
      'posts',
      '@' + username.toLowerCase()
    ];
    
    let positiveCount = 0;
    for (const indicator of positiveIndicators) {
      if (contentLower.includes(indicator) || titleLower.includes(indicator)) {
        positiveCount++;
      }
    }
    
    // Need at least 2 positive indicators
    return positiveCount >= 2;
  }

  // Enhanced user agent rotation with mobile variants
  getUserAgent() {
    const userAgents = [
      // Desktop Chrome variants
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      
      // Mobile variants (Instagram prefers mobile)
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
      'Mozilla/5.0 (Linux; Android 13; SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
      'Mozilla/5.0 (Linux; Android 12; Pixel 6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
      
      // Edge variants
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0',
      
      // Firefox variants
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:120.0) Gecko/20100101 Firefox/120.0'
    ];
    
    return userAgents[Math.floor(Math.random() * userAgents.length)];
  }

  // Advanced request header randomization
  async setupAdvancedHeaders(page) {
    const headers = {
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br',
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache',
      'Sec-Ch-Ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
      'Sec-Ch-Ua-Mobile': Math.random() > 0.5 ? '?1' : '?0',
      'Sec-Ch-Ua-Platform': '"Windows"',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none',
      'Sec-Fetch-User': '?1',
      'Upgrade-Insecure-Requests': '1',
      'X-Instagram-AJAX': Math.random().toString(36).substring(2, 10),
      'X-Requested-With': 'XMLHttpRequest'
    };
    
    await page.setExtraHTTPHeaders(headers);
    console.log(`[${new Date().toISOString()}] 🔧 Advanced headers configured`);
  }

  // GraphQL endpoint bypass
  async tryGraphQLBypass(username) {
    try {
      const graphqlEndpoints = [
        `https://www.instagram.com/graphql/query/?query_hash=f2405b236d85e8296cf30347c9f08c2a&variables={"username":"${username}","first":12}`,
        `https://www.instagram.com/api/v1/users/web_profile_info/?username=${username}`,
        `https://i.instagram.com/api/v1/users/web_profile_info/?username=${username}`,
        `https://www.instagram.com/${username}/?__a=1&__d=dis`
      ];
      
      for (const endpoint of graphqlEndpoints) {
        try {
          console.log(`[${new Date().toISOString()}] 🔗 Trying GraphQL: ${endpoint.substring(0, 60)}...`);
          
          const response = await fetch(endpoint, {
            headers: {
              'User-Agent': this.getUserAgent(),
              'Accept': 'application/json, text/plain, */*',
              'X-Instagram-AJAX': Math.random().toString(36).substring(2, 10),
              'X-CSRFToken': Math.random().toString(36).substring(2, 15),
              'X-Requested-With': 'XMLHttpRequest'
            }
          });
          
          if (response.ok) {
            const data = await response.text();
            if (data && data.length > 100 && !data.includes('login_required')) {
              console.log(`[${new Date().toISOString()}] ✅ GraphQL success: ${data.length} chars`);
              return data;
            }
          }
        } catch (e) {
          console.log(`[${new Date().toISOString()}] ❌ GraphQL endpoint failed: ${e.message}`);
        }
      }
      
      return null;
    } catch (error) {
      console.log(`[${new Date().toISOString()}] ❌ GraphQL bypass failed: ${error.message}`);
      return null;
    }
  }

  // Enhanced popup detection with proper selectors and XPath
  async closeAllPopups(page) {
    try {
      // Use valid CSS selectors only
      const validCssSelectors = [
        // Instagram-specific modals
        'div[role="dialog"] button[aria-label="Close"]',
        'div[role="dialog"] svg[aria-label="Close"]',
        'button[aria-label="Close"]',
        'svg[aria-label="Close"]',
        
        // Generic modal closers
        '.modal-close',
        '.close-button',
        '.popup-close',
        '[data-testid="modal-close-button"]',
        '[data-testid="close-button"]',
        '[aria-label="Close"]'
      ];
      
      // Use XPath for text-based selectors
      const xpathSelectors = [
        // Login/signup modals
        "//button[contains(text(), 'Not Now')]",
        "//button[contains(text(), 'Close')]",
        "//button[contains(text(), 'Cancel')]",
        "//div[@role='button'][contains(text(), 'Not Now')]",
        
        // Rate limit popups  
        "//button[contains(text(), 'OK')]",
        "//button[contains(text(), 'Try Again')]",
        "//button[contains(text(), 'Dismiss')]",
        
        // Instagram app install prompts
        "//button[contains(text(), 'Install App')]",
        "//button[contains(text(), 'Get App')]",
        "//a[contains(text(), 'Get App')]",
        
        // Cookie consent
        "//button[contains(text(), 'Accept')]",
        "//button[contains(text(), 'Allow')]",
        
        // Age verification
        "//button[contains(text(), 'Continue')]",
        "//button[contains(text(), \"I'm 18 or older\")]",
        
        // X button symbols
        "//button[contains(text(), '×')]",
        "//span[contains(text(), '×')]"
      ];
      
      let totalClosed = 0;
      
      // First try CSS selectors
      for (const selector of validCssSelectors) {
        try {
          const elements = await page.$$(selector);
          for (const element of elements) {
            try {
              const isVisible = await element.isIntersectingViewport();
              if (isVisible) {
                await element.click();
                totalClosed++;
                console.log(`[${new Date().toISOString()}] ✅ Closed popup (CSS): ${selector}`);
                await new Promise(resolve => setTimeout(resolve, 500));
              }
            } catch (e) {
              // Element might not be clickable, continue
            }
          }
        } catch (e) {
          // Selector might not exist, continue
        }
      }
      
      // Then try XPath selectors for text-based buttons
      for (const xpath of xpathSelectors) {
        try {
          const elements = await page.$x(xpath);
          for (const element of elements) {
            try {
              const isVisible = await element.isIntersectingViewport();
              if (isVisible) {
                await element.click();
                totalClosed++;
                console.log(`[${new Date().toISOString()}] ✅ Closed popup (XPath): ${xpath}`);
                await new Promise(resolve => setTimeout(resolve, 500));
              }
            } catch (e) {
              // Element might not be clickable, continue
            }
          }
        } catch (e) {
          // XPath might not exist, continue
        }
      }
      
      // Try Escape key as fallback
      if (totalClosed === 0) {
        await page.keyboard.press('Escape');
        await new Promise(resolve => setTimeout(resolve, 500));
        console.log(`[${new Date().toISOString()}] ⌨️ Tried Escape key fallback`);
      }
      
      return totalClosed;
    } catch (error) {
      console.log(`[${new Date().toISOString()}] ⚠️ Popup closing failed: ${error.message}`);
      return 0;
    }
  }

  // Viewport randomization for more realistic browsing
  getRandomViewport() {
    const viewports = [
      { width: 1920, height: 1080 }, // Full HD
      { width: 1366, height: 768 },  // Common laptop
      { width: 1536, height: 864 },  // 125% scaling
      { width: 1440, height: 900 },  // MacBook Pro
      { width: 1280, height: 720 },  // HD
      { width: 375, height: 667 },   // iPhone SE
      { width: 414, height: 896 },   // iPhone XR
      { width: 390, height: 844 }    // iPhone 12
    ];
    
    return viewports[Math.floor(Math.random() * viewports.length)];
  }

  // Enhanced stealth with all new techniques
  async setupUltimateStealthMode(page, username) {
    try {
      console.log(`[${new Date().toISOString()}] 🥷 Setting up ULTIMATE stealth mode for ${username}`);
      
      // 1. Random viewport
      const viewport = this.getRandomViewport();
      await page.setViewport(viewport);
      console.log(`[${new Date().toISOString()}] 📱 Viewport: ${viewport.width}x${viewport.height}`);
      
      // 2. Advanced user agent
      const userAgent = this.getUserAgent();
      await page.setUserAgent(userAgent);
      console.log(`[${new Date().toISOString()}] 🔧 User Agent: ${userAgent.substring(0, 50)}...`);
      
      // 3. Advanced headers
      await this.setupAdvancedHeaders(page);
      
      // 4. Enhanced session data
      await this.injectPersistentSession(page, username);
      
      // 5. Geo spoofing
      await this.setupGeoSpoofing(page);
      
      // 6. Request interception
      await this.setupRequestInterception(page);
      
      // 7. Advanced stealth techniques
      await page.evaluateOnNewDocument(() => {
        // Override WebRTC
        Object.defineProperty(navigator, 'webkitGetUserMedia', { value: undefined });
        Object.defineProperty(navigator, 'getUserMedia', { value: undefined });
        Object.defineProperty(navigator, 'mediaDevices', { value: undefined });
        
        // Override permissions
        Object.defineProperty(navigator, 'permissions', {
          value: {
            query: () => Promise.resolve({ state: 'denied' })
          }
        });
        
        // Override battery API
        Object.defineProperty(navigator, 'getBattery', { value: undefined });
        
        // Random device memory
        Object.defineProperty(navigator, 'deviceMemory', {
          get: () => [4, 8, 16][Math.floor(Math.random() * 3)]
        });
        
        // Random hardware concurrency
        Object.defineProperty(navigator, 'hardwareConcurrency', {
          get: () => [4, 8, 12, 16][Math.floor(Math.random() * 4)]
        });
        
        // Override timezone
        Date.prototype.getTimezoneOffset = function() {
          return [-300, -240, -180, -120][Math.floor(Math.random() * 4)]; // Random US timezones
        };
      });
      
      console.log(`[${new Date().toISOString()}] ✅ Ultimate stealth mode configured`);
      
    } catch (error) {
      console.log(`[${new Date().toISOString()}] ⚠️ Ultimate stealth setup failed: ${error.message}`);
    }
  }

  // Proxy loading removed - relying on Apify for proxy management

  // Update success rate tracking
  updateSuccessRate(success) {
    if (!this.stats) {
      this.stats = { total: 0, successful: 0 };
    }
    this.stats.total++;
    if (success) this.stats.successful++;
    
    const rate = this.stats.total > 0 ? (this.stats.successful / this.stats.total * 100).toFixed(1) : 0;
    this.log(`📊 Success rate: ${this.stats.successful}/${this.stats.total} (${rate}%)`);
  }

  // Create stealth browser with enhanced compatibility
  async createStealthBrowser() {
    return await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu',
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-renderer-backgrounding',
        '--memory-pressure-off',
        '--max_old_space_size=4096',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor',
        '--disable-blink-features=AutomationControlled',
        // Enhanced browser compatibility
        '--ignore-certificate-errors',
        '--ignore-ssl-errors',
        '--ignore-certificate-errors-spki-list',
        '--allow-running-insecure-content',
        '--enable-features=NetworkService',
        '--force-device-scale-factor=1',
        '--high-dpi-support=1',
        '--disable-background-networking',
        '--disable-default-apps',
        '--disable-sync',
        '--disable-translate',
        '--hide-scrollbars',
        '--metrics-recording-only', 
        '--mute-audio',
        '--no-default-browser-check',
        '--no-pings',
        '--password-store=basic',
        '--use-mock-keychain',
        '--disable-component-extensions-with-background-pages',
        '--disable-ipc-flooding-protection'
      ],
      defaultViewport: { width: 1366, height: 768 }
    });
  }

  // Remove duplicate methods that were accidentally added

// Removed duplicate methods - they already exist in the class above

  // 🧠 SMART ADAPTIVE DELAY SYSTEM
  async smartDelay(username) {
    const now = Date.now();
    const stats = this.rateLimitStats;
    
    // Calculate success rate
    const totalRequests = stats.successCount + stats.failureCount;
    const successRate = totalRequests > 0 ? stats.successCount / totalRequests : 0.5;
    
    // Base delay calculation
    let delay = stats.baseDelay;
    
    // Adjust based on recent performance
    if (stats.consecutiveFailures > 3) {
      delay = Math.min(delay * 1.5, stats.maxDelay);
      this.log(`⚠️ High failure rate detected, increasing delay to ${delay}ms`);
    } else if (stats.consecutiveSuccesses > 5) {
      delay = Math.max(delay * 0.8, stats.minDelay);
      this.log(`✅ High success rate, reducing delay to ${delay}ms`);
    }
    
    // Add jitter to avoid detection
    const jitter = delay * 0.2 * Math.random();
    const finalDelay = delay + jitter;
    
    this.log(`⏳ Smart delay for ${username}: ${Math.round(finalDelay)}ms (success rate: ${(successRate * 100).toFixed(1)}%)`);
    
    await new Promise(resolve => setTimeout(resolve, finalDelay));
  }

  // 🧠 UPDATE SUCCESS RATE WITH SMART ADAPTATION
  updateSuccessRate(success) {
    const stats = this.rateLimitStats;
    const now = Date.now();
    
    if (success) {
      stats.successCount++;
      stats.lastSuccessTime = now;
      stats.consecutiveSuccesses++;
      stats.consecutiveFailures = 0;
      
      // Gradually reduce delay on success
      if (stats.consecutiveSuccesses > 3) {
        stats.baseDelay = Math.max(stats.baseDelay * 0.95, stats.minDelay);
      }
    } else {
      stats.failureCount++;
      stats.lastFailureTime = now;
      stats.consecutiveFailures++;
      stats.consecutiveSuccesses = 0;
      
      // Increase delay on failure
      if (stats.consecutiveFailures > 2) {
        stats.baseDelay = Math.min(stats.baseDelay * 1.2, stats.maxDelay);
      }
    }
    
    // Reset counters if too high
    if (stats.consecutiveSuccesses > 10) stats.consecutiveSuccesses = 5;
    if (stats.consecutiveFailures > 10) stats.consecutiveFailures = 5;
  }
}

module.exports = InstagramBypassOptimized; 