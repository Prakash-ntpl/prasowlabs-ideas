import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles } from 'lucide-react';

interface IdeaCaptureProps {
  onAddIdea: (content: string) => Promise<boolean>;
  existingIdeas: Array<{ content: string }>;
}

const IdeaCapture: React.FC<IdeaCaptureProps> = ({ onAddIdea, existingIdeas }) => {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState(-1);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Smart autocomplete suggestions
  const suggestions = existingIdeas
    .filter(idea => 
      content.length > 2 && 
      idea.content.toLowerCase().includes(content.toLowerCase()) &&
      idea.content.toLowerCase() !== content.toLowerCase()
    )
    .slice(0, 5);

  useEffect(() => {
    setShowSuggestions(suggestions.length > 0 && content.length > 2);
    setSelectedSuggestion(-1);
  }, [content, suggestions.length]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isSubmitting) return;

    setIsSubmitting(true);
    const success = await onAddIdea(content.trim());
    
    if (success) {
      setContent('');
      setShowSuggestions(false);
      inputRef.current?.focus();
    }
    setIsSubmitting(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (selectedSuggestion >= 0) {
        setContent(suggestions[selectedSuggestion].content);
        setShowSuggestions(false);
      } else {
        handleSubmit(e);
      }
    } else if (e.key === 'ArrowDown' && showSuggestions) {
      e.preventDefault();
      setSelectedSuggestion(prev => 
        prev < suggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp' && showSuggestions) {
      e.preventDefault();
      setSelectedSuggestion(prev => prev > 0 ? prev - 1 : -1);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setSelectedSuggestion(-1);
    }
  };

  const selectSuggestion = (suggestion: string) => {
    setContent(suggestion);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  return (
    <div className="relative">
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative bg-white rounded-2xl shadow-xl border border-gray-200/50 overflow-hidden group focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-all duration-200">
          <div className="flex items-start p-6">
            <div className="flex-shrink-0 mr-4 mt-1">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <textarea
                ref={inputRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="What's your next big idea? Type it here..."
                className="w-full resize-none border-0 focus:ring-0 text-lg placeholder-gray-400 bg-transparent min-h-[60px] max-h-[200px]"
                rows={2}
                autoFocus
                disabled={isSubmitting}
              />
              
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-gray-500">
                  Press Enter to capture • Shift+Enter for new line
                </div>
                
                <button
                  type="submit"
                  disabled={!content.trim() || isSubmitting}
                  className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  {isSubmitting ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  <span className="font-medium">Capture</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>

      {/* Autocomplete Suggestions */}
      {showSuggestions && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-200/50 overflow-hidden z-50">
          <div className="p-2">
            <div className="text-xs text-gray-500 px-3 py-2 font-medium">Similar ideas</div>
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => selectSuggestion(suggestion.content)}
                className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                  index === selectedSuggestion
                    ? 'bg-blue-50 text-blue-900'
                    : 'hover:bg-gray-50 text-gray-700'
                }`}
              >
                <div className="truncate">{suggestion.content}</div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default IdeaCapture;