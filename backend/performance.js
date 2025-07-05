// 🚀 Performance Optimization Module for ClientScopeAI
const fs = require('fs');
const path = require('path');

class PerformanceOptimizer {
  constructor() {
    this.cache = new Map();
    this.CACHE_TTL = 300000; // 5 minutes
    this.retryConfig = {
      maxRetries: 3,
      baseDelay: 1000,
      maxDelay: 10000
    };
  }

  // 📦 Caching System
  getCached(key) {
    const item = this.cache.get(key);
    if (item && Date.now() - item.timestamp < this.CACHE_TTL) {
      return item.data;
    }
    this.cache.delete(key);
    return null;
  }

  setCached(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  clearCache() {
    this.cache.clear();
  }

  // 🔄 Batch Processing
  async processBatch(items, processor, batchSize = 10, delayMs = 1000) {
    const results = [];
    
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      console.log(`Processing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(items.length/batchSize)}`);
      
      try {
        const batchResults = await Promise.all(
          batch.map(item => this.withRetry(() => processor(item)))
        );
        results.push(...batchResults);
        
        // Rate limiting between batches
        if (i + batchSize < items.length) {
          await this.delay(delayMs);
        }
      } catch (e) {
        console.error(`Batch processing error:`, e);
        // Continue with next batch
      }
    }
    
    return results;
  }

