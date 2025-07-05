import React from "react";

interface WelcomeScreenProps {
  onContinue: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onContinue }) => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 to-black text-white">
    <h1 className="text-5xl font-extrabold mb-4">ClientScopeAI</h1>
    <h2 className="text-2xl mb-2 text-blue-400">Your Local AI-Powered Lead Sniper</h2>
    <p className="max-w-xl text-center mb-8 text-lg text-gray-300">
      Find, analyze, and organize high-quality Instagram leads with stealth and AI. 100% local, no logins, no APIs. <br />
      <span className="text-green-400 font-semibold">Built for freelancers, marketers, and hustlers.</span>
    </p>
    <button onClick={onContinue} className="bg-blue-600 hover:bg-blue-700 px-8 py-3 rounded-lg text-lg font-bold transition">Get Started</button>
    <div className="mt-12 text-xs text-gray-500">&copy; {new Date().getFullYear()} ClientScopeAI. Built by a teen entrepreneur.</div>
  </div>
);

export default WelcomeScreen; 