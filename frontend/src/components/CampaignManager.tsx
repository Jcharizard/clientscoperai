import React, { useEffect, useState } from "react";
import axios from "axios";
import { Session, Campaign, ApiResponse } from '../types';

interface CampaignsResponse {
  campaigns: Record<string, string[]>;
}

interface SessionsResponse {
  sessions: Session[];
}

const CampaignManager: React.FC = () => {
  const [campaigns, setCampaigns] = useState<Record<string, string[]>>({});
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      setLoading(true);
      try {
        const cRes = await axios.get<ApiResponse<CampaignsResponse>>("/api/campaigns");
        setCampaigns(cRes.data.data?.campaigns || {});
        const sRes = await axios.get<ApiResponse<SessionsResponse>>("/api/sessions");
        setSessions(sRes.data.data?.sessions || []);
      } catch (e) {
        setError("Failed to load campaigns");
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const getSessionsForCampaign = (campaign: string): Session[] => {
    const ids = campaigns[campaign] || [];
    return sessions.filter(s => ids.includes(s.id));
  };

  return (
    <div className="p-8 bg-gray-900 min-h-screen text-white">
      <h1 className="text-3xl font-bold mb-6">Campaign Manager</h1>
      {loading ? <div>Loading...</div> : error ? <div className="text-red-400">{error}</div> : (
        <div className="space-y-6">
          {Object.keys(campaigns).length === 0 && <div>No campaigns found.</div>}
          {Object.keys(campaigns).map(campaign => (
            <div key={campaign} className="bg-gray-800 rounded p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xl font-bold text-blue-400">{campaign}</span>
                <span className="text-xs text-gray-400">{getSessionsForCampaign(campaign).length} sessions</span>
              </div>
              <table className="min-w-full text-sm border border-gray-700">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="px-3 py-2 text-left">Session Name</th>
                    <th className="px-3 py-2 text-left">Date</th>
                    <th className="px-3 py-2 text-left">Leads</th>
                  </tr>
                </thead>
                <tbody>
                  {getSessionsForCampaign(campaign).map(s => (
                    <tr key={s.id} className="bg-gray-900">
                      <td className="px-3 py-2">{s.name}</td>
                      <td className="px-3 py-2">{new Date(s.createdAt).toLocaleString()}</td>
                      <td className="px-3 py-2">{s.leads?.length || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CampaignManager; 