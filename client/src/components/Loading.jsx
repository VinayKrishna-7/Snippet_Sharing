import React from 'react';
import { Loader2 } from 'lucide-react';

export function Spinner({ size = 'md', text = '', className = '' }) {
  const sizeMap = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  return (
    <div className={`flex items-center justify-center gap-2.5 text-slate-400 ${className}`}>
      <Loader2 className={`${sizeMap[size] || sizeMap.md} animate-spin text-brand-500`} />
      {text && <span className="text-sm font-medium">{text}</span>}
    </div>
  );
}

export function FullPageLoading({ message = 'Loading SnipDrop...' }) {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
      <Loader2 className="w-10 h-10 animate-spin text-brand-500" />
      <p className="text-sm font-mono text-slate-400 animate-pulse">{message}</p>
    </div>
  );
}

export function SnippetCardSkeleton() {
  return (
    <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-5 space-y-4 animate-pulse">
      <div className="flex justify-between items-center">
        <div className="h-6 w-24 bg-slate-800 rounded-md" />
        <div className="h-4 w-16 bg-slate-800 rounded" />
      </div>
      <div className="space-y-2">
        <div className="h-5 w-3/4 bg-slate-800 rounded" />
        <div className="h-4 w-full bg-slate-800/60 rounded" />
        <div className="h-4 w-2/3 bg-slate-800/60 rounded" />
      </div>
      <div className="flex gap-2">
        <div className="h-5 w-12 bg-slate-800 rounded-full" />
        <div className="h-5 w-14 bg-slate-800 rounded-full" />
      </div>
      <div className="pt-3 border-t border-slate-800/80 flex justify-between">
        <div className="h-4 w-16 bg-slate-800 rounded" />
        <div className="h-4 w-12 bg-slate-800 rounded" />
      </div>
    </div>
  );
}

export function SnippetViewSkeleton() {
  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-pulse">
      <div className="h-8 w-40 bg-slate-800 rounded" />
      <div className="space-y-3">
        <div className="h-10 w-2/3 bg-slate-800 rounded-lg" />
        <div className="h-5 w-1/2 bg-slate-800/60 rounded" />
      </div>
      <div className="flex gap-4">
        <div className="h-6 w-20 bg-slate-800 rounded" />
        <div className="h-6 w-20 bg-slate-800 rounded" />
        <div className="h-6 w-24 bg-slate-800 rounded" />
      </div>
      <div className="h-96 w-full bg-slate-900 border border-slate-800 rounded-xl" />
    </div>
  );
}

export default Spinner;
