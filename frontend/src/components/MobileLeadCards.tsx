import React, { useState, useEffect, useRef } from 'react';
import { 
  HeartIcon, 
  XMarkIcon, 
  StarIcon,
  EnvelopeIcon,
  UserIcon,
  MapPinIcon,
  SparklesIcon,
  ChartBarIcon,
  PaperAirplaneIcon,
  ChevronDownIcon,
  FolderIcon,
  EyeIcon,
  FireIcon
} from '@heroicons/react/24/solid';
import { Lead } from '../types';

interface Session {
  id: string;
  name: string;
  leadCount: number;
  createdAt: string;
}

interface Badge {
  icon: string;
  text: string;
  color: 'red' | 'orange' | 'green' | 'purple' | 'blue';
}

interface QuickStats {
  businessType: string;
  location: string;
}

interface LeadCard {
  id: string;
  username: string;
  displayName: string;
  screenshot: string;
  badges?: Badge[];
  attractiveness: number;
  cardTheme: 'gold' | 'purple' | 'blue' | 'green' | 'gray';
  followersFormatted: string;
  pitchScore: number;
  quickStats: QuickStats;
  bioShort: string;
}

interface MobileLeadCardsProps {
  onNavigateToAdvanced?: () => void;
  selectedLeadForEvaluation: Lead | null;
  setSelectedLeadForEvaluation: (lead: Lead | null) => void;
}

interface DragOffset {
  x: number;
  y: number;
}

type SwipeDirection = 'left' | 'right' | null;

