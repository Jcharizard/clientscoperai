import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import LeadScoringGuide from "./LeadScoringGuide";
import { Lead } from '../types';

// Interfaces for component data
interface TooltipProps {
  text: string;
  children: React.ReactNode;
}

interface LeadScore {
  score: number;
  tier: 'HOT' | 'WARM' | 'QUALIFIED' | 'COLD';
  action: string;
  confidence: number;
}

interface ActivityData {
  isActive: boolean;
  daysSinceLastPost: number;
  hasActiveStory: boolean;
  isVerified: boolean;
  activityScore: number;
}

interface ContactInfo {
  emails: string[];
  phones: string[];
  websites: string[];
  messagingApps: string[];
  bookingPlatforms: string[];
  contactScore: number;
  hasDirectContact: boolean;
}

interface EngagementData {
  engagementRate: number;
  engagementTier: 'Excellent' | 'Good' | 'Average' | 'Low' | 'Unknown';
  avgLikes: number;
  avgComments: number;
  isHighEngagement: boolean;
}

interface ExportButtonProps {
  leads: Lead[];
  sessionName: string;
  onClear: () => void;
}

interface AdvancedFiltersProps {
  leads: Lead[];
  onFilterChange: (filteredLeads: Lead[]) => void;
}

interface ProxyStatus {
  status: 'ok' | 'fail';
}

interface Analytics {
  hotLeads: number;
  warmLeads: number;
  contactLeads: number;
  avgBioScore: number;
  avgVisionScore: number;
}

interface CurrentProgress {
  current: number;
  target: number;
}

interface ActiveSession {
  id: string;
  name: string;
  leads: Lead[];
}

interface DedupInfo {
  newLeads: number;
  duplicates: number;
}

interface FilterCriteria {
  bioScoreMin: number;
  visionScoreMin: number;
  hasEmail: boolean;
  hasBookingLinks: boolean;
  businessType: string;
  minFollowers: number;
  maxFollowers: number;
}

// Advanced Settings Interface
interface AdvancedSettings {
  followerLimit: number;
}

const Tooltip: React.FC<TooltipProps> = ({ text, children }) => (
  <div className="group relative inline-block">
    {children}
    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-900 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
      {text}
      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
    </div>
  </div>
);

// 🚀 ENHANCED LEAD QUALITY BADGE WITH IMPROVED SCORING
const LeadQualityBadge: React.FC<{ lead: Lead }> = ({ lead }) => {
  const getTierData = (leadScore: number, leadTier: string) => {
    // Use the actual lead score from backend (0-100) and convert to 0-10 for display
    const displayScore = leadScore / 10;
    
    // Use the tier from backend if available
    if (leadTier === 'HOT') return { tier: 'HOT', color: 'bg-red-600', text: '🔥 HOT', score: displayScore };
    if (leadTier === 'WARM') return { tier: 'WARM', color: 'bg-orange-600', text: '🌟 WARM', score: displayScore };
    if (leadTier === 'QUALIFIED') return { tier: 'QUALIFIED', color: 'bg-blue-600', text: '✅ QUALIFIED', score: displayScore };
    
    // Fallback to score-based logic if tier not available
    if (displayScore >= 8) return { tier: 'HOT', color: 'bg-red-600', text: '🔥 HOT', score: displayScore };
    if (displayScore >= 6) return { tier: 'WARM', color: 'bg-orange-600', text: '🌟 WARM', score: displayScore };
    if (displayScore >= 4) return { tier: 'QUALIFIED', color: 'bg-blue-600', text: '✅ QUALIFIED', score: displayScore };
    return { tier: 'COLD', color: 'bg-gray-600', text: '❄️ COLD', score: displayScore };
  };

  const bioScore = lead.bioScore?.pitch_score || 0;
  const visionScore = lead.visionScore?.professional_score || 0;
  const leadScore = lead.leadScore || 0; // Use actual lead score from backend
  const leadTier = lead.leadTier || 'COLD'; // Use actual tier from backend
  const { color, text, score } = getTierData(leadScore, leadTier);

  return (
    <div className="flex items-center space-x-2 text-xs">
      <Tooltip text={`Bio: ${bioScore}/10 | Vision: ${visionScore}/10 | Lead Score: ${leadScore}/100`}>
        <span className={`${color} px-2 py-1 rounded`}>
          {text}
        </span>
      </Tooltip>
      <span className="text-gray-400">⚡Score: {score.toFixed(1)}/10</span>
    </div>
  );
};

// 🔥 NEW ACTIVITY STATUS COMPONENT
const ActivityStatus: React.FC<{ activityData?: ActivityData }> = ({ activityData }) => {
  if (!activityData) return null;
  
  const getActivityColor = (score: number) => {
    if (score >= 8) return 'text-green-400';
    if (score >= 6) return 'text-yellow-400';
    if (score >= 4) return 'text-orange-400';
    return 'text-red-400';
  };

  const getActivityText = (score: number) => {
    if (score >= 8) return 'Very Active';
    if (score >= 6) return 'Active';
    if (score >= 4) return 'Moderate';
    return 'Inactive';
  };
  
  return (
    <div className="flex items-center space-x-2 text-xs">
      <Tooltip text={`Days since last post: ${activityData.daysSinceLastPost} | Has story: ${activityData.hasActiveStory ? 'Yes' : 'No'} | Verified: ${activityData.isVerified ? 'Yes' : 'No'}`}>
        <span className={`${getActivityColor(activityData.activityScore)}`}>
          {activityData.isActive ? '🟢' : '🔴'} {getActivityText(activityData.activityScore)}
        </span>
      </Tooltip>
    </div>
  );
};

