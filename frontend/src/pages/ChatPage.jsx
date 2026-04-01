/**
 * Chat Page
 * Main chat interface
 */

import React, { useState, useEffect } from 'react';
import ChatList from '../components/ChatList';
import ChatWindow from '../components/ChatWindow';
import NewChatModal from '../components/NewChatModal';
import { chatAPI } from '../services/api';
import { messageEvents, getSocket } from '../services/socket';
import { useAuth } from '../context/AuthContext';

const ChatPage = ({ onOpenProfile }) => {
  const { user, logout } = useAuth();
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showNewChat, setShowNewChat] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [unreadCounts, setUnreadCounts] = useState({});

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

  useEffect(() => {
    const handleIncomingMessage = async (data) => {
      if (!data?.chatId || !data?.message) {
        return;
      }

      let exists = false;

      setChats((prevChats) => {
        const chatIndex = prevChats.findIndex((chat) => chat._id === data.chatId);

        if (chatIndex === -1) {
          exists = false;
          return prevChats;
        }

        exists = true;
        const updatedChat = {
          ...prevChats[chatIndex],
          lastMessage: data.message,
          updatedAt: data.message.createdAt || prevChats[chatIndex].updatedAt,
        };

        const nextChats = prevChats.filter((_, index) => index !== chatIndex);
        return [updatedChat, ...nextChats];
      });

      if (!exists) {
        try {
          const response = await chatAPI.getChatById(data.chatId);
          if (response.data?.chat) {
            setChats((prevChats) => [response.data.chat, ...prevChats]);
          }
        } catch (error) {
          console.warn('[ChatPage] Failed to fetch chat for incoming message');
        }
      }

      if (selectedChat?._id !== data.chatId) {
        setUnreadCounts((prev) => ({
          ...prev,
          [data.chatId]: (prev[data.chatId] || 0) + 1,
        }));
      }
    };

    messageEvents.onMessageReceived(handleIncomingMessage);

    return () => {
      const socket = getSocket();
      socket.off('receive-message', handleIncomingMessage);
    };
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
    setUnreadCounts((prev) => ({
      ...prev,
      [chat._id]: 0,
    }));
  };

  /**
   * Handle new chat created
   */
  const handleNewChat = (newChat) => {
    setChats((prev) => [newChat, ...prev]);
    setSelectedChat(newChat);
    setUnreadCounts((prev) => ({
      ...prev,
      [newChat._id]: 0,
    }));
    setShowNewChat(false);
  };

  const handleChatUpdated = (updatedChat) => {
    if (!updatedChat?._id) {
      return;
    }

    setChats((prevChats) =>
      prevChats.map((chat) =>
        chat._id === updatedChat._id ? { ...chat, ...updatedChat } : chat
      )
    );

    if (selectedChat?._id === updatedChat._id) {
      setSelectedChat((prev) => ({ ...prev, ...updatedChat }));
    }
  };

  return (
    <div className="flex h-screen bg-[#fff4e6]">
      {/* Left Sidebar - Chat List */}
      <div className="w-80 bg-white/90 backdrop-blur border-r border-amber-100 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-amber-100 bg-white">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-dark">Messages</h1>
              <p className="text-xs text-gray-500 mt-1">{user?.username}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenProfile}
                className="px-3 py-1.5 text-sm bg-white border border-gray-200 text-dark rounded-full hover:bg-light transition"
                title="Profile"
              >
                Profile
              </button>
              <button
                onClick={() => setShowNewChat(true)}
                className="p-2 hover:bg-light rounded-full transition"
                title="New chat"
              >
                ✎
              </button>
              <button
                onClick={logout}
                className="px-3 py-1.5 text-sm bg-red-500 hover:bg-red-600 text-white rounded-lg transition"
                title="Logout"
              >
                🚪
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <input
            type="text"
            placeholder="Search chats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 bg-light rounded-full focus:outline-none focus:ring-2 focus:ring-primary"
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
                unreadCount={unreadCounts[chat._id] || 0}
              />
            ))
          )}
        </div>
      </div>

      {/* Right Side - Chat Window */}
      <div className="flex-1 bg-white">
        {selectedChat ? (
          <ChatWindow chat={selectedChat} onChatUpdated={handleChatUpdated} />
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
