import React, { useMemo } from 'react';

const HashtagAnalytics = ({ leads }) => {
  const hashtagAnalysis = useMemo(() => {
    if (!leads || leads.length === 0) return { hashtags: [], totalHashtags: 0 };

    const hashtagMap = new Map();
    let totalHashtags = 0;

    leads.forEach(lead => {
      // Extract hashtags from bio
      if (lead.bioHashtags && Array.isArray(lead.bioHashtags)) {
        lead.bioHashtags.forEach(hashtag => {
          totalHashtags++;
          const tag = hashtag.toLowerCase();
          
          if (hashtagMap.has(tag)) {
            const existing = hashtagMap.get(tag);
            existing.count++;
            existing.totalEngagement += (lead.avgLikesPerPost || 0) + (lead.avgCommentsPerPost || 0);
            existing.totalFollowers += parseInt(lead.followers?.toString().replace(/[^0-9]/g, '') || '0');
            existing.users.push(lead.username);
          } else {
            hashtagMap.set(tag, {
              hashtag: hashtag,
              count: 1,
              totalEngagement: (lead.avgLikesPerPost || 0) + (lead.avgCommentsPerPost || 0),
              totalFollowers: parseInt(lead.followers?.toString().replace(/[^0-9]/g, '') || '0'),
              users: [lead.username],
              avgLeadScore: lead.bioScore?.pitch_score || 0
            });
          }
        });
      }
    });

    // Calculate performance metrics
    const hashtags = Array.from(hashtagMap.values())
      .map(tag => ({
        ...tag,
        avgEngagement: tag.count > 0 ? Math.round(tag.totalEngagement / tag.count) : 0,
        avgFollowers: tag.count > 0 ? Math.round(tag.totalFollowers / tag.count) : 0,
        avgLeadScore: tag.count > 0 ? Math.round((tag.avgLeadScore / tag.count) * 10) / 10 : 0,
        performance: calculatePerformanceScore(tag)
      }))
      .sort((a, b) => b.performance - a.performance)
      .slice(0, 20); // Top 20 hashtags

    return { hashtags, totalHashtags };
  }, [leads]);

  const calculatePerformanceScore = (tag) => {
    // Performance score based on usage, engagement, and lead quality
    const usageScore = Math.min(tag.count * 10, 50); // Max 50 points for usage
    const engagementScore = Math.min(tag.totalEngagement / 100, 30); // Max 30 points for engagement
    const leadQualityScore = tag.avgLeadScore * 2; // Max 20 points for lead quality
    
    return Math.round(usageScore + engagementScore + leadQualityScore);
  };

  const getPerformanceColor = (score) => {
    if (score >= 80) return 'text-green-400 bg-green-900/20';
    if (score >= 60) return 'text-blue-400 bg-blue-900/20';
    if (score >= 40) return 'text-yellow-400 bg-yellow-900/20';
    return 'text-red-400 bg-red-900/20';
  };

  const getPerformanceGrade = (score) => {
    if (score >= 80) return 'A';
    if (score >= 60) return 'B';
    if (score >= 40) return 'C';
    return 'D';
  };

  if (!leads || leads.length === 0) {
    return (
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6">
        <h3 className="text-xl font-bold text-white mb-4">🏷️ Hashtag Performance</h3>
        <div className="text-center py-8 text-gray-400">
          No hashtag data available. Scrape some leads to see hashtag analytics.
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white">🏷️ Hashtag Performance</h3>
        <div className="text-sm text-gray-400">
          {hashtagAnalysis.totalHashtags} total hashtags analyzed
        </div>
      </div>

      {hashtagAnalysis.hashtags.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          No hashtags found in the current leads.
        </div>
      ) : (
        <div className="space-y-3">
          {hashtagAnalysis.hashtags.slice(0, 10).map((tag, index) => (
            <div 
              key={tag.hashtag} 
              className="bg-gray-700/30 rounded-lg p-4 hover:bg-gray-700/50 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <span className="text-gray-400 text-sm">#{index + 1}</span>
                  <span className="text-blue-400 font-medium">{tag.hashtag}</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getPerformanceColor(tag.performance)}`}>
                    {getPerformanceGrade(tag.performance)}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-white font-semibold">{tag.performance}/100</div>
                  <div className="text-xs text-gray-400">Performance</div>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4 text-sm">
                <div className="text-center">
                  <div className="text-orange-400 font-medium">{tag.count}</div>
                  <div className="text-gray-500 text-xs">Uses</div>
                </div>
                <div className="text-center">
                  <div className="text-green-400 font-medium">{tag.avgEngagement.toLocaleString()}</div>
                  <div className="text-gray-500 text-xs">Avg Engagement</div>
                </div>
                <div className="text-center">
                  <div className="text-blue-400 font-medium">{tag.avgFollowers.toLocaleString()}</div>
                  <div className="text-gray-500 text-xs">Avg Followers</div>
                </div>
                <div className="text-center">
                  <div className="text-purple-400 font-medium">{tag.avgLeadScore}/10</div>
                  <div className="text-gray-500 text-xs">Lead Quality</div>
                </div>
              </div>

              {tag.users.length > 0 && (
                <div className="mt-2 text-xs text-gray-400">
                  Used by: {tag.users.slice(0, 3).join(', ')}
                  {tag.users.length > 3 && ` +${tag.users.length - 3} more`}
                </div>
              )}
            </div>
          ))}

          {hashtagAnalysis.hashtags.length > 10 && (
            <div className="text-center pt-4">
              <button className="text-blue-400 hover:text-blue-300 text-sm">
                Show {hashtagAnalysis.hashtags.length - 10} more hashtags...
              </button>
            </div>
          )}
        </div>
      )}

      {/* Top Insights */}
      {hashtagAnalysis.hashtags.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-700/50">
          <h4 className="text-lg font-semibold text-white mb-3">📊 Key Insights</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-900/20 rounded-lg p-3 border border-green-500/30">
              <div className="text-green-400 font-medium mb-1">🏆 Top Performer</div>
              <div className="text-white">{hashtagAnalysis.hashtags[0]?.hashtag}</div>
              <div className="text-sm text-gray-400">{hashtagAnalysis.hashtags[0]?.performance}/100 score</div>
            </div>
            
            <div className="bg-blue-900/20 rounded-lg p-3 border border-blue-500/30">
              <div className="text-blue-400 font-medium mb-1">📈 Most Used</div>
              <div className="text-white">
                {hashtagAnalysis.hashtags.reduce((prev, current) => 
                  prev.count > current.count ? prev : current
                )?.hashtag}
              </div>
              <div className="text-sm text-gray-400">
                {hashtagAnalysis.hashtags.reduce((prev, current) => 
                  prev.count > current.count ? prev : current
                )?.count} uses
              </div>
            </div>
            
            <div className="bg-purple-900/20 rounded-lg p-3 border border-purple-500/30">
              <div className="text-purple-400 font-medium mb-1">🎯 Best Quality</div>
              <div className="text-white">
                {hashtagAnalysis.hashtags.reduce((prev, current) => 
                  prev.avgLeadScore > current.avgLeadScore ? prev : current
                )?.hashtag}
              </div>
              <div className="text-sm text-gray-400">
                {hashtagAnalysis.hashtags.reduce((prev, current) => 
                  prev.avgLeadScore > current.avgLeadScore ? prev : current
                )?.avgLeadScore}/10 quality
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HashtagAnalytics; 