// 🔥 NEW CONTACT INFO COMPONENT
const ContactInfo: React.FC<{ contactInfo?: ContactInfo; email?: string }> = ({ contactInfo, email }) => {
  if (!contactInfo && !email) return null;
  
  const hasContact = email || (contactInfo && contactInfo.hasDirectContact);
  const contactScore = contactInfo?.contactScore || (email ? 8 : 0);
  
  return (
    <div className="flex items-center space-x-2 text-xs">
      <Tooltip text={`Contact Score: ${contactScore}/10 | Direct Contact: ${hasContact ? 'Yes' : 'No'}`}>
        <span className={`${hasContact ? 'bg-green-600' : 'bg-gray-600'} px-2 py-1 rounded`}>
          {hasContact ? '📧 Contact' : '❌ No Contact'}
        </span>
      </Tooltip>
    </div>
  );
};

// 🔥 NEW ENGAGEMENT METRICS COMPONENT
const EngagementMetrics: React.FC<{ engagementData?: EngagementData }> = ({ engagementData }) => {
  if (!engagementData) return null;
  
  const tierColors = {
    'Excellent': 'bg-green-600',
    'Good': 'bg-blue-600',
    'Average': 'bg-yellow-600',
    'Low': 'bg-gray-600',
    'Unknown': 'bg-gray-700'
  };
  
  return (
    <div className="flex items-center space-x-2 text-xs">
      <Tooltip text={`Avg Likes: ${engagementData.avgLikes} | Avg Comments: ${engagementData.avgComments}`}>
        <span className={`${tierColors[engagementData.engagementTier]} px-2 py-1 rounded`}>
          📊 {engagementData.engagementTier} ({engagementData.engagementRate}%)
        </span>
      </Tooltip>
      {engagementData.isHighEngagement && (
        <span className="bg-gold-600 px-2 py-1 rounded animate-pulse">🏆 HIGH ENGAGEMENT</span>
      )}
    </div>
  );
};

