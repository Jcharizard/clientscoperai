import React from "react";
import Sidebar from "./components/Sidebar";
import ScraperPanel from "./components/ScraperPanel";
import DashboardPanel from "./components/DashboardPanel";
import SessionManager from "./components/SessionManager";
import ApifyStatusPanel from "./components/ApifyStatusPanel";
import HelpPanel from "./components/HelpPanel";
import SettingsPage from "./components/SettingsPage";
import RateLimitDashboard from "./components/RateLimitDashboard";
import AnalyticsDashboard from "./components/AnalyticsDashboard";

import PerformanceMonitor from "./components/PerformanceMonitor";
import { ChartBarIcon, TableCellsIcon, MagnifyingGlassIcon, ServerStackIcon, UsersIcon, QuestionMarkCircleIcon, SparklesIcon, DevicePhoneMobileIcon, ChartPieIcon, Cog6ToothIcon, ShieldCheckIcon, PresentationChartLineIcon } from '@heroicons/react/24/outline';
import { TabConfig, Lead } from './types';

const TABS: TabConfig[] = [
  { key: "scraper", label: "Scraper", icon: MagnifyingGlassIcon },
  { key: "analytics", label: "Analytics", icon: PresentationChartLineIcon },
  { key: "sessions", label: "Sessions", icon: UsersIcon },
  { key: "dashboard", label: "Dashboard", icon: ChartBarIcon },
  { key: "ratelimit", label: "Rate Monitor", icon: ShieldCheckIcon },
  { key: "apify", label: "Apify Status", icon: ServerStackIcon },
  { key: "help", label: "Help & Docs", icon: QuestionMarkCircleIcon },
  { key: "settings", label: "Settings", icon: Cog6ToothIcon },
];

function App() {
  const [onboarded, setOnboarded] = React.useState(localStorage.getItem("onboarded") === "true");
  const [showWelcome, setShowWelcome] = React.useState(!onboarded);
  const [tab, setTab] = React.useState("scraper");
  const [selectedLeadForEvaluation, setSelectedLeadForEvaluation] = React.useState<Lead | null>(null);

  React.useEffect(() => {
    if (onboarded) setShowWelcome(false);
  }, [onboarded]);

  // Listen for session load events and switch to Scraper
  React.useEffect(() => {
    const handler = () => setTab('scraper');
    window.addEventListener('loadSession', handler);
    return () => window.removeEventListener('loadSession', handler);
  }, []);

  if (showWelcome) return <div className="bg-gray-900 min-h-screen text-white flex items-center justify-center"><div className="flex flex-col items-center"><img src="/logo/logo.png" alt="ClientScope Logo" className="w-16 h-16 aspect-square object-contain rounded-2xl shadow mb-6" /><h1 className="text-4xl font-bold mb-4">Welcome to ClientScopeAI</h1><button className="bg-blue-600 px-6 py-3 rounded text-lg font-semibold" onClick={() => { setShowWelcome(false); localStorage.setItem("onboarded", "true"); }}>Get Started</button></div></div>;
  return (
    <div className="flex h-screen bg-gray-900">
      <Sidebar tab={tab} setTab={setTab} tabs={TABS} />
      <div className="flex-1 flex flex-col overflow-auto">
        {/* Top Bar */}
        <div className="flex items-center justify-between border-b border-gray-800 bg-gradient-to-r from-gray-950 via-gray-900 to-blue-950 px-6 shadow-lg" style={{ minHeight: 64 }}>
          <div className="flex items-center gap-3">
            <img src="/logo/logo.png" alt="Logo" className="w-8 h-8 rounded-lg object-cover" style={{maxWidth: '32px', maxHeight: '32px'}} />
            <span className="text-xl font-bold tracking-tight text-white">ClientScope<span className="text-blue-400">AI</span></span>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded shadow transition text-sm font-semibold" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>Start Scrape</button>
            <button className="flex items-center gap-2 bg-green-600 hover:bg-green-700 px-4 py-2 rounded shadow transition text-sm font-semibold" onClick={() => window.dispatchEvent(new CustomEvent('exportLeads'))}>Export Leads</button>

          </div>
          <div className="flex items-center gap-4">
            <img src="/logo/avatar.png" alt="User Avatar" className="w-10 h-10 rounded-full border-2 border-blue-700 shadow object-cover" style={{maxWidth: '40px', maxHeight: '40px'}} />
            <button className="bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-2 rounded transition text-sm font-semibold" onClick={() => setTab('settings')}>Settings</button>
          </div>
        </div>
        {/* Main Content Area */}
        <div className="flex-1 overflow-auto bg-gray-900">
          <div className="max-w-5xl mx-auto px-4 pr-12">
          {tab === "scraper" && <ScraperPanel />}
          {tab === "analytics" && <AnalyticsDashboard />}
          {tab === "sessions" && <SessionManager />}
          {tab === "dashboard" && <DashboardPanel />}
          {tab === "ratelimit" && <RateLimitDashboard />}
          {tab === "apify" && <ApifyStatusPanel />}
          {tab === "help" && <HelpPanel />}
          {tab === "settings" && <SettingsPage />}
          </div>
        </div>
      </div>
      <PerformanceMonitor />
    </div>
  );
}

export default App;
