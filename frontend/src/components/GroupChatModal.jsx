/**
 * Group Chat Modal Component
 * Modal for creating or managing group chats
 */

import React, { useState } from 'react';
import { chatAPI } from '../services/api';

const GroupChatModal = ({ isOpen, onClose, onGroupCreated }) => {
  const [chatName, setChatName] = useState('');
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [availableUsers, setAvailableUsers] = useState([]);

  /**
   * Handle member selection
   */
  const handleMemberSelect = (userId) => {
    setSelectedMembers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  /**
   * Handle create group
   */
  const handleCreateGroup = async (e) => {
    e.preventDefault();

    if (!chatName.trim()) {
      setError('Chat name is required');
      return;
    }

    if (selectedMembers.length === 0) {
      setError('Select at least one member');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await chatAPI.createGroupChat({
        chatName: chatName.trim(),
        members: selectedMembers,
      });

      onGroupCreated(response.data.chat);
      setChatName('');
      setSelectedMembers([]);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create group');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold text-dark mb-4">Create Group Chat</h2>

        <form onSubmit={handleCreateGroup} className="space-y-4">
          {/* Chat Name */}
          <div>
            <label className="block text-sm font-medium text-dark mb-2">
              Group Name
            </label>
            <input
              type="text"
              value={chatName}
              onChange={(e) => setChatName(e.target.value)}
              placeholder="Enter group name"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              disabled={loading}
            />
          </div>

          {/* Members Selection */}
          <div>
            <label className="block text-sm font-medium text-dark mb-2">
              Select Members
            </label>
            <div className="border border-gray-300 rounded-lg p-2 max-h-48 overflow-y-auto space-y-2">
              {availableUsers.length === 0 ? (
                <p className="text-sm text-gray-500 p-2">
                  No users available
                </p>
              ) : (
                availableUsers.map((user) => (
                  <label key={user._id} className="flex items-center p-2 hover:bg-light rounded cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedMembers.includes(user._id)}
                      onChange={() => handleMemberSelect(user._id)}
                      className="mr-2"
                      disabled={loading}
                    />
                    <span className="text-sm text-dark">{user.username}</span>
                  </label>
                ))
              )}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded">
              {error}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2 border border-gray-300 text-dark rounded-lg hover:bg-light transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !chatName.trim() || selectedMembers.length === 0}
              className="flex-1 px-4 py-2 bg-primary hover:bg-blue-600 text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {loading ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GroupChatModal;