const ExportButton: React.FC<ExportButtonProps> = ({ leads, sessionName, onClear }) => {
  const exportToCSV = (): void => {
    const headers = ['Username', 'URL', 'Email', 'Followers', 'Bio', 'Bio Score', 'Vision Score', 'Business Type'];
    const csvData = leads.map(lead => [
      lead.username || '',
      lead.url || '',
      lead.email || '',
      lead.followers || '',
      (lead.bio || '').replace(/"/g, '""'),
      lead.bioScore?.pitch_score || '',
      lead.visionScore?.professional_score || '',
      lead.bioScore?.business_type || ''
    ]);
    
    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${sessionName || 'leads'}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportToJSON = (): void => {
    const jsonContent = JSON.stringify(leads, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${sessionName || 'leads'}_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClear = (): void => {
    if (confirm('Clear all current results? Session name will be kept.')) {
      onClear();
    }
  };

  return (
    <div className="flex space-x-2">
      <button className="bg-green-600 px-4 py-2 rounded text-sm" onClick={exportToCSV}>
        Export CSV
      </button>
      <button className="bg-blue-600 px-4 py-2 rounded text-sm" onClick={exportToJSON}>
        Export JSON
      </button>
      <button className="bg-red-600 px-4 py-2 rounded text-sm" onClick={handleClear}>
        Clear Results
      </button>
    </div>
  );
};

const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({ leads, onFilterChange }) => {
  const [filters, setFilters] = useState<FilterCriteria>({
    bioScoreMin: 0,
    visionScoreMin: 0,
    hasEmail: false,
    hasBookingLinks: false,
    businessType: '',
    minFollowers: 0,
    maxFollowers: 1000000
  });

  const applyFilters = (newFilters: FilterCriteria): void => {
    const filtered = leads.filter(lead => {
      const bioScore = lead.bioScore?.pitch_score || 0;
      const visionScore = lead.visionScore?.professional_score || 0;
      const followers = lead.followers || 0;

      return (
        bioScore >= newFilters.bioScoreMin &&
        visionScore >= newFilters.visionScoreMin &&
        (!newFilters.hasEmail || !!lead.email) &&
        (!newFilters.hasBookingLinks || ((lead as any).bookingLinks && (lead as any).bookingLinks.length > 0)) &&
        (!newFilters.businessType || (lead.bioScore?.business_type?.toLowerCase().includes(newFilters.businessType.toLowerCase()))) &&
        followers >= newFilters.minFollowers &&
        followers <= newFilters.maxFollowers
      );
    });
    
    onFilterChange(filtered);
  };

  const handleFilterChange = (key: keyof FilterCriteria, value: any): void => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    applyFilters(newFilters);
  };

  return (
    <div className="bg-gray-800 p-4 rounded mt-4">
      <h3 className="text-lg font-bold mb-4">Advanced Filters</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm mb-1">Min Bio Score</label>
          <input
            type="number"
            min="0"
            max="10"
            className="bg-black border px-3 py-2 w-full"
            value={filters.bioScoreMin}
            onChange={(e) => handleFilterChange('bioScoreMin', Number(e.target.value))}
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Min Vision Score</label>
          <input
            type="number"
            min="0"
            max="10"
            className="bg-black border px-3 py-2 w-full"
            value={filters.visionScoreMin}
            onChange={(e) => handleFilterChange('visionScoreMin', Number(e.target.value))}
          />
        </div>
        <div>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={filters.hasEmail}
              onChange={(e) => handleFilterChange('hasEmail', e.target.checked)}
            />
            <span>Has Email</span>
          </label>
        </div>
        <div>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={filters.hasBookingLinks}
              onChange={(e) => handleFilterChange('hasBookingLinks', e.target.checked)}
            />
            <span>Has Booking Links</span>
          </label>
        </div>
        <div>
          <label className="block text-sm mb-1">Business Type</label>
          <input
            type="text"
            className="bg-black border px-3 py-2 w-full"
            value={filters.businessType}
            onChange={(e) => handleFilterChange('businessType', e.target.value)}
            placeholder="e.g. restaurant, salon"
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Followers Range</label>
          <div className="flex space-x-2">
            <input
              type="number"
              className="bg-black border px-3 py-2 w-full"
              value={filters.minFollowers}
              onChange={(e) => handleFilterChange('minFollowers', Number(e.target.value))}
              placeholder="Min"
            />
            <input
              type="number"
              className="bg-black border px-3 py-2 w-full"
              value={filters.maxFollowers}
              onChange={(e) => handleFilterChange('maxFollowers', Number(e.target.value))}
              placeholder="Max"
            />
          </div>
        </div>
      </div>
    </div>
  );
}; 

// Additional components needed for the ScraperPanel
const AdvancedTooltip: React.FC<{ text: string; children: React.ReactNode; position?: string; className?: string }> = ({ text, children, position = 'auto', className = '' }) => {
  const [isVisible, setIsVisible] = useState(false);

  const getPositionClasses = () => {
    switch (position) {
      case 'top': return 'bottom-full left-1/2 transform -translate-x-1/2 mb-2';
      case 'bottom': return 'top-full left-1/2 transform -translate-x-1/2 mt-2';
      case 'left': return 'right-full top-1/2 transform -translate-y-1/2 mr-2';
      case 'right': return 'left-full top-1/2 transform -translate-y-1/2 ml-2';
      default: return 'bottom-full left-1/2 transform -translate-x-1/2 mb-2';
    }
  };

  const getArrowClasses = () => {
    switch (position) {
      case 'top': return 'top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900';
      case 'bottom': return 'bottom-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-gray-900';
      case 'left': return 'left-full top-1/2 transform -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-l-4 border-transparent border-l-gray-900';
      case 'right': return 'right-full top-1/2 transform -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent border-r-gray-900';
      default: return 'top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900';
    }
  };

  return (
    <div 
      className={`relative inline-block ${className}`}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div className={`absolute ${getPositionClasses()} px-3 py-2 text-sm text-white bg-gray-900 rounded-lg shadow-lg opacity-100 transition-opacity duration-200 whitespace-nowrap z-50 max-w-xs`}>
          {text}
          <div className={`absolute ${getArrowClasses()}`}></div>
        </div>
      )}
    </div>
  );
};

const ScreenshotModal: React.FC<{ isOpen: boolean; onClose: () => void; screenshot: string; username: string }> = ({ isOpen, onClose, screenshot, username }) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h3 className="text-lg font-semibold text-white">Screenshot: @{username}</h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-4 overflow-auto max-h-[calc(90vh-80px)]">
          <img 
            src={screenshot} 
            alt={`Screenshot of @${username}`}
            className="w-full h-auto rounded"
          />
        </div>
      </div>
    </div>
  );
};

const StatsCard: React.FC<{ title: string; value: number; subtitle?: string; icon: string; color?: string; trend?: any }> = ({ title, value, subtitle, icon, color = "blue", trend = null }) => (
  <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-400 text-sm">{title}</p>
        <p className="text-2xl font-bold text-white">{value}</p>
        {subtitle && <p className="text-gray-500 text-xs">{subtitle}</p>}
      </div>
      <div className="text-3xl">{icon}</div>
    </div>
    {trend && (
      <div className="mt-2 flex items-center text-xs">
        <span className={trend > 0 ? 'text-green-400' : 'text-red-400'}>
          {trend > 0 ? '↗' : '↘'} {Math.abs(trend)}%
        </span>
      </div>
    )}
  </div>
);

