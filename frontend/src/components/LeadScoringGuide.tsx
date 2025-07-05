import React from "react";

interface LeadScoringGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

const LeadScoringGuide: React.FC<LeadScoringGuideProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">🎯 Lead Scoring System Guide</h2>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-white text-2xl"
            >
              ×
            </button>
          </div>

          <div className="space-y-6 text-white">
            {/* Lead Quality Tiers */}
            <section>
              <h3 className="text-xl font-bold mb-4 text-blue-400">🏆 Lead Quality Tiers</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-red-900 p-4 rounded-lg border border-red-600">
                  <div className="flex items-center mb-2">
                    <span className="text-2xl mr-2">🔥</span>
                    <h4 className="text-lg font-bold text-red-400">HOT LEADS (80-100)</h4>
                  </div>
                  <p className="text-sm text-gray-300 mb-2">Ready to contact immediately!</p>
                  <ul className="text-xs text-gray-400 space-y-1">
                    <li>• Excellent bio score (8+/10)</li>
                    <li>• Direct contact info available</li>
                    <li>• Recently active</li>
                    <li>• High engagement rate</li>
                    <li>• Professional visuals</li>
                  </ul>
                </div>

                <div className="bg-orange-900 p-4 rounded-lg border border-orange-600">
                  <div className="flex items-center mb-2">
                    <span className="text-2xl mr-2">🌟</span>
                    <h4 className="text-lg font-bold text-orange-400">WARM LEADS (60-79)</h4>
                  </div>
                  <p className="text-sm text-gray-300 mb-2">Contact within 24 hours</p>
                  <ul className="text-xs text-gray-400 space-y-1">
                    <li>• Good bio score (6+/10)</li>
                    <li>• Some contact methods</li>
                    <li>• Active on platform</li>
                    <li>• Decent engagement</li>
                  </ul>
                </div>

                <div className="bg-blue-900 p-4 rounded-lg border border-blue-600">
                  <div className="flex items-center mb-2">
                    <span className="text-2xl mr-2">💼</span>
                    <h4 className="text-lg font-bold text-blue-400">QUALIFIED LEADS (40-59)</h4>
                  </div>
                  <p className="text-sm text-gray-300 mb-2">Add to outreach campaign</p>
                  <ul className="text-xs text-gray-400 space-y-1">
                    <li>• Average bio score (4+/10)</li>
                    <li>• Limited contact info</li>
                    <li>• Some business indicators</li>
                    <li>• Worth nurturing</li>
                  </ul>
                </div>

                <div className="bg-gray-700 p-4 rounded-lg border border-gray-600">
                  <div className="flex items-center mb-2">
                    <span className="text-2xl mr-2">❄️</span>
                    <h4 className="text-lg font-bold text-gray-400">COLD LEADS (0-39)</h4>
                  </div>
                  <p className="text-sm text-gray-300 mb-2">Add to nurture sequence</p>
                  <ul className="text-xs text-gray-400 space-y-1">
                    <li>• Low bio score (&lt;4/10)</li>
                    <li>• No direct contact info</li>
                    <li>• Inactive or low engagement</li>
                    <li>• Requires long-term nurturing</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Scoring Factors */}
            <section>
              <h3 className="text-xl font-bold mb-4 text-green-400">📊 Scoring Factors</h3>
              <div className="bg-gray-900 p-4 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-bold text-blue-300 mb-2">Bio Analysis (30% weight)</h4>
                    <ul className="text-sm text-gray-300 space-y-1">
                      <li>• Business keywords detection</li>
                      <li>• Contact readiness signals</li>
                      <li>• Urgency indicators</li>
                      <li>• Professional language</li>
                      <li>• Revenue potential</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-bold text-green-300 mb-2">Contact Availability (25% weight)</h4>
                    <ul className="text-sm text-gray-300 space-y-1">
                      <li>• Email addresses</li>
                      <li>• Phone numbers</li>
                      <li>• Website links</li>
                      <li>• Booking platforms</li>
                      <li>• Messaging apps</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-bold text-purple-300 mb-2">Activity Level (20% weight)</h4>
                    <ul className="text-sm text-gray-300 space-y-1">
                      <li>• Recent posts</li>
                      <li>• Active stories</li>
                      <li>• Account verification</li>
                      <li>• Response likelihood</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-bold text-yellow-300 mb-2">Engagement Quality (15% weight)</h4>
                    <ul className="text-sm text-gray-300 space-y-1">
                      <li>• Likes per post</li>
                      <li>• Comments ratio</li>
                      <li>• Audience interaction</li>
                      <li>• Content quality</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* What COLD Means */}
            <section>
              <h3 className="text-xl font-bold mb-4 text-red-400">❄️ What Does "COLD (number)" Mean?</h3>
              <div className="bg-gray-900 p-4 rounded-lg">
                <p className="text-gray-300 mb-4">
                  When you see <span className="bg-gray-600 px-2 py-1 rounded font-mono">❄️ COLD (23)</span> on a lead, here's what it means:
                </p>
                
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <span className="text-2xl">❄️</span>
                    <div>
                      <h4 className="font-bold text-gray-200">COLD = Lead Temperature</h4>
                      <p className="text-sm text-gray-400">This lead requires nurturing and is not ready for immediate outreach</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <span className="text-2xl">🔢</span>
                    <div>
                      <h4 className="font-bold text-gray-200">(23) = Quality Score</h4>
                      <p className="text-sm text-gray-400">Out of 100 points, this lead scored 23 based on our AI analysis</p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-yellow-900 rounded border border-yellow-600">
                  <h5 className="font-bold text-yellow-300 mb-2">💡 Pro Tip for COLD Leads:</h5>
                  <ul className="text-sm text-yellow-200 space-y-1">
                    <li>• Add them to a long-term nurture sequence</li>
                    <li>• Focus on providing value first</li>
                    <li>• Look for engagement opportunities</li>
                    <li>• Don't pitch immediately - build relationship</li>
                    <li>• Monitor for activity increases</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* AI Scoring Details */}
            <section>
              <h3 className="text-xl font-bold mb-4 text-cyan-400">🤖 AI Scoring Breakdown</h3>
              <div className="bg-gray-900 p-4 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-bold text-blue-300 mb-2">🧠 Bio Score (0-10)</h4>
                    <p className="text-sm text-gray-300 mb-2">AI analyzes bio text for:</p>
                    <ul className="text-xs text-gray-400 space-y-1">
                      <li>• Business type identification</li>
                      <li>• Service offerings</li>
                      <li>• Contact readiness</li>
                      <li>• Urgency signals</li>
                      <li>• Professional credibility</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-bold text-purple-300 mb-2">👁️ Vision Score (0-10)</h4>
                    <p className="text-sm text-gray-300 mb-2">AI analyzes profile image for:</p>
                    <ul className="text-xs text-gray-400 space-y-1">
                      <li>• Professional appearance</li>
                      <li>• Brand quality</li>
                      <li>• Visual marketability</li>
                      <li>• Business indicators</li>
                      <li>• Trust signals</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* Action Recommendations */}
            <section>
              <h3 className="text-xl font-bold mb-4 text-pink-400">🎯 Recommended Actions by Score</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-4 p-3 bg-red-900 rounded">
                  <span className="text-2xl">🔥</span>
                  <div>
                    <span className="font-bold text-red-300">80-100 Points:</span>
                    <span className="text-gray-300 ml-2">Contact immediately! High conversion probability</span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4 p-3 bg-orange-900 rounded">
                  <span className="text-2xl">🌟</span>
                  <div>
                    <span className="font-bold text-orange-300">60-79 Points:</span>
                    <span className="text-gray-300 ml-2">Contact within 24 hours, good potential</span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4 p-3 bg-blue-900 rounded">
                  <span className="text-2xl">💼</span>
                  <div>
                    <span className="font-bold text-blue-300">40-59 Points:</span>
                    <span className="text-gray-300 ml-2">Add to outreach campaign, moderate potential</span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4 p-3 bg-gray-700 rounded">
                  <span className="text-2xl">❄️</span>
                  <div>
                    <span className="font-bold text-gray-300">0-39 Points:</span>
                    <span className="text-gray-300 ml-2">Long-term nurture sequence, build relationship first</span>
                  </div>
                </div>
              </div>
            </section>
          </div>

          <div className="mt-6 flex justify-end">
            <button 
              onClick={onClose}
              className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded text-white font-semibold"
            >
              Got it!
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeadScoringGuide; 