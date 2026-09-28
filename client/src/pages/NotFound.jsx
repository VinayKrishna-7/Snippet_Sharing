import React from 'react';
import { Link } from 'react-router-dom';
import { Terminal, Home, PlusCircle, Compass } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 py-16">
      {/* Terminal Icon Box */}
      <div className="w-20 h-20 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-center text-brand-400 mb-6 shadow-2xl">
        <Terminal className="w-10 h-10" />
      </div>

      <span className="text-xs font-mono font-bold uppercase tracking-widest text-brand-400 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 mb-4">
        HTTP 404 Error
      </span>

      <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight mb-3">
        Snippet Not Found
      </h1>

      <p className="text-slate-400 text-sm max-w-md mx-auto mb-8 leading-relaxed font-mono">
        The requested path does not exist, has expired, or has been moved to a different address.
      </p>

      {/* Navigation Options */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
        >
          <Home className="w-4 h-4 text-slate-400" />
          <span>Return Home</span>
        </Link>

        <Link
          to="/snippets"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
        >
          <Compass className="w-4 h-4 text-slate-400" />
          <span>Browse Snippets</span>
        </Link>

        <Link
          to="/create"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-medium transition-colors shadow-md shadow-brand-500/20"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Create New Snippet</span>
        </Link>
      </div>
    </div>
  );
}
