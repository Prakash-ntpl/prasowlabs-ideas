import React, { useState } from 'react';
import { Trash2, Clock, Search } from 'lucide-react';

interface Idea {
  id: string;
  content: string;
  created_at: string;
  user_id?: string;
  session_id?: string;
}

interface IdeaListProps {
  ideas: Idea[];
  onDeleteIdea: (id: string) => Promise<boolean>;
  searchQuery: string;
}

const IdeaList: React.FC<IdeaListProps> = ({ ideas, onDeleteIdea, searchQuery }) => {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    const success = await onDeleteIdea(id);
    if (!success) {
      setDeletingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      const minutes = Math.floor(diffInHours * 60);
      return minutes <= 1 ? 'Just now' : `${minutes}m ago`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      });
    }
  };

  const highlightSearchTerm = (text: string, query: string) => {
    if (!query) return text;
    
    const regex = new RegExp(`(${query})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 text-yellow-900 rounded px-1">
          {part}
        </mark>
      ) : part
    );
  };

  if (ideas.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
          <Clock className="w-5 h-5 text-blue-600" />
          <span>Your Ideas</span>
          <span className="text-sm font-normal text-gray-500">({ideas.length})</span>
        </h3>
        
        {searchQuery && (
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Search className="w-4 h-4" />
            <span>Searching for "{searchQuery}"</span>
          </div>
        )}
      </div>

      {/* Ideas Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {ideas.map((idea, index) => (
          <div
            key={idea.id}
            className="group bg-white rounded-xl p-5 shadow-sm border border-gray-200/50 hover:shadow-lg hover:border-gray-300/50 transition-all duration-200 transform hover:-translate-y-1"
            style={{
              animationDelay: `${index * 50}ms`,
              animation: 'fadeInUp 0.5s ease-out forwards'
            }}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0">
                <p className="text-gray-900 leading-relaxed break-words">
                  {highlightSearchTerm(idea.content, searchQuery)}
                </p>
              </div>
              
              <button
                onClick={() => handleDelete(idea.id)}
                disabled={deletingId === idea.id}
                className="flex-shrink-0 ml-3 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                title="Delete idea"
              >
                {deletingId === idea.id ? (
                  <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
              </button>
            </div>
            
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span className="flex items-center space-x-1">
                <Clock className="w-3 h-3" />
                <span>{formatDate(idea.created_at)}</span>
              </span>
              
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>Synced</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default IdeaList;