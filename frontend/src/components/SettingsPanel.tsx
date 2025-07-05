import React from "react";

const SettingsPanel: React.FC = () => (
  <div className="p-8 bg-gray-900 min-h-screen text-white flex flex-col items-center justify-center">
    <div className="bg-gray-800 rounded-xl shadow-lg p-10 max-w-lg w-full flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-4">Settings</h1>
      <p className="text-gray-400 text-center">Settings coming soon!<br />Here you will be able to manage user preferences, multi-account, plugins, and more.</p>
    </div>
  </div>
);

export default SettingsPanel; 