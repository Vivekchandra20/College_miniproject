/**
 * Chat Page
 * Main chat interface
 */

import React, { useState, useEffect } from 'react';
import ChatWindow from '../components/ChatWindow';
import NewChatModal from '../components/NewChatModal';
import Sidebar from '../components/Sidebar';
import ProfileCard from '../components/ProfileCard';
import { chatAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const ChatPage = () => {
  const { user, logout } = useAuth();
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showNewChat, setShowNewChat] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('chats');

  /**
   * Fetch all chats
   */
  const fetchChats = async () => {
    try {
      setLoading(true);
      const response = await chatAPI.getAllChats();
      setChats(response.data.chats || []);
    } catch (err) {
      console.error('Fetch chats error:', err);
      setError('Failed to load chats');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Initialize chats
   */
  useEffect(() => {
    fetchChats();
  }, []);

  /**
   * Filter chats based on search
   */
  const filteredChats = chats.filter((chat) => {
    const chatName = chat.isGroupChat
      ? chat.chatName || 'Group Chat'
      : chat.users?.find((chatUser) => chatUser._id !== user?.id)?.username || 'Unknown User';

    return chatName.toLowerCase().includes(searchQuery.toLowerCase());
  });

  /**
   * Handle chat select
   */
  const handleSelectChat = (chat) => {
    setViewMode('chats');
    setSelectedChat(chat);
  };

  /**
   * Handle new chat created
   */
  const handleNewChat = (newChat) => {
    setChats((prev) => [newChat, ...prev]);
    setSelectedChat(newChat);
    setViewMode('chats');
    setShowNewChat(false);
  };

  const isMainVisibleOnMobile = viewMode === 'dashboard' || (viewMode === 'chats' && Boolean(selectedChat));

  return (
    <div className="min-h-screen bg-slate-950 px-3 py-4 text-slate-100 sm:px-5">
      <div className="relative mx-auto h-[calc(100vh-2rem)] max-w-7xl overflow-hidden rounded-3xl border border-slate-700/50 bg-slate-900/70 shadow-2xl shadow-black/35 backdrop-blur-xl">
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top_right,_rgba(79,70,229,0.18),_transparent_50%),radial-gradient(circle_at_bottom_left,_rgba(34,197,94,0.14),_transparent_45%)]" />

        <div className="relative grid h-full grid-cols-1 lg:grid-cols-[330px_1fr]">
          <div className={`${isMainVisibleOnMobile ? 'hidden lg:block' : 'block'} h-full`}>
            <Sidebar
              user={user}
              chats={filteredChats}
              selectedChat={selectedChat}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              loading={loading}
              error={error}
              onSelectChat={handleSelectChat}
              onOpenNewChat={() => setShowNewChat(true)}
              onLogout={logout}
              viewMode={viewMode}
              onSwitchMode={setViewMode}
            />
          </div>

          <main className={`${isMainVisibleOnMobile ? 'flex' : 'hidden lg:flex'} h-full flex-col`}>
            {viewMode === 'dashboard' ? (
              <div className="flex h-full items-center justify-center p-4 sm:p-8">
                <div className="w-full space-y-4">
                  <button
                    onClick={() => setViewMode('chats')}
                    className="inline-flex rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-200 transition hover:bg-slate-700 lg:hidden"
                  >
                    Back to chats
                  </button>
                  <ProfileCard user={user} onLogout={logout} />
                </div>
              </div>
            ) : selectedChat ? (
              <ChatWindow chat={selectedChat} onBack={() => setSelectedChat(null)} />
            ) : (
              <div className="flex h-full items-center justify-center p-6">
                <div className="max-w-md text-center">
                  <h2 className="text-2xl font-semibold text-slate-100">Choose a conversation</h2>
                  <p className="mt-3 text-sm text-slate-400">
                    Select a chat from the sidebar or create a new one to start messaging.
                  </p>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* New Chat Modal */}
      <NewChatModal
        isOpen={showNewChat}
        onClose={() => setShowNewChat(false)}
        onChatCreated={handleNewChat}
      />
    </div>
  );
};

export default ChatPage;
