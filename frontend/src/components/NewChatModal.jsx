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
    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen]);

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
   * Toggle user selection for group members
   */
  const handleToggleGroupUser = (selectedUserId) => {
    setSelectedUsers((prev) =>
      prev.includes(selectedUserId)
        ? prev.filter((id) => id !== selectedUserId)
        : [...prev, selectedUserId]
    );
  };

  /**
   * Handle group creation
   */
  const handleCreateGroup = async () => {
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

  const filteredUsers = users.filter((u) => {
    const isNotCurrentUser = u._id !== user?.id;
    const query = searchQuery.toLowerCase();
    const byUsername = u.username?.toLowerCase().includes(query);
    const byEmail = u.email?.toLowerCase().includes(query);
    return isNotCurrentUser && (byUsername || byEmail);
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
      <div className="flex max-h-[80vh] w-full max-w-md flex-col rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl shadow-black/40">
        {/* Header with Mode Toggle */}
        <div className="mb-4">
          <h2 className="mb-4 text-2xl font-semibold text-slate-100">New Chat</h2>
          <div className="flex gap-2">
            <button
              onClick={() => {
                setMode('direct');
                setError(null);
              }}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition ${
                mode === 'direct'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
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
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
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
              className="mb-3 w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              disabled={loading}
            />
            
            {loading && (
              <p className="p-4 text-center text-sm text-slate-400">
                Loading users...
              </p>
            )}
            
            {!loading && users.length === 0 && (
              <p className="p-4 text-center text-sm text-slate-400">
                No users found. Create another account in a different browser to start chatting!
              </p>
            )}
            
            {!loading && users.length > 0 && (
              <div className="max-h-48 space-y-2 overflow-y-auto rounded-lg border border-slate-700 bg-slate-800/40 p-2">
                {filteredUsers.map((u) => (
                    <button
                      key={u._id}
                      onClick={() => handleSelectUser(u)}
                      disabled={loading}
                      className="flex w-full items-center justify-between rounded-lg p-3 text-left transition hover:bg-slate-700/70 disabled:opacity-50"
                    >
                      <div>
                        <p className="font-medium text-slate-100">{u.username}</p>
                        <p className="text-xs text-slate-400">{u.email}</p>
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
              <label className="mb-2 block text-sm font-medium text-slate-200">
                Group Name
              </label>
              <input
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="Enter group name"
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                disabled={loading}
              />
            </div>

            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm text-slate-300">Select members</p>
              <p className="text-xs text-slate-400">
                {selectedUsers.length} selected
              </p>
            </div>

            <input
              type="text"
              placeholder="Search users by username or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="mb-3 w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              disabled={loading}
            />

            <div className="max-h-48 space-y-2 overflow-y-auto rounded-lg border border-slate-700 bg-slate-800/40 p-2">
              {loading ? (
                <p className="p-3 text-sm text-slate-400">Loading users...</p>
              ) : filteredUsers.length === 0 ? (
                <p className="p-3 text-sm text-slate-400">No users found.</p>
              ) : (
                filteredUsers.map((u) => {
                  const isSelected = selectedUsers.includes(u._id);

                  return (
                    <button
                      key={u._id}
                      type="button"
                      onClick={() => handleToggleGroupUser(u._id)}
                      className={`flex w-full items-center justify-between rounded-lg p-3 text-left transition ${
                        isSelected
                          ? 'border border-indigo-500/60 bg-indigo-500/20'
                          : 'hover:bg-slate-700/70'
                      }`}
                    >
                      <div>
                        <p className="font-medium text-slate-100">{u.username}</p>
                        <p className="text-xs text-slate-400">{u.email}</p>
                      </div>
                      <span
                        className={`rounded-md px-2 py-1 text-xs font-semibold ${
                          isSelected
                            ? 'bg-indigo-500 text-white'
                            : 'bg-slate-700 text-slate-300'
                        }`}
                      >
                        {isSelected ? 'Added' : 'Add'}
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-4 rounded-lg border border-rose-500/40 bg-rose-500/10 px-4 py-2 text-sm text-rose-200">
            {error}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleClose}
            disabled={loading}
            className="flex-1 rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-slate-200 transition hover:bg-slate-700 disabled:opacity-50"
          >
            Cancel
          </button>

          {mode === 'group' && (
            <button
              onClick={handleCreateGroup}
              disabled={loading || !groupName.trim() || selectedUsers.length === 0}
              className="flex-1 rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
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
