const fs = require('fs').promises;
const path = require('path');

const SETTINGS_FILE = path.join(__dirname, 'saved', 'settings.json');

class SettingsManager {
  constructor() {
    this.settings = {
      apifyApiKey: '',
      cookieMode: true,
      cookies: ['', '', '']
    };
    this.initialized = false;
    this.initPromise = this.loadSettings();
  }

  async ensureInitialized() {
    if (!this.initialized) {
      await this.initPromise;
    }
  }

  async loadSettings() {
    try {
      // 🔥 FIX: Read from enhanced database instead of old schema
      const db = require('./db_enhanced');
      const dbSettings = await db.getSettings();
      
      this.settings = {
        apifyApiKey: dbSettings.apifyApiKey || '',
        cookieMode: dbSettings.cookieMode !== undefined ? dbSettings.cookieMode : true,
        cookies: dbSettings.cookies || ['', '', '']
      };
      
      console.log('✅ Settings loaded from database');
      console.log(`🍪 Found ${this.settings.cookies.filter(c => c && c.trim()).length} configured cookies`);
      
      // Also maintain JSON file for backward compatibility
      await this.saveToJsonFile();
      
    } catch (error) {
      console.error('❌ Error loading settings from database:', error.message);
      // Fallback to JSON file if database fails
      await this.loadFromJsonFile();
    }
    this.initialized = true;
  }

  async loadFromJsonFile() {
    try {
      await fs.mkdir(path.dirname(SETTINGS_FILE), { recursive: true });
      const data = await fs.readFile(SETTINGS_FILE, 'utf8');
      this.settings = { ...this.settings, ...JSON.parse(data) };
      console.log('✅ Settings loaded from JSON file (fallback)');
    } catch (error) {
      if (error.code !== 'ENOENT') {
        console.error('❌ Error loading settings from JSON:', error.message);
      }
      // Use defaults if both database and file fail
      console.log('📄 Using default settings');
    }
  }

  async saveToJsonFile() {
    try {
      await fs.mkdir(path.dirname(SETTINGS_FILE), { recursive: true });
      await fs.writeFile(SETTINGS_FILE, JSON.stringify(this.settings, null, 2));
    } catch (error) {
      console.error('❌ Error saving settings to JSON file:', error.message);
    }
  }

  async saveSettings() {
    try {
      // 🔥 FIX: Save to enhanced database instead of old schema
      const db = require('./db_enhanced');
      await db.saveSettings(this.settings);
      
      // Also maintain JSON file for backward compatibility
      await this.saveToJsonFile();
      
      console.log('✅ Settings saved to database and JSON file');
      return true;
    } catch (error) {
      console.error('❌ Error saving settings:', error.message);
      return false;
    }
  }

  async getSettings() {
    await this.ensureInitialized();
    
    // 🔥 FIX: Always get fresh settings from enhanced database for real-time updates
    try {
      const db = require('./db_enhanced');
      const dbSettings = await db.getSettings();
      
      // Update internal cache with database values
      this.settings = {
        apifyApiKey: dbSettings.apifyApiKey || '',
        cookieMode: dbSettings.cookieMode !== undefined ? dbSettings.cookieMode : true,
        cookies: dbSettings.cookies || ['', '', '']
      };
      
      return { ...this.settings };
    } catch (error) {
      console.error('❌ Error getting fresh settings from database:', error.message);
      // Fallback to cached settings
    return { ...this.settings };
    }
  }

  async updateSettings(newSettings) {
    await this.ensureInitialized();
    
    // More lenient validation - allow empty API key but warn about format if provided
    if (newSettings.apifyApiKey && newSettings.apifyApiKey.trim() && !newSettings.apifyApiKey.startsWith('apify_api_')) {
      console.warn('⚠️ Warning: API key may be in incorrect format. Expected format: apify_api_...');
    }

    // For cookie mode, only validate if cookies are provided
    if (newSettings.cookieMode && newSettings.cookies) {
      const hasValidCookies = newSettings.cookies.some(cookie => 
        cookie && typeof cookie === 'string' && cookie.trim().length > 0
      );
      
      if (!hasValidCookies) {
        console.warn('⚠️ Warning: Cookie mode is enabled but no cookies provided');
      }
    }

    // Update settings with more flexible handling
    this.settings = {
      apifyApiKey: newSettings.apifyApiKey ? newSettings.apifyApiKey.trim() : '',
      cookieMode: Boolean(newSettings.cookieMode),
      cookies: newSettings.cookies ? newSettings.cookies.map(cookie => cookie ? cookie.trim() : '') : ['', '', '']
    };

    const success = await this.saveSettings();
    if (!success) {
      throw new Error('Failed to save settings');
    }

    return this.settings;
  }

  async getApifyApiKey() {
    await this.ensureInitialized();
    return this.settings.apifyApiKey;
  }

  async isCookieModeEnabled() {
    await this.ensureInitialized();
    return this.settings.cookieMode;
  }

  async getActiveCookies() {
    await this.ensureInitialized();
    if (!this.settings.cookieMode) return [];
    return this.settings.cookies.filter(cookie => cookie.trim() !== '');
  }

  async getRandomCookie() {
    const activeCookies = await this.getActiveCookies();
    if (activeCookies.length === 0) return null;
    return activeCookies[Math.floor(Math.random() * activeCookies.length)];
  }

  // Helper method to format cookies for browser use
  parseCookieString(cookieString) {
    const cookies = [];
    const pairs = cookieString.split(';');
    
    for (const pair of pairs) {
      const [name, value] = pair.trim().split('=');
      if (name && value) {
        cookies.push({
          name: name.trim(),
          value: value.trim(),
          domain: '.instagram.com',
          path: '/',
          httpOnly: false,
          secure: true
        });
      }
    }
    
    return cookies;
  }

  // Get formatted cookies for a browser session
  async getBrowserCookies() {
    const cookieString = await this.getRandomCookie();
    if (!cookieString) return [];
    return this.parseCookieString(cookieString);
  }
}

// Create singleton instance
const settingsManager = new SettingsManager();

module.exports = settingsManager; 