import React, { useState } from 'react';
import { formatTime } from '../utils/helpers';

const MessageBubble = ({ message, isOwn, onDelete, onEdit }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(message.content);

  const handleEditSubmit = () => {
    if (editedContent.trim() && editedContent.trim() !== message.content) {
      onEdit(message._id, editedContent.trim());
    }
    setIsEditing(false);
  };

  return (
    <div
      className={`group flex ${isOwn ? 'justify-end' : 'justify-start'}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`max-w-[82%] rounded-2xl px-4 py-3 shadow-sm transition sm:max-w-[70%] ${
          isOwn
            ? 'rounded-br-md bg-indigo-600 text-white shadow-indigo-900/40'
            : 'rounded-bl-md border border-slate-700 bg-slate-800 text-slate-100'
        }`}
      >
        {!isOwn && (
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-emerald-400">
            {message.sender?.username || 'User'}
          </p>
        )}

        {isEditing ? (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              className="w-full rounded-lg border border-slate-600 bg-slate-900 px-2.5 py-1.5 text-sm text-slate-100 outline-none focus:border-indigo-500"
              autoFocus
            />
            <button
              onClick={handleEditSubmit}
              className="rounded-md bg-emerald-600 px-2 py-1 text-xs font-semibold text-white hover:bg-emerald-500"
            >
              Save
            </button>
            <button
              onClick={() => {
                setIsEditing(false);
                setEditedContent(message.content);
              }}
              className="rounded-md bg-slate-700 px-2 py-1 text-xs font-semibold text-slate-100 hover:bg-slate-600"
            >
              Cancel
            </button>
          </div>
        ) : (
          <p className="text-sm leading-relaxed">{message.content}</p>
        )}

        <div className="mt-2 flex items-center justify-between gap-3">
          <p className={`text-[11px] ${isOwn ? 'text-indigo-100/90' : 'text-slate-400'}`}>
            {formatTime(message.createdAt)} {message.edited ? '• edited' : ''}
          </p>
          {isOwn && isHovered && !isEditing && (
            <div className="flex items-center gap-2 text-[11px]">
              <button
                onClick={() => setIsEditing(true)}
                className="font-medium text-indigo-100 transition hover:text-white"
              >
                Edit
              </button>
              <button
                onClick={() => onDelete(message._id)}
                className="font-medium text-rose-200 transition hover:text-white"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
