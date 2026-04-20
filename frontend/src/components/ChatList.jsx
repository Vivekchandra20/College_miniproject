/**
 * ChatList Component
 * Displays a single chat item in the chat list
 */

import React from 'react';
import { formatDate, getAvatarInitials, getAvatarColor, truncateText } from '../utils/helpers';

const ChatList = ({ chat, isSelected, onSelect, currentUserId }) => {
  // Get chat name
  const chatName = chat.isGroupChat
    ? chat.chatName
    : chat.users.find((user) => user._id !== currentUserId)?.username ||
      'Unknown User';

  // Get last message preview
  const lastMessage = chat.lastMessage;
  const lastMessagePreview = lastMessage
    ? `${lastMessage.sender.username}: ${truncateText(lastMessage.content, 40)}`
    : 'No messages yet';

  // Get unread count (you can implement this based on your needs)
  const unreadCount = 0;

  // Get avatar color
  const avatarColor = getAvatarColor(chatName);

  return (
    <button
      onClick={() => onSelect(chat)}
      className={`w-full rounded-xl p-3 text-left transition ${
        isSelected
          ? 'bg-slate-700/70 ring-1 ring-indigo-400/30'
          : 'hover:bg-slate-800/90'
      }`}
    >
      <div className="flex items-center space-x-3">
        {/* Avatar */}
        <div
          className="h-11 w-11 flex-shrink-0 rounded-xl flex items-center justify-center text-white font-bold shadow-md"
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

        {/* Chat Info */}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start">
            <h3 className="truncate text-sm font-semibold text-slate-100">{chatName}</h3>
            <span className="ml-2 flex-shrink-0 text-[11px] text-slate-400">
              {lastMessage ? formatDate(lastMessage.createdAt) : ''}
            </span>
          </div>
          <p className="truncate text-xs text-slate-400">
            {lastMessagePreview}
          </p>
        </div>

        {/* Unread Badge */}
        {unreadCount > 0 && (
          <span className="bg-primary text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0">
            {unreadCount}
          </span>
        )}
      </div>
    </button>
  );
};

export default ChatList;
