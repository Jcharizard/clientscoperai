import React, { useState, useEffect } from 'react';
import { 
  EnvelopeIcon, 
  ChartBarIcon, 
  ShoppingBagIcon, 
  MagnifyingGlassIcon,
  UserGroupIcon,
  CogIcon,
  SparklesIcon,
  GlobeAltIcon,
  BeakerIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

const AdvancedFeaturesPanel = ({ selectedLeadForEvaluation }) => {
  const [activeTab, setActiveTab] = useState(selectedLeadForEvaluation ? 'evaluation' : 'followup');
  const [sequences, setSequences] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [marketplaceListings, setMarketplaceListings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [evaluationResults, setEvaluationResults] = useState(null);

  const tabs = [
    ...(selectedLeadForEvaluation ? [{ key: 'evaluation', label: '🔥 Lead Evaluation', icon: SparklesIcon }] : []),
    { key: 'followup', label: 'Follow-up Sequences', icon: EnvelopeIcon },
    { key: 'brand', label: 'Brand Analysis', icon: SparklesIcon },
    { key: 'market', label: 'Market Intelligence', icon: ChartBarIcon },
    { key: 'marketplace', label: 'Lead Marketplace', icon: ShoppingBagIcon },
    { key: 'email', label: 'Email Finder', icon: MagnifyingGlassIcon },
    { key: 'social', label: 'Social Analysis', icon: GlobeAltIcon },
    { key: 'enrichment', label: 'Lead Enrichment', icon: UserGroupIcon },
    { key: 'outreach', label: 'AI Message Generator', icon: DocumentTextIcon },
    { key: 'abtest', label: 'A/B Testing', icon: BeakerIcon },
    { key: 'qualification', label: 'Success Rate Predictor', icon: CogIcon }
  ];

  useEffect(() => {
    loadSequences();
    loadTemplates();
    loadMarketplace();
    
    // If we have a selected lead, automatically run evaluation
    if (selectedLeadForEvaluation && !evaluationResults) {
      runFullEvaluation();
    }
  }, [selectedLeadForEvaluation]);

  const loadSequences = async () => {
    try {
      const response = await fetch('http://localhost:5001/followup/sequences');
      const data = await response.json();
      setSequences(data.sequences || []);
    } catch (error) {
      console.error('Failed to load sequences:', error);
    }
  };

  const loadTemplates = async () => {
    try {
      const response = await fetch('http://localhost:5001/outreach/templates');
      const data = await response.json();
      setTemplates(data.templates || []);
    } catch (error) {
      console.error('Failed to load templates:', error);
    }
  };

  const loadMarketplace = async () => {
    try {
      const response = await fetch('http://localhost:5001/marketplace/browse');
      const data = await response.json();
      setMarketplaceListings(data.listings || []);
    } catch (error) {
      console.error('Failed to load marketplace:', error);
    }
  };

  const runFullEvaluation = async () => {
    if (!selectedLeadForEvaluation) return;
    
    setLoading(true);
    setEvaluationResults(null);
    
    try {
      const lead = selectedLeadForEvaluation;
      const results = {};
      
      // 1. AI Message Generation
      try {
        const messageResponse = await fetch('http://localhost:5001/ai/generate-message', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            lead: lead,
            messageType: 'initial',
            tone: 'professional'
          })
        });
        results.aiMessage = await messageResponse.json();
      } catch (e) {
        results.aiMessage = { error: 'Failed to generate message' };
      }
      
      // 2. Success Rate Prediction
      try {
        const successResponse = await fetch('http://localhost:5001/ai/predict-success', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            leads: [lead],
            messageType: 'initial'
          })
        });
        results.successPrediction = await successResponse.json();
      } catch (e) {
        results.successPrediction = { error: 'Failed to predict success' };
      }
      
      // 3. Brand Analysis
      try {
        const brandResponse = await fetch('http://localhost:5001/brand/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            profileImageUrl: lead.screenshot,
            username: lead.username
          })
        });
        results.brandAnalysis = await brandResponse.json();
      } catch (e) {
        results.brandAnalysis = { error: 'Failed to analyze brand' };
      }
      
      // 4. Email Finding
      try {
        const emailResponse = await fetch('http://localhost:5001/email/find', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: lead.username,
            fullName: lead.displayName,
            company: lead.quickStats?.businessType
          })
        });
        results.emailFinding = await emailResponse.json();
      } catch (e) {
        results.emailFinding = { error: 'Failed to find emails' };
      }
      
      // 5. Social Analysis
      try {
        const socialResponse = await fetch('http://localhost:5001/social/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: lead.username,
            platforms: ['instagram', 'twitter', 'linkedin', 'tiktok']
          })
        });
        results.socialAnalysis = await socialResponse.json();
      } catch (e) {
        results.socialAnalysis = { error: 'Failed to analyze social presence' };
      }
      
      // 6. Lead Enrichment
      try {
        const enrichmentResponse = await fetch('http://localhost:5001/leads/enrich', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            leadIds: [lead.id]
          })
        });
        results.enrichment = await enrichmentResponse.json();
      } catch (e) {
        results.enrichment = { error: 'Failed to enrich lead data' };
      }
      
      setEvaluationResults(results);
    } catch (error) {
      console.error('Full evaluation failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const FollowupSequencesTab = () => {
    const [newSequence, setNewSequence] = useState({
      name: '',
      steps: [{ delay: 1, message: '', subject: '' }],
      triggers: { bioScore: 7, visionScore: 6 }
    });

    const addStep = () => {
      setNewSequence(prev => ({
        ...prev,
        steps: [...prev.steps, { delay: prev.steps.length + 1, message: '', subject: '' }]
      }));
    };

    const createSequence = async () => {
      if (!newSequence.name || newSequence.steps.some(s => !s.message)) {
        alert('Please fill in all required fields');
        return;
      }

      setLoading(true);
      try {
        const response = await fetch('http://localhost:5001/followup/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newSequence)
        });
        
        if (response.ok) {
          await loadSequences();
          setNewSequence({
            name: '',
            steps: [{ delay: 1, message: '', subject: '' }],
            triggers: { bioScore: 7, visionScore: 6 }
          });
          alert('Follow-up sequence created successfully!');
        }
      } catch (error) {
        console.error('Failed to create sequence:', error);
        alert('Failed to create sequence');
      } finally {
        setLoading(false);
      }
    };

    return (
      <div className="space-y-6">
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-xl font-bold text-white mb-4">Create New Follow-up Sequence</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Sequence Name</label>
              <input
                type="text"
                value={newSequence.name}
                onChange={(e) => setNewSequence(prev => ({ ...prev, name: e.target.value }))}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                placeholder="e.g., High-Value Lead Sequence"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Trigger Conditions</label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Min Bio Score</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={newSequence.triggers.bioScore}
                    onChange={(e) => setNewSequence(prev => ({
                      ...prev,
                      triggers: { ...prev.triggers, bioScore: parseInt(e.target.value) }
                    }))}
                    className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Min Vision Score</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={newSequence.triggers.visionScore}
                    onChange={(e) => setNewSequence(prev => ({
                      ...prev,
                      triggers: { ...prev.triggers, visionScore: parseInt(e.target.value) }
                    }))}
                    className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm"
                  />
                </div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-300">Sequence Steps</label>
                <button
                  onClick={addStep}
                  className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-sm text-white"
                >
                  Add Step
                </button>
              </div>
              
              {newSequence.steps.map((step, index) => (
                <div key={index} className="bg-gray-700 rounded-lg p-4 mb-3">
                  <div className="grid grid-cols-12 gap-4">
                    <div className="col-span-2">
                      <label className="block text-xs text-gray-400 mb-1">Day {step.delay}</label>
                      <input
                        type="number"
                        min="1"
                        value={step.delay}
                        onChange={(e) => {
                          const newSteps = [...newSequence.steps];
                          newSteps[index].delay = parseInt(e.target.value);
                          setNewSequence(prev => ({ ...prev, steps: newSteps }));
                        }}
                        className="w-full bg-gray-600 border border-gray-500 rounded px-2 py-1 text-white text-sm"
                      />
                    </div>
                    <div className="col-span-4">
                      <label className="block text-xs text-gray-400 mb-1">Subject</label>
                      <input
                        type="text"
                        value={step.subject}
                        onChange={(e) => {
                          const newSteps = [...newSequence.steps];
                          newSteps[index].subject = e.target.value;
                          setNewSequence(prev => ({ ...prev, steps: newSteps }));
                        }}
                        className="w-full bg-gray-600 border border-gray-500 rounded px-2 py-1 text-white text-sm"
                        placeholder="Email subject"
                      />
                    </div>
                    <div className="col-span-6">
                      <label className="block text-xs text-gray-400 mb-1">Message</label>
                      <textarea
                        value={step.message}
                        onChange={(e) => {
                          const newSteps = [...newSequence.steps];
                          newSteps[index].message = e.target.value;
                          setNewSequence(prev => ({ ...prev, steps: newSteps }));
                        }}
                        className="w-full bg-gray-600 border border-gray-500 rounded px-2 py-1 text-white text-sm"
                        rows="2"
                        placeholder="Follow-up message..."
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={createSequence}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 px-6 py-2 rounded text-white font-medium"
            >
              {loading ? 'Creating...' : 'Create Sequence'}
            </button>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-xl font-bold text-white mb-4">Existing Sequences</h3>
          {sequences.length === 0 ? (
            <p className="text-gray-400">No sequences created yet.</p>
          ) : (
            <div className="space-y-3">
              {sequences.map((sequence) => (
                <div key={sequence.id} className="bg-gray-700 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold text-white">{sequence.name}</h4>
                      <p className="text-sm text-gray-400">{sequence.steps.length} steps</p>
                      <p className="text-xs text-gray-500">
                        Triggers: Bio Score ≥{sequence.triggers.bioScore}, Vision Score ≥{sequence.triggers.visionScore}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-400">
                        Sent: {sequence.stats.sent} | Opened: {sequence.stats.opened} | Replied: {sequence.stats.replied}
                      </div>
                      <button className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-sm text-white mt-2">
                        Execute
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  const BrandAnalysisTab = () => {
    const [analysisInput, setAnalysisInput] = useState({ profileImageUrl: '', username: '' });
    const [analysisResult, setAnalysisResult] = useState(null);

    const analyzeBrand = async () => {
      if (!analysisInput.profileImageUrl) {
        alert('Please enter a profile image URL');
        return;
      }

      setLoading(true);
      try {
        const response = await fetch('http://localhost:5001/brand/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(analysisInput)
        });
        
        const data = await response.json();
        if (response.ok) {
          setAnalysisResult(data.brandAnalysis);
        }
      } catch (error) {
        console.error('Brand analysis failed:', error);
        alert('Brand analysis failed');
      } finally {
        setLoading(false);
      }
    };

    return (
      <div className="space-y-6">
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-xl font-bold text-white mb-4">Visual Brand Analysis</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Profile Image URL</label>
              <input
                type="url"
                value={analysisInput.profileImageUrl}
                onChange={(e) => setAnalysisInput(prev => ({ ...prev, profileImageUrl: e.target.value }))}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                placeholder="https://example.com/profile-image.jpg"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Username (Optional)</label>
              <input
                type="text"
                value={analysisInput.username}
                onChange={(e) => setAnalysisInput(prev => ({ ...prev, username: e.target.value }))}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                placeholder="@username"
              />
            </div>

            <button
              onClick={analyzeBrand}
              disabled={loading}
              className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 px-6 py-2 rounded text-white font-medium"
            >
              {loading ? 'Analyzing...' : 'Analyze Brand'}
            </button>
          </div>
        </div>

        {analysisResult && (
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-bold text-white mb-4">Brand Analysis Results</h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-gray-700 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-blue-400">{analysisResult.logoScore}/10</div>
                <div className="text-sm text-gray-300">Logo Score</div>
              </div>
              <div className="bg-gray-700 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-green-400">{analysisResult.aestheticScore}/10</div>
                <div className="text-sm text-gray-300">Aesthetic Score</div>
              </div>
              <div className="bg-gray-700 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-yellow-400">{analysisResult.brandConsistency}/10</div>
                <div className="text-sm text-gray-300">Consistency</div>
              </div>
              <div className="bg-gray-700 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-purple-400">{analysisResult.overallBrandScore}/10</div>
                <div className="text-sm text-gray-300">Overall Score</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-white mb-2">Brand Details</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Color Scheme:</span>
                    <span className="text-white capitalize">{analysisResult.colorScheme}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Brand Type:</span>
                    <span className="text-white capitalize">{analysisResult.brandType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Professional Look:</span>
                    <span className="text-white">{analysisResult.professionalLook}/10</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold text-white mb-2">Recommendations</h4>
                <ul className="space-y-1 text-sm text-gray-300">
                  {analysisResult.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-blue-400 mr-2">•</span>
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const MarketIntelligenceTab = () => {
    const [marketInput, setMarketInput] = useState({ industry: '', keywords: '' });
    const [marketResult, setMarketResult] = useState(null);

    const analyzeMarket = async () => {
      if (!marketInput.industry) {
        alert('Please enter an industry');
        return;
      }

      setLoading(true);
      try {
        const response = await fetch('http://localhost:5001/market/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(marketInput)
        });
        
        const data = await response.json();
        if (response.ok) {
          setMarketResult(data.marketIntelligence);
        }
      } catch (error) {
        console.error('Market analysis failed:', error);
        alert('Market analysis failed');
      } finally {
        setLoading(false);
      }
    };

    return (
      <div className="space-y-6">
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-xl font-bold text-white mb-4">Market Intelligence Analysis</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Industry</label>
              <input
                type="text"
                value={marketInput.industry}
                onChange={(e) => setMarketInput(prev => ({ ...prev, industry: e.target.value }))}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                placeholder="e.g., Technology, Healthcare, Finance"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Keywords (Optional)</label>
              <input
                type="text"
                value={marketInput.keywords}
                onChange={(e) => setMarketInput(prev => ({ ...prev, keywords: e.target.value }))}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                placeholder="AI, machine learning, SaaS"
              />
            </div>

            <button
              onClick={analyzeMarket}
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-600 px-6 py-2 rounded text-white font-medium"
            >
              {loading ? 'Analyzing...' : 'Analyze Market'}
            </button>
          </div>
        </div>

        {marketResult && (
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-bold text-white mb-4">Market Intelligence Results</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-700 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-green-400">{marketResult.trendScore}/10</div>
                <div className="text-sm text-gray-300">Trend Score</div>
              </div>
              <div className="bg-gray-700 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-yellow-400 capitalize">{marketResult.competitionLevel}</div>
                <div className="text-sm text-gray-300">Competition</div>
              </div>
              <div className="bg-gray-700 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-blue-400">{marketResult.avgEngagementRate}</div>
                <div className="text-sm text-gray-300">Avg Engagement</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-white mb-3">Top Hashtags</h4>
                <div className="flex flex-wrap gap-2">
                  {marketResult.topHashtags.map((tag, index) => (
                    <span key={index} className="bg-blue-600 text-white px-2 py-1 rounded text-sm">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold text-white mb-3">Best Posting Times</h4>
                <div className="space-y-1">
                  {marketResult.bestPostingTimes.map((time, index) => (
                    <div key={index} className="text-sm text-gray-300">
                      📅 {time}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6">
              <h4 className="font-semibold text-white mb-3">Audience Insights</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <h5 className="text-sm font-medium text-gray-300 mb-2">Age Groups</h5>
                  {Object.entries(marketResult.audienceInsights.ageGroups).map(([age, percent]) => (
                    <div key={age} className="flex justify-between text-sm">
                      <span className="text-gray-400">{age}:</span>
                      <span className="text-white">{percent}%</span>
                    </div>
                  ))}
                </div>
                
                <div>
                  <h5 className="text-sm font-medium text-gray-300 mb-2">Gender Split</h5>
                  {Object.entries(marketResult.audienceInsights.genderSplit).map(([gender, percent]) => (
                    <div key={gender} className="flex justify-between text-sm">
                      <span className="text-gray-400 capitalize">{gender}:</span>
                      <span className="text-white">{percent}%</span>
                    </div>
                  ))}
                </div>
                
                <div>
                  <h5 className="text-sm font-medium text-gray-300 mb-2">Top Locations</h5>
                  {marketResult.audienceInsights.topLocations.slice(0, 4).map((location, index) => (
                    <div key={index} className="text-sm text-gray-300">
                      🌍 {location}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6">
              <h4 className="font-semibold text-white mb-3">Recommendations</h4>
              <ul className="space-y-2">
                {marketResult.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start text-sm text-gray-300">
                    <span className="text-green-400 mr-2">✓</span>
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    );
  };

  const AIMessageGeneratorTab = () => {
    const [messageInput, setMessageInput] = useState({
      lead: null,
      messageType: 'initial',
      userBusiness: '',
      tone: 'professional'
    });
    const [generatedMessage, setGeneratedMessage] = useState(null);
    const [sampleLead] = useState({
      username: '@john_barber_nyc',
      bio: 'Professional barber in NYC. 10+ years experience. Looking to grow my client base. DM for appointments.',
      followers: 2500,
      bioScore: { pitch_score: 8, urgent: 'yes', business_type: 'Barber', region: 'New York' }
    });

    const generateMessage = async () => {
      setLoading(true);
      try {
        const response = await fetch('http://localhost:5001/ai/generate-message', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            lead: messageInput.lead || sampleLead,
            messageType: messageInput.messageType,
            userBusiness: messageInput.userBusiness,
            tone: messageInput.tone
          })
        });
        
        const data = await response.json();
        if (response.ok) {
          setGeneratedMessage(data);
        }
      } catch (error) {
        console.error('Message generation failed:', error);
        alert('Message generation failed');
      } finally {
        setLoading(false);
      }
    };

    return (
      <div className="space-y-6">
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-xl font-bold text-white mb-4">🔥 AI Message Generator</h3>
          <p className="text-gray-400 mb-6">Generate personalized, high-converting DMs based on lead data</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Your Business/Service</label>
                <input
                  type="text"
                  value={messageInput.userBusiness}
                  onChange={(e) => setMessageInput(prev => ({ ...prev, userBusiness: e.target.value }))}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                  placeholder="e.g., help barbers get more clients, social media marketing"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Message Type</label>
                <select 
                  value={messageInput.messageType}
                  onChange={(e) => setMessageInput(prev => ({ ...prev, messageType: e.target.value }))}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                >
                  <option value="initial">Initial Outreach</option>
                  <option value="followup">Follow-up</option>
                  <option value="value_add">Value-Add Message</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Tone</label>
                <select 
                  value={messageInput.tone}
                  onChange={(e) => setMessageInput(prev => ({ ...prev, tone: e.target.value }))}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                >
                  <option value="professional">Professional</option>
                  <option value="casual">Casual</option>
                  <option value="formal">Formal</option>
                </select>
              </div>
              
              <button
                onClick={generateMessage}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 px-6 py-3 rounded-lg text-white font-medium"
              >
                {loading ? 'Generating...' : '✨ Generate Message'}
              </button>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold text-white mb-3">Sample Lead Preview</h4>
              <div className="bg-gray-700 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                    JB
                  </div>
                  <div>
                    <div className="font-semibold text-white">{sampleLead.username}</div>
                    <div className="text-sm text-gray-400">{sampleLead.followers.toLocaleString()} followers</div>
                  </div>
                </div>
                <p className="text-gray-300 text-sm mb-3">{sampleLead.bio}</p>
                <div className="flex gap-2">
                  <span className="bg-red-600 text-white px-2 py-1 rounded text-xs">🔥 URGENT</span>
                  <span className="bg-orange-600 text-white px-2 py-1 rounded text-xs">⭐ SCORE: {sampleLead.bioScore.pitch_score}</span>
                  <span className="bg-blue-600 text-white px-2 py-1 rounded text-xs">💼 {sampleLead.bioScore.business_type}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {generatedMessage && (
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-bold text-white mb-4">Generated Message</h3>
            
            <div className="bg-gray-700 rounded-lg p-4 mb-4">
              <div className="flex justify-between items-start mb-3">
                <h4 className="font-semibold text-white">Your Personalized Message</h4>
                <div className="flex items-center gap-2">
                  <span className="text-green-400 font-bold">{generatedMessage.successProbability}%</span>
                  <span className="text-sm text-gray-400">Success Rate</span>
                </div>
              </div>
              <div className="bg-gray-600 rounded p-3 mb-3">
                <p className="text-white whitespace-pre-wrap">{generatedMessage.message}</p>
              </div>
              <button 
                onClick={() => navigator.clipboard.writeText(generatedMessage.message)}
                className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-white text-sm"
              >
                📋 Copy Message
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-white mb-2">Personalization Insights</h4>
                <ul className="space-y-1 text-sm text-gray-300">
                  {generatedMessage.insights.personalizedElements.map((element, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-green-400 mr-2">✓</span>
                      {element}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold text-white mb-2">Alternative Messages</h4>
                {generatedMessage.alternatives.map((alt, index) => (
                  <div key={index} className="bg-gray-700 rounded p-2 mb-2 text-sm text-gray-300">
                    {alt.substring(0, 100)}...
                    <button 
                      onClick={() => navigator.clipboard.writeText(alt)}
                      className="ml-2 text-blue-400 hover:text-blue-300"
                    >
                      Copy
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const SuccessRatePredictorTab = () => {
    const [predictions, setPredictions] = useState(null);
    const [sampleLeads] = useState([
      { username: '@sarah_photographer', bio: 'Wedding photographer seeking new clients', followers: 3200, bioScore: { pitch_score: 9, urgent: 'yes', business_type: 'Photographer' }, email: 'sarah@photos.com' },
      { username: '@mike_fitness', bio: 'Personal trainer', followers: 1800, bioScore: { pitch_score: 6, urgent: 'no', business_type: 'Fitness' } },
      { username: '@lisa_salon', bio: 'Hair salon owner', followers: 850, bioScore: { pitch_score: 4, urgent: 'no', business_type: 'Salon' } }
    ]);

    const predictSuccess = async () => {
      setLoading(true);
      try {
        const response = await fetch('http://localhost:5001/ai/predict-success', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ leads: sampleLeads })
        });
        
        const data = await response.json();
        if (response.ok) {
          setPredictions(data);
        }
      } catch (error) {
        console.error('Success prediction failed:', error);
        alert('Success prediction failed');
      } finally {
        setLoading(false);
      }
    };

    return (
      <div className="space-y-6">
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-xl font-bold text-white mb-4">🎯 Success Rate Predictor</h3>
          <p className="text-gray-400 mb-6">AI predicts response probability for each lead</p>
          
          <button
            onClick={predictSuccess}
            disabled={loading}
            className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 px-6 py-3 rounded-lg text-white font-medium"
          >
            {loading ? 'Analyzing...' : '🔮 Predict Success Rates'}
          </button>
        </div>

        {predictions && (
          <>
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-xl font-bold text-white mb-4">Campaign Overview</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-700 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-blue-400">{predictions.campaignMetrics.avgSuccessRate}%</div>
                  <div className="text-sm text-gray-300">Avg Success Rate</div>
                </div>
                <div className="bg-gray-700 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-green-400">{predictions.campaignMetrics.expectedResponses}</div>
                  <div className="text-sm text-gray-300">Expected Responses</div>
                </div>
                <div className="bg-gray-700 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-yellow-400">{predictions.campaignMetrics.premiumLeads}</div>
                  <div className="text-sm text-gray-300">Premium Leads</div>
                </div>
                <div className="bg-gray-700 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-purple-400">{predictions.campaignMetrics.campaignQuality}</div>
                  <div className="text-sm text-gray-300">Campaign Quality</div>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-xl font-bold text-white mb-4">Individual Lead Predictions</h3>
              <div className="space-y-4">
                {predictions.predictions.map((prediction, index) => (
                  <div key={index} className="bg-gray-700 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-semibold text-white">{prediction.leadId}</h4>
                        <p className="text-sm text-gray-400">{prediction.recommendation}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-400">{prediction.successRate}%</div>
                        <div className="text-sm text-gray-400">{prediction.qualityTier}</div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                      <div className="text-center">
                        <div className="text-lg font-bold text-blue-400">{prediction.factors.bioRelevance}</div>
                        <div className="text-xs text-gray-400">Bio Score</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-red-400">{prediction.factors.urgency ? '✓' : '✗'}</div>
                        <div className="text-xs text-gray-400">Urgent</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-purple-400">{prediction.factors.followerCount.toLocaleString()}</div>
                        <div className="text-xs text-gray-400">Followers</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-green-400">{prediction.factors.hasContactInfo ? '✓' : '✗'}</div>
                        <div className="text-xs text-gray-400">Contact Info</div>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {prediction.reasoning.map((reason, idx) => (
                        <span key={idx} className="bg-gray-600 text-gray-300 px-2 py-1 rounded text-xs">
                          {reason}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    );
  };

  const LeadEvaluationTab = () => {
    if (!selectedLeadForEvaluation) {
      return (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🤔</div>
          <h3 className="text-xl font-bold text-white mb-2">No Lead Selected</h3>
          <p className="text-gray-400">Go to Lead Cards and heart a lead to evaluate it here!</p>
        </div>
      );
    }

    const lead = selectedLeadForEvaluation;

    return (
      <div className="space-y-6">
        {/* Lead Overview */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg p-6">
          <div className="flex items-center gap-4">
            <img
              src={`http://localhost:5001${lead.screenshot}`}
              alt={lead.displayName}
              className="w-20 h-20 rounded-full object-cover border-4 border-white"
              onError={(e) => {
                e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik00MCAyMEMzMi4yIDIwIDI2IDI2LjIgMjYgMzRTMzIuMiA0OCA0MCA0OFM1NCA0MS44IDU0IDM0UzQ3LjggMjAgNDAgMjBaTTQwIDQ0QzM0LjUgNDQgMzAgMzkuNSAzMCAzNFMzNC41IDI0IDQwIDI0UzUwIDI4LjUgNTAgMzRTNDUuNSA0NCA0MCA0NFoiIGZpbGw9IiM5QjlCQTMiLz4KPHBhdGggZD0iTTQwIDUyQzI4LjkgNTIgMTggNTYuOSAxOCA2NEg2MkM2MiA1Ni45IDUxLjEgNTIgNDAgNTJaIiBmaWxsPSIjOUI5QkEzIi8+Cjwvc3ZnPg==';
              }}
            />
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white">{lead.displayName}</h2>
              <p className="text-purple-100">{lead.username}</p>
              <div className="flex items-center gap-4 mt-2 text-purple-100">
                <span>{lead.followersFormatted} followers</span>
                <span>•</span>
                <span>Pitch Score: {lead.pitchScore}/10</span>
                <span>•</span>
                <span>Attractiveness: {lead.attractiveness}%</span>
              </div>
            </div>
            <button
              onClick={runFullEvaluation}
              disabled={loading}
              className="bg-white text-purple-600 px-6 py-3 rounded-lg font-bold hover:bg-gray-100 transition-colors disabled:opacity-50"
            >
              {loading ? 'Evaluating...' : 'Re-evaluate'}
            </button>
          </div>
        </div>

        {loading && (
          <div className="bg-gray-800 rounded-lg p-8 text-center">
            <div className="animate-spin text-4xl mb-4">🔄</div>
            <h3 className="text-xl font-bold text-white mb-2">Running Deep Evaluation...</h3>
            <p className="text-gray-400">Analyzing all aspects of this lead</p>
            <div className="mt-4 bg-gray-700 rounded-full h-2">
              <div className="bg-purple-500 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
            </div>
          </div>
        )}

        {evaluationResults && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* AI Message Generation Results */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <DocumentTextIcon className="w-5 h-5" />
                AI Generated Message
              </h3>
              {evaluationResults.aiMessage?.success ? (
                <div className="space-y-3">
                  <div className="bg-gray-700 rounded-lg p-4">
                    <p className="text-white text-sm leading-relaxed">{evaluationResults.aiMessage.message}</p>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-green-400">Success Probability: {evaluationResults.aiMessage.successProbability}%</span>
                    <button className="bg-purple-600 hover:bg-purple-700 px-3 py-1 rounded text-white text-xs">
                      Copy Message
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-red-400">Failed to generate message</p>
              )}
            </div>

            {/* Success Rate Prediction */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <ChartBarIcon className="w-5 h-5" />
                Success Prediction
              </h3>
              {evaluationResults.successPrediction?.success ? (
                <div className="space-y-3">
                  {evaluationResults.successPrediction.predictions?.[0] && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white font-medium">Success Rate</span>
                        <span className="text-2xl font-bold text-green-400">
                          {evaluationResults.successPrediction.predictions[0].successRate}%
                        </span>
                      </div>
                      <div className="bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: `${evaluationResults.successPrediction.predictions[0].successRate}%` }}
                        ></div>
                      </div>
                      <p className="text-gray-400 text-sm mt-2">
                        {evaluationResults.successPrediction.predictions[0].recommendation}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-red-400">Failed to predict success</p>
              )}
            </div>

            {/* Brand Analysis */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <SparklesIcon className="w-5 h-5" />
                Brand Analysis
              </h3>
              {evaluationResults.brandAnalysis?.success ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-400">
                        {evaluationResults.brandAnalysis.brandAnalysis.logoScore}/10
                      </div>
                      <div className="text-xs text-gray-400">Logo Score</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-400">
                        {evaluationResults.brandAnalysis.brandAnalysis.overallBrandScore}/10
                      </div>
                      <div className="text-xs text-gray-400">Overall Brand</div>
                    </div>
                  </div>
                  <p className="text-gray-400 text-sm">
                    Brand Type: {evaluationResults.brandAnalysis.brandAnalysis.brandType}
                  </p>
                </div>
              ) : (
                <p className="text-red-400">Failed to analyze brand</p>
              )}
            </div>

            {/* Email Finding */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <EnvelopeIcon className="w-5 h-5" />
                Contact Information
              </h3>
              {evaluationResults.emailFinding?.success ? (
                <div className="space-y-2">
                  {evaluationResults.emailFinding.emailResults.emails.slice(0, 3).map((email, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-700 rounded px-3 py-2">
                      <span className="text-white text-sm">{email.email}</span>
                      <span className={`text-xs px-2 py-1 rounded ${email.verified ? 'bg-green-600 text-white' : 'bg-yellow-600 text-white'}`}>
                        {Math.round(email.confidence * 100)}%
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-red-400">Failed to find contact info</p>
              )}
            </div>

            {/* Social Analysis */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <GlobeAltIcon className="w-5 h-5" />
                Social Presence
              </h3>
              {evaluationResults.socialAnalysis?.success ? (
                <div className="space-y-2">
                  {evaluationResults.socialAnalysis.socialAnalysis.platforms.filter(p => p.found).map((platform, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-700 rounded px-3 py-2">
                      <span className="text-white text-sm capitalize">{platform.platform}</span>
                      <div className="text-right">
                        <div className="text-white text-sm">{platform.followers.toLocaleString()}</div>
                        <div className="text-gray-400 text-xs">{platform.engagement} engagement</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-red-400">Failed to analyze social presence</p>
              )}
            </div>

            {/* Lead Enrichment */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <UserGroupIcon className="w-5 h-5" />
                Company Data
              </h3>
              {evaluationResults.enrichment?.success ? (
                <div className="space-y-2">
                  {evaluationResults.enrichment.enrichedLeads[0] && (
                    <div className="space-y-2">
                      <div className="bg-gray-700 rounded px-3 py-2">
                        <div className="text-white text-sm font-medium">
                          {evaluationResults.enrichment.enrichedLeads[0].companyData.name}
                        </div>
                        <div className="text-gray-400 text-xs">
                          {evaluationResults.enrichment.enrichedLeads[0].companyData.industry} • 
                          {evaluationResults.enrichment.enrichedLeads[0].companyData.size}
                        </div>
                      </div>
                      <div className="bg-gray-700 rounded px-3 py-2">
                        <div className="text-white text-sm">
                          {evaluationResults.enrichment.enrichedLeads[0].contactData.jobTitle}
                        </div>
                        <div className="text-gray-400 text-xs">
                          {evaluationResults.enrichment.enrichedLeads[0].contactData.department}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-red-400">Failed to enrich lead data</p>
              )}
            </div>
          </div>
        )}

        {/* Action Recommendations */}
        {evaluationResults && (
          <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-lg p-6">
            <h3 className="text-xl font-bold text-white mb-4">🎯 Recommended Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-4 rounded-lg transition-all">
                <div className="text-2xl mb-2">📧</div>
                <div className="font-bold">Send AI Message</div>
                <div className="text-sm opacity-80">Use generated message</div>
              </button>
              <button className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-4 rounded-lg transition-all">
                <div className="text-2xl mb-2">📋</div>
                <div className="font-bold">Add to Sequence</div>
                <div className="text-sm opacity-80">Automated follow-up</div>
              </button>
              <button className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-4 rounded-lg transition-all">
                <div className="text-2xl mb-2">⭐</div>
                <div className="font-bold">Mark as Priority</div>
                <div className="text-sm opacity-80">High-value lead</div>
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'followup':
        return <FollowupSequencesTab />;
      case 'brand':
        return <BrandAnalysisTab />;
      case 'market':
        return <MarketIntelligenceTab />;
      case 'marketplace':
        return <div className="text-white">Lead Marketplace - Coming Soon</div>;
      case 'email':
        return <div className="text-white">Email Finder - Coming Soon</div>;
      case 'social':
        return <div className="text-white">Social Analysis - Coming Soon</div>;
      case 'enrichment':
        return <div className="text-white">Lead Enrichment - Coming Soon</div>;
      case 'outreach':
        return <AIMessageGeneratorTab />;
      case 'abtest':
        return <div className="text-white">A/B Testing - Coming Soon</div>;
      case 'qualification':
        return <SuccessRatePredictorTab />;
      case 'evaluation':
        return <LeadEvaluationTab />;
      default:
        return <div className="text-white">Select a feature to get started</div>;
    }
  };

  return (
    <div className="p-6 bg-gray-900 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">Advanced Features</h1>
          <p className="text-gray-400">Powerful tools to supercharge your lead generation and outreach</p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeTab === tab.key
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="min-h-96">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default AdvancedFeaturesPanel; 
