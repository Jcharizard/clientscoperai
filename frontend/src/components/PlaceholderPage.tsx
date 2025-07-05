import React from 'react';
import { SparklesIcon } from '@heroicons/react/24/outline';

interface PlaceholderPageProps {
  title?: string;
  description?: string;
}

const PlaceholderPage: React.FC<PlaceholderPageProps> = ({ 
  title = "Coming Soon", 
  description = "This feature is under development" 
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
      <div className="text-center">
        <div className="bg-white rounded-3xl p-12 shadow-xl max-w-md mx-auto">
          <SparklesIcon className="w-16 h-16 text-gray-400 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-gray-800 mb-4">{title}</h2>
          <p className="text-gray-600 text-lg">{description}</p>
        </div>
      </div>
    </div>
  );
};

export default PlaceholderPage; 