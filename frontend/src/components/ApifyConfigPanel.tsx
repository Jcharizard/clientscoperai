import React, { useState } from 'react';

interface ApifyConfigPanelProps {
  concurrentRuns?: number;
  setConcurrentRuns: (value: number) => void;
  profilesPerRun?: number;
  setProfilesPerRun: (value: number) => void;
  requestTimeout?: number;
  setRequestTimeout: (value: number) => void;
  retryAttempts?: number;
  setRetryAttempts: (value: number) => void;
  massMode?: boolean;
}

const ApifyConfigPanel: React.FC<ApifyConfigPanelProps> = ({ 
  concurrentRuns = 3,
  setConcurrentRuns,
  profilesPerRun = 25,
  setProfilesPerRun,
  requestTimeout = 60,
  setRequestTimeout,
  retryAttempts = 2,
  setRetryAttempts,
  massMode = false 
}) => {
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);

  const maxConcurrentRuns = massMode ? 10 : 5;
  const maxProfilesPerRun = massMode ? 100 : 50;
  const concurrentRunsProgress = (concurrentRuns - 1) / (maxConcurrentRuns - 1) * 100;
  const profilesPerRunProgress = (profilesPerRun - 10) / (maxProfilesPerRun - 10) * 100;

  const getPerformanceLevel = (): string => {
    if (concurrentRuns === 1) return 'Standard';
    if (concurrentRuns <= 3) return 'Fast';
    return 'Ultra-Fast';
  };

  const getEstimatedCost = (): string => {
    return ((concurrentRuns * profilesPerRun * 0.005)).toFixed(2);
  };

  const getEstimatedTime = (): number => {
    return Math.max(1, Math.ceil(profilesPerRun / 20));
  };

  const getTotalProfiles = (): number => {
    return concurrentRuns * profilesPerRun;
  };

  const getPerformanceColor = (totalProfiles: number): string => {
    if (totalProfiles > 150) return 'bg-red-900 text-red-300';
    if (totalProfiles > 100) return 'bg-orange-900 text-orange-300';
    return 'bg-green-900 text-green-300';
  };

  const getRecommendationContent = () => {
    const totalProfiles = getTotalProfiles();
    
    if (concurrentRuns === 1 && profilesPerRun <= 25) {
      return (
        <div className="flex items-start space-x-2 text-blue-300">
          <span>💡</span>
          <span><strong>Conservative Mode:</strong> Perfect for testing and small searches. Very cost-effective.</span>
        </div>
      );
    }
    
    if (concurrentRuns >= 3 && profilesPerRun >= 30) {
      return (
        <div className="flex items-start space-x-2 text-orange-300">
          <span>⚠️</span>
          <span><strong>High Performance:</strong> Great for large searches but watch your Apify usage costs.</span>
        </div>
      );
    }
    
    if (totalProfiles > 200) {
      return (
        <div className="flex items-start space-x-2 text-red-300">
          <span>🚨</span>
          <span><strong>Maximum Power:</strong> Only use for urgent large-scale lead generation.</span>
        </div>
      );
    }
    
    return null;
  };

  return (
    <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <span className="text-lg">☁️</span>
          <span className="font-semibold text-white">Apify Cloud Configuration</span>
          <span className="bg-blue-600 text-xs px-2 py-1 rounded">ENTERPRISE</span>
        </div>
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-sm text-blue-400 hover:text-blue-300"
        >
          {showAdvanced ? '🔽 Hide Advanced' : '🔧 Advanced Settings'}
        </button>
      </div>

      {/* Main Configuration Grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* Concurrent Runs */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-blue-400">
              ⚡ Concurrent Jobs:
            </label>
            <span className="text-lg font-bold text-blue-400">{concurrentRuns}</span>
          </div>
          <input
            type="range"
            min="1"
            max={maxConcurrentRuns}
            value={concurrentRuns}
            onChange={(e) => setConcurrentRuns(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${concurrentRunsProgress}%, #374151 ${concurrentRunsProgress}%, #374151 100%)`
            }}
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>1</span>
            <span>{maxConcurrentRuns}</span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Run {concurrentRuns} Instagram scraping job{concurrentRuns > 1 ? 's' : ''} simultaneously
          </p>
        </div>

        {/* Profiles Per Run */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-green-400">
              👥 Profiles/Job:
            </label>
            <span className="text-lg font-bold text-green-400">{profilesPerRun}</span>
          </div>
          <input
            type="range"
            min="10"
            max={maxProfilesPerRun}
            step="5"
            value={profilesPerRun}
            onChange={(e) => setProfilesPerRun(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, #10b981 0%, #10b981 ${profilesPerRunProgress}%, #374151 ${profilesPerRunProgress}%, #374151 100%)`
            }}
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>10</span>
            <span>{maxProfilesPerRun}</span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Target {profilesPerRun} profiles per Apify job
          </p>
        </div>
      </div>

      {/* Advanced Settings */}
      {showAdvanced && (
        <div className="mt-4 pt-4 border-t border-gray-700">
          <div className="grid grid-cols-2 gap-4">
            {/* Request Timeout */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-orange-400">
                  ⏱️ Timeout:
                </label>
                <span className="text-sm font-bold text-orange-400">{requestTimeout}s</span>
              </div>
              <input
                type="range"
                min="30"
                max="300"
                step="10"
                value={requestTimeout}
                onChange={(e) => setRequestTimeout(parseInt(e.target.value))}
                className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>30s</span>
                <span>5min</span>
              </div>
            </div>

            {/* Retry Attempts */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-purple-400">
                  🔄 Retries:
                </label>
                <span className="text-sm font-bold text-purple-400">{retryAttempts}</span>
              </div>
              <input
                type="range"
                min="1"
                max="5"
                value={retryAttempts}
                onChange={(e) => setRetryAttempts(parseInt(e.target.value))}
                className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>1</span>
                <span>5</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Performance Preview */}
      <div className="mt-4 bg-gray-900 p-3 rounded border border-gray-700">
        <div className="text-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-300">📊 Expected Performance:</span>
            <span className={`text-sm px-2 py-1 rounded ${getPerformanceColor(getTotalProfiles())}`}>
              {getTotalProfiles()} profiles total
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-xs text-gray-400">
            <div>⚡ Speed: {getPerformanceLevel()}</div>
            <div>💰 Cost: ~${getEstimatedCost()}</div>
            <div>⏰ Time: ~{getEstimatedTime()}min</div>
          </div>
        </div>
      </div>

      {/* Usage Recommendations */}
      <div className="mt-3 text-xs text-gray-400">
        {getRecommendationContent()}
      </div>
    </div>
  );
};

export default ApifyConfigPanel; 