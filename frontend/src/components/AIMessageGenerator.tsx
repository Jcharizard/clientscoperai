import React, { useState, useEffect } from 'react';
import { 
  SparklesIcon, 
  PaperAirplaneIcon, 
  ClipboardDocumentIcon,
  ArrowPathIcon,
  CheckIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/solid';
import { Lead } from '../types';

interface MessageType {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}

interface GeneratedMessage {
  message: string;
  confidence?: number;
  reasoning?: string;
  tips?: string[];
}

interface AIMessageGeneratorProps {
  selectedLeads?: Lead[];
  onClose: () => void;
}

interface MessageGenerationRequest {
  lead: Lead;
  messageType: string;
  customPrompt?: string;
  generateMultiple: boolean;
}

interface MessageGenerationResponse {
  messages?: GeneratedMessage[];
  message?: string;
  error?: string;
}

const AIMessageGenerator: React.FC<AIMessageGeneratorProps> = ({ selectedLeads = [], onClose }) => {
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [messageType, setMessageType] = useState<string>('professional');
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [generatedMessages, setGeneratedMessages] = useState<GeneratedMessage[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  useEffect(() => {
    if (selectedLeads.length > 0 && !selectedLead) {
      setSelectedLead(selectedLeads[0]);
    }
  }, [selectedLeads, selectedLead]);

  const messageTypes: MessageType[] = [
    {
      id: 'professional',
      name: 'Professional Outreach',
      description: 'Formal business approach',
      icon: '💼',
      color: 'blue'
    },
    {
      id: 'casual',
      name: 'Casual & Friendly',
      description: 'Relaxed conversation starter',
      icon: '😊',
      color: 'green'
    },
    {
      id: 'value_proposition',
      name: 'Value-Focused',
      description: 'Highlight benefits upfront',
      icon: '💎',
      color: 'purple'
    },
    {
      id: 'curiosity',
      name: 'Curiosity Hook',
      description: 'Intrigue-based opener',
      icon: '🤔',
      color: 'orange'
    },
    {
      id: 'compliment',
      name: 'Genuine Compliment',
      description: 'Start with authentic praise',
      icon: '⭐',
      color: 'yellow'
    },
    {
      id: 'custom',
      name: 'Custom Prompt',
      description: 'Your own instructions',
      icon: '✨',
      color: 'pink'
    }
  ];

  const generateMessages = async (): Promise<void> => {
    if (!selectedLead) return;

    setLoading(true);
    setGeneratedMessages([]);

    try {
      const requestData: MessageGenerationRequest = {
        lead: selectedLead,
        messageType: messageType,
        customPrompt: messageType === 'custom' ? customPrompt : undefined,
        generateMultiple: true
      };

      const response = await fetch('http://localhost:5001/ai/generate-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData)
      });

      const data: MessageGenerationResponse = await response.json();
      
      if (response.ok) {
        if (data.messages) {
          setGeneratedMessages(data.messages);
        } else if (data.message) {
          setGeneratedMessages([{ message: data.message }]);
        }
      } else {
        console.error('Message generation failed:', data.error);
      }
    } catch (error) {
      console.error('Failed to generate messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (message: string, index: number): Promise<void> => {
    try {
      await navigator.clipboard.writeText(message);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const getTypeColor = (color: string): string => {
    const colors: Record<string, string> = {
      blue: 'bg-blue-500 hover:bg-blue-600',
      green: 'bg-green-500 hover:bg-green-600',
      purple: 'bg-purple-500 hover:bg-purple-600',
      orange: 'bg-orange-500 hover:bg-orange-600',
      yellow: 'bg-yellow-500 hover:bg-yellow-600',
      pink: 'bg-pink-500 hover:bg-pink-600'
    };
    return colors[color] || colors.blue;
  };

  const getTypeBorder = (color: string): string => {
    const colors: Record<string, string> = {
      blue: 'border-blue-500',
      green: 'border-green-500',
      purple: 'border-purple-500',
      orange: 'border-orange-500',
      yellow: 'border-yellow-500',
      pink: 'border-pink-500'
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <SparklesIcon className="w-8 h-8" />
              <div>
                <h2 className="text-2xl font-bold">AI Message Generator</h2>
                <p className="text-purple-100">Create personalized DMs that convert</p>
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
          {/* Lead Selection */}
          {selectedLeads.length > 1 && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Lead
              </label>
              <select
                value={selectedLead?.username || ''}
                onChange={(e) => {
                  const lead = selectedLeads.find(l => l.username === e.target.value);
                  setSelectedLead(lead || null);
                  setGeneratedMessages([]);
                }}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                {selectedLeads.map((lead) => (
                  <option key={lead.username} value={lead.username}>
                    @{lead.username} - {lead.bio?.substring(0, 50)}...
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Selected Lead Preview */}
          {selectedLead && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center">
                  {selectedLead.screenshot ? (
                    <img 
                      src={`http://localhost:5001${selectedLead.screenshot}`}
                      alt={selectedLead.username}
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <span className="text-gray-500 text-xl">👤</span>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg">@{selectedLead.username}</h3>
                  <p className="text-gray-600 text-sm mb-2">{selectedLead.followersCount} followers</p>
                  <p className="text-gray-700">{selectedLead.bio}</p>
                  {selectedLead.email && (
                    <p className="text-green-600 text-sm mt-2">📧 {selectedLead.email}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Message Type Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Message Style
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {messageTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => {
                    setMessageType(type.id);
                    setGeneratedMessages([]);
                  }}
                  className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                    messageType === type.id
                      ? `${getTypeBorder(type.color)} bg-${type.color}-50`
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-2xl mb-2">{type.icon}</div>
                  <div className="font-medium text-sm">{type.name}</div>
                  <div className="text-xs text-gray-500 mt-1">{type.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Prompt */}
          {messageType === 'custom' && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Custom Instructions
              </label>
              <textarea
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="Describe the tone, style, or specific approach you want for the message..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                rows={3}
              />
            </div>
          )}

          {/* Generate Button */}
          <div className="mb-6">
            <button
              onClick={generateMessages}
              disabled={loading || !selectedLead || (messageType === 'custom' && !customPrompt.trim())}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <ArrowPathIcon className="w-5 h-5 animate-spin" />
                  Generating Messages...
                </>
              ) : (
                <>
                  <SparklesIcon className="w-5 h-5" />
                  Generate AI Messages
                </>
              )}
            </button>
          </div>

          {/* Generated Messages */}
          {generatedMessages.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <PaperAirplaneIcon className="w-5 h-5" />
                Generated Messages ({generatedMessages.length})
              </h3>
              
              {generatedMessages.map((messageData, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 bg-white">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs font-medium">
                        Option {index + 1}
                      </span>
                      {messageData.confidence && (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          messageData.confidence >= 80 ? 'bg-green-100 text-green-800' :
                          messageData.confidence >= 60 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {messageData.confidence}% confidence
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => copyToClipboard(messageData.message, index)}
                      className="flex items-center gap-1 text-gray-500 hover:text-gray-700 text-sm"
                    >
                      {copiedIndex === index ? (
                        <>
                          <CheckIcon className="w-4 h-4 text-green-500" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <ClipboardDocumentIcon className="w-4 h-4" />
                          Copy
                        </>
                      )}
                    </button>
                  </div>
                  
                  <div className="bg-gray-50 p-3 rounded-lg mb-3">
                    <p className="text-gray-800 whitespace-pre-wrap">
                      {messageData.message}
                    </p>
                  </div>
                  
                  {messageData.reasoning && (
                    <div className="text-sm text-gray-600">
                      <strong>AI Reasoning:</strong> {messageData.reasoning}
                    </div>
                  )}
                  
                  {messageData.tips && messageData.tips.length > 0 && (
                    <div className="mt-2">
                      <div className="text-sm font-medium text-gray-700 mb-1">💡 Tips:</div>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {messageData.tips.map((tip, tipIndex) => (
                          <li key={tipIndex} className="flex items-start gap-1">
                            <span className="text-blue-500">•</span>
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Tips Section */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-start gap-2">
              <ExclamationTriangleIcon className="w-5 h-5 text-blue-500 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-800 mb-2">Pro Tips for Better Results</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Personalize messages based on their bio and business type</li>
                  <li>• Keep initial messages short and focused</li>
                  <li>• Always include a clear call-to-action</li>
                  <li>• Test different approaches with A/B testing</li>
                  <li>• Follow up if no response within 3-5 days</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIMessageGenerator; 