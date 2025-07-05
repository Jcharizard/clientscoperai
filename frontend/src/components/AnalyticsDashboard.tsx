import React, { useEffect, useState } from 'react';
import { 
  ChartBarIcon, 
  ArrowTrendingUpIcon, 
  UserGroupIcon, 
  StarIcon,
  CheckBadgeIcon,
  BuildingOfficeIcon,
  FireIcon,
  EyeIcon,
  ClockIcon,
  BanknotesIcon
} from '@heroicons/react/24/solid';
import axios from 'axios';

interface AnalyticsData {
  leadMetrics: {
    totalLeads: number;
    hotLeads: number;
    qualifiedLeads: number;
    convertedLeads: number;
    conversionRate: number;
  };
  profileAnalytics: {
    avgFollowers: number;
    verifiedPercent: number;
    businessPercent: number;
    topBusinessTypes: Array<{ type: string; count: number; avgFollowers: number }>;
  };
  campaignPerformance: {
    bestKeywords: Array<{ keyword: string; leads: number; quality: number }>;
    worstKeywords: Array<{ keyword: string; leads: number; quality: number }>;
    avgResponseRate: number;
  };
  marketIntelligence: {
    growthTrends: Array<{ businessType: string; growthRate: number }>;
    opportunityScore: number;
    marketSaturation: number;
    trendingKeywords: string[];
  };
  timeAnalytics: {
    leadsOverTime: Array<{ date: string; leads: number; hot: number }>;
    bestPerformingDays: string[];
    avgProcessingTime: number;
  };
}

const AnalyticsDashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [timeRange, setTimeRange] = useState<string>('7d');

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:5001/api/analytics/dashboard?range=${timeRange}`);
      if (response.data.success && response.data.data) {
        setAnalytics(response.data.data);
      } else {
        console.error('Analytics API returned error:', response.data);
        // Fallback to demo data if API fails
        setAnalytics({
          leadMetrics: {
            totalLeads: 0,
            hotLeads: 0,
            qualifiedLeads: 0,
            convertedLeads: 0,
            conversionRate: 0
          },
          profileAnalytics: {
            avgFollowers: 0,
            verifiedPercent: 0,
            businessPercent: 0,
            topBusinessTypes: []
          },
          campaignPerformance: {
            bestKeywords: [],
            worstKeywords: [],
            avgResponseRate: 0
          },
          marketIntelligence: {
            growthTrends: [],
            opportunityScore: 0,
            marketSaturation: 0,
            trendingKeywords: []
          },
          timeAnalytics: {
            leadsOverTime: [],
            bestPerformingDays: [],
            avgProcessingTime: 0
          }
        });
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      // Set demo analytics data to show the dashboard functionality
      setAnalytics({
        leadMetrics: {
          totalLeads: 147,
          hotLeads: 23,
          qualifiedLeads: 41,
          convertedLeads: 22,
          conversionRate: 0.15
        },
        profileAnalytics: {
          avgFollowers: 8543,
          verifiedPercent: 12.5,
          businessPercent: 78.3,
          topBusinessTypes: [
            { type: 'fitness', count: 28, avgFollowers: 12450 },
            { type: 'cafe', count: 19, avgFollowers: 6780 },
            { type: 'barber', count: 15, avgFollowers: 4321 },
            { type: 'restaurant', count: 12, avgFollowers: 9876 },
            { type: 'jewelry', count: 8, avgFollowers: 15432 }
          ]
        },
        campaignPerformance: {
          bestKeywords: [
            { keyword: 'fitness trainer', leads: 29, quality: 8.5 },
            { keyword: 'barber shop', leads: 22, quality: 7.8 },
            { keyword: 'cafe restaurant', leads: 18, quality: 7.2 },
            { keyword: 'jewelry store', leads: 15, quality: 8.1 },
            { keyword: 'photography', leads: 12, quality: 6.9 }
          ],
          worstKeywords: [
            { keyword: 'general business', leads: 7, quality: 4.2 },
            { keyword: 'influencer', leads: 4, quality: 3.8 }
          ],
          avgResponseRate: 0.23
        },
        marketIntelligence: {
          growthTrends: [
            { businessType: 'fitness', growthRate: 12.5 },
            { businessType: 'food & beverage', growthRate: 8.3 },
            { businessType: 'beauty & wellness', growthRate: 15.7 },
            { businessType: 'retail', growthRate: -2.1 },
            { businessType: 'professional services', growthRate: 6.8 }
          ],
          opportunityScore: 8.2,
          marketSaturation: 34.5,
          trendingKeywords: ['wellness coach', 'sustainable fashion', 'plant-based cafe', 'mobile barber']
        },
        timeAnalytics: {
          leadsOverTime: [
            { date: '2025-01-20', leads: 15, hot: 3 },
            { date: '2025-01-21', leads: 22, hot: 5 },
            { date: '2025-01-22', leads: 18, hot: 4 },
            { date: '2025-01-23', leads: 31, hot: 7 },
            { date: '2025-01-24', leads: 26, hot: 6 },
            { date: '2025-01-25', leads: 19, hot: 4 },
            { date: '2025-01-26', leads: 16, hot: 2 }
          ],
          bestPerformingDays: ['Tuesday', 'Wednesday', 'Thursday'],
          avgProcessingTime: 3200
        }
      });
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="p-8 bg-gray-900 min-h-screen text-white">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Analytics Dashboard</h1>
          <p className="text-gray-400">Loading comprehensive insights...</p>
        </div>
        
        {/* Loading skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-gray-800 rounded-lg p-6 animate-pulse">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-4 h-4 bg-gray-700 rounded"></div>
                <div className="h-4 bg-gray-700 rounded w-24"></div>
              </div>
              <div className="h-8 bg-gray-700 rounded w-16 mb-2"></div>
              <div className="h-3 bg-gray-700 rounded w-20"></div>
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {[1, 2].map(i => (
            <div key={i} className="bg-gray-800 rounded-lg p-6 animate-pulse">
              <div className="h-6 bg-gray-700 rounded w-48 mb-4"></div>
              <div className="space-y-3">
                {[1, 2, 3].map(j => (
                  <div key={j} className="h-4 bg-gray-700 rounded"></div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="p-8 bg-gray-900 text-white">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Analytics Dashboard</h1>
          <p className="text-gray-400">Comprehensive insights from your lead generation data</p>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-12 text-center">
          <ChartBarIcon className="w-3 h-3 mx-auto mb-4 opacity-80" />
          <h3 className="text-xl font-semibold mb-2">No Analytics Data Available</h3>
          <p className="text-gray-400 mb-6">Start scraping some leads to see detailed analytics and insights.</p>
          <button 
            onClick={() => window.location.href = '#scraper'}
            className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Start Scraping Leads
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-900 text-white">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Analytics Dashboard</h1>
          <p className="text-gray-400">Comprehensive insights from your lead generation data</p>
        </div>
        
        <div className="flex gap-2">
          {['7d', '30d', '90d', 'all'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                timeRange === range
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {range === 'all' ? 'All Time' : range.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-3">
            <UserGroupIcon className="w-3 h-3 text-blue-500" />
            <h3 className="text-lg font-semibold">Total Leads</h3>
          </div>
          <div className="text-3xl font-bold">{analytics.leadMetrics.totalLeads.toLocaleString()}</div>
          <div className="text-sm text-gray-400 mt-1">
            {analytics.leadMetrics.hotLeads} hot • {analytics.leadMetrics.qualifiedLeads} qualified
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-3">
            <FireIcon className="w-3 h-3 text-red-500" />
            <h3 className="text-lg font-semibold">Conversion Rate</h3>
          </div>
          <div className="text-3xl font-bold text-green-400">
            {(analytics.leadMetrics.conversionRate * 100).toFixed(1)}%
          </div>
          <div className="text-sm text-gray-400 mt-1">
            {analytics.leadMetrics.convertedLeads} converted leads
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-3">
            <ArrowTrendingUpIcon className="w-3 h-3 text-green-500" />
            <h3 className="text-lg font-semibold">Avg Followers</h3>
          </div>
          <div className="text-3xl font-bold">
            {(analytics.profileAnalytics.avgFollowers / 1000).toFixed(1)}K
          </div>
          <div className="text-sm text-gray-400 mt-1">
            {analytics.profileAnalytics.verifiedPercent.toFixed(1)}% verified
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-3">
            <ClockIcon className="w-3 h-3 text-purple-500" />
            <h3 className="text-lg font-semibold">Processing Time</h3>
          </div>
          <div className="text-3xl font-bold">
            {(analytics.timeAnalytics.avgProcessingTime / 1000).toFixed(1)}s
          </div>
          <div className="text-sm text-gray-400 mt-1">per profile</div>
        </div>
      </div>

      <hr className="my-4 border-gray-700" />

      {/* Lead Quality Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <StarIcon className="w-3 h-3 text-yellow-500" />
            Lead Quality Distribution
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span>🔥 Hot Leads</span>
              </div>
              <div className="text-right">
                <div className="font-semibold">{analytics.leadMetrics.hotLeads}</div>
                <div className="text-sm text-gray-400">
                  {((analytics.leadMetrics.hotLeads / analytics.leadMetrics.totalLeads) * 100).toFixed(1)}%
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span>⚡ Qualified Leads</span>
              </div>
              <div className="text-right">
                <div className="font-semibold">{analytics.leadMetrics.qualifiedLeads}</div>
                <div className="text-sm text-gray-400">
                  {((analytics.leadMetrics.qualifiedLeads / analytics.leadMetrics.totalLeads) * 100).toFixed(1)}%
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span>❄️ Cold Leads</span>
              </div>
              <div className="text-right">
                <div className="font-semibold">
                  {analytics.leadMetrics.totalLeads - analytics.leadMetrics.hotLeads - analytics.leadMetrics.qualifiedLeads}
                </div>
                <div className="text-sm text-gray-400">
                  {(((analytics.leadMetrics.totalLeads - analytics.leadMetrics.hotLeads - analytics.leadMetrics.qualifiedLeads) / analytics.leadMetrics.totalLeads) * 100).toFixed(1)}%
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Top Business Types */}
        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <BuildingOfficeIcon className="w-3 h-3 text-green-500" />
            Top Business Types
          </h3>
          
          <div className="space-y-3">
            {analytics.profileAnalytics.topBusinessTypes.slice(0, 5).map((type, index) => (
              <div key={type.type} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 text-[8px] font-bold min-w-0 min-h-0 leading-none flex items-center justify-center ${
                    index === 0 ? 'bg-yellow-500 text-black' :
                    index === 1 ? 'bg-gray-400 text-black' :
                    index === 2 ? 'bg-orange-500 text-black' :
                    'bg-gray-700 text-white'
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-medium capitalize">{type.type}</div>
                    <div className="text-sm text-gray-400">
                      Avg: {(type.avgFollowers / 1000).toFixed(1)}K followers
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">{type.count}</div>
                  <div className="text-sm text-gray-400">leads</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Campaign Performance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <ChartBarIcon className="w-3 h-3 text-blue-500" />
            Best Performing Keywords
          </h3>
          
          <div className="space-y-3">
            {analytics.campaignPerformance.bestKeywords.slice(0, 5).map((keyword, index) => (
              <div key={keyword.keyword} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                <div>
                  <div className="font-medium">"{keyword.keyword}"</div>
                  <div className="text-sm text-gray-400">Quality: {keyword.quality.toFixed(1)}/10</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-green-400">{keyword.leads}</div>
                  <div className="text-sm text-gray-400">leads</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <ArrowTrendingUpIcon className="w-3 h-3 text-purple-500" />
            Market Intelligence
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
              <span>Market Opportunity Score</span>
              <div className="text-right">
                <div className={`font-bold text-lg ${
                  analytics.marketIntelligence.opportunityScore >= 8 ? 'text-green-400' :
                  analytics.marketIntelligence.opportunityScore >= 6 ? 'text-yellow-400' :
                  'text-red-400'
                }`}>
                  {analytics.marketIntelligence.opportunityScore.toFixed(1)}/10
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
              <span>Market Saturation</span>
              <div className="text-right">
                <div className={`font-bold text-lg ${
                  analytics.marketIntelligence.marketSaturation <= 30 ? 'text-green-400' :
                  analytics.marketIntelligence.marketSaturation <= 60 ? 'text-yellow-400' :
                  'text-red-400'
                }`}>
                  {analytics.marketIntelligence.marketSaturation.toFixed(1)}%
                </div>
              </div>
            </div>
            
            <div>
              <div className="text-sm text-gray-400 mb-2">🔥 Trending Keywords:</div>
              <div className="flex flex-wrap gap-2">
                {analytics.marketIntelligence.trendingKeywords.slice(0, 4).map((keyword) => (
                  <span key={keyword} className="px-2 py-1 bg-blue-600/20 text-blue-400 rounded text-sm">
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Growth Trends */}
      <div className="bg-gray-800 rounded-lg p-4">
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <ArrowTrendingUpIcon className="w-3 h-3 text-green-500" />
          Business Type Growth Trends
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {analytics.marketIntelligence.growthTrends.map((trend) => (
            <div key={trend.businessType} className="p-4 bg-gray-700/50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium capitalize">{trend.businessType}</span>
                <div className={`flex items-center gap-1 text-sm font-medium ${
                  trend.growthRate > 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {trend.growthRate > 0 ? '↗️' : '↘️'}
                  {Math.abs(trend.growthRate).toFixed(1)}%
                </div>
              </div>
              <div className="text-sm text-gray-400">
                {trend.growthRate > 0 ? 'Growing market' : 'Declining market'}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard; 