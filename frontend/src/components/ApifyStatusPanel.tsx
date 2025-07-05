import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

interface ApifyConfig {
  concurrentRuns: number;
  profilesPerRun: number;
  requestTimeout: number;
  retryAttempts: number;
}

interface RunHistoryEntry {
  date: string;
  profiles: number;
  status: 'success' | 'failed' | 'running' | 'pending';
  duration: number;
  credits: number;
}

interface ApifyStatusData {
  credits: number;
  creditsLimit: number;
  creditsRemaining: number;
  lastRun: string | null;
  successRate: number;
  totalRuns: number;
  runHistory: RunHistoryEntry[];
  config: ApifyConfig;
}

const ApifyStatusPanel: React.FC = () => {
  const [status, setStatus] = useState<ApifyStatusData>({
    credits: 0,
    creditsLimit: 0,
    creditsRemaining: 0,
    lastRun: null,
    successRate: 0,
    totalRuns: 0,
    runHistory: [],
    config: {
      concurrentRuns: 3,
      profilesPerRun: 25,
      requestTimeout: 60,
      retryAttempts: 2
    }
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [showConfig, setShowConfig] = useState<boolean>(false);
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [apiKey, setApiKey] = useState<string>("");
  const [apiKeySaved, setApiKeySaved] = useState<boolean>(false);
  const [copyToast, setCopyToast] = useState<string>("");
  const logRef = useRef<HTMLDivElement>(null);

  const fetchStatus = async (): Promise<void> => {
    setLoading(true);
    try {
      const response = await axios.get<ApifyStatusData>("http://localhost:5001/apify/status");
      setStatus(response.data);
      setError("");
    } catch (e: any) {
      setError("Failed to fetch Apify status: " + (e.response?.data?.error || e.message));
    }
    setLoading(false);
  };

  const updateConfig = async (newConfig: ApifyConfig): Promise<void> => {
    try {
      await axios.post("http://localhost:5001/apify/config", newConfig);
      setStatus(prev => ({ ...prev, config: newConfig }));
      setError("");
    } catch (e: any) {
      setError("Failed to update configuration");
    }
  };

  const saveApiKey = async (): Promise<void> => {
    try {
      // Save to Apify endpoint (which now saves to database)
      await axios.post("http://localhost:5001/apify/save-api", { apiKey });
      
      // Also update the main settings so both are in sync
      const settingsResponse = await axios.get("http://localhost:5001/api/settings");
      const currentSettings = settingsResponse.data;
      const updatedSettings = {
        ...currentSettings,
        apifyApiKey: apiKey
      };
      await axios.post("http://localhost:5001/api/settings", updatedSettings);
      
      setApiKeySaved(true);
      setTimeout(() => setApiKeySaved(false), 2000);
      fetchStatus();
    } catch (e: any) {
      setError("Failed to save API key");
    }
  };

  const handleCopyLog = (): void => {
    const now = new Date().toLocaleString();
    let text = `==== Apify Status Diagnostic Log ====
`;
    text += `Timestamp: ${now}\n`;
    text += `Current URL: ${window.location.href}\n`;
    text += `User Agent: ${navigator.userAgent}\n`;
    if (error) text += `\nError: ${error}\n`;
    text += `\n--- API Key Status ---\n`;
    if (apiKey && apiKey.length > 6) {
      text += `API Key: ****${apiKey.slice(-6)}\n`;
    } else {
      text += `API Key: Not set or too short\n`;
    }
    text += `\n--- Apify Status ---\n`;
    text += `Credits Used: ${status.credits}\n`;
    text += `Credits Limit: ${status.creditsLimit}\n`;
    text += `Credits Remaining: ${status.creditsRemaining}\n`;
    text += `Last Run: ${status.lastRun ? new Date(status.lastRun).toLocaleString() : 'Never'}\n`;
    text += `Success Rate: ${status.successRate}%\n`;
    text += `Total Runs: ${status.totalRuns}\n`;
    text += `\n--- Last 10 Run History Entries ---\n`;
    if (status.runHistory && status.runHistory.length > 0) {
      status.runHistory.slice(0, 10).forEach((run, i) => {
        text += `#${i+1}: [${new Date(run.date).toLocaleString()}] ${run.status} | Profiles: ${run.profiles} | Duration: ${run.duration}s | Credits: ${run.credits}\n`;
      });
    } else {
      text += 'No run history available.\n';
    }
    text += `\n--- Config ---\n`;
    Object.entries(status.config || {}).forEach(([k, v]) => {
      text += `${k}: ${v}\n`;
    });
    text += `\n==== End of Log ====`;
    navigator.clipboard.writeText(text).then(() => {
      setCopyToast("Copied log!");
      setTimeout(() => setCopyToast(""), 2000);
    }).catch(() => {
      setCopyToast("Failed to copy");
      setTimeout(() => setCopyToast(""), 2000);
    });
  };

  // Load API key from Settings on component mount
  const loadApiKeyFromSettings = async (): Promise<void> => {
    try {
      const response = await axios.get("http://localhost:5001/api/settings");
      const settings = response.data;
      if (settings.apifyApiKey) {
        setApiKey(settings.apifyApiKey);
      }
    } catch (e: any) {
      console.log("Could not load API key from settings");
    }
  };

  useEffect(() => {
    loadApiKeyFromSettings(); // Load API key first
    fetchStatus();
    // Refresh status every 30 seconds
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleInputChange = (field: keyof ApifyConfig, value: number): void => {
    updateConfig({ ...status.config, [field]: value });
  };

  return (
    <div className="p-8 bg-gray-900 min-h-screen text-white">
      <h1 className="text-3xl font-bold mb-6">Apify Status</h1>
      
      {error && (
        <div className="bg-red-900/30 border-l-4 border-red-500 p-4 mb-6">
          <p className="text-red-300">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Credits Card */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 flex flex-col justify-between w-full">
          <h3 className="text-lg font-semibold mb-2">Credits</h3>
          <div className="space-y-2">
            <div className="flex justify-between pr-8">
              <span className="text-gray-400">Used:</span>
              <span className="font-mono">{status.credits}</span>
            </div>
            <div className="flex justify-between pr-8">
              <span className="text-gray-400">Limit:</span>
              <span className="font-mono">{status.creditsLimit}</span>
            </div>
            <div className="flex justify-between pr-8">
              <span className="text-gray-400">Remaining:</span>
              <span className="font-mono text-green-400">{status.creditsRemaining}</span>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-700">
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{ width: `${(status.credits / (status.creditsLimit || 1)) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Card */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 flex flex-col justify-between w-full">
          <h3 className="text-lg font-semibold mb-2">Performance</h3>
          <div className="space-y-2">
            <div className="flex justify-between pr-8">
              <span className="text-gray-400">Success Rate:</span>
              <span className="font-mono text-green-400">{status.successRate}%</span>
            </div>
            <div className="flex justify-between pr-8">
              <span className="text-gray-400">Total Runs:</span>
              <span className="font-mono">{status.totalRuns}</span>
            </div>
            <div className="flex justify-between pr-8">
              <span className="text-gray-400">Last Run:</span>
              <span className="font-mono">{status.lastRun ? new Date(status.lastRun).toLocaleString() : 'Never'}</span>
            </div>
            <button 
              onClick={() => setShowHistory(!showHistory)}
              className="w-full mt-4 bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded transition"
            >
              {showHistory ? 'Hide Run History' : 'Show Run History'}
            </button>
          </div>
        </div>

        {/* Quick Actions Card */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 flex flex-col justify-between w-full">
          <h3 className="text-lg font-semibold mb-2">Quick Actions</h3>
          <div className="space-y-3">
            <button 
              onClick={fetchStatus}
              className="w-full bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded transition"
            >
              Refresh Status
            </button>
            <button 
              onClick={() => window.open('https://console.apify.com', '_blank', 'noopener,noreferrer')}
              className="w-full bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded transition"
            >
              Open Apify Console
            </button>
            <button 
              onClick={() => setShowConfig(!showConfig)}
              className="w-full bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded transition"
            >
              {showConfig ? 'Hide Configuration' : 'Show Configuration'}
            </button>
            <button 
              onClick={handleCopyLog}
              className="w-full bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded transition"
            >
              Copy Log
            </button>
            {copyToast && <span className="text-green-400 ml-2">{copyToast}</span>}
          </div>
        </div>
      </div>

      {/* Configuration Panel */}
      {showConfig && (
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 mb-8 max-w-xl">
          <h3 className="text-lg font-semibold mb-4">Apify Configuration</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Concurrent Runs
              </label>
              <input
                type="number"
                value={status.config.concurrentRuns}
                onChange={(e) => handleInputChange('concurrentRuns', parseInt(e.target.value))}
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
                min="1"
                max="10"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Profiles Per Run
              </label>
              <input
                type="number"
                value={status.config.profilesPerRun}
                onChange={(e) => handleInputChange('profilesPerRun', parseInt(e.target.value))}
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
                min="1"
                max="100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Request Timeout (seconds)
              </label>
              <input
                type="number"
                value={status.config.requestTimeout}
                onChange={(e) => handleInputChange('requestTimeout', parseInt(e.target.value))}
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
                min="30"
                max="300"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Retry Attempts
              </label>
              <input
                type="number"
                value={status.config.retryAttempts}
                onChange={(e) => handleInputChange('retryAttempts', parseInt(e.target.value))}
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
                min="0"
                max="5"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-400 mb-2">
                API Key
              </label>
              <input
                type="password"
                value={apiKey}
                onChange={e => setApiKey(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 font-mono"
                placeholder="Enter Apify API Key"
                autoComplete="off"
              />
              <button
                onClick={saveApiKey}
                className="mt-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded transition"
              >
                Save API Key
              </button>
              {apiKeySaved && <span className="text-green-400 ml-2">Saved!</span>}
            </div>
          </div>
        </div>
      )}

      {/* Run History Panel */}
      {showHistory && (
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 mb-8">
          <h3 className="text-lg font-semibold mb-4">Run History</h3>
          <div className="overflow-x-auto" style={{maxWidth: '100vw'}}>
            <table className="min-w-full">
              <thead>
                <tr className="text-left text-sm text-gray-400">
                  <th className="pb-3">Date</th>
                  <th className="pb-3">Profiles</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Duration</th>
                  <th className="pb-3">Credits Used</th>
                </tr>
              </thead>
              <tbody>
                {status.runHistory.map((run, index) => (
                  <tr key={index} className="border-t border-gray-700">
                    <td className="py-3">{new Date(run.date).toLocaleString()}</td>
                    <td className="py-3">{run.profiles}</td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded text-sm ${
                        run.status === 'success' ? 'bg-green-900/30 text-green-400' :
                        run.status === 'failed' ? 'bg-red-900/30 text-red-400' :
                        'bg-yellow-900/30 text-yellow-400'
                      }`}>
                        {run.status}
                      </span>
                    </td>
                    <td className="py-3">{run.duration}s</td>
                    <td className="py-3">{run.credits}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-semibold mb-4">About Apify Integration</h3>
        <div className="space-y-4 text-gray-300">
          <p>
            Your app now uses Apify's professional Instagram scraping service. This provides:
          </p>
          <ul className="list-disc ml-6 space-y-2">
            <li>Reliable scraping with built-in proxy rotation</li>
            <li>Automatic rate limiting and anti-bot evasion</li>
            <li>High-quality data extraction</li>
            <li>Professional infrastructure and uptime</li>
          </ul>
          <p className="text-sm text-gray-400 mt-4">
            Note: Apify credits are used for each scraping run. Monitor your usage in the credits section above.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ApifyStatusPanel; 