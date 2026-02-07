/**
 * MessageItem Component
 * Displays a single message in the chat
 */

import React, { useState } from 'react';
import { formatTime } from '../utils/helpers';

const MessageItem = ({ message, isOwn, onDelete, onEdit }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(message.content);

  /**
   * Handle edit submit
   */
  const handleEditSubmit = () => {
    if (editedContent.trim() !== message.content) {
      onEdit(message._id, editedContent.trim());
    }
    setIsEditing(false);
  };

  return (
    <div
      className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-2`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`max-w-xs px-4 py-2 rounded-lg ${
          isOwn
            ? 'bg-primary text-white rounded-br-none'
            : 'bg-gray-200 text-dark rounded-bl-none'
        }`}
      >
        {/* Sender name in group chats */}
        {!isOwn && (
          <p className="font-semibold text-xs mb-1 opacity-75">
            {message.sender.username}
          </p>
        )}

        {/* Message content */}
        {isEditing ? (
          <div className="flex space-x-1">
            <input
              type="text"
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              className="flex-1 px-2 py-1 rounded text-dark text-sm"
              autoFocus
            />
            <button
              onClick={handleEditSubmit}
              className="text-xs hover:opacity-80"
            >
              ✓
            </button>
            <button
              onClick={() => {
                setIsEditing(false);
                setEditedContent(message.content);
              }}
              className="text-xs hover:opacity-80"
            >
              ✕
            </button>
          </div>
        ) : (
          <p className="text-sm break-words">{message.content}</p>
        )}

        {/* Edited indicator */}
        {message.edited && !isEditing && (
          <p className="text-xs opacity-75 mt-1">(edited)</p>
        )}

        {/* Timestamp */}
        <p
          className={`text-xs mt-1 ${
            isOwn ? 'text-blue-100' : 'text-gray-600'
          }`}
        >
          {formatTime(message.createdAt)}
        </p>
      </div>

      {/* Actions */}
      {isOwn && isHovered && (
        <div className="flex space-x-1 ml-2 self-center">
          <button
            onClick={() => setIsEditing(true)}
            className="text-gray-500 hover:text-primary text-sm transition"
            title="Edit message"
          >
            ✎
          </button>
          <button
            onClick={() => onDelete(message._id)}
            className="text-gray-500 hover:text-red-500 text-sm transition"
            title="Delete message"
          >
            🗑
          </button>
        </div>
      )}
    </div>
  );
};

export default MessageItem;
