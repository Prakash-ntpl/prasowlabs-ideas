import React from 'react';
import { Lightbulb } from 'lucide-react';

const LoadingScreen: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
      <div className="text-center">
        <div className="relative mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto animate-pulse">
            <Lightbulb className="w-10 h-10 text-white" />
          </div>
          <div className="absolute -inset-4 bg-gradient-to-r from-blue-400 to-purple-500 rounded-3xl opacity-20 animate-ping"></div>
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-2">IdeaFlow</h2>
        <p className="text-gray-600">Loading your creative workspace...</p>
        
        <div className="mt-6 flex justify-center">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;