import React from 'react';

const InputBox = ({ value, onChange, onSubmit, disabled }) => {
  return (
    <form onSubmit={onSubmit} className="flex items-end gap-2 sm:gap-3">
      <button
        type="button"
        className="hidden rounded-xl border border-slate-700 bg-slate-800 p-2 text-slate-300 transition hover:border-slate-500 hover:text-slate-100 sm:inline-flex"
        title="Attach file"
      >
        +
      </button>

      <div className="flex-1 rounded-2xl border border-slate-700 bg-slate-800/90 px-3 py-2 shadow-inner">
        <input
          type="text"
          value={value}
          onChange={onChange}
          placeholder="Type a message"
          className="w-full bg-transparent text-sm text-slate-100 outline-none placeholder:text-slate-500"
        />
      </div>

      <button
        type="submit"
        disabled={disabled}
        className="rounded-2xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/30 transition hover:-translate-y-0.5 hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Send
      </button>
    </form>
  );
};

export default InputBox;
