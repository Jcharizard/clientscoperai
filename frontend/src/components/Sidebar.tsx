import React from "react";
import { Cog6ToothIcon } from '@heroicons/react/24/outline';
import { TabConfig } from '../types';

interface SidebarProps {
  tab: string;
  setTab: (tab: string) => void;
  tabs: TabConfig[];
}

function Sidebar({ tab, setTab, tabs }: SidebarProps) {
  const [collapsed, setCollapsed] = React.useState(false);
  return (
    <div className={`transition-all duration-300 ${collapsed ? 'w-20' : 'w-52'} min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-blue-950 text-white p-4 border-r border-gray-800 flex flex-col items-center`}>
      <div className="flex flex-col items-center mb-10 w-full">
        <img src="/logo/logo.png" alt="ClientScope Logo" className={`transition-all duration-300 ${collapsed ? 'w-8 h-8' : 'w-12 h-12'} aspect-square object-cover rounded-lg shadow mb-3`} style={{maxWidth: collapsed ? '32px' : '48px', maxHeight: collapsed ? '32px' : '48px'}} />
        {!collapsed && <span className="text-2xl font-bold tracking-tight text-center leading-tight">ClientScope<span className="text-blue-500">AI</span></span>}
      </div>
      <nav className="flex flex-col gap-2 w-full">
        {tabs.map(t => (
          <button
            key={t.key}
            className={`flex items-center gap-3 px-4 py-2 rounded transition-colors w-full text-left font-medium ${tab === t.key ? 'bg-gray-800 text-blue-400' : 'hover:bg-gray-800 text-gray-300'} ${collapsed ? 'justify-center px-0' : ''}`}
            onClick={() => setTab(t.key)}
            title={collapsed ? t.label : undefined}
          >
            <t.icon className="w-5 h-5" />
            {!collapsed && <span>{t.label}</span>}
          </button>
        ))}
      </nav>
      <div className="mt-auto flex flex-col items-center w-full gap-4">
        <button className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-800 transition mb-2" title="Settings">
          <Cog6ToothIcon className="w-6 h-6 text-gray-400 hover:text-blue-400" />
        </button>
        <button className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-800 transition mb-2" onClick={() => setCollapsed(c => !c)} title={collapsed ? 'Expand' : 'Collapse'}>
          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d={collapsed ? 'M4 12h16m-7-7l7 7-7 7' : 'M20 12H4m7-7l-7 7 7 7'} /></svg>
        </button>
        <img src="/logo/avatar.png" alt="User Avatar" className="w-10 h-10 rounded-full border-2 border-blue-700 shadow mb-2 object-cover" style={{maxWidth: '40px', maxHeight: '40px'}} />
        <div className={`text-xs text-gray-600 pt-4 ${collapsed ? 'hidden' : ''}`}>v1.0<br />Premium Local Lead Gen</div>
      </div>
    </div>
  );
}

export default Sidebar;
