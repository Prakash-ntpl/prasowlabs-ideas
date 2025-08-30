import React, { useState, useEffect } from 'react';
import { Lightbulb, User, LogOut, Sparkles } from 'lucide-react';
import IdeaCapture from './components/IdeaCapture';
import IdeaList from './components/IdeaList';
import AuthModal from './components/AuthModal';
import LoadingScreen from './components/LoadingScreen';

interface User {
  id: string;
  email: string;
}

interface Idea {
  id: string;
  content: string;
  created_at: string;
  user_id?: string;
  session_id?: string;
}

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [sessionId, setSessionId] = useState<string>('');
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const API_BASE = 'http://localhost:3306/api';

  // Generate or retrieve session ID
  useEffect(() => {
    let storedSessionId = localStorage.getItem('ideaflow_session');
    if (!storedSessionId) {
      storedSessionId = 'session_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('ideaflow_session', storedSessionId);
    }
    setSessionId(storedSessionId);
  }, []);

  // Check for existing user session
  useEffect(() => {
    const token = localStorage.getItem('ideaflow_token');
    if (token) {
      fetchUserProfile(token);
    } else {
      setLoading(false);
    }
  }, []);

  // Fetch ideas when user or session changes
  useEffect(() => {
    if (sessionId) {
      fetchIdeas();
    }
  }, [user, sessionId]);

  const fetchUserProfile = async (token: string) => {
    try {
      const response = await fetch(`${API_BASE}/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        localStorage.removeItem('ideaflow_token');
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      localStorage.removeItem('ideaflow_token');
    } finally {
      setLoading(false);
    }
  };

  const fetchIdeas = async () => {
    try {
      const token = localStorage.getItem('ideaflow_token');
      const headers: Record<string, string> = {};
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      } else {
        headers['X-Session-ID'] = sessionId;
      }

      const response = await fetch(`${API_BASE}/ideas`, { headers });
      
      if (response.ok) {
        const ideasData = await response.json();
        setIdeas(ideasData);
      }
    } catch (error) {
      console.error('Error fetching ideas:', error);
    }
  };

  const handleAddIdea = async (content: string) => {
    try {
      const token = localStorage.getItem('ideaflow_token');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      } else {
        headers['X-Session-ID'] = sessionId;
      }

      const response = await fetch(`${API_BASE}/ideas`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ content }),
      });

      if (response.ok) {
        const newIdea = await response.json();
        setIdeas(prev => [newIdea, ...prev]);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error adding idea:', error);
      return false;
    }
  };

  const handleDeleteIdea = async (ideaId: string) => {
    try {
      const token = localStorage.getItem('ideaflow_token');
      const headers: Record<string, string> = {};
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      } else {
        headers['X-Session-ID'] = sessionId;
      }

      const response = await fetch(`${API_BASE}/ideas/${ideaId}`, {
        method: 'DELETE',
        headers,
      });

      if (response.ok) {
        setIdeas(prev => prev.filter(idea => idea.id !== ideaId));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error deleting idea:', error);
      return false;
    }
  };

  const handleAuth = async (email: string, password: string, isLogin: boolean) => {
    try {
      const endpoint = isLogin ? 'login' : 'register';
      const response = await fetch(`${API_BASE}/auth/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Session-ID': sessionId,
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const { token, user: userData } = await response.json();
        localStorage.setItem('ideaflow_token', token);
        setUser(userData);
        setShowAuthModal(false);
        
        // Refresh ideas to get user's ideas
        fetchIdeas();
        return { success: true };
      } else {
        const error = await response.json();
        return { success: false, error: error.message };
      }
    } catch (error) {
      return { success: false, error: 'Network error occurred' };
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('ideaflow_token');
    setUser(null);
    setShowAuthModal(false);
    
    // Generate new session ID for anonymous use
    const newSessionId = 'session_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('ideaflow_session', newSessionId);
    setSessionId(newSessionId);
    setIdeas([]);
  };

  const filteredIdeas = ideas.filter(idea =>
    idea.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
                <Lightbulb className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  IdeaFlow
                </h1>
                <p className="text-xs text-gray-500">Capture ideas instantly</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {user ? (
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2 px-3 py-2 bg-gray-50 rounded-lg">
                    <User className="w-4 h-4 text-gray-600" />
                    <span className="text-sm text-gray-700">{user.email}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Logout"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <User className="w-4 h-4" />
                  <span className="text-sm font-medium">Sign Up</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full mb-6">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">Never lose an idea again</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
            Capture Ideas
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {" "}Instantly
            </span>
          </h2>
          
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            The fastest way to capture, organize, and retrieve your content ideas across all devices. 
            Built for creators who think fast and move faster.
          </p>

          {!user && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 max-w-md mx-auto mb-8">
              <p className="text-sm text-amber-800">
                <strong>Quick Start:</strong> Start capturing ideas immediately! 
                Sign up later to sync across devices and keep ideas forever.
              </p>
            </div>
          )}
        </div>

        {/* Idea Capture */}
        <div className="mb-8">
          <IdeaCapture onAddIdea={handleAddIdea} existingIdeas={ideas} />
        </div>

        {/* Search */}
        {ideas.length > 0 && (
          <div className="mb-6">
            <div className="relative max-w-md mx-auto">
              <input
                type="text"
                placeholder="Search your ideas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 pl-10 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-sm"
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                <div className="w-4 h-4 border-2 border-gray-400 rounded-full"></div>
                <div className="absolute top-3 left-3 w-2 h-2 border-r-2 border-b-2 border-gray-400 rotate-45"></div>
              </div>
            </div>
          </div>
        )}

        {/* Ideas List */}
        <IdeaList 
          ideas={filteredIdeas} 
          onDeleteIdea={handleDeleteIdea}
          searchQuery={searchQuery}
        />

        {/* Empty State */}
        {ideas.length === 0 && (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Lightbulb className="w-12 h-12 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Ready for your first idea?</h3>
            <p className="text-gray-600 max-w-md mx-auto">
              Start typing above to capture your thoughts instantly. Your ideas will appear here, 
              organized chronologically for easy browsing.
            </p>
          </div>
        )}

        {/* Stats */}
        {ideas.length > 0 && (
          <div className="mt-12 text-center">
            <div className="inline-flex items-center space-x-6 px-6 py-3 bg-white/60 backdrop-blur-sm rounded-xl border border-gray-200/50">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{ideas.length}</div>
                <div className="text-xs text-gray-500">Ideas Captured</div>
              </div>
              <div className="w-px h-8 bg-gray-200"></div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {new Set(ideas.map(idea => idea.created_at.split('T')[0])).size}
                </div>
                <div className="text-xs text-gray-500">Active Days</div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-16 py-8 text-center text-gray-500 text-sm">
        <p>© 2025 IdeaFlow. Built for creators who never stop thinking.</p>
      </footer>

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          onAuth={handleAuth}
        />
      )}
    </div>
  );
}

export default App;