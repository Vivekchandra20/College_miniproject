/**
 * Chat Page
 * Main chat interface
 */

import React, { useState, useEffect } from 'react';
import ChatList from '../components/ChatList';
import ChatWindow from '../components/ChatWindow';
import { chatAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const ChatPage = () => {
  const { user } = useAuth();
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showNewChat, setShowNewChat] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

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
    const chatName = chat.chatName || chat.isGroupChat
      ? chat.chatName
      : chat.users?.[0]?.username || '';

    return chatName.toLowerCase().includes(searchQuery.toLowerCase());
  });

  /**
   * Handle chat select
   */
  const handleSelectChat = (chat) => {
    setSelectedChat(chat);
  };

  /**
   * Handle new chat created
   */
  const handleNewChat = (newChat) => {
    setChats((prev) => [newChat, ...prev]);
    setSelectedChat(newChat);
    setShowNewChat(false);
  };

  return (
    <div className="flex h-screen bg-light">
      {/* Left Sidebar - Chat List */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-dark">Messages</h1>
            <button
              onClick={() => setShowNewChat(!showNewChat)}
              className="p-2 hover:bg-light rounded-full transition"
              title="New chat"
            >
              ✎
            </button>
          </div>

          {/* Search Bar */}
          <input
            type="text"
            placeholder="Search chats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 bg-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-gray-500">
              Loading chats...
            </div>
          ) : error ? (
            <div className="p-4 text-center text-red-500">{error}</div>
          ) : filteredChats.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              {searchQuery
                ? 'No chats found'
                : 'No chats yet. Start a new conversation!'}
            </div>
          ) : (
            filteredChats.map((chat) => (
              <ChatList
                key={chat._id}
                chat={chat}
                isSelected={selectedChat?._id === chat._id}
                onSelect={handleSelectChat}
                currentUserId={user?.id}
              />
            ))
          )}
        </div>
      </div>

      {/* Right Side - Chat Window */}
      <div className="flex-1 bg-white">
        {selectedChat ? (
          <ChatWindow chat={selectedChat} onChatUpdated={handleNewChat} />
        ) : (
          <div className="h-full flex items-center justify-center text-gray-500">
            <div className="text-center">
              <p className="text-xl font-medium mb-2">
                Select a chat to start messaging
              </p>
              <p className="text-sm">Or start a new conversation</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;
