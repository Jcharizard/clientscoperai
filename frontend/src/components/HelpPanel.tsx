import React from "react";

const HelpPanel: React.FC = () => (
  <div className="p-8 bg-gray-900 min-h-screen text-white">
    <div className="flex flex-col items-center mb-4">
              <img src="/logo/logo.png" alt="Logo" className="w-8 h-8 aspect-square object-cover rounded-lg shadow mb-2" style={{maxWidth: '32px', maxHeight: '32px'}} />
    </div>
    <h1 className="text-4xl font-bold mb-6">🆘 Help & Documentation</h1>
    <div className="max-w-2xl mx-auto space-y-8">
      <section>
        <h2 className="text-2xl font-bold mb-2 text-blue-400">Quick Start</h2>
        <ol className="list-decimal ml-6 text-gray-200 space-y-1">
          <li>Go to <b>Apify Status</b> to check your scraping credits and configuration.</li>
          <li>Go to <b>Scraper</b>, enter a keyword (e.g. "LA barber"), set pages/delay, and start scraping.</li>
          <li>Save your session and organize it under a campaign.</li>
          <li>Explore, filter, and export leads in <b>Lead Explorer</b>.</li>
          <li>Track stats and performance in the <b>Dashboard</b>.</li>
        </ol>
      </section>
      <section>
        <h2 className="text-2xl font-bold mb-2 text-green-400">Troubleshooting</h2>
        <ul className="list-disc ml-6 text-gray-200 space-y-1">
          <li><b>Scraping fails?</b> Check your Apify credits and configuration in the Apify Status page.</li>
          <li><b>Leads missing info?</b> Some profiles are private or have limited data. Try more keywords.</li>
          <li><b>AI scoring not working?</b> Make sure Python is installed and bio_score.py is present.</li>
          <li><b>Rate limited?</b> Adjust your concurrent runs and request timeout in Apify configuration.</li>
        </ul>
      </section>
      <section>
        <h2 className="text-2xl font-bold mb-2 text-pink-400">Feature Overview</h2>
        <ul className="list-disc ml-6 text-gray-200 space-y-1">
          <li><b>Scraper:</b> Professional Instagram scraping powered by Apify, with automatic proxy rotation and rate limiting.</li>
          <li><b>AI Scoring:</b> Local AI analyzes bios for pitchability, urgency, language, region, and business type. Vision AI scores branding and visuals.</li>
          <li><b>Lead Explorer:</b> Advanced filtering, search, and export for all leads. Bulk actions and deduplication.</li>
          <li><b>Dashboard:</b> Visual stats and charts for campaigns, sessions, and lead quality.</li>
          <li><b>Apify Status:</b> Monitor your scraping credits, performance, and configuration. View run history and adjust settings.</li>
          <li><b>Campaigns/Sessions:</b> Organize and revisit scraping runs by campaign. Session/campaign templates.</li>
          <li><b>Pitch Generator:</b> AI suggests personalized outreach messages for each lead.</li>
          <li><b>Auto-tagging & CRM:</b> Tag, note, and manage leads with advanced CRM features.</li>
          <li><b>Crash Recovery:</b> Auto-save and recover from crashes. Settings backup/restore.</li>
          <li><b>Multi-platform Ready:</b> Future support for TikTok, Twitter, LinkedIn, and more.</li>
        </ul>
      </section>
      <section>
        <h2 className="text-2xl font-bold mb-2 text-yellow-400">FAQ</h2>
        <ul className="list-disc ml-6 text-gray-200 space-y-1">
          <li><b>Is this app 100% local?</b> The app uses Apify's cloud service for reliable scraping, but all data processing and AI analysis happens locally.</li>
          <li><b>Can I scrape other platforms?</b> Not yet, but plugin support is coming soon.</li>
          <li><b>How do I avoid rate limits?</b> The app automatically handles rate limiting through Apify's professional service.</li>
          <li><b>Can I use my own AI models?</b> Yes, you can swap out the Python scripts for your own models.</li>
        </ul>
      </section>
      <section>
        <h2 className="text-2xl font-bold mb-2 text-gray-300">Credits</h2>
        <p className="text-gray-400">ClientScopeAI was built by a teen entrepreneur using React, Node.js, Python, and Apify's professional scraping service. <br /> Special thanks to open source and the indie dev community.</p>
      </section>
      <section>
        <h2 className="text-2xl font-bold mb-2 text-blue-300">Apify Integration</h2>
        <ul className="list-disc ml-6 text-gray-200 space-y-1">
          <li>Your app uses Apify's professional Instagram scraping service for reliable data extraction.</li>
          <li>Monitor your Apify credits and usage in the Apify Status page.</li>
          <li>Adjust scraping settings like concurrent runs and request timeouts in the configuration panel.</li>
          <li>View detailed run history and performance metrics to optimize your scraping strategy.</li>
        </ul>
      </section>
    </div>
  </div>
);

export default HelpPanel; 