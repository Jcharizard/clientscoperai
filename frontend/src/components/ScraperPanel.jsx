import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import axios from "axios";
import { useLocation } from "react-router-dom";
import LeadScoringGuide from "./LeadScoringGuide";
import HashtagAnalytics from "./HashtagAnalytics";

// 🎨 ADVANCED TOOLTIP SYSTEM (Prevents ALL cropping and overlapping issues)
const AdvancedTooltip = ({ text, children, position = 'auto', className = '' }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [calculatedPosition, setCalculatedPosition] = useState(position);
  const tooltipRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (isVisible && tooltipRef.current && containerRef.current) {
      const tooltip = tooltipRef.current;
      const container = containerRef.current;
      const containerRect = container.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      // Auto-calculate best position to prevent cropping
      let bestPosition = position;
      
      if (position === 'auto') {
        // Check if there's space above
        if (containerRect.top > 120) {
          bestPosition = containerRect.left < viewportWidth / 2 ? 'top-left' : 'top-right';
        }
        // Check if there's space below  
        else if (containerRect.bottom < viewportHeight - 120) {
          bestPosition = containerRect.left < viewportWidth / 2 ? 'bottom-left' : 'bottom-right';
        }
        // Use side positions as fallback
        else {
          bestPosition = containerRect.left < viewportWidth / 2 ? 'right' : 'left';
        }
      }
      
      setCalculatedPosition(bestPosition);
    }
  }, [isVisible, position]);

  const getPositionClasses = () => {
    const baseClasses = 'absolute z-[9999] transition-all duration-200';
    
    switch (calculatedPosition) {
      case 'top':
        return `${baseClasses} bottom-full mb-2 left-1/2 transform -translate-x-1/2`;
      case 'top-left':
        return `${baseClasses} bottom-full mb-2 right-0`;
      case 'top-right':
        return `${baseClasses} bottom-full mb-2 left-0`;
      case 'bottom':
        return `${baseClasses} top-full mt-2 left-1/2 transform -translate-x-1/2`;
      case 'bottom-left':
        return `${baseClasses} top-full mt-2 right-0`;
      case 'bottom-right':
        return `${baseClasses} top-full mt-2 left-0`;
      case 'left':
        return `${baseClasses} right-full mr-2 top-1/2 transform -translate-y-1/2`;
      case 'right':
        return `${baseClasses} left-full ml-2 top-1/2 transform -translate-y-1/2`;
      default:
        return `${baseClasses} bottom-full mb-2 left-1/2 transform -translate-x-1/2`;
    }
  };

  const getArrowClasses = () => {
    switch (calculatedPosition) {
      case 'top':
      case 'top-left':
      case 'top-right':
        return 'absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900';
      case 'bottom':
      case 'bottom-left':  
      case 'bottom-right':
        return 'absolute bottom-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-b-gray-900';
      case 'left':
        return 'absolute left-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-l-gray-900';
      case 'right':
        return 'absolute right-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-r-gray-900';
      default:
        return 'absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900';
    }
  };
  
  return (
    <div 
      ref={containerRef}
      className={`relative ${className}`}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div ref={tooltipRef} className={getPositionClasses()}>
          <div className="bg-gray-900 text-white text-xs px-3 py-2 rounded-lg shadow-xl border border-gray-700 whitespace-nowrap max-w-xs font-medium">
            {text}
            <div className={getArrowClasses()}></div>
          </div>
        </div>
      )}
    </div>
  );
};

