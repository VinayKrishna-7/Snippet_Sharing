import React from 'react';
import { Link } from 'react-router-dom';
import { Eye, Clock, ArrowRight } from 'lucide-react';
import { getLanguageMeta } from '../utils/languages';

// Helper for relative time
function formatRelativeTime(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);

  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

export default function SnippetCard({ snippet }) {
  const lang = getLanguageMeta(snippet.language);
  const formattedTime = formatRelativeTime(snippet.createdAt);

  return (
    <div className="group relative flex flex-col justify-between rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 hover:shadow-xl hover:shadow-brand-500/5 transition-all duration-300 overflow-hidden p-5">
      {/* Top row: Language badge & View count */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-800 border border-slate-700/80 text-slate-200">
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: lang.color }}
            />
            {lang.name}
          </span>

          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span className="flex items-center gap-1 font-mono" title={`${snippet.viewCount || 0} views`}>
              <Eye className="w-3.5 h-3.5 text-slate-400" />
              <span>{snippet.viewCount || 0}</span>
            </span>
            <span className="flex items-center gap-1" title={new Date(snippet.createdAt).toLocaleString()}>
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>{formattedTime}</span>
            </span>
          </div>
        </div>

        {/* Title */}
        <Link to={`/s/${snippet.shortId}`} className="block group-hover:text-brand-300 transition-colors">
          <h3 className="text-base font-semibold text-white tracking-tight line-clamp-1 mb-1.5">
            {snippet.title}
          </h3>
        </Link>

        {/* Description */}
        <p className="text-slate-400 text-xs line-clamp-2 leading-relaxed mb-4 min-h-[2.5rem]">
          {snippet.description || 'No description provided for this snippet.'}
        </p>

        {/* Tags */}
        {snippet.tags && snippet.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {snippet.tags.slice(0, 3).map((tag, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-slate-800/80 text-slate-400 border border-slate-700/60 font-mono"
              >
                #{tag}
              </span>
            ))}
            {snippet.tags.length > 3 && (
              <span className="text-[10px] text-slate-500 self-center">
                +{snippet.tags.length - 3} more
              </span>
            )}
          </div>
        )}
      </div>

      {/* Card footer: Open Snippet button */}
      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between mt-auto">
        <span className="text-[11px] text-slate-500 font-mono">
          /s/{snippet.shortId}
        </span>
        <Link
          to={`/s/${snippet.shortId}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-400 group-hover:text-brand-300 transition-colors"
        >
          <span>Open</span>
          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    </div>
  );
}
