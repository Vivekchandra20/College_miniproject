/**
 * User Status Component
 * Displays user online/offline status
 */

import React from 'react';
import { getLastSeenText } from '../utils/helpers';

const UserStatus = ({ user }) => {
  if (!user) {
    return null;
  }

  return (
    <div className="flex items-center space-x-2">
      {/* Status Indicator */}
      <div
        className={`w-3 h-3 rounded-full ${
          user.isOnline ? 'bg-green-500' : 'bg-gray-400'
        }`}
      />

      {/* Status Text */}
      <span className="text-xs text-gray-600">
        {getLastSeenText(user)}
      </span>
    </div>
  );
};

export default UserStatus;