// 🚨 ENHANCED ERROR DISPLAY COMPONENT
const ErrorDisplay: React.FC<{ error: string; onDismiss: () => void }> = ({ error, onDismiss }) => {
  const [showDetails, setShowDetails] = useState(false);
  
  // Try to parse error as JSON for enhanced error info
  let errorData: any = null;
  try {
    errorData = JSON.parse(error);
  } catch {
    // If not JSON, treat as simple string
    errorData = { error: error };
  }

  const isEnhancedError = errorData && typeof errorData === 'object' && errorData.details;

  return (
    <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-4 mb-4">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1">
          <span className="text-red-400 text-xl mt-0.5">❌</span>
          <div className="flex-1">
            <h3 className="text-red-300 font-semibold">
              {isEnhancedError ? errorData.error : 'Scraping Failed'}
            </h3>
            
            {isEnhancedError && errorData.details?.suggestion && (
              <p className="text-red-200 text-sm mt-1">
                💡 {errorData.details.suggestion}
              </p>
            )}
            
            {!isEnhancedError && (
              <p className="text-red-200 text-sm mt-1">{error}</p>
            )}

            {isEnhancedError && errorData.details?.troubleshooting && (
              <div className="mt-3">
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="text-red-300 text-sm hover:text-red-200 flex items-center space-x-1"
                >
                  <span>{showDetails ? '▼' : '▶'}</span>
                  <span>Troubleshooting Details</span>
                </button>
                
                {showDetails && (
                  <div className="mt-3 space-y-3 bg-red-900/20 rounded p-3">
                    {/* Keyword Analysis */}
                    {errorData.details.troubleshooting.keyword && (
                      <div>
                        <h4 className="text-red-200 font-medium text-sm">Keyword Analysis:</h4>
                        <p className="text-red-300 text-xs">
                          Type: {errorData.details.troubleshooting.keyword.type} 
                          ({errorData.details.troubleshooting.keyword.length} characters)
                        </p>
                        {errorData.details.troubleshooting.keyword.suggestions?.length > 0 && (
                          <ul className="text-red-300 text-xs mt-1 list-disc list-inside">
                            {errorData.details.troubleshooting.keyword.suggestions.map((suggestion: string, idx: number) => (
                              <li key={idx}>{suggestion}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    )}

                    {/* Next Steps */}
                    {errorData.details.troubleshooting.nextSteps && (
                      <div>
                        <h4 className="text-red-200 font-medium text-sm">Next Steps:</h4>
                        <ol className="text-red-300 text-xs mt-1 list-decimal list-inside space-y-0.5">
                          {errorData.details.troubleshooting.nextSteps.map((step: string, idx: number) => (
                            <li key={idx}>{step}</li>
                          ))}
                        </ol>
                      </div>
                    )}

                    {/* Settings Recommendations */}
                    {errorData.details.troubleshooting.settings?.recommendations && (
                      <div>
                        <h4 className="text-red-200 font-medium text-sm">Settings:</h4>
                        <ul className="text-red-300 text-xs mt-1 list-disc list-inside">
                          {errorData.details.troubleshooting.settings.recommendations.map((rec: string, idx: number) => (
                            <li key={idx}>{rec}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        
        <button
          onClick={onDismiss}
          className="text-red-400 hover:text-red-300 ml-2"
          title="Dismiss error"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

const ModernLeadCard: React.FC<{ lead: Lead; index: number }> = ({ lead, index }) => {
  const [showScreenshot, setShowScreenshot] = useState(false);

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  const openProfile = (url: string) => {
    window.open(url, '_blank');
  };

  const openWebsite = (website: string) => {
    // Add https:// if not present
    const url = website.startsWith('http') ? website : `https://${website}`;
    window.open(url, '_blank');
  };

  const viewScreenshot = () => {
    if (lead.screenshot) {
      setShowScreenshot(true);
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-gray-600 transition-all duration-200">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
            {lead.username?.charAt(0).toUpperCase() || '?'}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">@{lead.username}</h3>
            <p className="text-gray-400 text-sm">{lead.followers?.toLocaleString()} followers</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <LeadQualityBadge lead={lead} />
        </div>
      </div>

      {lead.bio && (
        <div className="mb-4">
          <p className="text-gray-300 text-sm leading-relaxed">{lead.bio}</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-gray-700 rounded p-3">
          <p className="text-gray-400 text-xs mb-1">Bio Score</p>
          <p className="text-white font-semibold">{lead.bioScore?.pitch_score || 'N/A'}/10</p>
        </div>
        <div className="bg-gray-700 rounded p-3">
          <p className="text-gray-400 text-xs mb-1">Vision Score</p>
          <p className="text-white font-semibold">{lead.visionScore?.professional_score || 'N/A'}/10</p>
        </div>
      </div>

      {/* Additional Info Grid */}
      <div className="grid grid-cols-3 gap-2 mb-4 text-xs">
        <div className="bg-gray-700/50 rounded p-2 text-center">
          <p className="text-gray-400">Posts</p>
          <p className="text-white font-semibold">{lead.posts?.toLocaleString() || 'N/A'}</p>
        </div>
        <div className="bg-gray-700/50 rounded p-2 text-center">
          <p className="text-gray-400">Following</p>
          <p className="text-white font-semibold">{lead.following?.toLocaleString() || 'N/A'}</p>
        </div>
        <div className="bg-gray-700/50 rounded p-2 text-center">
          <p className="text-gray-400">Engagement</p>
          <p className="text-white font-semibold">{lead.posts && lead.followers ? ((lead.posts / lead.followers) * 100).toFixed(1) + '%' : 'N/A'}</p>
        </div>
      </div>

      {/* Business Info */}
      {(lead.businessCategory || lead.bioScore?.business_type || lead.isVerified) && (
        <div className="flex flex-wrap gap-2 mb-4">
          {lead.businessCategory && (
            <span className="bg-blue-600/20 text-blue-300 px-2 py-1 rounded text-xs">
              🏢 {lead.businessCategory}
            </span>
          )}
          {lead.bioScore?.business_type && lead.bioScore.business_type !== lead.businessCategory && (
            <span className="bg-purple-600/20 text-purple-300 px-2 py-1 rounded text-xs">
              🎯 {lead.bioScore.business_type}
            </span>
          )}
          {lead.isVerified && (
            <span className="bg-green-600/20 text-green-300 px-2 py-1 rounded text-xs">
              ✅ Verified
            </span>
          )}
          {lead.isBusinessAccount && (
            <span className="bg-orange-600/20 text-orange-300 px-2 py-1 rounded text-xs">
              💼 Business
            </span>
          )}
        </div>
      )}

      {/* Lead Factors */}
      {lead.leadFactors && lead.leadFactors.length > 0 && (
        <div className="mb-4">
          <p className="text-gray-400 text-xs mb-2">Lead Factors:</p>
          <div className="flex flex-wrap gap-1">
            {lead.leadFactors.slice(0, 3).map((factor, idx) => (
              <span key={idx} className="bg-yellow-600/20 text-yellow-300 px-2 py-1 rounded text-xs">
                {factor}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <ActivityStatus activityData={lead.activityData} />
        <ContactInfo contactInfo={lead.contactInfo} email={lead.email} />
      </div>

      {/* <EngagementMetrics engagementData={lead.engagementData} /> */}

      <div className="flex items-center justify-between pt-4 border-t border-gray-700">
        <div className="flex space-x-2">
          <button
            onClick={() => openProfile(lead.url || `https://instagram.com/${lead.username}`)}
            className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white text-xs rounded transition-colors"
          >
            View
          </button>
          {lead.screenshot && (
            <button
              onClick={viewScreenshot}
              className="px-3 py-1 bg-purple-600 hover:bg-purple-500 text-white text-xs rounded transition-colors"
            >
              Screenshot
            </button>
          )}
          {(lead.externalUrl || lead.website) && (
            <button
              onClick={() => openWebsite(lead.externalUrl || lead.website || '')}
              className="px-3 py-1 bg-green-600 hover:bg-green-500 text-white text-xs rounded transition-colors transform hover:scale-105 duration-200"
              title="Open website in new tab"
            >
              🌐Website
            </button>
          )}
        </div>
        <div className="flex space-x-2">
          {lead.email && (
            <button
              onClick={() => copyToClipboard(lead.email!, 'email')}
              className="px-2 py-1 bg-green-600 hover:bg-green-500 text-white text-xs rounded transition-colors"
            >
              Copy Email
            </button>
          )}
          <button
            onClick={() => copyToClipboard(lead.username || '', 'username')}
            className="px-2 py-1 bg-gray-600 hover:bg-gray-500 text-white text-xs rounded transition-colors"
          >
            Copy Username
          </button>
        </div>
      </div>

      {showScreenshot && lead.screenshot && (
        <ScreenshotModal
          isOpen={showScreenshot}
          onClose={() => setShowScreenshot(false)}
          screenshot={lead.screenshot}
          username={lead.username || ''}
        />
      )}
    </div>
  );
};

// 🔥 NEW ADVANCED SETTINGS COMPONENT


const ControlPanel: React.FC<{ 
  keyword: string; setKeyword: (keyword: string) => void; 
  pages: number; setPages: (pages: number) => void; 
  loading: boolean; 
  onStart: () => void; 
  onStop: () => void; 
  progress: CurrentProgress; 
  eta: string;
  showAdvanced: boolean;
  setShowAdvanced: (show: boolean) => void;
  advancedSettings: AdvancedSettings;
  setAdvancedSettings: (settings: AdvancedSettings) => void;
  leads: Lead[];
}> = ({ 
  keyword, setKeyword, 
  pages, setPages, 
  loading, 
  onStart, 
  onStop, 
  progress, 
  eta,
  showAdvanced,
  setShowAdvanced,
  advancedSettings,
  setAdvancedSettings,
  leads
}) => {
  const handleCopyDebugLogs = async () => {
    try {
      const response = await axios.get('http://localhost:5001/api/logs/debug');
      if (response.data.success) {
        await navigator.clipboard.writeText(response.data.logs);
        // Show success message briefly
        const button = document.querySelector('[data-copy-logs]');
        if (button) {
          const originalText = button.textContent;
          button.textContent = '✅ Copied!';
          setTimeout(() => {
            button.textContent = originalText;
          }, 2000);
        }
      }
    } catch (error) {
      console.error('Error copying debug logs:', error);
      // Fallback to basic system info
      const debugInfo = `
ClientScope AI Debug Info
========================
Timestamp: ${new Date().toISOString()}
Keyword: ${keyword}
Pages: ${pages}
Follower Limit: ${advancedSettings.followerLimit}
Current Leads: ${leads.length}
      `.trim();
      await navigator.clipboard.writeText(debugInfo);
    }
  };

  const getFollowerText = (value: number) => {
    if (value >= 5000000) return '5M+';
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
    return value.toString();
  };

  return (
  <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Search Keyword</label>
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="e.g., fitness, restaurant, salon"
          className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled={loading}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Pages to Scrape</label>
        <input
          type="number"
          min="1"
          max="10"
          value={pages}
          onChange={(e) => setPages(Number(e.target.value))}
          className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled={loading}
        />
      </div>
      <div className="flex items-end">
        {loading ? (
          <button
            onClick={onStop}
            className="w-full px-6 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
          >
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Stop Scraping</span>
          </button>
        ) : (
          <button
            onClick={onStart}
            disabled={!keyword.trim()}
            className="w-full px-6 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
          >
            <span>🚀</span>
            <span>Start Scraping</span>
          </button>
        )}
      </div>
    </div>

    {loading && (
      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-400 mb-2">
          <span>Progress: {progress.current}/{progress.target}</span>
          <span>ETA: {eta}</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(progress.current / progress.target) * 100}%` }}
          ></div>
        </div>
      </div>
    )}

      <div className="flex items-center justify-between mb-4">
        <div className="flex space-x-4">
          <button
            onClick={handleCopyDebugLogs}
            data-copy-logs
            className="text-gray-400 hover:text-gray-300 text-sm flex items-center space-x-1"
          >
            <span>📋</span>
            <span>Copy Debug Logs</span>
          </button>
        </div>
      </div>

      {/* Advanced Settings Dropdown */}
      <div className="mb-4">
      <button
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="text-blue-400 hover:text-blue-300 text-sm flex items-center space-x-1"
      >
        <span>{showAdvanced ? '▼' : '▶'}</span>
          <span>Advanced Settings</span>
      </button>
        
        {showAdvanced && (
          <div className="mt-4 p-4 bg-gray-700 rounded-lg border border-gray-600 animate-slideDown">
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Follower Limit: {getFollowerText(advancedSettings.followerLimit)}
              </label>
              <div className="relative">
                <input
                  type="range"
                  min="0"
                  max="5000000"
                  step="10000"
                  value={advancedSettings.followerLimit}
                  onChange={(e) => setAdvancedSettings({ ...advancedSettings, followerLimit: Number(e.target.value) })}
                  className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>0</span>
                  <span>1M</span>
                  <span>2M</span>
                  <span>3M</span>
                  <span>4M</span>
                  <span>5M+</span>
                </div>
              </div>
            </div>
          </div>
        )}
    </div>
  </div>
);
};

const ScraperPanel: React.FC = () => {
  const location = useLocation();
  const [keyword, setKeyword] = useState("");
  const [pages, setPages] = useState(3);
  const [loading, setLoading] = useState(false);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [currentProgress, setCurrentProgress] = useState<CurrentProgress>({ current: 0, target: 0 });
  const [eta, setEta] = useState("Calculating...");
  const [showScoringGuide, setShowScoringGuide] = useState(false);
  const [isSavingSession, setIsSavingSession] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  // New advanced settings state
  const [advancedSettings, setAdvancedSettings] = useState<AdvancedSettings>({
    followerLimit: 5000000 // 5M default
  });

  const abortControllerRef = useRef<AbortController | null>(null);

  // 🔄 Session Loading Effect
  useEffect(() => {
    // Check for loaded session from localStorage
    const loadedSession = localStorage.getItem('loadedSession');
    if (loadedSession) {
      try {
        const sessionData = JSON.parse(loadedSession);
        setLeads(sessionData.leads || []);
        setKeyword(sessionData.keyword || '');
        setSuccess(`✅ Session loaded! ${sessionData.leads?.length || 0} leads restored.`);
        
        // Clear the loaded session data
        localStorage.removeItem('loadedSession');
      } catch (error) {
        console.error('Error loading session:', error);
      }
    }

    // Listen for session load events
    const handleLoadSession = (event: any) => {
      const { data } = event.detail;
      if (data && data.leads) {
        setLeads(data.leads);
        setKeyword(data.searchCriteria?.keyword || 'Loaded Session');
        setSuccess(`✅ Session loaded! ${data.leads.length} leads restored.`);
      }
    };

    window.addEventListener('loadSession', handleLoadSession);
    
    return () => {
      window.removeEventListener('loadSession', handleLoadSession);
    };
  }, []);

  // Analytics calculations
  const analytics = React.useMemo(() => {
    if (!leads.length) return { hotLeads: 0, warmLeads: 0, contactLeads: 0, avgBioScore: 0, avgVisionScore: 0 };
    
    const hotLeads = leads.filter(lead => (lead.bioScore?.pitch_score >= 7) && (lead.bioScore?.urgency_score >= 7)).length;
    const warmLeads = leads.filter(lead => lead.bioScore?.pitch_score >= 5 || lead.visionScore?.professional_score >= 7).length;
    const contactLeads = leads.filter(lead => lead.email || (lead.bio && (lead.bio.includes('@') || lead.bio.includes('DM')))).length;
    const avgBioScore = Math.round(leads.reduce((sum, lead) => sum + (lead.bioScore?.pitch_score || 0), 0) / leads.length * 10) / 10;
    const avgVisionScore = Math.round(leads.reduce((sum, lead) => sum + (lead.visionScore?.professional_score || 0), 0) / leads.length * 10) / 10;
    
    return { hotLeads, warmLeads, contactLeads, avgBioScore, avgVisionScore };
  }, [leads]);

  const handleStart = async () => {
    if (!keyword.trim()) return;
    
    setLoading(true);
    setError("");
    setSuccess("");
    setCurrentProgress({ current: 0, target: pages * 10 });
    setEta('Calculating...');
    
    // Clear previous results
    setLeads([]);
    
    // Start ETA simulation
    const startTime = Date.now();
    const estimatedTimePerPage = 15000; // 15 seconds per page
    const totalEstimatedTime = pages * estimatedTimePerPage;
    
    const etaInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, totalEstimatedTime - elapsed);
      const progress = Math.min(100, (elapsed / totalEstimatedTime) * 100);
      
      setCurrentProgress({ current: Math.floor(progress), target: 100 });
      
      if (remaining > 0) {
        const minutes = Math.floor(remaining / 60000);
        const seconds = Math.floor((remaining % 60000) / 1000);
        setEta(`ETA: ${minutes}m ${seconds}s - ${Math.floor(progress)}%`);
      } else {
        setEta('Finalizing...');
      }
    }, 1000);
    
    try {
      const abortController = new AbortController();
      abortControllerRef.current = abortController;
      
      const response = await axios.post('http://localhost:5001/api/scrape', {
        keyword: keyword.trim(),
        pages: pages,
        advancedSettings: advancedSettings // Pass advanced settings to backend
      }, {
        signal: abortController.signal,
        timeout: 300000 // 5 minutes
      });
      
      clearInterval(etaInterval);
      
      if (response.data.success) {
        setLeads(response.data.leads || []);
        setSuccess(`✅ Successfully scraped ${response.data.leads?.length || 0} leads!`);
        setCurrentProgress({ current: 100, target: 100 });
        setEta('Completed!');
      } else {
        setError(response.data.error || 'Scraping failed');
      }
    } catch (error: any) {
      clearInterval(etaInterval);
      
      if (error.name === 'AbortError' || error.code === 'ERR_CANCELED') {
        setSuccess('Scraping was stopped by user');
      } else {
        console.error('Scraping error:', error);
        
        // Handle enhanced error responses
        if (error.response?.data) {
          // If the backend sent enhanced error data, stringify it for the ErrorDisplay component
          const errorData = error.response.data;
          if (errorData.details) {
            setError(JSON.stringify(errorData));
          } else {
            setError(errorData.error || errorData.message || 'Failed to scrape leads');
          }
        } else {
          setError(error.message || 'Failed to scrape leads');
        }
      }
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleStop = async () => {
    try {
      // Send stop signal to backend
      await axios.post('http://localhost:5001/api/scrape/stop');
      
      // Also abort frontend request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      setLoading(false);
      setSuccess("Scraping stopped successfully. Keeping scraped results.");
    } catch (error) {
      console.error('Error stopping scraper:', error);
      // Still stop the frontend loading state
      setLoading(false);
      setSuccess("Scraping stopped (frontend). Keeping scraped results.");
    }
  };

  // 🔥 NEW: Fetch Results Handler
  const handleFetchResults = async () => {
    try {
      setError(''); // Clear previous errors
      
      // First try to get latest leads from memory (this should work during scraping)
      const latestResponse = await axios.get('http://localhost:5001/api/leads/latest');
      if (latestResponse.data.success) {
        const fetchedLeads = latestResponse.data.leads || [];
        setLeads(fetchedLeads);
        
        if (fetchedLeads.length > 0) {
          const message = loading ? 
            `🔄 Fetched ${fetchedLeads.length} leads (scraping in progress)` :
            `✅ Fetched ${fetchedLeads.length} leads from latest session!`;
          setSuccess(message);
          return;
        } else if (loading) {
          setSuccess('🔄 Fetching latest leads... (scraping in progress)');
          return;
        }
      }
      
      // If no latest leads, try database
      const dbResponse = await axios.get('http://localhost:5001/api/leads');
      if (dbResponse.data.success && dbResponse.data.leads && dbResponse.data.leads.length > 0) {
        setLeads(dbResponse.data.leads);
        setSuccess(`✅ Fetched ${dbResponse.data.leads.length} leads from database!`);
        return;
      }
      
      // If still no leads, show appropriate message
      if (loading) {
        setSuccess('🔄 Scraping in progress... Leads will appear here as they are found.');
      } else {
        setError('No leads found. Try starting a new scrape or check if a previous scrape completed.');
      }
      
    } catch (error: any) {
      console.error('Error fetching results:', error);
      setError(error.response?.data?.error || "Failed to fetch results from backend");
    }
  };

  // 🔥 NEW: Save Session Handler
  const handleSaveSession = async () => {
    if (!leads || leads.length === 0) return;
    
    setIsSavingSession(true);
    try {
      const sessionData = {
        timestamp: new Date().toISOString(),
        totalLeads: leads.length,
        searchCriteria: {
          keyword: keyword,
          pages: pages,
          timestamp: new Date().toISOString()
        },
        summary: {
          hotLeads: analytics.hotLeads,
          warmLeads: analytics.warmLeads,
          contactLeads: analytics.contactLeads,
          avgBioScore: analytics.avgBioScore,
          avgVisionScore: analytics.avgVisionScore,
          totalLeads: leads.length
        },
        leads: leads
      };
      
      const response = await axios.post('http://localhost:5001/api/sessions/save', sessionData);
      
      if (response.data.success) {
        setSuccess(`✅ Session saved! ${leads.length} leads saved with ID: ${response.data.sessionId}`);
      } else {
        setError(response.data.error || "Failed to save session");
      }
    } catch (error: any) {
      console.error('Error saving session:', error);
      setError(error.response?.data?.error || "Failed to save session");
    } finally {
      setIsSavingSession(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            ClientScope AI Scraper
          </h1>
          <p className="text-gray-400 text-lg">Advanced Instagram Lead Generation & Analysis</p>
        </div>
        
        {/* Control Panel */}
        <ControlPanel 
          keyword={keyword}
          setKeyword={setKeyword}
          pages={pages}
          setPages={setPages}
          loading={loading}
          onStart={handleStart}
          onStop={handleStop}
          progress={currentProgress}
          eta={eta}
          showAdvanced={showAdvanced}
          setShowAdvanced={setShowAdvanced}
          advancedSettings={advancedSettings}
          setAdvancedSettings={setAdvancedSettings}
          leads={leads}
        />

        {/* Status Messages */}
        {error && (
          <ErrorDisplay error={error} onDismiss={() => setError('')} />
        )}
        
        {success && (
          <div className="bg-green-900/30 border border-green-500/50 rounded-lg p-4 flex items-center space-x-3">
            <span className="text-green-400 text-xl">✅</span>
            <span className="text-green-300">{success}</span>
          </div>
        )}
        
        {/* Analytics Dashboard */}
        {leads.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <StatsCard title="Hot Leads" value={analytics.hotLeads} icon="🔥" color="red" />
            <StatsCard title="Warm Leads" value={analytics.warmLeads} icon="🌟" color="orange" />
            <StatsCard title="With Contact" value={analytics.contactLeads} icon="📧" color="green" />
            <StatsCard title="Avg Bio Score" value={analytics.avgBioScore} icon="🧠" color="blue" />
            <StatsCard title="Avg Visual Score" value={analytics.avgVisionScore} icon="👁️" color="purple" />
          </div>
        )}
        
        {/* Leads Grid */}
        {leads.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
                <span>📊</span>
                <span>Scraped Leads ({leads.length})</span>
              </h2>
              <div className="flex items-center space-x-3">
                <button 
                  onClick={() => setShowScoringGuide(true)}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-colors duration-200 flex items-center space-x-2"
                >
                  <span>🎯</span>
                  <span>Scoring Guide</span>
                </button>
                
                {/* 🔥 NEW: Fetch Results Button */}
                <button 
                  onClick={handleFetchResults}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200 flex items-center space-x-2"
                >
                  <span>🔄</span>
                  <span>Fetch Results</span>
                </button>
                
                {/* 🔥 NEW: Save Session Button */}
                <button 
                  onClick={handleSaveSession}
                  disabled={!leads || leads.length === 0 || isSavingSession}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors duration-200 flex items-center space-x-2"
                >
                  {isSavingSession ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <span>💾</span>
                      <span>Save Session</span>
                    </>
                  )}
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {leads.map((lead, index) => (
                <ModernLeadCard key={index} lead={lead} index={index} />
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && leads.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🚀</div>
            <h3 className="text-2xl font-bold text-gray-300 mb-2">Ready to Find Leads</h3>
            <p className="text-gray-500">Enter a keyword above and start scraping to see results here.</p>
          </div>
        )}
        
        {/* Scoring Guide Modal */}
        {showScoringGuide && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-white">🎯 Lead Scoring Guide</h2>
                  <button 
                    onClick={() => setShowScoringGuide(false)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <LeadScoringGuide isOpen={true} onClose={() => setShowScoringGuide(false)} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScraperPanel; 