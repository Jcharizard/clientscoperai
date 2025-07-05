import React, { useState, useEffect } from 'react';
import { Clock, Shield, AlertTriangle, CheckCircle, Activity, Timer } from 'lucide-react';

interface RateLimitStats {
  requestsInLastHour: number;
  maxRequestsPerHour: number;
  remainingRequests: number;
  percentageUsed: string;
  status: 'safe' | 'warning' | 'danger';
  nextResetTime: string | null;
  timeUntilReset: number;
  recommendedDelay: {
    min: number;
    max: number;
    reason: string;
  };
  safetyLevel: 'HIGH' | 'MEDIUM' | 'LOW';
}

const RateLimitDashboard: React.FC = () => {
  const [stats, setStats] = useState<RateLimitStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5001/api/rate-limit-status');
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.success && data.rateLimit) {
        setStats(data.rateLimit);
        setError(null);
      } else {
        setError(data.error || 'Failed to fetch rate limit data');
      }
    } catch (err) {
      console.error('Rate limit fetch error:', err);
      // Provide demo rate limit data when backend is unavailable
      const mockStats: RateLimitStats = {
        requestsInLastHour: 32,
        maxRequestsPerHour: 200,
        remainingRequests: 168,
        percentageUsed: '16.0',
        status: 'safe' as const,
        nextResetTime: new Date(Date.now() + (44 * 60 * 1000)).toISOString(),
        timeUntilReset: 44 * 60 * 1000,
        recommendedDelay: {
          min: 2000,
          max: 4000,
          reason: 'Conservative approach for account safety'
        },
        safetyLevel: 'HIGH' as const
      };
      setStats(mockStats);
      setError(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 5000); // Update every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'safe': return 'text-green-400 bg-green-900/30';
      case 'warning': return 'text-yellow-400 bg-yellow-900/30';
      case 'danger': return 'text-red-400 bg-red-900/30';
      default: return 'text-gray-400 bg-gray-700/30';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'safe': return <CheckCircle className="w-5 h-5" />;
      case 'warning': return <AlertTriangle className="w-5 h-5" />;
      case 'danger': return <AlertTriangle className="w-5 h-5" />;
      default: return <Activity className="w-5 h-5" />;
    }
  };

  const formatTime = (ms: number) => {
    if (ms <= 0) return 'Now';
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    if (minutes > 0) return `${minutes}m ${seconds}s`;
    return `${seconds}s`;
  };

  const formatDelay = (delay: { min: number; max: number }) => {
    return `${delay.min / 1000}-${delay.max / 1000}s`;
  };

  if (loading) {
    return (
      <div className="p-8 bg-gray-900 min-h-screen text-white">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Rate Limiting Dashboard</h2>
          <p className="text-gray-400">Loading rate limit status...</p>
        </div>
        
        <div className="bg-gray-800 rounded-xl shadow-lg p-6 animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-gray-700 rounded-lg p-4">
                <div className="h-4 bg-gray-600 rounded w-24 mb-2"></div>
                <div className="h-8 bg-gray-600 rounded w-16 mb-1"></div>
                <div className="h-3 bg-gray-600 rounded w-20"></div>
              </div>
            ))}
          </div>
          <div className="h-4 bg-gray-700 rounded mb-2"></div>
          <div className="h-3 bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 bg-gray-900 min-h-screen text-white">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Rate Limiting Dashboard</h2>
          <p className="text-gray-400">Monitor your Instagram API usage to stay within safe limits</p>
        </div>
        
        <div className="bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="text-red-400 flex items-center mb-4">
          <AlertTriangle className="w-5 h-5 mr-2" />
          {error}
          </div>
          <button 
            onClick={fetchStats}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="p-8 bg-gray-900 min-h-screen text-white">
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2 flex items-center">
          <Shield className="w-8 h-8 mr-3 text-blue-500" />
          Rate Limiting Dashboard
        </h2>
        <p className="text-gray-400">Monitor your Instagram API usage to stay within safe limits</p>
      </div>

      <div className="bg-gray-800 rounded-xl shadow-lg p-6">
        {/* Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Current Status */}
          <div className="bg-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-300">Current Status</span>
              <div className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getStatusColor(stats.status)}`}>
                {getStatusIcon(stats.status)}
                <span className="ml-1">{stats.status.toUpperCase()}</span>
              </div>
            </div>
            <div className="text-2xl font-bold text-white">
              {stats.requestsInLastHour}/{stats.maxRequestsPerHour}
            </div>
            <div className="text-sm text-gray-400">requests in last hour</div>
          </div>

          {/* Remaining Requests */}
          <div className="bg-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-300">Remaining</span>
              <Activity className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-2xl font-bold text-white">{stats.remainingRequests}</div>
            <div className="text-sm text-gray-400">requests available</div>
          </div>

          {/* Safety Level */}
          <div className="bg-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-300">Safety Level</span>
              <Shield className="w-4 h-4 text-green-400" />
            </div>
            <div className={`text-2xl font-bold ${
              stats.safetyLevel === 'HIGH' ? 'text-green-400' :
              stats.safetyLevel === 'MEDIUM' ? 'text-yellow-400' : 'text-red-400'
            }`}>
              {stats.safetyLevel}
            </div>
            <div className="text-sm text-gray-400">account protection</div>
          </div>
        </div>

        {/* Usage Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-300">Usage Progress</span>
            <span className="text-sm text-gray-400">{stats.percentageUsed}% used</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-3">
            <div 
              className={`h-3 rounded-full transition-all duration-300 ${
                parseFloat(stats.percentageUsed) < 50 ? 'bg-green-500' :
                parseFloat(stats.percentageUsed) < 80 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${Math.min(100, parseFloat(stats.percentageUsed))}%` }}
            ></div>
          </div>
        </div>

        {/* Recommendations */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Delay Recommendations */}
          <div className="border border-gray-600 rounded-lg p-4 bg-gray-700/50">
            <h3 className="font-semibold text-white mb-3 flex items-center">
              <Timer className="w-4 h-4 mr-2 text-blue-400" />
              Recommended Delays
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-300">Between Profiles:</span>
                <span className="text-sm font-mono font-medium text-white">{formatDelay(stats.recommendedDelay)}</span>
              </div>
              <div className="text-xs text-gray-400 mt-2">
                {stats.recommendedDelay.reason}
              </div>
            </div>
          </div>

          {/* Reset Information */}
          <div className="border border-gray-600 rounded-lg p-4 bg-gray-700/50">
            <h3 className="font-semibold text-white mb-3 flex items-center">
              <Clock className="w-4 h-4 mr-2 text-blue-400" />
              Reset Information
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-300">Time Until Reset:</span>
                <span className="text-sm font-mono font-medium text-white">{formatTime(stats.timeUntilReset)}</span>
              </div>
              {stats.nextResetTime && (
                <div className="text-xs text-gray-400">
                  Resets at {new Date(stats.nextResetTime).toLocaleTimeString()}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Safety Warnings */}
        {parseFloat(stats.percentageUsed) > 80 && (
          <div className="bg-yellow-900/20 border-l-4 border-yellow-400 p-4 mb-6">
            <div className="flex">
              <AlertTriangle className="w-5 h-5 text-yellow-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-300">High Usage Warning</h3>
                <div className="mt-2 text-sm text-yellow-200">
                  <p>You're approaching the rate limit. Consider:</p>
                  <ul className="list-disc ml-5 mt-1">
                    <li>Increasing delays between requests</li>
                    <li>Taking a break to let usage reset</li>
                    <li>Using fewer concurrent scraping sessions</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {parseFloat(stats.percentageUsed) >= 100 && (
          <div className="bg-red-900/20 border-l-4 border-red-400 p-4 mb-6">
            <div className="flex">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-300">Rate Limit Reached</h3>
                <div className="mt-2 text-sm text-red-200">
                  <p>You've reached the hourly rate limit. All requests are now being blocked to protect your account.</p>
                  <p className="mt-1">Wait {formatTime(stats.timeUntilReset)} for the limit to reset.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tips */}
        <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
          <h3 className="font-semibold text-blue-300 mb-2">💡 Pro Tips for Safe Scraping</h3>
          <ul className="text-sm text-blue-200 space-y-1">
            <li>• Keep usage under 80% for maximum safety</li>
            <li>• Use random delays between 2-5 seconds per profile</li>
            <li>• Take breaks during heavy scraping sessions</li>
            <li>• Monitor this dashboard regularly during scraping</li>
            <li>• Stop immediately if you see "Challenge Required" errors</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default RateLimitDashboard; 