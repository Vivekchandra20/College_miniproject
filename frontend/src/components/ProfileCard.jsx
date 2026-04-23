import React from 'react';
import { getAvatarInitials } from '../utils/helpers';

const ProfileCard = ({ user, onLogout }) => {
  return (
    <section className="mx-auto w-full max-w-2xl rounded-2xl border border-slate-700/70 bg-slate-900/90 p-6 shadow-2xl shadow-black/20 backdrop-blur-xl sm:p-8">
      <div className="mb-6 flex items-center gap-4">
        <div className="grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-indigo-500 to-emerald-500 text-xl font-bold text-white">
          {getAvatarInitials(user?.username || 'U')}
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Profile Dashboard</p>
          <h2 className="mt-1 text-2xl font-semibold text-slate-100">{user?.username || 'Unknown User'}</h2>
          <p className="mt-1 text-sm text-slate-400">Manage your account details</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="rounded-xl border border-slate-700 bg-slate-800/80 p-4">
          <p className="text-xs uppercase tracking-[0.14em] text-slate-400">Username</p>
          <p className="mt-1 text-base font-medium text-slate-100">{user?.username || 'N/A'}</p>
        </div>

        <div className="rounded-xl border border-slate-700 bg-slate-800/80 p-4">
          <p className="text-xs uppercase tracking-[0.14em] text-slate-400">Registered Email</p>
          <p className="mt-1 text-base font-medium text-slate-100">{user?.email || 'N/A'}</p>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="button"
          className="rounded-xl border border-slate-600 bg-slate-800 px-4 py-2.5 text-sm font-medium text-slate-100 transition hover:bg-slate-700"
        >
          Edit Profile
        </button>
        <button
          type="button"
          onClick={onLogout}
          className="rounded-xl border border-rose-500/40 bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-500"
        >
          Logout
        </button>
      </div>
    </section>
  );
};

export default ProfileCard;
