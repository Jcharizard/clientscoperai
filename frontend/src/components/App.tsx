import React, { useState } from 'react';
import { 
  HomeIcon, 
  MagnifyingGlassIcon, 
  ChartBarIcon, 
  Cog6ToothIcon,
  SparklesIcon,
  DevicePhoneMobileIcon,
  FolderIcon
} from '@heroicons/react/24/outline';
import Dashboard from './Dashboard';
import LeadExplorer from './LeadExplorer';
import Analytics from './Analytics';
import Settings from './Settings';
import AdvancedFeaturesPanel from './AdvancedFeaturesPanel';
import MobileLeadCards from './MobileLeadCards';
import SessionsManager from './SessionsManager';
import PlaceholderPage from './PlaceholderPage';
import { Lead } from '../types';

type TabId = 'dashboard' | 'explorer' | 'sessions' | 'cards' | 'advanced' | 'analytics' | 'settings';

interface Tab {
  id: TabId;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
}

function App() {
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const [selectedLeadForEvaluation, setSelectedLeadForEvaluation] = useState<Lead | null>(null);

  const tabs: Tab[] = [
    { id: 'dashboard', name: 'Dashboard', icon: HomeIcon },
    { id: 'explorer', name: 'Lead Explorer', icon: MagnifyingGlassIcon },
    { id: 'sessions', name: 'Sessions', icon: FolderIcon },
    { id: 'cards', name: 'Lead Cards', icon: DevicePhoneMobileIcon },
    { id: 'advanced', name: 'Advanced Features', icon: SparklesIcon },
    { id: 'analytics', name: 'Analytics', icon: ChartBarIcon },
    { id: 'settings', name: 'Settings', icon: Cog6ToothIcon }
  ];

  const handleNavigateToAdvanced = (): void => {
    setActiveTab('advanced');
  };

  const renderContent = (): JSX.Element => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'explorer':
        return <LeadExplorer />;
      case 'sessions':
        return <SessionsManager />;
      case 'cards':
        return (
          <MobileLeadCards 
            onNavigateToAdvanced={handleNavigateToAdvanced}
            selectedLeadForEvaluation={selectedLeadForEvaluation}
            setSelectedLeadForEvaluation={setSelectedLeadForEvaluation}
          />
        );
      case 'advanced':
        return <AdvancedFeaturesPanel selectedLeadForEvaluation={selectedLeadForEvaluation} />;
      case 'analytics':
        return <Analytics />;
      case 'settings':
        return <Settings />;
      default:
        return <PlaceholderPage title="Page Not Found" description="This page doesn't exist yet" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navigation */}
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between">
            <div className="flex space-x-8">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center px-3 py-4 text-sm font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'text-blue-600 border-b-2 border-blue-600'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <Icon className="w-5 h-5 mr-2" />
                    {tab.name}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main>
        {renderContent()}
      </main>
    </div>
  );
}

export default App; 