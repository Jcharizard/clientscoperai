import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { ChartBarIcon, FolderIcon, UsersIcon, ArrowPathIcon, ArrowDownTrayIcon, RocketLaunchIcon } from '@heroicons/react/24/solid';
import { Lead, Session, ApiResponse } from '../types';

interface LeadsResponse {
  leads: Lead[];
}

interface SessionsResponse {
  sessions: Session[];
}

interface CampaignsResponse {
  campaigns: Record<string, string[]>;
}

declare global {
  interface Window {
    Chart: any;
  }
}

interface ChartRef extends HTMLCanvasElement {
  chart?: any;
}

const DashboardPanel: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [campaigns, setCampaigns] = useState<Record<string, string[]>>({});
  const chartRef1 = useRef<ChartRef>(null);
  const chartRef2 = useRef<ChartRef>(null);
  const chartRef3 = useRef<ChartRef>(null);

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      try {
        const [leadsRes, sessionsRes, campaignsRes] = await Promise.all([
          axios.get<ApiResponse<LeadsResponse>>("/api/leads"),
          axios.get<ApiResponse<SessionsResponse>>("/api/sessions"),
          axios.get<ApiResponse<CampaignsResponse>>("/api/campaigns")
        ]);

        setLeads(leadsRes.data.data?.leads || []);
        setSessions(sessionsRes.data.data?.sessions || []);
        setCampaigns(campaignsRes.data.data?.campaigns || {});
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      }
    };

    fetchData();
  }, []);

  // Chart.js loader
  useEffect(() => {
    if (!window.Chart) {
      const script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/chart.js";
      script.onload = renderCharts;
      document.body.appendChild(script);
    } else {
      renderCharts();
    }
    // eslint-disable-next-line
  }, [leads, sessions, campaigns]);

  const renderCharts = (): void => {
    if (!window.Chart) return;
    
    // Leads per campaign
    const campaignNames = Object.keys(campaigns);
    const leadsPerCampaign = campaignNames.map(c =>
      leads.filter(l => (l as any).campaign === c).length
    );
    const hotLeadsPerCampaign = campaignNames.map(c =>
      leads.filter(l => 
        (l as any).campaign === c && 
        (l.bioScore?.pitch && l.bioScore.pitch >= 2) || 
        (l.bioScore?.urgent?.toString().toLowerCase() === "yes")
      ).length
    );
    
    // Leads over time (by day)
    const byDay: Record<string, number> = {};
    leads.forEach(l => {
      if ((l as any).createdAt) {
        const d = new Date((l as any).createdAt).toLocaleDateString();
        byDay[d] = (byDay[d] || 0) + 1;
      }
    });
    const days = Object.keys(byDay);
    const leadsByDay = days.map(d => byDay[d]);
    
    // Chart 1: Leads per campaign
    if (chartRef1.current) {
      if (chartRef1.current.chart) chartRef1.current.chart.destroy();
      chartRef1.current.chart = new window.Chart(chartRef1.current, {
        type: 'bar',
        data: {
          labels: campaignNames,
          datasets: [{ label: 'Leads', data: leadsPerCampaign, backgroundColor: '#4f46e5' }]
        },
        options: { plugins: { legend: { display: false } } }
      });
    }
    
    // Chart 2: Hot leads per campaign
    if (chartRef2.current) {
      if (chartRef2.current.chart) chartRef2.current.chart.destroy();
      chartRef2.current.chart = new window.Chart(chartRef2.current, {
        type: 'bar',
        data: {
          labels: campaignNames,
          datasets: [{ label: 'Hot Leads', data: hotLeadsPerCampaign, backgroundColor: '#f59e42' }]
        },
        options: { plugins: { legend: { display: false } } }
      });
    }
    
    // Chart 3: Leads over time
    if (chartRef3.current) {
      if (chartRef3.current.chart) chartRef3.current.chart.destroy();
      chartRef3.current.chart = new window.Chart(chartRef3.current, {
        type: 'line',
        data: {
          labels: days,
          datasets: [{ 
            label: 'Leads per Day', 
            data: leadsByDay, 
            borderColor: '#10b981', 
            backgroundColor: 'rgba(16,185,129,0.2)', 
            fill: true 
          }]
        },
        options: { plugins: { legend: { display: false } } }
      });
    }
  };

  const totalLeads = leads.length;
  const hotLeads = leads.filter(l => 
    (l.bioScore?.pitch && l.bioScore.pitch >= 2) || 
    (l.bioScore?.urgent?.toString().toLowerCase() === "yes")
  ).length;
  const totalCampaigns = Object.keys(campaigns).length;
  const totalSessions = sessions.length;
  // Conversion rate: hot leads / total leads
  const conversionRate = totalLeads ? ((hotLeads / totalLeads) * 100).toFixed(1) : 0;

  const handleStartScrape = (): void => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleExportLeads = (): void => {
    window.dispatchEvent(new CustomEvent('exportLeads'));
  };



  return (
    <div className="p-8 bg-gray-900 min-h-screen text-white transition-all duration-300 relative">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between mb-8 gap-4 z-10 relative">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <img 
            src="/logo/logo.png" 
            alt="Logo" 
            className="w-8 h-8 rounded-lg object-cover" 
            style={{ maxWidth: '32px', maxHeight: '32px' }} 
          />
          Dashboard
        </h1>
        <div className="flex gap-2">
          <button 
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded shadow transition" 
            onClick={handleStartScrape}
          >
            <RocketLaunchIcon className="w-5 h-5" />
            Start Scrape
          </button>
          <button 
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 px-4 py-2 rounded shadow transition" 
            onClick={handleExportLeads}
          >
            <ArrowDownTrayIcon className="w-5 h-5" />
            Export Leads
          </button>

        </div>
      </div>
      
      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-900 to-gray-800 rounded-lg p-5 flex flex-col items-center shadow-lg">
          <ChartBarIcon className="w-8 h-8 text-blue-400 mb-1" />
          <span className="text-2xl font-bold text-blue-400">{totalLeads}</span>
          <span className="text-xs text-gray-400 mt-1">Total Leads</span>
        </div>
        <div className="bg-gradient-to-br from-orange-900 to-gray-800 rounded-lg p-5 flex flex-col items-center shadow-lg">
          <ChartBarIcon className="w-8 h-8 text-orange-400 mb-1" />
          <span className="text-2xl font-bold text-orange-400">{hotLeads}</span>
          <span className="text-xs text-gray-400 mt-1">Hot Leads</span>
        </div>
        <div className="bg-gradient-to-br from-green-900 to-gray-800 rounded-lg p-5 flex flex-col items-center shadow-lg">
          <FolderIcon className="w-8 h-8 text-green-400 mb-1" />
          <span className="text-2xl font-bold text-green-400">{totalCampaigns}</span>
          <span className="text-xs text-gray-400 mt-1">Campaigns</span>
        </div>
        <div className="bg-gradient-to-br from-pink-900 to-gray-800 rounded-lg p-5 flex flex-col items-center shadow-lg">
          <UsersIcon className="w-8 h-8 text-pink-400 mb-1" />
          <span className="text-2xl font-bold text-pink-400">{totalSessions}</span>
          <span className="text-xs text-gray-400 mt-1">Sessions</span>
        </div>
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-gray-800 rounded-lg p-4 shadow-md transition-all duration-300">
          <h2 className="text-lg font-bold mb-2">Leads per Campaign</h2>
          <canvas ref={chartRef1} height={200}></canvas>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 shadow-md transition-all duration-300">
          <h2 className="text-lg font-bold mb-2">Hot Leads per Campaign</h2>
          <canvas ref={chartRef2} height={200}></canvas>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 shadow-md transition-all duration-300">
          <h2 className="text-lg font-bold mb-2">Leads Over Time</h2>
          <canvas ref={chartRef3} height={200}></canvas>
        </div>
      </div>
      
      <div className="mt-12 text-xs text-gray-500 text-center">
        Dashboard powered by Chart.js | ClientScopeAI
      </div>
      
      {/* Faint watermark logo in the bottom right */}
      <img 
        src="/logo/logo.png" 
        alt="Logo watermark" 
        className="hidden lg:block fixed bottom-8 right-8 w-12 h-12 opacity-10 pointer-events-none select-none z-0" 
      />
    </div>
  );
};

export default DashboardPanel;