  // 🔁 Retry Logic with Exponential Backoff
  async withRetry(fn, customConfig = {}) {
    const config = { ...this.retryConfig, ...customConfig };
    
    for (let attempt = 0; attempt < config.maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        if (attempt === config.maxRetries - 1) {
          throw error;
        }
        
        const delay = Math.min(
          config.baseDelay * Math.pow(2, attempt),
          config.maxDelay
        );
        
        console.log(`Retry attempt ${attempt + 1}/${config.maxRetries} after ${delay}ms`);
        await this.delay(delay);
      }
    }
  }

  // ⏱️ Smart Delay with Jitter
  async delay(ms, jitter = 0.1) {
    const jitterMs = ms * jitter * Math.random();
    const totalDelay = ms + jitterMs;
    return new Promise(resolve => setTimeout(resolve, totalDelay));
  }

  // 📊 Memory Monitoring
  getMemoryUsage() {
    const usage = process.memoryUsage();
    return {
      rss: Math.round(usage.rss / 1024 / 1024), // MB
      heapUsed: Math.round(usage.heapUsed / 1024 / 1024), // MB
      heapTotal: Math.round(usage.heapTotal / 1024 / 1024), // MB
      external: Math.round(usage.external / 1024 / 1024) // MB
    };
  }

  // 🧹 Memory Cleanup
  forceGarbageCollection() {
    if (global.gc) {
      global.gc();
      console.log('🧹 Garbage collection forced');
    }
  }

  // 📈 Performance Metrics
  startTimer(label) {
    const start = process.hrtime.bigint();
    return {
      end: () => {
        const end = process.hrtime.bigint();
        const duration = Number(end - start) / 1000000; // Convert to milliseconds
        console.log(`⏱️ ${label}: ${duration.toFixed(2)}ms`);
        return duration;
      }
    };
  }

  // 🔍 Lead Deduplication Optimization
  deduplicateLeads(newLeads, existingLeads) {
    const timer = this.startTimer('Lead Deduplication');
    
    // Create a Set for O(1) lookup
    const existingUsernames = new Set(
      existingLeads.map(lead => lead.username || lead.url)
    );
    
    const unique = [];
    const duplicates = [];
    
    for (const lead of newLeads) {
      const key = lead.username || lead.url;
      if (existingUsernames.has(key)) {
        duplicates.push(lead);
      } else {
        unique.push(lead);
        existingUsernames.add(key);
      }
    }
    
    timer.end();
    return { unique, duplicates };
  }

  // 🎯 Smart Proxy Selection
  selectOptimalProxy(proxies, usageStats = {}) {
    if (!proxies.length) return null;
    
    // Sort by success rate and recent usage
    const scored = proxies.map(proxy => {
      const stats = usageStats[proxy] || { success: 0, total: 0, lastUsed: 0 };
      const successRate = stats.total > 0 ? stats.success / stats.total : 0.5;
      const timeSinceLastUse = Date.now() - stats.lastUsed;
      
      // Prefer proxies with high success rate and less recent usage
      const score = successRate * 0.7 + (timeSinceLastUse / 3600000) * 0.3; // 1 hour = 1.0
      
      return { proxy, score, stats };
    });
    
    scored.sort((a, b) => b.score - a.score);
    return scored[0].proxy;
  }

  // 📊 Performance Report
  generateReport() {
    const memory = this.getMemoryUsage();
    const cacheSize = this.cache.size;
    
    return {
      timestamp: new Date().toISOString(),
      memory,
      cache: {
        size: cacheSize,
        hitRate: this.cacheHitRate || 0
      },
      uptime: process.uptime(),
      version: '1.0.0'
    };
  }

  // 🔧 Auto-optimization
  autoOptimize() {
    const memory = this.getMemoryUsage();
    
    // Clear cache if memory usage is high
    if (memory.heapUsed > 400) { // 400MB threshold
      console.log('🧹 High memory usage detected, clearing cache');
      this.clearCache();
    }
    
    // Force garbage collection if needed
    if (memory.heapUsed > 500) { // 500MB threshold
      this.forceGarbageCollection();
    }
  }

  // 📊 Instagram Scraping Performance Analytics
  generateInstagramReport() {
    const memory = this.getMemoryUsage();
    const cacheSize = this.cache.size;
    const uptime = process.uptime();
    
    // Calculate performance metrics
    const requestsPerMinute = this.instagramStats?.requestsPerMinute || 0;
    const successRate = this.instagramStats?.successRate || 0;
    const avgResponseTime = this.instagramStats?.avgResponseTime || 0;
    
    return {
      timestamp: new Date().toISOString(),
      memory,
      cache: {
        size: cacheSize,
        hitRate: this.cacheHitRate || 0
      },
      uptime,
      instagram: {
        requestsPerMinute,
        successRate: `${(successRate * 100).toFixed(1)}%`,
        avgResponseTime: `${avgResponseTime.toFixed(0)}ms`,
        recommendedDelay: this.calculateOptimalDelay(),
        status: this.getInstagramStatus()
      },
      version: '1.0.0'
    };
  }

  // 🧠 Calculate optimal delay based on performance
  calculateOptimalDelay() {
    const successRate = this.instagramStats?.successRate || 0.5;
    const baseDelay = 1000;
    
    if (successRate > 0.8) return Math.max(baseDelay * 0.7, 500); // Fast mode
    if (successRate > 0.6) return baseDelay; // Normal mode
    if (successRate > 0.4) return baseDelay * 1.5; // Conservative mode
    return baseDelay * 2; // Very conservative mode
  }

  // 📈 Get Instagram scraping status
  getInstagramStatus() {
    const successRate = this.instagramStats?.successRate || 0;
    const requestsPerMinute = this.instagramStats?.requestsPerMinute || 0;
    
    if (successRate > 0.8 && requestsPerMinute < 30) return 'OPTIMAL';
    if (successRate > 0.6) return 'GOOD';
    if (successRate > 0.4) return 'FAIR';
    return 'POOR';
  }

  // 🔄 Instagram-specific auto-optimization
  autoOptimizeInstagram() {
    const memory = this.getMemoryUsage();
    const successRate = this.instagramStats?.successRate || 0;
    
    // Clear cache if memory usage is high
    if (memory.heapUsed > 400) { // 400MB threshold
      console.log('🧹 High memory usage detected, clearing cache');
      this.clearCache();
    }
    
    // Adjust scraping strategy based on success rate
    if (successRate < 0.3) {
      console.log('⚠️ Low success rate detected, recommending conservative mode');
      return { mode: 'conservative', delay: 3000 };
    } else if (successRate > 0.8) {
      console.log('✅ High success rate, enabling fast mode');
      return { mode: 'fast', delay: 800 };
    }
    
    return { mode: 'normal', delay: 1500 };
  }
}

// 🚀 Export singleton instance
module.exports = new PerformanceOptimizer(); 