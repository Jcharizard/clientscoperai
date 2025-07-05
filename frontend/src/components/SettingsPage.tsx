import React, { useState, useEffect } from 'react';
import { Save, Key, Cookie, Settings, AlertCircle, CheckCircle, Eye, EyeOff, TestTube, Trash2 } from 'lucide-react';
import { AppSettings, CookieData } from '../types';

interface TestResult {
  success: boolean;
  message: string;
  cookieIndex?: number;
}

const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState({
    apifyApiKey: '',
    cookieMode: true, // Default enabled
    cookies: [
      { sessionid: '', ds_user_id: '', csrftoken: '' },
      { sessionid: '', ds_user_id: '', csrftoken: '' },
      { sessionid: '', ds_user_id: '', csrftoken: '' }
    ]
  });
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [saved, setSaved] = useState(false);
  const [testResults, setTestResults] = useState<{[key: number]: TestResult}>({});
  const [showApiKey, setShowApiKey] = useState(false);
  const [errors, setErrors] = useState<{
    general?: string;
    apifyApiKey?: string;
    cookies?: string;
  }>({});

  // Load settings on component mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    console.log('🔧 Loading settings from localStorage...');
    try {
      // Try to load from localStorage first
      const savedSettings = localStorage.getItem('clientscope_settings');
      if (savedSettings) {
        const data = JSON.parse(savedSettings);
        console.log('✅ Settings loaded from localStorage:', data);
        
        const loadedSettings = {
          apifyApiKey: data.apifyApiKey || '',
          cookieMode: data.cookieMode !== undefined ? data.cookieMode : true,
          cookies: data.cookies && data.cookies.length > 0 ? 
            data.cookies.slice(0, 3) :
            [
              { sessionid: '', ds_user_id: '', csrftoken: '' },
              { sessionid: '', ds_user_id: '', csrftoken: '' },
              { sessionid: '', ds_user_id: '', csrftoken: '' }
            ]
        };
        
        setSettings(loadedSettings);
        
        // 🔄 AUTO-SYNC: Sync localStorage to database on load (if settings exist)
        if (data.apifyApiKey || data.cookies?.some(c => c.sessionid || c.ds_user_id || c.csrftoken)) {
          console.log('🔄 Auto-syncing localStorage to database...');
          try {
            await fetch('http://localhost:5001/api/settings/sync-localstorage', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(loadedSettings)
            });
            console.log('✅ Auto-sync completed successfully!');
          } catch (syncError) {
            console.warn('⚠️ Auto-sync failed:', syncError.message);
          }
        }
        
        return;
      }
      
      // If no localStorage, set defaults
      console.log('📝 No saved settings found, using defaults');
      setSettings({
        apifyApiKey: '',
        cookieMode: true,
        cookies: [
          { sessionid: '', ds_user_id: '', csrftoken: '' },
          { sessionid: '', ds_user_id: '', csrftoken: '' },
          { sessionid: '', ds_user_id: '', csrftoken: '' }
        ]
      });
    } catch (error) {
      console.error('❌ Failed to load settings:', error);
    }
  };

  const parseCookieString = (cookieStr) => {
    const cookie = { sessionid: '', ds_user_id: '', csrftoken: '' };
    if (!cookieStr) return cookie;
    
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
  };

  const formatCookieString = (cookie) => {
    const parts = [];
    if (cookie.sessionid) parts.push(`sessionid=${cookie.sessionid}`);
    if (cookie.ds_user_id) parts.push(`ds_user_id=${cookie.ds_user_id}`);
    if (cookie.csrftoken) parts.push(`csrftoken=${cookie.csrftoken}`);
    return parts.join('; ');
  };

  const validateSettings = () => {
    const newErrors: {
      general?: string;
      apifyApiKey?: string;
      cookies?: string;
    } = {};
    
    // More lenient validation - allow empty API key but warn about format if provided
    if (settings.apifyApiKey.trim() && !settings.apifyApiKey.startsWith('apify_api_')) {
      newErrors.apifyApiKey = 'API key format may be incorrect. Expected format: apify_api_...';
    }

    // For cookie mode, only warn if cookies are provided but incomplete
    if (settings.cookieMode) {
      const validCookies = settings.cookies.filter(cookie => 
        cookie.sessionid && cookie.ds_user_id && cookie.csrftoken
      );
      const partialCookies = settings.cookies.filter(cookie => 
        cookie.sessionid || cookie.ds_user_id || cookie.csrftoken
      );
      
      if (partialCookies.length > 0 && validCookies.length === 0) {
        newErrors.cookies = 'Please complete all fields for at least one cookie set, or leave all fields empty';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    console.log('🔧 Saving settings...');
    console.log('📤 Current settings:', settings);
    
    if (!validateSettings()) {
      console.log('❌ Validation failed, not saving');
      return;
    }

    setSaving(true);
    try {
      // Convert to backend format
      const backendSettings = {
        apifyApiKey: settings.apifyApiKey,
        cookieMode: settings.cookieMode,
        cookies: settings.cookies.map(cookie => formatCookieString(cookie))
      };

      console.log('📤 Saving settings to localStorage:', backendSettings);

      // Save to localStorage first
      localStorage.setItem('clientscope_settings', JSON.stringify({
        apifyApiKey: settings.apifyApiKey,
        cookieMode: settings.cookieMode,
        cookies: settings.cookies
      }));

      // 🔄 CRITICAL: Sync localStorage to database for backend scraper
      try {
        const syncResponse = await fetch('http://localhost:5001/api/settings/sync-localstorage', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            apifyApiKey: settings.apifyApiKey,
            cookieMode: settings.cookieMode,
            cookies: settings.cookies
          })
        });
        
        if (syncResponse.ok) {
          console.log('✅ Settings synced to database successfully!');
        } else {
          console.warn('⚠️ Database sync failed, but localStorage saved');
        }
      } catch (syncError) {
        console.warn('⚠️ Database sync failed:', syncError.message);
      }

      console.log('✅ Settings saved to localStorage successfully!');
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('❌ Save failed:', error);
      setErrors({ general: 'Failed to save settings. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const handleTestCookie = async (cookieIndex) => {
    setTesting(true);
    
    // Clear previous test result for this specific cookie
    setTestResults(prev => {
      const newResults = { ...prev };
      delete newResults[cookieIndex];
      return newResults;
    });
    
    try {
      // Use current form data (from state) instead of saved data
      const cookie = settings.cookies[cookieIndex];
      if (!cookie.sessionid || !cookie.ds_user_id || !cookie.csrftoken) {
        setTestResults(prev => ({
          ...prev,
          [cookieIndex]: { success: false, message: 'Please fill in all cookie fields first', cookieIndex }
        }));
        return;
      }

      console.log(`🧪 Testing cookie #${cookieIndex + 1} with data:`, {
        sessionid: `****${cookie.sessionid.slice(-4)}`,
        ds_user_id: `****${cookie.ds_user_id.slice(-4)}`,
        csrftoken: `****${cookie.csrftoken.slice(-4)}`
      });

      // Test the cookie by making a simple Instagram request
      const testResponse = await fetch(`http://localhost:5001/api/test-cookie-new?t=${Date.now()}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          cookieString: formatCookieString(cookie),
          cookieIndex: cookieIndex 
        })
      });

      const result = await testResponse.json();
      console.log(`🔍 Test result for cookie #${cookieIndex + 1}:`, result);
      
      setTestResults(prev => ({
        ...prev,
        [cookieIndex]: { ...result, cookieIndex }
      }));
      
    } catch (error) {
      console.error(`❌ Cookie test error for #${cookieIndex + 1}:`, error);
      setTestResults(prev => ({
        ...prev,
        [cookieIndex]: { success: false, message: 'Test failed: ' + error.message, cookieIndex }
      }));
    } finally {
      setTesting(false);
    }
  };

  const handleCookieChange = (index, field, value) => {
    const newCookies = [...settings.cookies];
    newCookies[index] = { ...newCookies[index], [field]: value };
    setSettings({ ...settings, cookies: newCookies });
    // Clear test result for this specific cookie when user modifies it
    setTestResults(prev => {
      const newResults = { ...prev };
      delete newResults[index];
      return newResults;
    });
  };

  const clearCookie = (index) => {
    const newCookies = [...settings.cookies];
    newCookies[index] = { sessionid: '', ds_user_id: '', csrftoken: '' };
    setSettings({ ...settings, cookies: newCookies });
  };

  const toggleCookieMode = () => {
    setSettings({ ...settings, cookieMode: !settings.cookieMode });
  };

  const getActiveCookieCount = () => {
    return settings.cookies.filter(cookie => 
      cookie.sessionid && cookie.ds_user_id && cookie.csrftoken
    ).length;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg mb-8">
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <Settings className="w-6 h-6 mr-3 text-blue-600" />
              Settings & Configuration
            </h1>
            <p className="text-gray-600 mt-1">Configure your API keys and Instagram session cookies for reliable screenshots</p>
          </div>

          {/* General Error */}
          {errors.general && (
            <div className="p-4 bg-red-50 border-l-4 border-red-400">
              <div className="flex">
                <AlertCircle className="w-5 h-5 text-red-400" />
                <div className="ml-3">
                  <p className="text-red-700">{errors.general}</p>
                </div>
              </div>
            </div>
          )}

          {/* Success Message */}
          {saved && (
            <div className="p-4 bg-green-50 border-l-4 border-green-400">
              <div className="flex">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <div className="ml-3">
                  <p className="text-green-700">Settings saved successfully! Cookie mode is active.</p>
                </div>
              </div>
            </div>
          )}

          <div className="p-6 space-y-8">
            {/* Apify API Key Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <Key className="w-5 h-5 mr-2 text-blue-600" />
                Apify API Configuration
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Apify API Key (Optional)
                  </label>
                  <div className="relative">
                    <input
                      type={showApiKey ? 'text' : 'password'}
                      value={settings.apifyApiKey}
                      onChange={(e) => setSettings({ ...settings, apifyApiKey: e.target.value })}
                      placeholder="apify_api_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                      className={`w-full px-4 py-3 pr-20 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.apifyApiKey ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showApiKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.apifyApiKey && (
                    <p className="text-red-600 text-sm mt-1">{errors.apifyApiKey}</p>
                  )}
                  <p className="text-gray-500 text-sm mt-2">
                    Get your API key from <a href="https://console.apify.com/account/integrations" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Apify Console</a>. Leave empty to use basic screenshot features only.
                  </p>
                </div>
              </div>
            </div>

            {/* Cookie Mode Section */}
            <div className="border-t pt-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                    <Cookie className="w-5 h-5 mr-2 text-orange-600" />
                    Instagram Cookie Sessions
                  </h3>
                  <p className="text-gray-600 text-sm mt-1">
                    Use authenticated Instagram sessions to bypass restrictions (Enabled by default)
                  </p>
                </div>
                
                {/* Toggle Switch */}
                <div className="flex items-center space-x-3">
                  <span className={`text-sm font-medium ${settings.cookieMode ? 'text-gray-400' : 'text-gray-700'}`}>
                    Disabled
                  </span>
                  <button
                    onClick={toggleCookieMode}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                      settings.cookieMode ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.cookieMode ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                  <span className={`text-sm font-medium ${settings.cookieMode ? 'text-blue-600' : 'text-gray-400'}`}>
                    Enabled
                  </span>
                </div>
              </div>

              {/* Cookie Status Indicator */}
              <div className={`p-4 rounded-lg mb-6 ${
                settings.cookieMode 
                  ? 'bg-green-50 border border-green-200' 
                  : 'bg-gray-50 border border-gray-200'
              }`}>
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-3 ${
                    settings.cookieMode ? 'bg-green-500' : 'bg-gray-400'
                  }`}></div>
                  <span className={`text-sm font-medium ${
                    settings.cookieMode ? 'text-green-800' : 'text-gray-600'
                  }`}>
                    Cookie Mode: {settings.cookieMode ? 'ACTIVE' : 'INACTIVE'} ({getActiveCookieCount()}/3 configured)
                  </span>
                </div>
                <p className={`text-xs mt-1 ${
                  settings.cookieMode ? 'text-green-700' : 'text-gray-500'
                }`}>
                  {settings.cookieMode 
                    ? 'Screenshots will use authenticated Instagram sessions for better success rate'
                    : 'Screenshots will use anonymous browsing (may be blocked by Instagram)'
                  }
                </p>
              </div>

              {/* Cookie Input Fields */}
              <div className={`space-y-6 ${!settings.cookieMode ? 'opacity-50' : ''}`}>
                {settings.cookies.map((cookie, index) => (
                  <div key={index} className="bg-gray-50 p-6 rounded-lg border">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium text-gray-800">
                        Instagram Account #{index + 1}
                        {index === 0 && settings.cookieMode && <span className="text-gray-500 ml-1">(Optional)</span>}
                      </h4>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleTestCookie(index)}
                          disabled={!settings.cookieMode || testing || !cookie.sessionid || !cookie.ds_user_id || !cookie.csrftoken}
                          className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <TestTube className="w-4 h-4" />
                          <span>{testing ? 'Testing...' : 'Test'}</span>
                        </button>
                        <button
                          onClick={() => clearCookie(index)}
                          disabled={!settings.cookieMode}
                          className="flex items-center space-x-1 px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Clear</span>
                        </button>
                      </div>
                    </div>
                    
                    {/* Test Result Display - Show result for this specific cookie */}
                    {testResults[index] && (
                      <div className={`p-4 rounded-lg mb-4 ${
                        testResults[index].success 
                          ? 'bg-green-50 border border-green-200' 
                          : 'bg-red-50 border border-red-200'
                      }`}>
                        <div className="flex items-center">
                          {testResults[index].success ? (
                            <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                          ) : (
                            <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                          )}
                          <div className={`text-sm ${
                            testResults[index].success ? 'text-green-800' : 'text-red-800'
                          }`}>
                            <span className="font-medium">
                              Instagram Account #{index + 1} Test Result:
                            </span>
                            <br />
                            <span>{testResults[index].message}</span>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Session ID
                        </label>
                        <input
                          type="text"
                          value={cookie.sessionid}
                          onChange={(e) => handleCookieChange(index, 'sessionid', e.target.value)}
                          disabled={!settings.cookieMode}
                          placeholder="sessionid value from Instagram cookies"
                          className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm ${
                            !settings.cookieMode ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'
                          } border-gray-300`}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          User ID
                        </label>
                        <input
                          type="text"
                          value={cookie.ds_user_id}
                          onChange={(e) => handleCookieChange(index, 'ds_user_id', e.target.value)}
                          disabled={!settings.cookieMode}
                          placeholder="ds_user_id value from Instagram cookies"
                          className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm ${
                            !settings.cookieMode ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'
                          } border-gray-300`}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          CSRF Token
                        </label>
                        <input
                          type="text"
                          value={cookie.csrftoken}
                          onChange={(e) => handleCookieChange(index, 'csrftoken', e.target.value)}
                          disabled={!settings.cookieMode}
                          placeholder="csrftoken value from Instagram cookies"
                          className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm ${
                            !settings.cookieMode ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'
                          } border-gray-300`}
                        />
                      </div>
                    </div>
                  </div>
                ))}
                
                {errors.cookies && (
                  <p className="text-red-600 text-sm">{errors.cookies}</p>
                )}

                {/* Cookie Instructions */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                  <h4 className="font-medium text-blue-900 mb-2">How to get Instagram cookies:</h4>
                  <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                    <li>Open Instagram in Chrome/Firefox and log in to your account</li>
                    <li>Press <kbd className="bg-blue-100 px-1 rounded">F12</kbd> → <strong>Application/Storage</strong> → <strong>Cookies</strong> → <strong>instagram.com</strong></li>
                    <li>Find and copy the values for: <code className="bg-blue-100 px-1 rounded">sessionid</code>, <code className="bg-blue-100 px-1 rounded">ds_user_id</code>, <code className="bg-blue-100 px-1 rounded">csrftoken</code></li>
                    <li>Paste each value into the corresponding field above</li>
                    <li>Click <strong>Test</strong> to verify the cookie works</li>
                  </ol>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="border-t pt-6">
              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium flex items-center justify-center space-x-2"
              >
                <Save className="w-5 h-5" />
                <span>{saving ? 'Saving...' : 'Save Settings'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Quick Status Panel */}
        <div className="bg-white rounded-xl shadow-lg">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Configuration Status</h3>
              <button
                onClick={async () => {
                  try {
                    // Gather comprehensive diagnostic data
                    const healthResponse = await fetch('/api/health');
                    const healthData = await healthResponse.json();
                    
                    // Get settings from localStorage (where they're actually stored)
                    const localStorageSettings = localStorage.getItem('clientscope_settings');
                    let settingsData;
                    if (localStorageSettings) {
                      settingsData = JSON.parse(localStorageSettings);
                    } else {
                      settingsData = {
                        apifyApiKey: '',
                        cookieMode: true,
                        cookies: [
                          { sessionid: '', ds_user_id: '', csrftoken: '' },
                          { sessionid: '', ds_user_id: '', csrftoken: '' },
                          { sessionid: '', ds_user_id: '', csrftoken: '' }
                        ]
                      };
                    }
                    
                    const statusResponse = await fetch('/api/settings/status');
                    const statusData = await statusResponse.json();
                    
                    // Get cookie usage statistics
                    let cookieUsageData = null;
                    try {
                      const cookieUsageResponse = await fetch('/api/cookie-usage');
                      cookieUsageData = await cookieUsageResponse.json();
                    } catch (e) {
                      cookieUsageData = { error: e.message };
                    }
                    
                    // Try to get Apify status if API key exists
                    let apifyData = null;
                    if (settingsData.apifyApiKey) {
                      try {
                        const apifyResponse = await fetch('/apify/status');
                        apifyData = await apifyResponse.json();
                      } catch (e) {
                        apifyData = { error: e.message };
                      }
                    }
                    
                    const now = new Date().toLocaleString();
                    let logData = `====== CLIENTSCOPEAI DIAGNOSTIC LOG ======\n`;
                    logData += `Timestamp: ${now}\n`;
                    logData += `Current URL: ${window.location.href}\n`;
                    logData += `User Agent: ${navigator.userAgent}\n`;
                    logData += `Screen Resolution: ${window.screen.width}x${window.screen.height}\n`;
                    logData += `Viewport: ${window.innerWidth}x${window.innerHeight}\n`;
                    
                    logData += `\n--- SYSTEM HEALTH ---\n`;
                    logData += `Database: ${healthData.health?.database || 'Unknown'}\n`;
                    logData += `Backend Uptime: ${(healthData.health?.uptime || 0).toFixed(2)} seconds\n`;
                    logData += `Memory Usage: ${((healthData.health?.memory?.heapUsed || 0) / 1024 / 1024).toFixed(2)} MB\n`;
                    logData += `Total Leads: ${healthData.health?.stats?.leads || 0}\n`;
                    logData += `Total Sessions: ${healthData.health?.stats?.sessions || 0}\n`;
                    
                    logData += `\n--- SETTINGS CONFIGURATION ---\n`;
                    logData += `Apify API Key: ${settingsData.apifyApiKey ? `****${settingsData.apifyApiKey.slice(-6)}` : 'Not Set'}\n`;
                    logData += `Cookie Mode: ${settingsData.cookieMode ? 'ENABLED' : 'DISABLED'}\n`;
                    logData += `Active Cookies: ${statusData.activeCookies || 0}/3\n`;
                    
                    // Cookie details (masked for security)
                    logData += `\n--- COOKIE ANALYSIS ---\n`;
                    settingsData.cookies.forEach((cookie, index) => {
                      const hasSessionId = cookie.sessionid && cookie.sessionid.length > 0;
                      const hasUserId = cookie.ds_user_id && cookie.ds_user_id.length > 0;
                      const hasCsrfToken = cookie.csrftoken && cookie.csrftoken.length > 0;
                      const isComplete = hasSessionId && hasUserId && hasCsrfToken;
                      
                      logData += `Cookie #${index + 1}: ${isComplete ? 'COMPLETE' : 'INCOMPLETE'}\n`;
                      logData += `  - SessionID: ${hasSessionId ? `****${cookie.sessionid.slice(-4)}` : 'Missing'}\n`;
                      logData += `  - UserID: ${hasUserId ? `****${cookie.ds_user_id.slice(-4)}` : 'Missing'}\n`;
                      logData += `  - CSRF Token: ${hasCsrfToken ? `****${cookie.csrftoken.slice(-4)}` : 'Missing'}\n`;
                    });
                    
                    // Test results if available
                    if (Object.keys(testResults).length > 0) {
                      logData += `\n--- RECENT COOKIE TEST RESULTS ---\n`;
                      Object.entries(testResults).forEach(([index, result]) => {
                        logData += `Cookie #${parseInt(index) + 1}: ${result.success ? 'PASSED' : 'FAILED'}\n`;
                        logData += `  Message: ${result.message}\n`;
                      });
                    }
                    
                    logData += `\n--- APIFY INTEGRATION ---\n`;
                    if (apifyData) {
                      if (apifyData.error) {
                        logData += `Status: ERROR - ${apifyData.error}\n`;
                      } else {
                        logData += `Credits Used: ${apifyData.credits || 0}\n`;
                        logData += `Credits Remaining: ${apifyData.creditsRemaining || 0}\n`;
                        logData += `Success Rate: ${apifyData.successRate || 0}%\n`;
                        logData += `Total Runs: ${apifyData.totalRuns || 0}\n`;
                      }
                    } else {
                      logData += `Status: No API key configured\n`;
                    }
                    
                    logData += `\n--- COOKIE USAGE & CONFLICTS ---\n`;
                    if (cookieUsageData && !cookieUsageData.error) {
                      logData += `Active Sessions: ${cookieUsageData.usage.activeSessions}\n`;
                      logData += `Available Cookies: ${cookieUsageData.usage.availableCookies}\n`;
                      logData += `Recommended Method: ${cookieUsageData.recommendation.toUpperCase()}\n`;
                      if (cookieUsageData.usage.activeSessionDetails.length > 0) {
                        logData += `Active Cookie Sessions:\n`;
                        cookieUsageData.usage.activeSessionDetails.forEach(session => {
                          logData += `  - ${session.cookieId}: ${(session.usageDuration / 1000).toFixed(1)}s active\n`;
                        });
                      }
                    } else {
                      logData += `Cookie Usage: ${cookieUsageData?.error || 'Unable to fetch'}\n`;
                    }
                    
                    logData += `\n--- BROWSER ENVIRONMENT ---\n`;
                    logData += `Cookies Enabled: ${navigator.cookieEnabled}\n`;
                    logData += `Online Status: ${navigator.onLine}\n`;
                    logData += `Language: ${navigator.language}\n`;
                    logData += `Platform: ${navigator.platform}\n`;
                    
                    logData += `\n--- NETWORK CONNECTIVITY ---\n`;
                    const startTime = Date.now();
                    try {
                      await fetch('/api/health');
                      const responseTime = Date.now() - startTime;
                      logData += `Backend Response Time: ${responseTime}ms\n`;
                      logData += `Backend Connection: WORKING\n`;
                    } catch (e) {
                      logData += `Backend Connection: FAILED - ${e.message}\n`;
                    }
                    
                    logData += `\n--- TROUBLESHOOTING TIPS ---\n`;
                    if (!settingsData.apifyApiKey) {
                      logData += `⚠️ No Apify API key configured - Add one in Settings for enhanced scraping\n`;
                    }
                    if (statusData.activeCookies === 0) {
                      logData += `⚠️ No active cookies - Add Instagram cookies for authenticated scraping\n`;
                    }
                    if (Object.values(testResults).some(r => !r.success)) {
                      logData += `⚠️ Cookie tests failing - Try fresh cookies from logged-in Instagram session\n`;
                    }
                    
                    logData += `\n====== END DIAGNOSTIC LOG ======`;
                    
                    await navigator.clipboard.writeText(logData);
                    alert('Comprehensive diagnostic log copied to clipboard!');
                  } catch (error) {
                    console.error('Failed to copy diagnostic log:', error);
                    alert('Failed to copy diagnostic log: ' + error.message);
                  }
                }}
                className="flex items-center space-x-2 px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm"
              >
                <span>📋</span>
                <span>Copy Diagnostic Log</span>
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Apify API Key</span>
                <span className={`text-sm px-2 py-1 rounded ${
                  settings.apifyApiKey ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {settings.apifyApiKey ? 'Configured' : 'Missing'}
                </span>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Cookie Mode</span>
                <span className={`text-sm px-2 py-1 rounded ${
                  settings.cookieMode ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {settings.cookieMode ? 'Enabled' : 'Disabled'}
                </span>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Active Cookies</span>
                <span className={`text-sm px-2 py-1 rounded ${
                  getActiveCookieCount() > 0 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {getActiveCookieCount()}/3
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage; 