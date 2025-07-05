import React, { useState, useEffect } from 'react';
import { 
  ChartBarIcon, 
  TrophyIcon, 
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/solid';
import { Lead } from '../types';

interface PredictionSummary {
  avgSuccessRate: number;
  expectedResponses: number;
  highConfidenceLeads: number;
  avgResponseTime: string;
}

interface LeadPrediction {
  username: string;
  successRate: number;
  confidence: number;
  estimatedResponseTime: string;
  priority: 'High' | 'Medium' | 'Low';
  reasoning: string;
  factors?: string[];
  recommendations?: string[];
  followers?: number;
  screenshot?: string;
}

interface PredictionResponse {
  predictions?: LeadPrediction[];
  summary?: PredictionSummary;
  error?: string;
}

interface SuccessRatePredictorProps {
  selectedLeads?: Lead[];
  onClose: () => void;
}

type SortOption = 'successRate' | 'confidence' | 'username';
type FilterOption = 'all' | 'high' | 'medium' | 'low';

const SuccessRatePredictor: React.FC<SuccessRatePredictorProps> = ({ selectedLeads = [], onClose }) => {
  const [predictions, setPredictions] = useState<LeadPrediction[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [summary, setSummary] = useState<PredictionSummary | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('successRate');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');

  useEffect(() => {
    if (selectedLeads.length > 0) {
      generatePredictions();
    }
  }, [selectedLeads]);

  const generatePredictions = async (): Promise<void> => {
    setLoading(true);
    
    try {
      const response = await fetch('http://localhost:5001/ai/predict-success', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leads: selectedLeads })
      });

      const data: PredictionResponse = await response.json();
      
      if (response.ok) {
        setPredictions(data.predictions || []);
        setSummary(data.summary || null);
      } else {
        console.error('Prediction failed:', data.error);
      }
    } catch (error) {
      console.error('Failed to generate predictions:', error);
    } finally {
      setLoading(false);
    }
  };

  const sortedAndFilteredPredictions = predictions
    .filter(pred => {
      if (filterBy === 'all') return true;
      if (filterBy === 'high') return pred.successRate >= 70;
      if (filterBy === 'medium') return pred.successRate >= 40 && pred.successRate < 70;
      if (filterBy === 'low') return pred.successRate < 40;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'successRate') return b.successRate - a.successRate;
      if (sortBy === 'confidence') return b.confidence - a.confidence;
      if (sortBy === 'username') return a.username.localeCompare(b.username);
      return 0;
    });

  const getSuccessColor = (rate: number): string => {
    if (rate >= 70) return 'text-green-600 bg-green-100';
    if (rate >= 40) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getSuccessIcon = (rate: number): JSX.Element => {
    if (rate >= 70) return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
    if (rate >= 40) return <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500" />;
    return <XCircleIcon className="w-5 h-5 text-red-500" />;
  };

  const getConfidenceColor = (confidence: number): string => {
    if (confidence >= 80) return 'text-blue-600';
    if (confidence >= 60) return 'text-purple-600';
    return 'text-gray-600';
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    setSortBy(e.target.value as SortOption);
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    setFilterBy(e.target.value as FilterOption);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ChartBarIcon className="w-8 h-8" />
              <div>
                <h2 className="text-2xl font-bold">Success Rate Predictor</h2>
                <p className="text-blue-100">AI-powered conversion likelihood analysis</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 text-2xl font-bold"
            >
              ×
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="text-gray-600">Analyzing leads and predicting success rates...</p>
              </div>
            </div>
          ) : (
            <>
              {/* Summary Stats */}
              {summary && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-lg">
                    <div className="flex items-center gap-2">
                      <TrophyIcon className="w-6 h-6" />
                      <div>
                        <div className="text-2xl font-bold">{summary.avgSuccessRate}%</div>
                        <div className="text-green-100 text-sm">Avg Success Rate</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-lg">
                    <div className="flex items-center gap-2">
                      <ArrowTrendingUpIcon className="w-6 h-6" />
                      <div>
                        <div className="text-2xl font-bold">{summary.expectedResponses}</div>
                        <div className="text-blue-100 text-sm">Expected Responses</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-4 rounded-lg">
                    <div className="flex items-center gap-2">
                      <CheckCircleIcon className="w-6 h-6" />
                      <div>
                        <div className="text-2xl font-bold">{summary.highConfidenceLeads}</div>
                        <div className="text-purple-100 text-sm">High Confidence</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-4 rounded-lg">
                    <div className="flex items-center gap-2">
                      <ClockIcon className="w-6 h-6" />
                      <div>
                        <div className="text-2xl font-bold">{summary.avgResponseTime}</div>
                        <div className="text-orange-100 text-sm">Avg Response Time</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Controls */}
              <div className="flex flex-wrap gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
                  <select
                    value={sortBy}
                    onChange={handleSortChange}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="successRate">Success Rate</option>
                    <option value="confidence">Confidence</option>
                    <option value="username">Username</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Filter By</label>
                  <select
                    value={filterBy}
                    onChange={handleFilterChange}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Leads</option>
                    <option value="high">High Success (70%+)</option>
                    <option value="medium">Medium Success (40-69%)</option>
                    <option value="low">Low Success (&lt;40%)</option>
                  </select>
                </div>
              </div>

              {/* Predictions List */}
              <div className="space-y-4">
                {sortedAndFilteredPredictions.map((prediction, index) => (
                  <div key={prediction.username} className="border border-gray-200 rounded-lg p-4 bg-white hover:shadow-md transition-shadow">
                    <div className="flex items-start gap-4">
                      {/* Profile Image */}
                      <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                        {prediction.screenshot ? (
                          <img 
                            src={`http://localhost:5001${prediction.screenshot}`}
                            alt={prediction.username}
                            className="w-full h-full object-cover rounded-full"
                          />
                        ) : (
                          <span className="text-gray-500 text-xl">👤</span>
                        )}
                      </div>

                      {/* Main Content */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-bold text-lg">@{prediction.username}</h3>
                            <p className="text-gray-600 text-sm">{prediction.followers} followers</p>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            {getSuccessIcon(prediction.successRate)}
                            <span className={`px-3 py-1 rounded-full text-sm font-bold ${getSuccessColor(prediction.successRate)}`}>
                              {prediction.successRate}% Success Rate
                            </span>
                          </div>
                        </div>

                        {/* Prediction Details */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <div className="text-sm text-gray-600">Confidence Level</div>
                            <div className={`text-lg font-bold ${getConfidenceColor(prediction.confidence)}`}>
                              {prediction.confidence}%
                            </div>
                          </div>
                          
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <div className="text-sm text-gray-600">Response Time</div>
                            <div className="text-lg font-bold text-gray-800">
                              {prediction.estimatedResponseTime}
                            </div>
                          </div>
                          
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <div className="text-sm text-gray-600">Priority Level</div>
                            <div className={`text-lg font-bold ${
                              prediction.priority === 'High' ? 'text-red-600' :
                              prediction.priority === 'Medium' ? 'text-yellow-600' :
                              'text-green-600'
                            }`}>
                              {prediction.priority}
                            </div>
                          </div>
                        </div>

                        {/* Reasoning */}
                        <div className="mb-3">
                          <div className="text-sm font-medium text-gray-700 mb-1">AI Analysis:</div>
                          <p className="text-sm text-gray-600">{prediction.reasoning}</p>
                        </div>

                        {/* Factors */}
                        {prediction.factors && prediction.factors.length > 0 && (
                          <div className="mb-3">
                            <div className="text-sm font-medium text-gray-700 mb-2">Key Factors:</div>
                            <div className="flex flex-wrap gap-2">
                              {prediction.factors.map((factor, factorIndex) => (
                                <span 
                                  key={factorIndex}
                                  className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium"
                                >
                                  {factor}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Recommendations */}
                        {prediction.recommendations && prediction.recommendations.length > 0 && (
                          <div>
                            <div className="text-sm font-medium text-gray-700 mb-1">Recommendations:</div>
                            <ul className="text-sm text-gray-600 space-y-1">
                              {prediction.recommendations.map((rec, recIndex) => (
                                <li key={recIndex} className="flex items-start gap-1">
                                  <span className="text-blue-500">•</span>
                                  {rec}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* No Results */}
              {sortedAndFilteredPredictions.length === 0 && !loading && (
                <div className="text-center py-12">
                  <ChartBarIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-600 mb-2">No Predictions Available</h3>
                  <p className="text-gray-500">
                    {filterBy !== 'all' 
                      ? 'No leads match the selected filter criteria.'
                      : 'Select some leads to generate success rate predictions.'
                    }
                  </p>
                </div>
              )}

              {/* Tips Section */}
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-start gap-2">
                  <ExclamationTriangleIcon className="w-5 h-5 text-blue-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-800 mb-2">How to Use Success Predictions</h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Focus on leads with 70%+ success rates for immediate outreach</li>
                      <li>• Use medium-success leads (40-69%) for nurture campaigns</li>
                      <li>• Low-success leads (&lt;40%) may need different approaches or timing</li>
                      <li>• High confidence predictions are more reliable for planning</li>
                      <li>• Consider response time estimates when planning follow-ups</li>
                    </ul>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SuccessRatePredictor; 