/**
 * Profile Page
 * Dedicated dashboard for user profile
 */

import React, { useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { userAPI } from '../services/api';
import { getAvatarColor, getAvatarInitials } from '../utils/helpers';

const ProfilePage = ({ onBack }) => {
  const { user, updateUser } = useAuth();
  const [profilePic, setProfilePic] = useState(user?.profilePic || '');
  const [preview, setPreview] = useState(user?.profilePic || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const avatarColor = useMemo(
    () => getAvatarColor(user?.username || 'User'),
    [user?.username]
  );

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setPreview(reader.result);
        setProfilePic(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const response = await userAPI.updateProfile(profilePic.trim() || null);
      if (response.data?.user) {
        updateUser({ profilePic: response.data.user.profilePic });
        setPreview(response.data.user.profilePic || '');
      }

      setSuccess('Profile updated successfully');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setProfilePic('');
    setPreview('');
    setSuccess(null);
    setError(null);
  };

  return (
    <div className="min-h-screen profile-shell">
      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="uppercase tracking-[0.35em] text-xs text-slate-500">Profile dashboard</p>
            <h1 className="text-3xl md:text-4xl font-semibold text-slate-900">
              Your account, beautifully organized
            </h1>
          </div>
          <button
            onClick={onBack}
            className="profile-back-btn"
          >
            Back to chat
          </button>
        </div>

        <div className="grid lg:grid-cols-[1.2fr_1fr] gap-8">
          <div className="profile-card">
            <div className="flex items-center gap-5">
              <div
                className="w-20 h-20 rounded-2xl flex items-center justify-center text-white text-2xl font-semibold shadow-lg"
                style={{ backgroundColor: avatarColor }}
              >
                {preview ? (
                  <img
                    src={preview}
                    alt={user?.username || 'Profile'}
                    className="w-full h-full rounded-2xl object-cover"
                  />
                ) : (
                  getAvatarInitials(user?.username || 'User')
                )}
              </div>
              <div>
                <p className="text-sm text-slate-500">Signed in as</p>
                <h2 className="text-2xl font-semibold text-slate-900">{user?.username}</h2>
                <p className="text-sm text-slate-600">{user?.email}</p>
              </div>
            </div>

            <div className="mt-8 space-y-6">
              <div className="profile-field">
                <label className="text-xs uppercase tracking-[0.2em] text-slate-500">
                  Profile image URL
                </label>
                <input
                  type="text"
                  value={profilePic}
                  onChange={(event) => {
                    setProfilePic(event.target.value);
                    setPreview(event.target.value);
                  }}
                  placeholder="Paste image URL"
                  className="profile-input"
                  disabled={loading}
                />
              </div>

              <div className="profile-divider">or upload</div>

              <div className="profile-upload">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  disabled={loading}
                />
              </div>
            </div>

            {error && (
              <div className="profile-alert error">{error}</div>
            )}
            {success && (
              <div className="profile-alert success">{success}</div>
            )}

            <div className="mt-8 flex flex-wrap gap-3">
              <button
                onClick={handleSave}
                disabled={loading}
                className="profile-primary-btn"
              >
                {loading ? 'Saving...' : 'Save changes'}
              </button>
              <button
                onClick={handleReset}
                disabled={loading}
                className="profile-secondary-btn"
              >
                Reset image
              </button>
            </div>
          </div>

          <div className="profile-card subtle">
            <h3 className="text-lg font-semibold text-slate-900">What others see</h3>
            <p className="text-sm text-slate-500 mt-1">
              Your profile image appears in chat lists and headers. No image means your initials stay visible.
            </p>

            <div className="mt-6 profile-preview">
              <div className="profile-preview-card">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-semibold"
                  style={{ backgroundColor: avatarColor }}
                >
                  {preview ? (
                    <img
                      src={preview}
                      alt="Preview"
                      className="w-full h-full rounded-2xl object-cover"
                    />
                  ) : (
                    getAvatarInitials(user?.username || 'User')
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">{user?.username}</p>
                  <p className="text-xs text-slate-500">Hey there! I use this chat app.</p>
                </div>
              </div>
            </div>

            <div className="mt-8 profile-tips">
              <h4 className="text-sm font-semibold text-slate-800">Tips</h4>
              <ul className="text-sm text-slate-600">
                <li>Square images look best.</li>
                <li>Keep it under 1 MB for smooth loading.</li>
                <li>You can always reset to initials.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;