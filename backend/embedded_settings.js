const fs = require('fs');
const path = require('path');

// Settings file path
const SETTINGS_FILE = path.join(__dirname, 'settings.json');

// Initialize settings file if it doesn't exist
if (!fs.existsSync(SETTINGS_FILE)) {
  const defaultSettings = {
    apifyApiKey: '',
    cookieMode: true,
    cookies: [
      { sessionid: '', ds_user_id: '', csrftoken: '' },
      { sessionid: '', ds_user_id: '', csrftoken: '' },
      { sessionid: '', ds_user_id: '', csrftoken: '' }
    ]
  };
  fs.writeFileSync(SETTINGS_FILE, JSON.stringify(defaultSettings, null, 2));
}

// Settings handlers
const settingsHandlers = {
  // GET /api/settings
  getSettings: () => {
    try {
      const settings = JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf8'));
      console.log('✅ Settings loaded:', settings);
      return { success: true, data: settings };
    } catch (error) {
      console.error('❌ Error loading settings:', error);
      return { success: false, error: 'Failed to load settings' };
    }
  },

  // POST /api/settings
  saveSettings: (data) => {
    try {
      const { apifyApiKey, cookieMode, cookies } = data;
      
      // Convert cookie strings back to objects
      const cookieObjects = cookies.map(cookieStr => {
        if (!cookieStr) return { sessionid: '', ds_user_id: '', csrftoken: '' };
        
        const cookie = { sessionid: '', ds_user_id: '', csrftoken: '' };
        const pairs = cookieStr.split(';');
        pairs.forEach(pair => {
          const [name, value] = pair.trim().split('=');
          if (name && value) {
            if (name === 'sessionid') cookie.sessionid = value;
            else if (name === 'ds_user_id') cookie.ds_user_id = value;
            else if (name === 'csrftoken') cookie.csrftoken = value;
          }
        });
        return cookie;
      });
      
      const settings = {
        apifyApiKey: apifyApiKey || '',
        cookieMode: cookieMode !== undefined ? cookieMode : true,
        cookies: cookieObjects
      };
      
      fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2));
      console.log('✅ Settings saved successfully');
      
      return { 
        success: true, 
        message: 'Settings saved successfully!',
        settings: {
          apifyConfigured: !!settings.apifyApiKey,
          cookieModeEnabled: settings.cookieMode,
          activeCookies: settings.cookies.filter(c => c.sessionid && c.ds_user_id && c.csrftoken).length
        }
      };
    } catch (error) {
      console.error('❌ Error saving settings:', error);
      return { success: false, error: 'Failed to save settings' };
    }
  }
};

module.exports = settingsHandlers; 