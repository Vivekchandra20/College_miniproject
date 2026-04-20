import React from 'react';
import ChatList from './ChatList';

const Sidebar = ({
  user,
  chats,
  selectedChat,
  searchQuery,
  setSearchQuery,
  loading,
  error,
  onSelectChat,
  onOpenNewChat,
  onLogout,
  viewMode,
  onSwitchMode,
}) => {
  return (
    <aside className="flex h-full w-full flex-col border-r border-slate-700/60 bg-slate-900/85 backdrop-blur-xl">
      <div className="border-b border-slate-700/60 p-4">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Workspace</p>
            <h1 className="mt-1 text-xl font-semibold text-slate-100">Conversations</h1>
            <p className="mt-1 text-sm text-slate-400">{user?.username || 'Guest'}</p>
          </div>
          <button
            onClick={onOpenNewChat}
            className="rounded-xl border border-indigo-500/40 bg-indigo-600/80 px-3 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition hover:-translate-y-0.5 hover:bg-indigo-500"
            title="Start new chat"
          >
            New
          </button>
        </div>

        <div className="mb-3 grid grid-cols-2 gap-2">
          <button
            onClick={() => onSwitchMode('chats')}
            className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
              viewMode === 'chats'
                ? 'bg-slate-700 text-slate-100'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700/80 hover:text-slate-200'
            }`}
          >
            Chats
          </button>
          <button
            onClick={() => onSwitchMode('dashboard')}
            className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
              viewMode === 'dashboard'
                ? 'bg-slate-700 text-slate-100'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700/80 hover:text-slate-200'
            }`}
          >
            Dashboard
          </button>
        </div>

        <label className="relative block" htmlFor="chatSearch">
          <input
            id="chatSearch"
            type="text"
            placeholder="Search chats"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30"
          />
        </label>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {loading ? (
          <div className="rounded-xl border border-slate-700 bg-slate-800/70 p-4 text-center text-sm text-slate-400">
            Loading chats...
          </div>
        ) : error ? (
          <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-center text-sm text-rose-300">
            {error}
          </div>
        ) : chats.length === 0 ? (
          <div className="rounded-xl border border-slate-700 bg-slate-800/70 p-4 text-center text-sm text-slate-400">
            {searchQuery ? 'No matching conversations.' : 'No chats yet. Start a new conversation.'}
          </div>
        ) : (
          <div className="space-y-1">
            {chats.map((chat) => (
              <ChatList
                key={chat._id}
                chat={chat}
                isSelected={selectedChat?._id === chat._id}
                onSelect={onSelectChat}
                currentUserId={user?.id}
              />
            ))}
          </div>
        )}
      </div>

      <div className="border-t border-slate-700/60 p-4">
        <button
          onClick={onLogout}
          className="w-full rounded-xl border border-rose-500/40 bg-rose-600/90 px-3 py-2.5 text-sm font-semibold text-white shadow-lg shadow-rose-600/20 transition hover:bg-rose-500"
        >
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
