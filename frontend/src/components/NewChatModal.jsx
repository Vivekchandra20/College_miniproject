/**
 * New Chat Modal Component
 * Modal for starting new direct messages or group chats
 */

import React, { useState, useEffect } from 'react';
import { chatAPI, userAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const NewChatModal = ({ isOpen, onClose, onChatCreated }) => {
  const { user } = useAuth();
  const [mode, setMode] = useState('direct'); // 'direct' or 'group'
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [groupName, setGroupName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Fetch available users
   */
  useEffect(() => {
    if (isOpen && mode === 'direct') {
      fetchUsers();
    }
  }, [isOpen, mode]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await userAPI.getAllUsers();
      console.log('Users fetched:', response.data);
      setUsers(response.data.users || []);
    } catch (err) {
      console.error('Error fetching users:', err);
      console.error('Error response:', err.response?.data);
      setError(err.response?.data?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle user selection for direct message
   */
  const handleSelectUser = async (selectedUser) => {
    try {
      setLoading(true);
      console.log('Starting chat with user:', selectedUser);
      const response = await chatAPI.getOrCreateChat(selectedUser._id);
      console.log('Chat created:', response.data);
      onChatCreated(response.data.chat);
      handleClose();
    } catch (err) {
      console.error('Error starting chat:', err);
      console.error('Error response:', err.response?.data);
      setError(err.response?.data?.message || 'Failed to start chat');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle group creation
   */
  const handleCreateGroup = async (e) => {
    e.preventDefault();

    if (!groupName.trim()) {
      setError('Group name is required');
      return;
    }

    if (selectedUsers.length === 0) {
      setError('Select at least one member');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await chatAPI.createGroupChat({
        chatName: groupName.trim(),
        members: selectedUsers,
      });

      onChatCreated(response.data.chat);
      handleClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create group');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Close modal and reset
   */
  const handleClose = () => {
    setMode('direct');
    setSearchQuery('');
    setSelectedUsers([]);
    setGroupName('');
    setError(null);
    onClose();
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-md max-h-96 flex flex-col">
        {/* Header with Mode Toggle */}
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-dark mb-4">New Chat</h2>
          <div className="flex gap-2">
            <button
              onClick={() => {
                setMode('direct');
                setError(null);
              }}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition ${
                mode === 'direct'
                  ? 'bg-primary text-white'
                  : 'bg-light text-dark hover:bg-gray-300'
              }`}
            >
              Direct Message
            </button>
            <button
              onClick={() => {
                setMode('group');
                setError(null);
              }}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition ${
                mode === 'group'
                  ? 'bg-primary text-white'
                  : 'bg-light text-dark hover:bg-gray-300'
              }`}
            >
              Group Chat
            </button>
          </div>
        </div>

        {/* Direct Message Mode */}
        {mode === 'direct' && (
          <div className="flex-1 overflow-y-auto mb-4">
            <p className="text-sm text-gray-600 mb-3">
              Select a user to start a direct conversation
            </p>
            <input
              type="text"
              placeholder="Search users by username..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary mb-3"
              disabled={loading}
            />
            
            {loading && (
              <p className="text-sm text-gray-500 text-center p-4">
                Loading users...
              </p>
            )}
            
            {!loading && users.length === 0 && (
              <p className="text-sm text-gray-500 text-center p-4">
                No users found. Create another account in a different browser to start chatting!
              </p>
            )}
            
            {!loading && users.length > 0 && (
              <div className="space-y-2 border border-gray-300 rounded-lg p-2 max-h-48 overflow-y-auto">
                {users
                  .filter((u) =>
                    u.username.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map((u) => (
                    <button
                      key={u._id}
                      onClick={() => handleSelectUser(u)}
                      disabled={loading}
                      className="w-full text-left p-3 hover:bg-light rounded-lg transition flex items-center justify-between disabled:opacity-50"
                    >
                      <div>
                        <p className="font-medium text-dark">{u.username}</p>
                        <p className="text-xs text-gray-500">{u.email}</p>
                      </div>
                      <span className={`w-3 h-3 rounded-full ${
                        u.isOnline ? 'bg-green-500' : 'bg-gray-400'
                      }`} />
                    </button>
                  ))}
              </div>
            )}
          </div>
        )}

        {/* Group Chat Mode */}
        {mode === 'group' && (
          <div className="flex-1 overflow-y-auto mb-4">
            {/* Group Name */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-dark mb-2">
                Group Name
              </label>
              <input
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="Enter group name"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                disabled={loading}
              />
            </div>

            {/* Pre-populate message */}
            <p className="text-sm text-gray-500">
              You can add members after creating the group. Start with a name to create the group.
            </p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleClose}
            disabled={loading}
            className="flex-1 px-4 py-2 border border-gray-300 text-dark rounded-lg hover:bg-light transition disabled:opacity-50"
          >
            Cancel
          </button>

          {mode === 'group' && (
            <button
              onClick={() => {
                handleCreateGroup({ preventDefault: () => {} });
              }}
              disabled={loading || !groupName.trim()}
              className="flex-1 px-4 py-2 bg-primary hover:bg-blue-600 text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {loading ? 'Creating...' : 'Create'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default NewChatModal;
