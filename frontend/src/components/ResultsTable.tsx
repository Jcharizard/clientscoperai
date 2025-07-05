import React from "react";
import { Lead } from '../types';

interface ResultsTableProps {
  leads: Lead[];
}

const ResultsTable: React.FC<ResultsTableProps> = ({ leads }) => {
  if (!leads || leads.length === 0) return null;

  const sortedLeads = [...leads].sort((a, b) => (b.score || 0) - (a.score || 0));

  return (
    <div className="mt-6 overflow-x-auto">
      <h2 className="text-xl font-bold text-white mb-2">📊 Leads Table</h2>
      <table className="min-w-full text-sm border border-gray-600">
        <thead className="bg-gray-700 text-white">
          <tr>
            <th className="px-3 py-2 text-left border border-gray-600">Username</th>
            <th className="px-3 py-2 text-left border border-gray-600">URL</th>
            <th className="px-3 py-2 text-left border border-gray-600">Score</th>
            <th className="px-3 py-2 text-left border border-gray-600">Bio</th>
          </tr>
        </thead>
        <tbody>
          {sortedLeads.map((lead, idx) => (
            <tr key={idx} className="bg-gray-800 text-white">
              <td className="px-3 py-1 border border-gray-600">{lead.username}</td>
              <td className="px-3 py-1 border border-gray-600">
                <a href={lead.url} target="_blank" rel="noopener noreferrer" className="text-blue-400 underline">
                  {lead.url}
                </a>
              </td>
              <td className="px-3 py-1 border border-gray-600">{lead.score || 0}</td>
              <td className="px-3 py-1 border border-gray-600">{lead.bio?.substring(0, 100) || 'No bio'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ResultsTable; 