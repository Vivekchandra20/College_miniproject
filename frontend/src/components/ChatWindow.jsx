/**
 * ChatWindow Component
 * Displays messages and input for a selected chat
 */

import React, { useState, useEffect, useRef } from 'react';
import { messageAPI } from '../services/api';
import { messageEvents, typingEvents } from '../services/socket';
import { useAuth } from '../context/AuthContext';
import MessageBubble from './MessageBubble';
import InputBox from './InputBox';
import { formatTime, getAvatarColor, getAvatarInitials, debounce } from '../utils/helpers';

const ChatWindow = ({ chat, onBack }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const messagesEndRef = useRef(null);

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
        setMessages((prev) => {
          const alreadyExists = prev.some((msg) => msg._id === data.message?._id);
          return alreadyExists ? prev : [...prev, data.message];
        });
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

    const unsubscribeMessage = messageEvents.onMessageReceived(handleNewMessage);
    const unsubscribeTyping = typingEvents.onUserTyping(handleUserTyping);
    const unsubscribeStopTyping = typingEvents.onUserStoppedTyping(handleUserStoppedTyping);

    scrollToBottom();

    return () => {
      unsubscribeMessage?.();
      unsubscribeTyping?.();
      unsubscribeStopTyping?.();
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
      
      setMessages((prev) => {
        const alreadyExists = prev.some((msg) => msg._id === message._id);
        return alreadyExists ? prev : [...prev, message];
      });
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
    <div className="flex h-full flex-col">
      {/* Chat Header */}
      <div className="border-b border-slate-700/60 bg-slate-900/80 p-4 backdrop-blur-xl">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="inline-flex rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1.5 text-sm text-slate-200 transition hover:bg-slate-700 lg:hidden"
              title="Back to chats"
            >
              Back
            </button>
          <div
              className="flex h-10 w-10 items-center justify-center rounded-xl text-white font-bold shadow-md"
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
              <h2 className="text-base font-semibold text-slate-100">{chatName}</h2>
            {!chat.isGroupChat && otherUser && (
                <p className="text-xs text-slate-400">
                  {isOnline ? 'Online' : `Last seen ${formatTime(otherUser.lastSeen)}`}
              </p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
          <div className="flex space-x-2">
            <button className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-300 transition hover:bg-slate-700 hover:text-slate-100" title="Video call">
              Call
            </button>
            <button className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-300 transition hover:bg-slate-700 hover:text-slate-100" title="More options">
              More
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto bg-slate-900/30 p-4 sm:p-5">
        <div className="mx-auto w-full max-w-4xl space-y-3">
          {loading ? (
            <div className="rounded-xl border border-slate-700 bg-slate-800/70 py-6 text-center text-sm text-slate-400">
              Loading messages...
            </div>
          ) : messages.length === 0 ? (
            <div className="rounded-xl border border-slate-700 bg-slate-800/70 py-6 text-center text-sm text-slate-400">
              No messages yet. Start the conversation.
            </div>
          ) : (
            messages.map((message) => (
              <MessageBubble
                key={message._id}
                message={message}
                isOwn={message.sender._id === user?.id}
                onDelete={handleDeleteMessage}
                onEdit={handleEditMessage}
              />
            ))
          )}

          {typingUsers.length > 0 && (
            <div className="text-xs italic text-slate-400">
              {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t border-slate-700/60 bg-slate-900/85 p-3 sm:p-4">
        <div className="mx-auto w-full max-w-4xl">
          <InputBox
            value={input}
            onChange={handleInputChange}
            onSubmit={handleSendMessage}
            disabled={!input.trim()}
          />
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