// 🖼️ ENHANCED SCREENSHOT MODAL WITH BETTER UI (FIXED background and positioning)
const ScreenshotModal = ({ isOpen, onClose, screenshot, username }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-[99999] p-4" onClick={onClose}>
      <div className="relative max-w-5xl max-h-[95vh] bg-gray-800 border border-gray-600 rounded-2xl overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
        {/* Enhanced Header */}
        <div className="bg-gradient-to-r from-purple-700 to-blue-700 p-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <span className="text-2xl">📸</span>
        </div>
            <div>
              <h3 className="text-white font-bold text-xl">Profile Screenshot</h3>
              <p className="text-purple-200 text-sm">@{username}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-purple-200 hover:text-white text-3xl transition-colors duration-200 w-10 h-10 flex items-center justify-center rounded-full hover:bg-white hover:bg-opacity-10"
          >
            ×
          </button>
        </div>
        
        {/* Screenshot Display */}
        <div className="p-6 bg-gray-900">
          <div className="relative">
            <img 
              src={screenshot}
              alt={`Screenshot of @${username}`}
              className="w-full h-auto max-h-[70vh] object-contain rounded-lg shadow-lg"
            />
            {/* Overlay controls */}
            <div className="absolute top-4 right-4 flex space-x-2">
              <button 
                onClick={() => window.open(screenshot, '_blank')}
                className="px-3 py-2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-lg transition-all duration-200 flex items-center space-x-2 text-sm backdrop-blur-sm"
              >
                <span>🔗</span>
                <span>Full Size</span>
              </button>
      </div>
    </div>
        </div>
        
        {/* Enhanced Footer */}
        <div className="bg-gray-700 p-4 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-gray-300 text-sm">
            <span>💡</span>
            <span>Click outside to close • Use ESC key</span>
          </div>
          <div className="flex space-x-2">
            <button 
              onClick={() => navigator.clipboard.writeText(`https://instagram.com/${username}`)}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors duration-200 flex items-center space-x-2 text-sm"
            >
              <span>📋</span>
              <span>Copy Profile URL</span>
            </button>
            <button 
              onClick={() => window.open(`https://instagram.com/${username}`, '_blank')}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-colors duration-200 flex items-center space-x-2 text-sm"
            >
              <span>🔗</span>
              <span>Open Profile</span>
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

// 🚀 FIXED LEAD QUALITY BADGE (No more cropping!)
const LeadQualityBadge = ({ lead }) => {
  const leadScore = lead.leadScore || lead.bioScore?.pitch_score || 0;
  
  const getTierData = (score) => {
    if (score >= 8) return { tier: 'HOT', color: 'from-red-500 to-pink-500', icon: '🔥', ring: 'ring-red-500/50' };
    if (score >= 6) return { tier: 'WARM', color: 'from-orange-500 to-yellow-500', icon: '🌟', ring: 'ring-orange-500/50' };
    if (score >= 4) return { tier: 'QUALIFIED', color: 'from-blue-500 to-cyan-500', icon: '💼', ring: 'ring-blue-500/50' };
    return { tier: 'COLD', color: 'from-gray-500 to-slate-500', icon: '❄️', ring: 'ring-gray-500/50' };
  };
  
  const tierData = getTierData(leadScore);
  
  return (
    <AdvancedTooltip text={`Lead Score: ${leadScore}/10`} position="auto">
      <div className={`inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-gradient-to-r ${tierData.color} text-white text-xs font-bold shadow-lg ring-2 ${tierData.ring} hover:scale-105 transition-all duration-200 cursor-help`}>
        <span>{tierData.icon}</span>
        <span>{tierData.tier}</span>
        <span className="text-white/80">({leadScore})</span>
      </div>
    </AdvancedTooltip>
  );
};

// 🔥 MODERN STATS CARD
const StatsCard = ({ title, value, subtitle, icon, color = "blue", trend = null }) => (
  <div className={`bg-gradient-to-br from-gray-800 to-gray-900 p-4 rounded-xl border-l-4 border-${color}-500 hover:shadow-lg transition-all duration-200 hover:scale-[1.02]`}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-400 text-sm font-medium">{title}</p>
        <p className={`text-2xl font-bold text-${color}-400 mt-1`}>{value}</p>
        {subtitle && <p className="text-gray-500 text-xs mt-1">{subtitle}</p>}
      </div>
      <div className={`text-3xl opacity-80 text-${color}-400`}>{icon}</div>
    </div>
    {trend && (
      <div className="mt-3 flex items-center text-xs">
        <span className={`${trend > 0 ? 'text-green-400' : 'text-red-400'}`}>
          {trend > 0 ? '↗️' : '↘️'} {Math.abs(trend)}%
        </span>
        <span className="text-gray-500 ml-1">vs last session</span>
      </div>
      )}
    </div>
  );

// 🎯 COMPLETELY REDESIGNED LEAD CARD (Fixed ALL issues!)
const ModernLeadCard = ({ lead, index }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [showScreenshotModal, setShowScreenshotModal] = useState(false);
  
  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    // Add toast notification here if needed
  };
  
  const openProfile = (url) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const viewScreenshot = () => {
    if (lead.screenshot) {
      setShowScreenshotModal(true);
    }
  };

  const screenshotUrl = lead.screenshot ? `http://localhost:5001/screenshots/${lead.screenshot.split('/').pop()}` : null;

  return (
    <>
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-all duration-300 hover:shadow-xl hover:scale-[1.02] group">
        {/* FIXED Header - Perfect spacing and positioning */}
        <div className="flex items-start justify-between mb-5">
          <LeadQualityBadge lead={lead} />
          
          {/* FIXED Action Buttons - NO MORE COLLISION! */}
          <div className="flex items-center space-x-2">
            {/* CLEAR View Screenshot Button */}
            <AdvancedTooltip text={lead.screenshot ? "View Profile Screenshot" : "No screenshot available"} position="auto">
              <button 
                onClick={viewScreenshot}
                disabled={!lead.screenshot}
                className={`px-4 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2 text-sm font-medium ${
                  lead.screenshot 
                    ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-md hover:shadow-lg' 
                    : 'bg-gray-600 cursor-not-allowed text-gray-400'
                }`}
              >
                <span>📸</span>
                <span>View</span>
      </button>
            </AdvancedTooltip>
            
            <AdvancedTooltip text="Copy Profile URL" position="auto">
              <button 
                onClick={() => copyToClipboard(lead.url, 'URL')}
                className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors duration-200"
              >
                <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
      </button>
            </AdvancedTooltip>
            
            <AdvancedTooltip text="Open Instagram Profile" position="auto">
              <button 
                onClick={() => openProfile(lead.url)}
                className="p-2 bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors duration-200"
              >
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
      </button>
            </AdvancedTooltip>
    </div>
        </div>
        
        {/* Profile Content */}
        <div className="flex space-x-4">
          {/* ENHANCED Profile Image with clean hover animation - NO TOOLTIP */}
          <div className="flex-shrink-0">
              <div className="relative cursor-pointer group/image" onClick={viewScreenshot}>
                {lead.screenshot && !imageError ? (
                  <img 
                    src={screenshotUrl}
                    alt={lead.username}
                    className={`w-20 h-20 rounded-xl object-cover ring-2 ring-gray-600 group-hover/image:ring-purple-500 transition-all duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                    onLoad={() => setImageLoaded(true)}
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center text-2xl group-hover/image:from-purple-600 group-hover/image:to-purple-700 transition-all duration-300">
                    👤
                  </div>
                )}
                
                {/* Clear screenshot overlay indicator */}
                {lead.screenshot && (
                  <div className="absolute inset-0 rounded-xl bg-purple-600 bg-opacity-0 group-hover/image:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                    <div className="opacity-0 group-hover/image:opacity-100 transition-opacity duration-300 bg-black bg-opacity-50 rounded-full p-2">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </div>
                  </div>
                )}
                
                {lead.verified && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
          </div>
          
          {/* ENHANCED Profile Info Container */}
          <div className="flex-1 min-w-0">
            {/* Header with Username and Verification */}
            <div className="flex items-center space-x-2 mb-2">
              <h3 className="text-white font-bold text-lg truncate">{lead.username || 'Unknown'}</h3>
              {lead.isVerified && (
                <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
              {lead.isBusiness && (
                <span className="px-2 py-1 text-xs bg-green-600 text-white rounded-full">BUSINESS</span>
              )}
              {lead.businessType && (
                <span className="px-2 py-1 text-xs bg-purple-600 text-white rounded-full">
                  {lead.bioScore?.business_type || 'Business'}
                </span>
              )}
            </div>

            {/* Full Name if Available */}
            {lead.displayName && lead.displayName !== lead.username && (
              <p className="text-gray-300 text-sm mb-2">{lead.displayName}</p>
            )}
            
            {/* Enhanced Stats Grid */}
            <div className="grid grid-cols-3 gap-2 text-sm text-gray-400 mb-3">
              <div className="flex items-center space-x-1">
                <span>👥</span>
                <span className="font-medium">{lead.followers || 'N/A'}</span>
              </div>
              <div className="flex items-center space-x-1">
                <span>📸</span>
                <span className="font-medium">{lead.posts || lead.postsCount || 'N/A'}</span>
              </div>
              <div className="flex items-center space-x-1">
                <span>➡️</span>
                <span className="font-medium">{lead.following || 'N/A'}</span>
              </div>
            </div>

            {/* 🔥 NEW: Advanced Engagement Metrics */}
            {(lead.engagementRate || lead.avgLikesPerPost || lead.avgCommentsPerPost) && (
              <div className="grid grid-cols-2 gap-2 text-xs text-blue-400 mb-2 bg-blue-900/20 p-2 rounded">
                {lead.engagementRate && (
                  <div className="flex items-center space-x-1">
                    <span>📊</span>
                    <span className="font-medium">{lead.engagementRate} engagement</span>
                  </div>
                )}
                {lead.avgLikesPerPost && (
                  <div className="flex items-center space-x-1">
                    <span>❤️</span>
                    <span className="font-medium">{lead.avgLikesPerPost} avg likes</span>
                  </div>
                )}
                {lead.avgCommentsPerPost && (
                  <div className="flex items-center space-x-1">
                    <span>💬</span>
                    <span className="font-medium">{lead.avgCommentsPerPost} avg comments</span>
                  </div>
                )}
                {lead.suggestedCategory && (
                  <div className="flex items-center space-x-1">
                    <span>🏷️</span>
                    <span className="font-medium">{lead.suggestedCategory}</span>
                  </div>
                )}
              </div>
            )}

            {/* 🔥 NEW: Business Contact Info */}
            {lead.businessContacts && lead.businessContacts.length > 0 && (
              <div className="text-xs text-green-400 mb-2 bg-green-900/20 p-2 rounded">
                <div className="font-semibold mb-1">🏢 Business Contacts:</div>
                {lead.businessContacts.map((contact, idx) => (
                  <div key={idx} className="flex items-center space-x-1">
                    <span>{contact.type === 'email' ? '📧' : contact.type === 'phone' ? '📞' : '🌐'}</span>
                    <span className="truncate">{contact.value}</span>
                  </div>
                ))}
              </div>
            )}

            {/* 🔥 NEW: Hashtag Analysis */}
            {lead.bioHashtags && lead.bioHashtags.length > 0 && (
              <div className="text-xs text-purple-400 mb-2">
                <span className="font-semibold">🏷️ Tags: </span>
                <span>{lead.bioHashtags.slice(0, 3).join(' ')}</span>
                {lead.bioHashtags.length > 3 && <span className="text-gray-500"> +{lead.bioHashtags.length - 3} more</span>}
              </div>
            )}

            {/* 🔥 NEW: Link Analysis & Business Opportunity */}
            {lead.linkAnalysis && lead.linkAnalysis.totalLinks > 0 && (
              <div className="text-xs text-cyan-400 mb-2 bg-cyan-900/20 p-2 rounded">
                <div className="font-semibold mb-1">🔗 Link Analysis:</div>
                <div className="grid grid-cols-2 gap-1">
                  {lead.linkAnalysis.linkTypes.ecommerce > 0 && (
                    <span>🛒 Store: {lead.linkAnalysis.linkTypes.ecommerce}</span>
                  )}
                  {lead.linkAnalysis.linkTypes.booking > 0 && (
                    <span>📅 Booking: {lead.linkAnalysis.linkTypes.booking}</span>
                  )}
                  {lead.linkAnalysis.linkTypes.social > 0 && (
                    <span>📱 Social: {lead.linkAnalysis.linkTypes.social}</span>
                  )}
                  {lead.linkAnalysis.linkTypes.website > 0 && (
                    <span>🌐 Website: {lead.linkAnalysis.linkTypes.website}</span>
                  )}
                </div>
                {lead.businessOpportunityScore > 0 && (
                  <div className="text-yellow-400 mt-1">
                    💰 Business Score: {lead.businessOpportunityScore}/100
                  </div>
                )}
              </div>
            )}

            {/* 🔥 NEW: Geographic Insights */}
            {lead.geographicInsights && lead.geographicInsights.isLocalBusiness && (
              <div className="text-xs text-orange-400 mb-2 bg-orange-900/20 p-2 rounded">
                <div className="font-semibold mb-1">📍 Geographic Insights:</div>
                <div className="mb-1">📍 Primary: {lead.geographicInsights.primaryLocation}</div>
                {lead.geographicInsights.serviceArea && lead.geographicInsights.serviceArea.length > 0 && (
                  <div className="text-xs">🌍 Service Area: {lead.geographicInsights.serviceArea.slice(0, 2).join(', ')}</div>
                )}
              </div>
            )}

            {/* 🔥 NEW: Predictive AI Insights */}
            {lead.predictiveInsights && (
              <div className="text-xs text-purple-400 mb-2 bg-purple-900/20 p-2 rounded">
                <div className="font-semibold mb-1">🤖 AI Predictions:</div>
                <div className="grid grid-cols-2 gap-1">
                  <div>📊 Conversion: {lead.predictiveInsights.conversionProbability}%</div>
                  <div>📧 Response: {lead.predictiveInsights.responseRate}%</div>
                  {lead.predictiveInsights.estimatedValue > 0 && (
                    <div className="col-span-2 text-green-400">💰 Est. Value: ${lead.predictiveInsights.estimatedValue}</div>
                  )}
                </div>
                {lead.predictiveInsights.personalizedSuggestion && (
                  <div className="mt-1 text-xs text-gray-300">
                    💡 {lead.predictiveInsights.personalizedSuggestion}
                  </div>
                )}
                {lead.predictiveInsights.riskFactors && lead.predictiveInsights.riskFactors.length > 0 && (
                  <div className="mt-1 text-xs text-red-400">
                    ⚠️ {lead.predictiveInsights.riskFactors[0]}
                  </div>
                )}
              </div>
            )}

            {/* ENHANCED: Recent Activity & Engagement */}
            {(lead.recentPosts || lead.lastPostDate || lead.avgEngagement) && (
              <div className="flex items-center space-x-3 text-xs text-yellow-400 mb-2">
                {lead.recentPosts && lead.recentPosts.length > 0 && (
                  <div className="flex items-center space-x-1">
                    <span>🔥</span>
                    <span>{lead.recentPosts.length} recent posts</span>
                  </div>
                )}
                {lead.avgEngagement && (
                  <div className="flex items-center space-x-1">
                    <span>⚡</span>
                    <span>{lead.avgEngagement} activity</span>
                  </div>
                )}
                {lead.lastPostDate && (
                  <div className="flex items-center space-x-1 text-green-400">
                    <span>📅</span>
                    <span>Recent post</span>
                  </div>
                )}
              </div>
            )}

            {/* Additional Profile Metrics */}
            {(lead.highlightsCount || lead.externalLinks || lead.hasStories) && (
              <div className="flex items-center space-x-3 text-xs text-gray-500 mb-2">
                {lead.highlightsCount && (
                  <div className="flex items-center space-x-1">
                    <span>⭐</span>
                    <span>{lead.highlightsCount} highlights</span>
                  </div>
                )}
                {lead.hasStories && (
                  <div className="flex items-center space-x-1 text-purple-400">
                    <span>📱</span>
                    <span>Has stories</span>
                  </div>
                )}
                {lead.externalLinks && lead.externalLinks.length > 0 && (
                  <div className="flex items-center space-x-1 text-blue-400">
                    <span>🔗</span>
                    <span>{lead.externalLinks.length} link{lead.externalLinks.length > 1 ? 's' : ''}</span>
                  </div>
                )}
              </div>
            )}

            {/* Contact Information */}
            {(lead.email || lead.externalUrl || lead.website) && (
              <div className="flex items-center space-x-3 text-xs mb-3">
                {lead.email && (
                  <div className="flex items-center space-x-1 text-green-400">
                    <span>📧</span>
                    <span className="truncate max-w-[120px]">{lead.email}</span>
                  </div>
                )}
                {(lead.externalUrl || lead.website) && (
                  <div className="flex items-center space-x-1 text-blue-400">
                    <span>🌐</span>
                    <span className="truncate max-w-[100px]">Website</span>
                  </div>
                )}
              </div>
            )}
            
            {/* Bio Preview */}
            {lead.bio && (
              <p className="text-gray-300 text-sm line-clamp-2 mb-4">
                {lead.bio}
              </p>
            )}
            
            {/* AI Analysis Scores */}
            <div className="flex items-center space-x-2 text-xs flex-wrap gap-1">
              {lead.bioScore && (
                <AdvancedTooltip text={`Bio Analysis: ${lead.bioScore.recommendation || 'Standard lead'}`} position="auto">
                  <div className="flex items-center space-x-1 bg-green-900/40 px-2 py-1 rounded-lg cursor-help border border-green-800/50 hover:bg-green-900/60 transition-colors duration-200">
                    <span>🧠</span>
                    <span className="font-medium">Bio: {lead.bioScore.pitch_score || 0}/10</span>
                  </div>
                </AdvancedTooltip>
              )}
              {lead.visionScore && (
                <AdvancedTooltip text={`Visual Analysis: ${lead.visionScore.recommendation || 'Needs improvement'}`} position="auto">
                  <div className="flex items-center space-x-1 bg-purple-900/40 px-2 py-1 rounded-lg cursor-help border border-purple-800/50 hover:bg-purple-900/60 transition-colors duration-200">
                    <span>👁️</span>
                    <span className="font-medium">Visual: {lead.visionScore.professional_score || 0}/10</span>
                  </div>
                </AdvancedTooltip>
              )}
              {lead.leadScore && (
                <div className="flex items-center space-x-1 bg-blue-900/40 px-2 py-1 rounded-lg border border-blue-800/50">
                  <span>⚡</span>
                  <span className="font-medium">Score: {lead.leadScore}/10</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Screenshot Modal */}
      <ScreenshotModal 
        isOpen={showScreenshotModal}
        onClose={() => setShowScreenshotModal(false)}
        screenshot={screenshotUrl}
        username={lead.username}
      />
    </>
  );
};

// 🎛️ MODERN CONTROL PANEL
const ControlPanel = ({ 
  keyword, setKeyword, 
  pages, setPages, 
  loading, 
  onStart, 
  onStop, 
  progress, 
  eta,
  showAdvanced,
  setShowAdvanced 
}) => (
  <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700 shadow-xl">
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
        <span>🚀</span>
        <span>Lead Scraper</span>
      </h2>
      <div className="flex items-center space-x-2">
        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
        <span className="text-sm text-gray-400">System Active</span>
    </div>
    </div>
    
    {/* Search Input */}
    <div className="mb-6">
      <label className="block text-sm font-medium text-gray-300 mb-2">
        🎯 Search Keywords
      </label>
          <input 
        type="text"
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        placeholder="e.g., LA fitness, NYC barber, Miami cafe..."
        className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
        disabled={loading}
      />
        </div>
    
    {/* Quick Settings */}
    <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          📄 Pages to Scrape
        </label>
          <input 
          type="number"
          value={pages}
          onChange={(e) => setPages(Number(e.target.value))}
          min="1"
            max="10" 
          className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
          disabled={loading}
        />
        </div>
        <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          ⚡ Mode
        </label>
        <select className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200" disabled={loading}>
          <option>🎯 Precision</option>
          <option>⚡ Mass Scrape</option>
          </select>
        </div>
        </div>
    
    {/* Progress Section */}
    {loading && (
      <div className="mb-6 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
        <div className="flex items-center justify-between mb-3">
          <span className="text-blue-300 font-medium">Scraping in Progress...</span>
          <span className="text-sm text-gray-400">ETA: {eta}</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
          <div 
            className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress.percentage || 0}%` }}
          ></div>
      </div>
        <div className="flex justify-between text-sm text-gray-400">
          <span>{progress.current || 0}/{progress.target || 0} leads</span>
          <span>{progress.percentage || 0}%</span>
    </div>
      </div>
    )}
    
    {/* Action Buttons */}
    <div className="space-y-3">
      {/* Main Action Button */}
        <div>
        {!loading ? (
          <button 
            onClick={onStart}
            disabled={!keyword.trim()}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold py-4 px-6 rounded-lg transition-all duration-200 hover:scale-[1.02] disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-lg"
          >
            <span>🚀</span>
            <span>Start Scraping</span>
          </button>
        ) : (
          <button 
            onClick={onStop}
            className="w-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-bold py-4 px-6 rounded-lg transition-all duration-200 hover:scale-[1.02] flex items-center justify-center space-x-2 shadow-lg"
          >
            <span>⏹️</span>
            <span>Stop Scraping</span>
          </button>
        )}
        </div>
      
      {/* Copy Logs Button */}
      <button 
        onClick={async () => {
          try {
            const response = await axios.get('http://localhost:5001/api/debug/logs');
            navigator.clipboard.writeText(response.data.logs);
            setSuccess("Debug logs copied to clipboard!");
            setTimeout(() => setSuccess(""), 3000);
          } catch (error) {
            setError("Failed to copy logs");
            setTimeout(() => setError(""), 3000);
          }
        }}
        className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 hover:scale-[1.02] flex items-center justify-center space-x-2 shadow-lg"
      >
        <span>📋</span>
        <span>Copy Debug Logs</span>
      </button>
      
      {/* Settings Button Row */}
      <div className="flex space-x-3">
        <AdvancedTooltip text="Advanced Settings">
          <button 
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex-1 bg-gray-700 hover:bg-gray-600 text-gray-300 font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>Settings</span>
          </button>
        </AdvancedTooltip>
        </div>
      </div>
    </div>
  );

