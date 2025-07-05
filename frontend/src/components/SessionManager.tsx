import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Session, ApiResponse } from '../types';

interface SessionsResponse {
  sessions: Session[];
}

const SessionManager: React.FC = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const navigate = useNavigate();

  const fetchSessions = async (): Promise<void> => {
    setLoading(true);
    try {
      // Fetch both scraping sessions and saved sessions
      const [scrapingRes, savedRes] = await Promise.all([
        axios.get<ApiResponse<SessionsResponse>>("/api/sessions").catch(() => ({ data: { data: { sessions: [] } } })),
        axios.get("/api/sessions/saved").catch(() => ({ data: [] }))
      ]);
      
      const scrapingSessions = scrapingRes.data.data?.sessions || [];
      const savedSessions = (savedRes.data || []).map((session: any) => ({
        ...session,
        id: session.sessionId,
        name: `Saved Session - ${new Date(session.timestamp).toLocaleDateString()}`,
        keyword: JSON.stringify(session.searchCriteria),
        createdAt: session.timestamp,
        leads: [],
        leadCount: session.leadCount || session.totalLeads || 0,
        type: 'saved'
      }));
      
      // Combine and sort by creation date
      const allSessions = [...scrapingSessions, ...savedSessions].sort((a, b) => 
        new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime()
      );
      
      setSessions(allSessions);
    } catch (e) {
      setError("Failed to load sessions");
    }
    setLoading(false);
  };

  useEffect(() => { 
    fetchSessions(); 
  }, []);

  const handleDelete = async (id: string): Promise<void> => {
    if (!window.confirm("Delete this session?")) return;
    await axios.delete(`/api/session/${id}`);
    fetchSessions();
  };

  const handleLoad = (id: string): void => {
    navigate(`/`, { state: { loadSessionId: id } });
  };

  const handleNewSession = (): void => {
    navigate(`/`, { state: { newSession: true } });
  };

  const handleDownloadSession = async (sessionId: string): Promise<void> => {
    try {
      const response = await axios.get(`/api/sessions/saved`);
      const sessions = response.data;
      const session = sessions.find((s: any) => s.sessionId === sessionId);
      
      if (session) {
        const blob = new Blob([JSON.stringify(session, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `session_${sessionId}_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Failed to download session:', error);
    }
  };

  const handleViewSession = async (sessionId: string): Promise<void> => {
    try {
      const response = await axios.get(`/api/sessions/saved/${sessionId}`);
      const sessionData = response.data;
      if (!sessionData) return;
      localStorage.setItem('loadedSession', JSON.stringify({ leads: sessionData.leads || [], keyword: sessionData.searchCriteria?.keyword || 'Loaded Session', analytics: sessionData.summary }));
      window.dispatchEvent(new CustomEvent('loadSession', { detail: { sessionId, data: sessionData } }));
      navigate('/');
    } catch (error) {
      console.error('Failed to load session:', error);
    }
  };

  return (
    <div className="p-8 bg-gray-900 min-h-screen text-white">
      <h1 className="text-3xl font-bold mb-6">Sessions</h1>
      {loading && <div className="text-blue-400">Loading sessions...</div>}
      {error && <div className="text-red-400">{error}</div>}
      <button className="bg-green-600 px-4 py-2 rounded mb-6" onClick={handleNewSession}>+ Start New Session</button>
      <table className="min-w-full text-sm border border-gray-700 mt-4">
        <thead className="bg-gray-700">
          <tr>
            <th className="px-3 py-2 text-left">Session Name</th>
            <th className="px-3 py-2 text-left">Type</th>
            <th className="px-3 py-2 text-left">Campaign/Search</th>
            <th className="px-3 py-2 text-left">Created</th>
            <th className="px-3 py-2 text-left">Leads</th>
            <th className="px-3 py-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {sessions.map((s, i) => (
            <tr key={i} className={`${(s as any).type === 'saved' ? 'bg-blue-900/30' : 'bg-gray-800'} border-b border-gray-700`}>
              <td className="px-3 py-2 flex items-center gap-2">
                {(s as any).type === 'saved' && <span className="bg-blue-600 text-xs px-2 py-1 rounded">SAVED</span>}
                {s.name}
              </td>
              <td className="px-3 py-2">
                <span className={`px-2 py-1 rounded text-xs ${
                  (s as any).type === 'saved' ? 'bg-blue-600' : 'bg-gray-600'
                }`}>
                  {(s as any).type === 'saved' ? 'Saved Session' : 'Scraping Session'}
                </span>
              </td>
              <td className="px-3 py-2 max-w-xs truncate">{s.keyword || '-'}</td>
              <td className="px-3 py-2">{s.createdAt ? new Date(s.createdAt).toLocaleString() : '-'}</td>
              <td className="px-3 py-2">
                <span className="font-semibold">{(s as any).leadCount || s.leads?.length || 0}</span>
                {(s as any).hotLeads && <span className="text-orange-400 ml-1">({(s as any).hotLeads} hot)</span>}
              </td>
              <td className="px-3 py-2 space-x-2">
                {(s as any).type === 'saved' ? (
                  <>
                    <button 
                      className="bg-green-600 hover:bg-green-700 px-2 py-1 rounded text-xs" 
                      onClick={() => handleDownloadSession(s.id)}
                      title="Download session data"
                    >
                      Download
                    </button>
                    <button 
                      className="bg-purple-600 hover:bg-purple-700 px-2 py-1 rounded text-xs" 
                      onClick={() => handleViewSession(s.id)}
                      title="View session details"
                    >
                      View
                    </button>
                  </>
                ) : (
                  <button className="bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded text-xs" onClick={() => handleLoad(s.id)}>Load</button>
                )}
                <button className="bg-red-600 hover:bg-red-700 px-2 py-1 rounded text-xs" onClick={() => handleDelete(s.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SessionManager; 