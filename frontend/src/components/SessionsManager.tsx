import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

interface SessionData {
  sessionId: string;
  timestamp: string;
  totalLeads: number;
  searchCriteria: {
    keyword: string;
    pages: number;
    timestamp: string;
  };
  summary: {
  hotLeads: number;
    warmLeads: number;
    contactLeads: number;
    avgBioScore: number;
    avgVisionScore: number;
    totalLeads: number;
  };
  leads: any[];
}

const SessionsManager: React.FC = () => {
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedSession, setSelectedSession] = useState<SessionData | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [loadingSession, setLoadingSession] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async (): Promise<void> => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:5001/api/sessions/saved');
      setSessions(response.data || []);
    } catch (error) {
      console.error('Failed to load sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSessionIntoExplorer = async (sessionId: string): Promise<void> => {
    setLoadingSession(sessionId);
    try {
        // Get the specific session data
      const response = await axios.get(`http://localhost:5001/api/sessions/saved/${sessionId}`);
      const sessionData = response.data;
      
      if (!sessionData) {
        console.error('Session not found:', sessionId);
        return;
      }
      
      // Store session data in localStorage for Lead Explorer to pick up
      localStorage.setItem('loadedSession', JSON.stringify({
        leads: sessionData.leads || [],
        keyword: sessionData.searchCriteria?.keyword || 'Loaded Session',
        analytics: sessionData.summary
      }));
      
      // Navigate to Lead Explorer (scraper tab)
      navigate('/');
      
      // Trigger a custom event to notify Lead Explorer
      window.dispatchEvent(new CustomEvent('loadSession', { 
        detail: { sessionId, data: sessionData } 
      }));
      
    } catch (error) {
      console.error('Failed to load session:', error);
    } finally {
      setLoadingSession(null);
    }
  };

  const formatDate = (timestamp: string): string => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getGradeColor = (score: number): string => {
    if (score >= 8) return 'text-green-400';
    if (score >= 6) return 'text-blue-400';
    if (score >= 4) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getGradeBg = (score: number): string => {
    if (score >= 8) return 'bg-green-900/20 border-green-500/30';
    if (score >= 6) return 'bg-blue-900/20 border-blue-500/30';
    if (score >= 4) return 'bg-yellow-900/20 border-yellow-500/30';
    return 'bg-red-900/20 border-red-500/30';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-400">Loading sessions...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
      {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            💾 Saved Sessions
            </h1>
          <p className="text-gray-400 text-lg">Manage and reload your scraping sessions</p>
          <div className="mt-4 flex items-center justify-center space-x-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">{sessions.length}</div>
              <div className="text-sm text-gray-500">Total Sessions</div>
          </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">
                {sessions.reduce((sum, s) => sum + s.totalLeads, 0)}
              </div>
              <div className="text-sm text-gray-500">Total Leads</div>
          </div>
        </div>
      </div>

      {/* Sessions Grid */}
      {sessions.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📁</div>
            <h3 className="text-2xl font-bold text-gray-300 mb-2">No Saved Sessions</h3>
          <p className="text-gray-500 mb-6">
              Create your first session by scraping leads and clicking "Save Session"
          </p>
          <button 
              onClick={() => navigate('/')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Go to Lead Explorer
          </button>
        </div>
      ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {sessions.map((session) => (
              <div 
                key={session.sessionId} 
                className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 overflow-hidden hover:shadow-xl hover:border-gray-600/50 transition-all duration-300"
              >
                {/* Session Header */}
                <div className="p-6 border-b border-gray-700/50">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-1">
                        🔍 {session.searchCriteria?.keyword || 'Unknown Search'}
                      </h3>
                      <div className="text-sm text-gray-400">
                        📅 {formatDate(session.timestamp)}
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getGradeBg(session.summary?.avgBioScore || 0)}`}>
                      <span className={getGradeColor(session.summary?.avgBioScore || 0)}>
                        ⭐ {(session.summary?.avgBioScore || 0).toFixed(1)}
                        </span>
                      </div>
                    </div>
                    
                  {/* Quick Stats */}
                  <div className="grid grid-cols-4 gap-2">
                    <div className="text-center p-2 bg-red-900/20 rounded-lg">
                      <div className="text-lg font-bold text-red-400">{session.summary?.hotLeads || 0}</div>
                      <div className="text-xs text-red-300">🔥 Hot</div>
                    </div>
                    <div className="text-center p-2 bg-orange-900/20 rounded-lg">
                      <div className="text-lg font-bold text-orange-400">{session.summary?.warmLeads || 0}</div>
                      <div className="text-xs text-orange-300">🌟 Warm</div>
                    </div>
                    <div className="text-center p-2 bg-green-900/20 rounded-lg">
                      <div className="text-lg font-bold text-green-400">{session.summary?.contactLeads || 0}</div>
                      <div className="text-xs text-green-300">📧 Contact</div>
                    </div>
                    <div className="text-center p-2 bg-blue-900/20 rounded-lg">
                      <div className="text-lg font-bold text-blue-400">{session.totalLeads}</div>
                      <div className="text-xs text-blue-300">👥 Total</div>
                    </div>
                  </div>
                </div>

                {/* Session Details */}
                <div className="p-6">
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Bio Score:</span>
                      <span className={`font-medium ${getGradeColor(session.summary?.avgBioScore || 0)}`}>
                        {(session.summary?.avgBioScore || 0).toFixed(1)}/10
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Vision Score:</span>
                      <span className={`font-medium ${getGradeColor(session.summary?.avgVisionScore || 0)}`}>
                        {(session.summary?.avgVisionScore || 0).toFixed(1)}/10
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Pages Scraped:</span>
                      <span className="text-white font-medium">{session.searchCriteria?.pages || 'N/A'}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                  <div className="flex space-x-2">
                    <button
                      onClick={() => loadSessionIntoExplorer(session.sessionId)}
                      disabled={loadingSession === session.sessionId}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                    >
                      {loadingSession === session.sessionId ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Loading...</span>
                        </>
                      ) : (
                        <>
                          <span>🔄</span>
                          <span>Load</span>
                        </>
                      )}
                    </button>
                    
                  <button
                      onClick={() => setDeleteConfirm(session.sessionId)}
                      className="px-3 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition-colors"
                      title="Delete Session"
                  >
                      🗑️
                  </button>
                  </div>
                </div>
              </div>
            ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-xl max-w-md w-full border border-gray-700">
              <div className="p-6">
                <h3 className="text-xl font-bold text-white mb-4">Delete Session</h3>
                <p className="text-gray-400 mb-6">
                  Are you sure you want to delete this session? This action cannot be undone.
            </p>
                <div className="flex space-x-3">
              <button
                    onClick={() => setDeleteConfirm(null)}
                    className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                    onClick={() => {
                      // TODO: Implement delete functionality
                      setDeleteConfirm(null);
                    }}
                    className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                Delete
              </button>
                </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default SessionsManager; 