// 🚀 Optimized Scraper Configuration for ClientScopeAI
module.exports = {
  // 🧠 SMART RATE LIMITING
  rateLimiting: {
    baseDelay: 1000,
    minDelay: 500,
    maxDelay: 5000,
    jitterFactor: 0.2,
    successRateThreshold: 0.7,
    failureRateThreshold: 0.3,
    consecutiveFailureLimit: 5,
    consecutiveSuccessLimit: 10
  },

  // 🔄 BROWSER POOL OPTIMIZATION
  browserPool: {
    minBrowsers: 1,
    maxBrowsers: 3,
    profilesPerBrowser: 3,
    browserTimeout: 30000,
    pageTimeout: 15000,
    reuseBrowsers: true,
    isolateSessions: true
  },

  // ⚡ PARALLEL PROCESSING
  parallel: {
    maxConcurrent: 2,
    chunkSize: 2,
    staggerDelay: 500,
    adaptiveChunking: true,
    successBasedScaling: true
  },

  // 📱 MOBILE OPTIMIZATION
  mobile: {
    viewport: { width: 375, height: 667 },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.2 Mobile/15E148 Safari/604.1',
    skipDesktop: true,
    popupHandling: 'aggressive',
    waitTime: 1500
  },

  // 🛡️ STEALTH ENHANCEMENTS
  stealth: {
    enableStealthPlugin: true,
    randomizeUserAgent: true,
    spoofReferrer: true,
    blockImages: false,
    blockCSS: false,
    blockFonts: false,
    requestInterception: true,
    cookieRotation: true
  },

  // 🍪 COOKIE MANAGEMENT
  cookies: {
    rotationEnabled: true,
    maxCookies: 5,
    cookieTimeout: 7200000, // 2 hours
    validateBeforeUse: true,
    fallbackToAnonymous: true
  },

  // 📊 PERFORMANCE MONITORING
  monitoring: {
    trackSuccessRate: true,
    trackResponseTime: true,
    trackMemoryUsage: true,
    autoOptimize: true,
    logLevel: 'info',
    performanceThresholds: {
      memoryWarning: 400, // MB
      memoryCritical: 500, // MB
      successRateWarning: 0.4,
      responseTimeWarning: 10000 // ms
    }
  },

  // 🔄 RETRY STRATEGY
  retry: {
    maxRetries: 3,
    exponentialBackoff: true,
    baseDelay: 1000,
    maxDelay: 10000,
    retryOnRateLimit: true,
    retryOnNetworkError: true
  },

  // 🎯 SCREENSHOT OPTIMIZATION
  screenshots: {
    quality: 80,
    format: 'png',
    fullPage: false,
    optimizeImages: true,
    maxFileSize: 1024 * 1024, // 1MB
    compressionEnabled: true
  },

  // 🔍 SEARCH OPTIMIZATION
  search: {
    maxResults: 15,
    searchStrategies: ['instagram_search', 'hashtag_search', 'bing_search'],
    fallbackEnabled: true,
    deduplication: true,
    qualityFiltering: true
  },

  // ⚙️ ADVANCED SETTINGS
  advanced: {
    enableCaching: true,
    cacheTTL: 300000, // 5 minutes
    enableCompression: true,
    enableGzip: true,
    connectionPooling: true,
    keepAlive: true
  }
}; 