// 🎛️ MAIN SCRAPER PANEL COMPONENT
function ScraperPanel() {
  const location = useLocation();
  const [keyword, setKeyword] = useState("");
  const [pages, setPages] = useState(3);
  const [loading, setLoading] = useState(false);
  const [leads, setLeads] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [currentProgress, setCurrentProgress] = useState({ current: 0, target: 0, percentage: 0 });
  const [eta, setEta] = useState("Calculating...");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showScoringGuide, setShowScoringGuide] = useState(false);
  const [isSavingSession, setIsSavingSession] = useState(false);
  const abortControllerRef = useRef(null);

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
    const handleLoadSession = (event) => {
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
    abortControllerRef.current = new AbortController();
    
    try {
      const response = await axios.post('http://localhost:5001/scrape', {
        keyword: keyword.trim(),
        pages,
        massMode: true,
        delay: 3000
      }, {
        signal: abortControllerRef.current.signal
      });
      
      if (response.data.success) {
        setLeads(response.data.leads || []);
        setSuccess(`Successfully scraped ${response.data.leads?.length || 0} leads!`);
      } else {
        setError(response.data.error || "Scraping failed");
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        setError(error.response?.data?.error || error.message || "Scraping failed");
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
    } catch (error) {
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
        />

        {/* Status Messages */}
        {error && (
          <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-4 flex items-center space-x-3">
            <span className="text-red-400 text-xl">❌</span>
            <span className="text-red-300">{error}</span>
              </div>
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

        {/* 🔥 NEW: Hashtag Performance Analytics */}
        {leads.length > 0 && (
          <HashtagAnalytics leads={leads} />
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
                <LeadScoringGuide />
                      </div>
                    </div>
                  </div>
                )}
                  </div>
    </div>
  );
}

export default ScraperPanel;
