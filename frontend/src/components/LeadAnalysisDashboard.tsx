import React, { useState, useEffect } from 'react';
import { Search, Brain, TrendingUp, Users, Award, Filter } from 'lucide-react';
import LeadCardTextOnly from './LeadCardTextOnly';
import { Lead } from '../types';

interface LeadStats {
  total: number;
  hot: number;
  warm: number;
  cold: number;
  avgScore: number;
}

type FilterType = 'all' | 'hot' | 'warm' | 'cold';

interface SearchResponse {
  leads?: Lead[];
  message?: string;
  error?: string;
}

const LeadAnalysisDashboard: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filter, setFilter] = useState<FilterType>('all');

  const handleSearch = async (): Promise<void> => {
    if (!searchTerm.trim()) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          searchTerm,
          pages: 1,
          mass: false 
        })
      });
      
      const data: SearchResponse = await response.json();
      setLeads(data.leads || []);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredLeads = leads.filter(lead => {
    if (filter === 'all') return true;
    if (filter === 'hot') return lead.temperature === 'HOT';
    if (filter === 'warm') return lead.temperature === 'WARM';
    if (filter === 'cold') return lead.temperature === 'COLD';
    return true;
  });

  const stats: LeadStats = {
    total: leads.length,
    hot: leads.filter(l => l.temperature === 'HOT').length,
    warm: leads.filter(l => l.temperature === 'WARM').length,
    cold: leads.filter(l => l.temperature === 'COLD').length,
    avgScore: leads.length > 0 ? Math.round(leads.reduce((sum, l) => sum + (l.score || 0), 0) / leads.length) : 0
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Brain className="w-8 h-8 mr-3 text-blue-600" />
                ClientScopeAI
              </h1>
              <p className="text-gray-600 mt-1">Advanced Instagram Lead Analysis Platform</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                AI-Powered Analysis
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search Section */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <Search className="w-5 h-5 mr-2 text-blue-600" />
            Lead Discovery Engine
          </h2>
          <div className="flex space-x-4">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Enter search term (e.g., 'cafe', 'fitness', 'jewelry')"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              onKeyPress={handleKeyPress}
            />
            <button
              onClick={handleSearch}
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium min-w-[120px]"
            >
              {loading ? 'Analyzing...' : 'Find Leads'}
            </button>
          </div>
        </div>

        {/* Stats Dashboard */}
        {leads.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <Users className="w-8 h-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Leads</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                  <span className="text-red-600 font-bold">🔥</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Hot Leads</p>
                  <p className="text-2xl font-bold text-red-600">{stats.hot}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <span className="text-orange-600 font-bold">⚡</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Warm Leads</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.warm}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-bold">❄️</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Cold Leads</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.cold}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <Award className="w-8 h-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Avg Score</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.avgScore}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filter Bar */}
        {leads.length > 0 && (
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <div className="flex items-center space-x-4">
              <Filter className="w-5 h-5 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">Filter:</span>
              <div className="flex space-x-2">
                {(['all', 'hot', 'warm', 'cold'] as FilterType[]).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${
                      filter === f 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {f} {f !== 'all' && `(${stats[f as keyof typeof stats]})`}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Results Grid */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-flex items-center space-x-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="text-lg text-gray-600">Analyzing Instagram profiles...</span>
            </div>
          </div>
        )}

        {filteredLeads.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredLeads.map((lead, index) => (
              <LeadCardTextOnly key={index} lead={lead} />
            ))}
          </div>
        )}

        {leads.length === 0 && !loading && (
          <div className="text-center py-12">
            <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Ready to Find Leads</h3>
            <p className="text-gray-600">Enter a search term above to discover and analyze Instagram business profiles</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeadAnalysisDashboard; 