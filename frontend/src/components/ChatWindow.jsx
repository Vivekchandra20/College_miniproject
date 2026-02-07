/**
 * ChatWindow Component
 * Displays messages and input for a selected chat
 */

import React, { useState, useEffect, useRef } from 'react';
import { messageAPI } from '../services/api';
import { messageEvents, typingEvents } from '../services/socket';
import { useAuth } from '../context/AuthContext';
import MessageItem from './MessageItem';
import { formatTime, getAvatarColor, getAvatarInitials, debounce } from '../utils/helpers';

const ChatWindow = ({ chat, onChatUpdated }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  /**
   * Scroll to bottom
   */
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  /**
   * Fetch messages
   */
  const fetchMessages = async () => {
    try {
      setLoading(true);
      console.log(`[ChatWindow] Fetching messages for chat: ${chat._id}`);
      
      const response = await messageAPI.getMessages(chat._id, 50, 0);
      console.log(`[ChatWindow] Messages fetched successfully:`, response.data.messages?.length || 0);
      
      setMessages(response.data.messages || []);

      // Mark all as read
      try {
        await messageAPI.markChatAsRead(chat._id);
        console.log(`[ChatWindow] Chat marked as read: ${chat._id}`);
      } catch (readError) {
        console.warn('[ChatWindow] Failed to mark chat as read:', readError.response?.status, readError.response?.data?.message);
      }
    } catch (error) {
      console.error('[ChatWindow] Failed to fetch messages:', {
        status: error.response?.status,
        message: error.response?.data?.message,
        error: error.message,
      });
      
      alert(`Failed to load messages: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Initialize messages and listeners
   */
  useEffect(() => {
    fetchMessages();

    // Listen for incoming messages
    const handleNewMessage = (data) => {
      if (data.chatId === chat._id) {
        setMessages((prev) => [...prev, data.message]);
      }
    };

    // Listen for typing indicators
    const handleUserTyping = (data) => {
      if (data.chatId === chat._id) {
        setTypingUsers((prev) => {
          if (!prev.includes(data.username)) {
            return [...prev, data.username];
          }
          return prev;
        });
      }
    };

    const handleUserStoppedTyping = (data) => {
      if (data.chatId === chat._id) {
        setTypingUsers((prev) =>
          prev.filter((name) => name !== data.username)
        );
      }
    };

    messageEvents.onMessageReceived(handleNewMessage);
    typingEvents.onUserTyping(handleUserTyping);
    typingEvents.onUserStoppedTyping(handleUserStoppedTyping);

    scrollToBottom();

    return () => {
      // Cleanup
    };
  }, [chat._id]);

  /**
   * Auto-scroll to bottom when new messages arrive
   */
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  /**
   * Debounced typing handler
   */
  const handleTyping = debounce(() => {
    const recipientIds = chat.users
      .filter((u) => u._id !== user?.id)
      .map((u) => u._id);

    typingEvents.stopTyping(chat._id, recipientIds);
    setTypingUsers([]);
  }, 3000);

  /**
   * Handle input change
   */
  const handleInputChange = (e) => {
    setInput(e.target.value);

    if (input.length === 0 && e.target.value.length > 0) {
      // User started typing
      const recipientIds = chat.users
        .filter((u) => u._id !== user?.id)
        .map((u) => u._id);

      typingEvents.startTyping(chat._id, recipientIds, user?.username);
    }

    handleTyping();
  };

  /**
   * Handle send message
   */
  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!input.trim() || !user) {
      console.warn('[ChatWindow] Cannot send message: input empty or user not set');
      return;
    }

    try {
      console.log(`[ChatWindow] Sending message to chat: ${chat._id} | Content length: ${input.trim().length}`);
      
      const response = await messageAPI.sendMessage({
        chatId: chat._id,
        content: input.trim(),
      });

      const message = response.data.message;
      console.log(`[ChatWindow] Message sent successfully | ID: ${message._id}`);
      
      setMessages((prev) => [...prev, message]);
      setInput('');

      // Stop typing indicator
      const recipientIds = chat.users
        .filter((u) => u._id !== user?.id)
        .map((u) => u._id);

      typingEvents.stopTyping(chat._id, recipientIds);

      // Emit via socket
      messageEvents.sendMessage(chat._id, message, recipientIds);
    } catch (error) {
      console.error('[ChatWindow] Failed to send message:', {
        status: error.response?.status,
        message: error.response?.data?.message,
        error: error.message,
      });
      
      // Show user-friendly error
      const errorMsg = error.response?.data?.message || error.message || 'Failed to send message';
      alert(`Error sending message: ${errorMsg}`);
    }
  };

  /**
   * Handle delete message
   */
  const handleDeleteMessage = async (messageId) => {
    try {
      console.log(`[ChatWindow] Deleting message: ${messageId}`);
      await messageAPI.deleteMessage(messageId);
      console.log(`[ChatWindow] Message deleted successfully: ${messageId}`);
      
      setMessages((prev) =>
        prev.filter((msg) => msg._id !== messageId)
      );
    } catch (error) {
      console.error('[ChatWindow] Failed to delete message:', {
        status: error.response?.status,
        message: error.response?.data?.message,
        error: error.message,
      });
      alert(`Failed to delete message: ${error.response?.data?.message || error.message}`);
    }
  };

  /**
   * Handle edit message
   */
  const handleEditMessage = async (messageId, newContent) => {
    try {
      console.log(`[ChatWindow] Editing message: ${messageId}`);
      const response = await messageAPI.editMessage(messageId, newContent);
      console.log(`[ChatWindow] Message edited successfully: ${messageId}`);
      
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === messageId ? response.data.message : msg
        )
      );
    } catch (error) {
      console.error('[ChatWindow] Failed to edit message:', {
        status: error.response?.status,
        message: error.response?.data?.message,
        error: error.message,
      });
      alert(`Failed to edit message: ${error.response?.data?.message || error.message}`);
    }
  };

  // Get chat name
  const chatName = chat.isGroupChat
    ? chat.chatName
    : chat.users.find((u) => u._id !== user?.id)?.username || 'Unknown User';

  const otherUser = chat.users.find((u) => u._id !== user?.id);
  const isOnline = otherUser?.isOnline;
  const avatarColor = getAvatarColor(chatName);

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
            style={{ backgroundColor: avatarColor }}
          >
            {chat.groupPic ? (
              <img
                src={chat.groupPic}
                alt={chatName}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              getAvatarInitials(chatName)
            )}
          </div>
          <div>
            <h2 className="font-bold text-dark">{chatName}</h2>
            {!chat.isGroupChat && otherUser && (
              <p className="text-xs text-gray-500">
                {isOnline ? '🟢 Online' : `Last seen ${formatTime(otherUser.lastSeen)}`}
              </p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2">
          <button className="p-2 hover:bg-light rounded-full transition" title="Video call">
            📞
          </button>
          <button className="p-2 hover:bg-light rounded-full transition" title="More options">
            ⋮
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-light">
        {loading ? (
          <div className="text-center text-gray-500 py-8">
            Loading messages...
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map((message) => (
            <MessageItem
              key={message._id}
              message={message}
              isOwn={message.sender._id === user?.id}
              onDelete={handleDeleteMessage}
              onEdit={handleEditMessage}
            />
          ))
        )}
        {typingUsers.length > 0 && (
          <div className="text-xs text-gray-500 italic p-2">
            {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 p-4">
        <form onSubmit={handleSendMessage} className="flex space-x-2">
          <button
            type="button"
            className="p-2 hover:bg-light rounded-full transition"
            title="Add attachment"
          >
            📎
          </button>
          <input
            type="text"
            value={input}
            onChange={handleInputChange}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 bg-light rounded-full focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button
            type="button"
            className="p-2 hover:bg-light rounded-full transition"
            title="Send emoji"
          >
            😊
          </button>
          <button
            type="submit"
            disabled={!input.trim()}
            className="px-4 py-2 bg-primary hover:bg-blue-600 text-white rounded-full transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatWindow;