const MobileLeadCards: React.FC<MobileLeadCardsProps> = ({ 
  onNavigateToAdvanced, 
  selectedLeadForEvaluation, 
  setSelectedLeadForEvaluation 
}) => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedSession, setSelectedSession] = useState<string>('');
  const [showSessionDropdown, setShowSessionDropdown] = useState<boolean>(false);
  const [cards, setCards] = useState<LeadCard[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [dragOffset, setDragOffset] = useState<DragOffset>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [swipeDirection, setSwipeDirection] = useState<SwipeDirection>(null);
  const [showEvaluateButton, setShowEvaluateButton] = useState<boolean>(false);
  const [likedCards, setLikedCards] = useState<Set<string>>(new Set());
  
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadSessions();
  }, []);

  useEffect(() => {
    if (selectedSession) {
      loadCardsFromSession();
    }
  }, [selectedSession]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (showSessionDropdown && !target.closest('.session-dropdown')) {
        setShowSessionDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSessionDropdown]);

  const loadSessions = async (): Promise<void> => {
    try {
      const response = await fetch('http://localhost:5001/sessions');
      const data = await response.json();
      setSessions(data.sessions || []);
    } catch (error) {
      console.error('Failed to load sessions:', error);
    }
  };

  const loadCardsFromSession = async (): Promise<void> => {
    if (!selectedSession) return;
    
    setLoading(true);
    try {
      console.log(`🔍 Loading cards from session: ${selectedSession}`);
      const response = await fetch(`http://localhost:5001/leads/cards?session=${encodeURIComponent(selectedSession)}&limit=50`);
      const data = await response.json();
      
      console.log('📊 Cards API Response:', data);
      
      if (data.success) {
        console.log(`✅ Found ${data.cards?.length || 0} cards`);
        setCards(data.cards || []);
        setCurrentIndex(0); // Reset to first card
        setLikedCards(new Set()); // Reset liked cards
        
        // Debug: Log first few cards
        if (data.cards && data.cards.length > 0) {
          console.log('🎯 First card:', data.cards[0]);
        } else {
          console.warn('⚠️ No cards found in session');
        }
      } else {
        console.error('❌ API returned error:', data.error);
      }
    } catch (error) {
      console.error('💥 Failed to load cards:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSwipe = (direction: 'left' | 'right'): void => {
    if (currentIndex >= cards.length) return;
    
    const currentCard = cards[currentIndex];
    
    if (direction === 'right') {
      // Liked the card
      setLikedCards(prev => new Set([...prev, currentCard.id]));
      setShowEvaluateButton(true);
      
      // Auto-hide evaluate button after 3 seconds
      setTimeout(() => setShowEvaluateButton(false), 3000);
    }
    
    // Move to next card
    setTimeout(() => {
      setCurrentIndex(prev => prev + 1);
      setSwipeDirection(null);
      setDragOffset({ x: 0, y: 0 });
    }, 300);
    
    setSwipeDirection(direction);
  };

  const handleEvaluate = (): void => {
    if (currentIndex > 0 && cards[currentIndex - 1]) {
      const lastLikedCard = cards[currentIndex - 1];
      // Convert LeadCard to Lead format for compatibility
      const leadData: Lead = {
        id: lastLikedCard.id,
        username: lastLikedCard.username,
        displayName: lastLikedCard.displayName,
        bio: lastLikedCard.bioShort,
        screenshot: lastLikedCard.screenshot,
        followers: parseInt(lastLikedCard.followersFormatted.replace(/[^0-9]/g, '')) || 0,
        following: 0,
        posts: 0,
        isVerified: false,
        isPrivate: false,
        url: `https://instagram.com/${lastLikedCard.username}`,
        email: '',
        bioScore: null,
        visionScore: null,
        temperature: 'COLD',
        score: lastLikedCard.pitchScore * 10, // Convert to 100-point scale
        followersCount: parseInt(lastLikedCard.followersFormatted.replace(/[^0-9]/g, '')) || 0,
        isBusinessAccount: false,
        scrapedAt: new Date()
      };
      setSelectedLeadForEvaluation(leadData);
      if (onNavigateToAdvanced) {
        onNavigateToAdvanced();
      }
    }
  };

  const handleStart = (e: React.MouseEvent | React.TouchEvent): void => {
    setIsDragging(true);
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    setDragOffset({ x: clientX, y: clientY });
  };

  const handleMove = (e: React.MouseEvent | React.TouchEvent): void => {
    if (!isDragging) return;
    
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    const deltaX = clientX - dragOffset.x;
    const deltaY = clientY - dragOffset.y;
    
    if (cardRef.current) {
      const rotation = deltaX * 0.1;
      cardRef.current.style.transform = `translate(${deltaX}px, ${deltaY}px) rotate(${rotation}deg)`;
      
      // Show swipe indicators
      if (Math.abs(deltaX) > 50) {
        setSwipeDirection(deltaX > 0 ? 'right' : 'left');
      } else {
        setSwipeDirection(null);
      }
    }
  };

  const handleEnd = (): void => {
    if (!isDragging) return;
    setIsDragging(false);
    
    if (cardRef.current) {
      const transform = cardRef.current.style.transform;
      const translateX = parseFloat(transform.match(/translate\(([^,]+)/)?.[1] || '0');
      
      if (Math.abs(translateX) > 100) {
        handleSwipe(translateX > 0 ? 'right' : 'left');
      } else {
        // Snap back
        cardRef.current.style.transform = 'translate(0px, 0px) rotate(0deg)';
        setSwipeDirection(null);
      }
    }
  };

  const getCardStyle = (index: number): React.CSSProperties => {
    const offset = index - currentIndex;
    if (offset < 0) return { display: 'none' };
    if (offset > 2) return { display: 'none' };
    
    const scale = 1 - (offset * 0.05);
    const translateY = offset * 10;
    const zIndex = 10 - offset;
    
    return {
      transform: `scale(${scale}) translateY(${translateY}px)`,
      zIndex: zIndex,
      opacity: offset === 0 ? 1 : 0.7
    };
  };

  const getBadgeColor = (badge: Badge): string => {
    const colors: Record<Badge['color'], string> = {
      red: 'bg-red-500',
      orange: 'bg-orange-500', 
      green: 'bg-green-500',
      purple: 'bg-purple-500',
      blue: 'bg-blue-500'
    };
    return colors[badge.color] || 'bg-gray-500';
  };

  const getThemeGradient = (theme: LeadCard['cardTheme']): string => {
    const themes: Record<LeadCard['cardTheme'], string> = {
      gold: 'from-yellow-400 via-yellow-500 to-yellow-600',
      purple: 'from-purple-400 via-purple-500 to-purple-600',
      blue: 'from-blue-400 via-blue-500 to-blue-600',
      green: 'from-green-400 via-green-500 to-green-600',
      gray: 'from-gray-400 via-gray-500 to-gray-600'
    };
    return themes[theme] || themes.gray;
  };

  const handleSessionSelect = (sessionName: string): void => {
    setSelectedSession(sessionName);
    setShowSessionDropdown(false);
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>): void => {
    const target = e.target as HTMLImageElement;
    target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDQwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMDAgMTAwQzE2MS4zIDEwMCAxMzAgMTMxLjMgMTMwIDE3MFMxNjEuMyAyNDAgMjAwIDI0MFMyNzAgMjA4LjcgMjcwIDE3MFMyMzguNyAxMDAgMjAwIDEwMFpNMjAwIDIyMEMxNzIuNCAyMjAgMTUwIDE5Ny42IDE1MCAxNzBTMTcyLjQgMTIwIDIwMCAxMjBTMjUwIDE0Mi40IDI1MCAxNzBTMjI3LjYgMjIwIDIwMCAyMjBaIiBmaWxsPSIjOUI5QkEzIi8+CjxwYXRoIGQ9Ik0yMDAgMjYwQzE0NC43IDI2MCA5MCAyODQuNyA5MCAzMjBIMzEwQzMxMCAyODQuNyAyNTUuMyAyNjAgMjAwIDI2MFoiIGZpbGw9IiM5QjlCQTMiLz4KPC9zdmc+';
  };

  if (!selectedSession) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-500 via-red-500 to-yellow-500 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-white rounded-3xl p-8 shadow-2xl max-w-md mx-auto">
            <div className="text-6xl mb-4">💕</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Choose Your Session</h2>
            <p className="text-gray-600 mb-6">Select a session to start swiping through leads</p>
            
            <div className="relative session-dropdown">
              <button
                onClick={() => setShowSessionDropdown(!showSessionDropdown)}
                className="w-full bg-gradient-to-r from-pink-500 to-red-500 text-white px-6 py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 hover:from-pink-600 hover:to-red-600 transition-all shadow-lg"
              >
                <FolderIcon className="w-6 h-6" />
                Select Session
                <ChevronDownIcon className="w-5 h-5" />
              </button>
              
              {showSessionDropdown && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-200 max-h-64 overflow-y-auto z-50">
                  {sessions.map((session) => (
                    <button
                      key={session.id}
                      onClick={() => handleSessionSelect(session.name)}
                      className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
                    >
                      <div className="font-medium text-gray-800">{session.name}</div>
                      <div className="text-sm text-gray-500">{session.leadCount} leads • {new Date(session.createdAt).toLocaleDateString()}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-500 via-red-500 to-yellow-500 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin text-6xl mb-4">💕</div>
          <h2 className="text-2xl font-bold">Loading your matches...</h2>
        </div>
      </div>
    );
  }

  if (currentIndex >= cards.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-500 via-red-500 to-yellow-500 flex items-center justify-center">
        <div className="text-center text-white">
          {cards.length === 0 ? (
            <>
              <div className="text-6xl mb-4">😔</div>
              <h2 className="text-3xl font-bold mb-4">No Cards Found</h2>
              <p className="text-xl mb-6">This session doesn't have any leads with screenshots</p>
              <div className="text-sm mb-6 opacity-80">
                Try running a scrape first to generate leads with screenshots
              </div>
              <button
                onClick={() => setSelectedSession('')}
                className="bg-white text-pink-500 px-8 py-3 rounded-2xl font-bold text-lg hover:bg-gray-100 transition-colors mr-4"
              >
                Choose Another Session
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="bg-white bg-opacity-20 backdrop-blur-sm text-white px-8 py-3 rounded-2xl font-bold text-lg hover:bg-opacity-30 transition-colors"
              >
                Start Scraping
              </button>
            </>
          ) : (
            <>
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-3xl font-bold mb-4">All Done!</h2>
              <p className="text-xl mb-6">You've reviewed all leads in this session</p>
              <button
                onClick={() => setSelectedSession('')}
                className="bg-white text-pink-500 px-8 py-3 rounded-2xl font-bold text-lg hover:bg-gray-100 transition-colors"
              >
                Choose Another Session
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  const currentCard = cards[currentIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-500 via-red-500 to-yellow-500 relative overflow-hidden">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-20 p-4">
        <div className="flex justify-between items-center">
          <button
            onClick={() => setSelectedSession('')}
            className="bg-white bg-opacity-20 backdrop-blur-sm text-white p-3 rounded-full hover:bg-opacity-30 transition-all"
          >
            <ChevronDownIcon className="w-6 h-6" />
          </button>
          
          <div className="text-center text-white">
            <div className="text-lg font-bold">{selectedSession}</div>
            <div className="text-sm opacity-80">{currentIndex + 1} of {cards.length}</div>
          </div>
          
          <div className="bg-white bg-opacity-20 backdrop-blur-sm text-white p-3 rounded-full">
            <HeartIcon className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Card Stack */}
      <div className="absolute inset-0 flex items-center justify-center p-4 pt-24 pb-32">
        <div className="relative w-full max-w-sm">
          {cards.slice(currentIndex, currentIndex + 3).map((card, index) => (
            <div
              key={card.id}
              ref={index === 0 ? cardRef : null}
              className={`absolute inset-0 bg-white rounded-3xl shadow-2xl overflow-hidden cursor-grab active:cursor-grabbing transition-all duration-300 ${
                swipeDirection === 'right' && index === 0 ? 'border-4 border-green-400' :
                swipeDirection === 'left' && index === 0 ? 'border-4 border-red-400' : ''
              }`}
              style={getCardStyle(currentIndex + index)}
              onMouseDown={index === 0 ? handleStart : undefined}
              onMouseMove={index === 0 ? handleMove : undefined}
              onMouseUp={index === 0 ? handleEnd : undefined}
              onTouchStart={index === 0 ? handleStart : undefined}
              onTouchMove={index === 0 ? handleMove : undefined}
              onTouchEnd={index === 0 ? handleEnd : undefined}
            >
              {/* Card Image */}
              <div className="relative h-96 overflow-hidden">
                <img
                                      src={`http://localhost:5001${card.screenshot}`}
                  alt={card.displayName}
                  className="w-full h-full object-cover"
                  onError={handleImageError}
                />
                
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
                
                {/* Badges */}
                <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                  {card.badges?.slice(0, 3).map((badge, i) => (
                    <span
                      key={i}
                      className={`${getBadgeColor(badge)} text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1`}
                    >
                      <span>{badge.icon}</span>
                      {badge.text}
                    </span>
                  ))}
                </div>
                
                {/* Attractiveness Score */}
                <div className="absolute top-4 right-4">
                  <div className={`bg-gradient-to-r ${getThemeGradient(card.cardTheme)} text-white text-lg font-bold w-12 h-12 rounded-full flex items-center justify-center shadow-lg`}>
                    {card.attractiveness}
                  </div>
                </div>
                
                {/* Swipe Indicators */}
                {swipeDirection === 'right' && index === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-green-500 text-white text-4xl font-bold px-8 py-4 rounded-2xl transform rotate-12 shadow-2xl">
                      LIKE
                    </div>
                  </div>
                )}
                {swipeDirection === 'left' && index === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-red-500 text-white text-4xl font-bold px-8 py-4 rounded-2xl transform -rotate-12 shadow-2xl">
                      PASS
                    </div>
                  </div>
                )}
              </div>
              
              {/* Card Info */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-2xl font-bold text-gray-800">{card.displayName}</h3>
                  <div className="flex items-center gap-1 text-gray-600">
                    <UserIcon className="w-4 h-4" />
                    <span className="text-sm">{card.followersFormatted}</span>
                  </div>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-gray-600">
                    <SparklesIcon className="w-4 h-4" />
                    <span className="text-sm">Pitch Score: {card.pitchScore}/10</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPinIcon className="w-4 h-4" />
                    <span className="text-sm">{card.quickStats.businessType} • {card.quickStats.location}</span>
                  </div>
                </div>
                
                <p className="text-gray-700 text-sm leading-relaxed">
                  {card.bioShort}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="absolute bottom-8 left-0 right-0 flex justify-center items-center gap-6 px-4">
        <button
          onClick={() => handleSwipe('left')}
          className="bg-white text-red-500 w-16 h-16 rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform"
        >
          <XMarkIcon className="w-8 h-8" />
        </button>
        
        {showEvaluateButton && (
          <button
            onClick={handleEvaluate}
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-full font-bold shadow-2xl hover:scale-105 transition-transform animate-pulse"
          >
            <div className="flex items-center gap-2">
              <ChartBarIcon className="w-5 h-5" />
              Evaluate
            </div>
          </button>
        )}
        
        <button
          onClick={() => handleSwipe('right')}
          className="bg-white text-green-500 w-16 h-16 rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform"
        >
          <HeartIcon className="w-8 h-8" />
        </button>
      </div>
    </div>
  );
};

export default MobileLeadCards; 