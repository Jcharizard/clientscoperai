const fs = require('fs');
const path = require('path');

class CookieManager {
  constructor() {
    this.activeSessions = new Map(); // Track which cookies are currently in use
    this.cookieUsageLog = path.join(__dirname, 'logs', 'cookie_usage.log');
    this.lastUsedTimes = new Map(); // Track when each cookie was last used
    this.minCooldownMs = 3000; // 3 seconds minimum between uses - OPTIMIZED for speed
  }

  logUsage(message) {
    try {
      const timestamp = new Date().toISOString();
      fs.appendFileSync(this.cookieUsageLog, `[${timestamp}] ${message}\n`);
      console.log(`🍪 Cookie Manager: ${message}`);
    } catch (e) {
      console.error('Failed to log cookie usage:', e);
    }
  }

  // Get available cookie for use (not currently active)
  async getAvailableCookie(settingsManager, retryCount = 0) {
    // Prevent infinite recursion
    if (retryCount > 3) {
      throw new Error('Max retries exceeded - cookie manager deadlock prevention');
    }
    const allSettings = await settingsManager.getSettings();
    
    // Get the raw cookie strings and parse them
    const rawCookies = allSettings.cookies || [];
    const activeCookies = [];
    
    // Parse each cookie string into an object
    for (let i = 0; i < rawCookies.length; i++) {
      const cookieString = rawCookies[i];
      // Handle both string and non-string cookie formats - FIXED: Check type first
      if (!cookieString) continue;
      if (typeof cookieString !== 'string') continue; // Skip non-string cookies
      if (cookieString.trim().length === 0) continue; // Now safe to call trim()
      
      // Parse cookie string into object
      const cookieObj = this.parseCookieString(cookieString);
      
      // Only use cookies with required fields
      if (cookieObj.sessionid && cookieObj.ds_user_id) {
        activeCookies.push({ ...cookieObj, index: i });
      }
    }
    
    if (activeCookies.length === 0) {
      throw new Error('No valid cookies configured. Please add Instagram cookies in Settings.');
    }

    this.logUsage(`Found ${activeCookies.length} valid cookies (skipping ${rawCookies.length - activeCookies.length} empty/invalid slots)`);

    // If only one cookie, use it but with longer cooldown for safety
    if (activeCookies.length === 1) {
      const cookieId = 'cookie_0';
      const lastUsed = this.lastUsedTimes.get(cookieId) || 0;
      const timeSinceLastUse = Date.now() - lastUsed;
      const singleCookieCooldown = 4000; // 4 second cooldown for single cookie - OPTIMIZED
      
      if (timeSinceLastUse < singleCookieCooldown) {
        const waitTime = singleCookieCooldown - timeSinceLastUse;
        this.logUsage(`Single cookie mode: Waiting ${waitTime}ms for safety cooldown`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
      
      this.activeSessions.set(cookieId, {
        startTime: Date.now(),
        cookie: activeCookies[0]
      });
      this.lastUsedTimes.set(cookieId, Date.now());
      
      this.logUsage(`Using single cookie with extended safety cooldown`);
      return {
        cookieId,
        cookie: activeCookies[0],
        index: activeCookies[0].index
      };
    }

    // Multiple cookies - find one that's not in use and has cooled down
    for (let i = 0; i < activeCookies.length; i++) {
      const cookieId = `cookie_${i}`;
      const isInUse = this.activeSessions.has(cookieId);
      const lastUsed = this.lastUsedTimes.get(cookieId) || 0;
      const timeSinceLastUse = Date.now() - lastUsed;
      const hasCooledDown = timeSinceLastUse >= this.minCooldownMs;

      if (!isInUse && hasCooledDown) {
        // Reserve this cookie
        this.activeSessions.set(cookieId, {
          startTime: Date.now(),
          cookie: activeCookies[i]
        });
        this.lastUsedTimes.set(cookieId, Date.now());
        
        this.logUsage(`Reserved ${cookieId} for scraping session`);
        return {
          cookieId,
          cookie: activeCookies[i],
          index: activeCookies[i].index
        };
      }
    }

    // If no cookies available, calculate proper wait time
    const cooldownTimes = Array.from(this.lastUsedTimes.values()).map(time => 
      this.minCooldownMs - (Date.now() - time)
    ).filter(time => time > 0);

    if (cooldownTimes.length > 0) {
      const waitTime = Math.min(...cooldownTimes);
      const maxWaitTime = 60000; // Maximum 1 minute wait
      const actualWaitTime = Math.min(waitTime, maxWaitTime);
      
      this.logUsage(`All cookies in use or cooling down. Waiting ${actualWaitTime}ms for availability.`);
      await new Promise(resolve => setTimeout(resolve, actualWaitTime));
      return this.getAvailableCookie(settingsManager, retryCount + 1); // Retry with counter
    }

    // Force release all sessions if stuck (emergency recovery)
    this.logUsage(`Emergency: Force releasing all cookie sessions to prevent deadlock`);
    this.releaseAllCookies();
    
    // Try once more after emergency release
    for (let i = 0; i < activeCookies.length; i++) {
      const cookieId = `cookie_${i}`;
      if (!this.activeSessions.has(cookieId)) {
        this.activeSessions.set(cookieId, {
          startTime: Date.now(),
          cookie: activeCookies[i]
        });
        this.lastUsedTimes.set(cookieId, Date.now());
        
        this.logUsage(`Emergency allocation: ${cookieId} after force release`);
        return {
          cookieId,
          cookie: activeCookies[i],
          index: activeCookies[i].index
        };
      }
    }

    throw new Error('No cookies available after emergency recovery');
  }

  // Parse cookie string into object (NEW METHOD)
  parseCookieString(cookieString) {
    const cookieObj = {};
    const pairs = cookieString.split(';');
    
    this.logUsage(`🔍 Parsing cookie string with ${pairs.length} pairs`);
    
    for (const pair of pairs) {
      const [name, value] = pair.trim().split('=');
      if (name && value) {
        cookieObj[name.trim()] = value.trim();
        this.logUsage(`🍪 Found cookie: ${name.trim()} = ${value.trim().substring(0, 20)}...`);
      }
    }
    
    // 🔥 DEBUG: Check for essential Instagram cookies
    const essentialCookies = ['sessionid', 'ds_user_id', 'csrftoken'];
    const foundEssential = essentialCookies.filter(cookie => cookieObj[cookie]);
    const missingEssential = essentialCookies.filter(cookie => !cookieObj[cookie]);
    
    this.logUsage(`✅ Found essential cookies: ${foundEssential.join(', ')}`);
    if (missingEssential.length > 0) {
      this.logUsage(`❌ Missing essential cookies: ${missingEssential.join(', ')}`);
    }
    
    return cookieObj;
  }

  // Release a cookie when done using it
  releaseCookie(cookieId) {
    if (this.activeSessions.has(cookieId)) {
      const session = this.activeSessions.get(cookieId);
      const usageDuration = Date.now() - session.startTime;
      this.activeSessions.delete(cookieId);
      this.logUsage(`Released ${cookieId} after ${usageDuration}ms usage`);
    }
  }

  // Get usage statistics
  getUsageStats() {
    return {
      activeSessions: this.activeSessions.size,
      totalCookies: this.lastUsedTimes.size,
      availableCookies: this.lastUsedTimes.size - this.activeSessions.size,
      activeSessionDetails: Array.from(this.activeSessions.entries()).map(([id, session]) => ({
        cookieId: id,
        usageDuration: Date.now() - session.startTime
      }))
    };
  }

  // Check if we should use Apify or bypass based on cookie availability
  shouldUseApify(settingsManager) {
    // EXPLANATION OF RECOMMENDATION SYSTEM:
    // 
    // APIFY = Professional service with rotating proxies (costs credits, better success rate)
    // BYPASS = Your local browser scraping (free, but uses your IP directly)
    //
    // RECOMMENDATION LOGIC:
    // - If you have 2+ cookies: Use APIFY (can rotate between cookies safely)  
    // - If you have 1 cookie: Use BYPASS (avoid proxy conflicts with single cookie)
    // - If no cookies: Use BYPASS (public scraping only)
    
    const stats = this.getUsageStats();
    const shouldUseApify = stats.totalCookies >= 2 && stats.availableCookies >= 1;
    
    this.logUsage(`Recommendation: ${shouldUseApify ? 'APIFY' : 'BYPASS'} (${stats.totalCookies} cookies, ${stats.availableCookies} available)`);
    
    return shouldUseApify;
  }

  // Get detailed recommendation with reasoning
  getScrapingRecommendation() {
    const stats = this.getUsageStats();
    
    if (stats.totalCookies === 0) {
      return {
        method: 'bypass',
        reason: 'No cookies configured - using public scraping only',
        safety: 'medium',
        rateLimit: 'Very limited (public API only)'
      };
    }
    
    if (stats.totalCookies === 1) {
      return {
        method: 'bypass', 
        reason: 'Single cookie detected - avoiding proxy conflicts',
        safety: 'high',
        rateLimit: '~200 requests/hour (authenticated)'
      };
    }
    
    if (stats.availableCookies >= 2) {
      return {
        method: 'apify',
        reason: 'Multiple cookies available - can rotate safely',
        safety: 'highest',
        rateLimit: '~500+ requests/hour (distributed)'
      };
    }
    
    return {
      method: 'bypass',
      reason: 'Multiple cookies busy - avoiding conflicts',
      safety: 'high', 
      rateLimit: '~200 requests/hour (authenticated)'
    };
  }

  // Force release all cookies (for emergency situations)
  releaseAllCookies() {
    const count = this.activeSessions.size;
    this.activeSessions.clear();
    this.logUsage(`Emergency release: Freed ${count} cookie sessions`);
  }
}

module.exports = new CookieManager(); 