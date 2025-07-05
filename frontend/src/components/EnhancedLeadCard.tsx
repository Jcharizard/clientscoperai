import React from 'react';
import { 
  CheckBadgeIcon, 
  BuildingOfficeIcon, 
  LinkIcon, 
  EyeIcon,
  HeartIcon,
  ChatBubbleLeftIcon,
  SparklesIcon,
  StarIcon,
  ShieldCheckIcon,
  GlobeAltIcon,
  UserGroupIcon
} from '@heroicons/react/24/solid';
import { Lead } from '../types';

interface EnhancedLeadCardProps {
  lead: Lead;
  onSelect?: (lead: Lead) => void;
  onAction?: (lead: Lead, action: string) => void;
  showActions?: boolean;
  compact?: boolean;
}

const EnhancedLeadCard: React.FC<EnhancedLeadCardProps> = ({ 
  lead, 
  onSelect, 
  onAction, 
  showActions = true, 
  compact = false 
}) => {
  // Parse follower count for display
  const formatFollowerCount = (count: string | number | undefined): string => {
    if (!count) return 'N/A';
    
    // Handle number directly
    if (typeof count === 'number') {
      if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
      if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
      return count.toString();
    }
    
    // Handle string - extract numbers
    const countStr = String(count);
    const numericOnly = countStr.replace(/[^\d]/g, '');
    const numCount = parseInt(numericOnly, 10);
    
    if (isNaN(numCount)) return countStr;
    
    if (numCount >= 1000000) return `${(numCount / 1000000).toFixed(1)}M`;
    if (numCount >= 1000) return `${(numCount / 1000).toFixed(1)}K`;
    return numCount.toString();
  };

  // Calculate lead tier based on followers and verification
  const getLeadTier = (lead: Lead): { tier: string; color: string; icon: React.ComponentType<any> } => {
    const followers = typeof lead.followers === 'string' ? 
      parseInt(lead.followers.replace(/[^\d]/g, '')) : lead.followers || 0;
    
    if (lead.isVerified) {
      return { tier: 'PLATINUM', color: 'text-purple-400 bg-purple-900/20 border-purple-400/30', icon: ShieldCheckIcon };
    }
    if (followers >= 100000) {
      return { tier: 'GOLD', color: 'text-yellow-400 bg-yellow-900/20 border-yellow-400/30', icon: StarIcon };
    }
    if (followers >= 10000) {
      return { tier: 'SILVER', color: 'text-blue-400 bg-blue-900/20 border-blue-400/30', icon: SparklesIcon };
    }
    if (followers >= 1000) {
      return { tier: 'BRONZE', color: 'text-orange-400 bg-orange-900/20 border-orange-400/30', icon: HeartIcon };
    }
    return { tier: 'COLD', color: 'text-gray-400 bg-gray-900/20 border-gray-400/30', icon: EyeIcon };
  };

  const tierInfo = getLeadTier(lead);
  const TierIcon = tierInfo.icon;

  return (
    <div className={`bg-gray-800 rounded-lg border border-gray-700 hover:border-gray-600 transition-all duration-200 ${compact ? 'p-3' : 'p-4'}`}>
      {/* Header with profile info */}
      <div className="flex items-start gap-3 mb-3">
        {/* Profile Picture */}
        <div className="relative flex-shrink-0">
          {lead.screenshot ? (
            <div className="relative">
              <img 
                src={`/api/screenshot/${lead.screenshot.split('/').pop()}`} 
                alt={lead.username}
                className="w-12 h-12 rounded-full object-cover border-2 border-gray-600"
                onError={(e) => {
                  e.currentTarget.src = `https://ui-avatars.com/api/?name=${lead.username}&background=374151&color=fff&size=48`;
                }}
              />
              {lead.isVerified && (
                <CheckBadgeIcon className="absolute -top-1 -right-1 w-4 h-4 text-blue-400" />
              )}
            </div>
          ) : (
            <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center text-white text-lg font-bold">
              {lead.username.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        {/* Profile Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-white truncate">@{lead.username}</h3>
            {lead.isVerified && (
              <CheckBadgeIcon className="w-4 h-4 text-blue-400 flex-shrink-0" title="Verified Account" />
            )}
            {lead.isBusinessAccount && (
              <BuildingOfficeIcon className="w-4 h-4 text-green-400 flex-shrink-0" title="Business Account" />
            )}
          </div>
          
          {lead.displayName && (
            <p className="text-sm text-gray-300 truncate">{lead.displayName}</p>
          )}
          
          {/* Tier Badge */}
          <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${tierInfo.color} mt-1`}>
            <TierIcon className="w-3 h-3" />
            {tierInfo.tier}
          </div>
        </div>

        {/* Action Menu */}
        {showActions && (
          <div className="flex-shrink-0">
            <button 
              onClick={() => onAction?.(lead, 'view')}
              className="p-1 text-gray-400 hover:text-white rounded"
              title="View Profile"
            >
              <EyeIcon className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4 mb-3 text-sm">
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-blue-400 mb-1">
            <UserGroupIcon className="w-4 h-4" />
          </div>
          <div className="text-white font-medium">{formatFollowerCount(lead.followers)}</div>
          <div className="text-gray-400 text-xs">Followers</div>
        </div>
        
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-green-400 mb-1">
            <EyeIcon className="w-4 h-4" />
          </div>
          <div className="text-white font-medium">{lead.posts || 'N/A'}</div>
          <div className="text-gray-400 text-xs">Posts</div>
        </div>
        
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-purple-400 mb-1">
            <SparklesIcon className="w-4 h-4" />
          </div>
          <div className="text-white font-medium">{lead.bioScore?.pitch || 'N/A'}</div>
          <div className="text-gray-400 text-xs">Score</div>
        </div>
      </div>

      {/* Bio Preview */}
      {lead.bio && (
        <div className="mb-3">
          <p className="text-sm text-gray-300 line-clamp-2 leading-relaxed">
            {lead.bio}
          </p>
        </div>
      )}

      {/* Enhanced Info Row */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-3">
          {lead.externalUrl && (
            <a
              href={lead.externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Open website"
              className="flex items-center gap-1 text-blue-400 hover:text-blue-300 hover:underline hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 animate-website-link"
              style={{ willChange: 'transform' }}
            >
              <LinkIcon className="w-3 h-3" />
              <span>Website</span>
            </a>
          )}
          
          {lead.businessCategory && (
            <div className="flex items-center gap-1 text-green-400">
              <BuildingOfficeIcon className="w-3 h-3" />
              <span className="truncate max-w-20">{lead.businessCategory}</span>
            </div>
          )}
          
          {lead.bioScore?.language && (
            <div className="flex items-center gap-1 text-purple-400">
              <GlobeAltIcon className="w-3 h-3" />
              <span>{lead.bioScore.language}</span>
            </div>
          )}
        </div>

        {/* Lead Temperature */}
        <div className={`px-2 py-1 rounded text-xs font-medium ${
          lead.bioScore?.urgent === 'yes' || (lead.bioScore?.pitch && lead.bioScore.pitch >= 8) 
            ? 'bg-red-900/30 text-red-400' 
            : lead.bioScore?.pitch && lead.bioScore.pitch >= 5
            ? 'bg-yellow-900/30 text-yellow-400'
            : 'bg-blue-900/30 text-blue-400'
        }`}>
          {lead.bioScore?.urgent === 'yes' || (lead.bioScore?.pitch && lead.bioScore.pitch >= 8) 
            ? '🔥 HOT' 
            : lead.bioScore?.pitch && lead.bioScore.pitch >= 5
            ? '⚡ WARM'
            : '❄️ COLD'}
        </div>
      </div>

      {/* Action Buttons */}
      {showActions && !compact && (
        <div className="mt-3 pt-3 border-t border-gray-700 flex gap-2">
          <button 
            onClick={() => onAction?.(lead, 'message')}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm py-2 px-3 rounded font-medium transition-colors"
          >
            Message
          </button>
          <button 
            onClick={() => onAction?.(lead, 'save')}
            className="bg-gray-700 hover:bg-gray-600 text-white text-sm py-2 px-3 rounded font-medium transition-colors"
          >
            Save
          </button>
        </div>
      )}
    </div>
  );
};

export default EnhancedLeadCard; 