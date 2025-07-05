import React from 'react';
import { ExternalLink, User, Mail, Globe, Star, TrendingUp, Award } from 'lucide-react';
import { Lead } from '../types';

interface LeadCardTextOnlyProps {
  lead: Lead;
}

const LeadCardTextOnly: React.FC<LeadCardTextOnlyProps> = ({ lead }) => {
  const getTemperatureColor = (temp: string): string => {
    switch(temp) {
      case 'HOT': return 'text-red-500 bg-red-50 border-red-200';
      case 'WARM': return 'text-orange-500 bg-orange-50 border-orange-200';
      case 'COLD': return 'text-blue-500 bg-blue-50 border-blue-200';
      default: return 'text-gray-500 bg-gray-50 border-gray-200';
    }
  };

  const getScoreColor = (score: number): string => {
    if (score >= 70) return 'text-green-600 bg-green-100';
    if (score >= 40) return 'text-yellow-600 bg-yellow-100';
    return 'text-gray-600 bg-gray-100';
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300">
      {/* Header with Username and Score */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 text-white">
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <User className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg">@{lead.username}</h3>
              <p className="text-blue-100 text-sm">{lead.fullName || 'Instagram Profile'}</p>
            </div>
          </div>
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(lead.score || 0)}`}>
            {lead.score || 0}/100
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Temperature Badge */}
        <div className="flex justify-between items-center mb-4">
          <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getTemperatureColor(lead.temperature || 'COLD')}`}>
            🌡️ {lead.temperature || 'COLD'} LEAD
          </span>
          <a 
            href={`https://instagram.com/${lead.username}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            <ExternalLink className="w-4 h-4" />
            <span>View Profile</span>
          </a>
        </div>

        {/* Bio Section */}
        {lead.bio && (
          <div className="mb-4">
            <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
              <Star className="w-4 h-4 mr-2 text-yellow-500" />
              Bio Analysis
            </h4>
            <p className="text-gray-700 text-sm leading-relaxed bg-gray-50 p-3 rounded-lg">
              {lead.bio}
            </p>
          </div>
        )}

        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          {lead.followersCount && (
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="text-blue-600 text-sm font-medium">Followers</div>
              <div className="text-lg font-bold text-blue-800">
                {lead.followersCount.toLocaleString()}
              </div>
            </div>
          )}
          {lead.postsCount && (
            <div className="bg-green-50 p-3 rounded-lg">
              <div className="text-green-600 text-sm font-medium">Posts</div>
              <div className="text-lg font-bold text-green-800">
                {lead.postsCount.toLocaleString()}
              </div>
            </div>
          )}
        </div>

        {/* Contact Information */}
        {(lead.email || lead.website || lead.phone) && (
          <div className="mb-4">
            <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
              <Mail className="w-4 h-4 mr-2 text-green-500" />
              Contact Information
            </h4>
            <div className="space-y-2">
              {lead.email && (
                <div className="flex items-center space-x-2 text-sm">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-700">{lead.email}</span>
                </div>
              )}
              {lead.website && (
                <div className="flex items-center space-x-2 text-sm">
                  <Globe className="w-4 h-4 text-gray-500" />
                  <a href={lead.website} target="_blank" rel="noopener noreferrer" 
                     className="text-blue-600 hover:underline">{lead.website}</a>
                </div>
              )}
              {lead.phone && (
                <div className="flex items-center space-x-2 text-sm">
                  <span className="text-gray-700">{lead.phone}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* AI Insights */}
        <div className="border-t pt-4">
          <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
            <TrendingUp className="w-4 h-4 mr-2 text-purple-500" />
            AI Analysis
          </h4>
          <div className="grid grid-cols-1 gap-2 text-sm">
            {lead.businessType && (
              <div className="flex justify-between">
                <span className="text-gray-600">Business Type:</span>
                <span className="font-medium text-gray-800">{lead.businessType}</span>
              </div>
            )}
            {lead.revenueScore && (
              <div className="flex justify-between">
                <span className="text-gray-600">Revenue Potential:</span>
                <span className="font-medium text-gray-800">{lead.revenueScore}/10</span>
              </div>
            )}
            {lead.contactReadiness !== undefined && (
              <div className="flex justify-between">
                <span className="text-gray-600">Contact Ready:</span>
                <span className="font-medium text-green-600">
                  {lead.contactReadiness > 0.5 ? 'Yes' : 'No'}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2 mt-4">
          <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm">
            Add to Campaign
          </button>
          <button className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors font-medium text-sm">
            Save for Later
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-50 px-6 py-3 border-t">
        <div className="flex justify-between items-center text-xs text-gray-500">
          <span>Discovered by ClientScopeAI</span>
          <span className="flex items-center">
            <Award className="w-3 h-3 mr-1" />
            Quality Score: {lead.score || 0}
          </span>
        </div>
      </div>
    </div>
  );
};

export default LeadCardTextOnly; 