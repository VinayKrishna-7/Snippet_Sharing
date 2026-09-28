import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Copy,
  Check,
  Share2,
  ArrowLeft,
  Eye,
  Calendar,
  Clock,
  AlertCircle,
  Download,
  Trash2,
  PlusCircle,
} from 'lucide-react';
import Editor from '@monaco-editor/react';
import { snippetApi, getErrorMessage } from '../services/api';
import { useToast } from '../components/Toast';
import { getLanguageMeta } from '../utils/languages';
import { SnippetViewSkeleton } from '../components/Loading';

export default function ViewSnippet() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [snippet, setSnippet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isExpired, setIsExpired] = useState(false);

  // Action states
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showRaw, setShowRaw] = useState(false);

  // Check if current client has delete token stored locally for this snippet
  const localDeleteToken = typeof window !== 'undefined'
    ? localStorage.getItem(`snipdrop_token_${id}`)
    : null;

  // Fetch snippet data
  const loadSnippet = useCallback(async () => {
    setLoading(true);
    setError(null);
    setIsExpired(false);

    try {
      const response = await snippetApi.getSnippetById(id);
      if (response.success && (response.data || response.snippet)) {
        setSnippet(response.data || response.snippet);
      } else {
        setError('Snippet could not be retrieved.');
      }
    } catch (err) {
      if (err.response && err.response.status === 410) {
        setIsExpired(true);
      } else {
        setError(getErrorMessage(err));
      }
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadSnippet();
  }, [loadSnippet]);

  // Copy Code to Clipboard (Section 6 Requirement)
  const handleCopyCode = async () => {
    if (!snippet?.code) return;
    try {
      await navigator.clipboard.writeText(snippet.code);
      setCopiedCode(true);
      showToast('Code copied to clipboard!', 'success');
      setTimeout(() => setCopiedCode(false), 2500);
    } catch {
      showToast('Failed to copy code to clipboard.', 'error');
    }
  };

  // Share snippet via Web Share API or copy URL (Section 6 Requirement)
  const handleShare = async () => {
    const url = window.location.href;
    const shareData = {
      title: `${snippet?.title || 'Snippet'} - SnipDrop`,
      text: `Check out this ${snippet?.language || ''} snippet on SnipDrop:`,
      url: url,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        showToast('Shared successfully!', 'success');
        return;
      } catch (err) {
        // User cancelled or share failed, fallback to copy URL
        if (err.name !== 'AbortError') {
          console.warn('Web Share failed, falling back to copy URL', err);
        }
      }
    }

    // Fallback: Copy link
    try {
      await navigator.clipboard.writeText(url);
      setCopiedLink(true);
      showToast('Shareable link copied to clipboard!', 'success');
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      showToast('Failed to copy link.', 'error');
    }
  };

  // Download snippet as file
  const handleDownload = () => {
    if (!snippet) return;
    const langMeta = getLanguageMeta(snippet.language);
    const filename = `${snippet.title.replace(/[^a-z0-9_-]/gi, '_').toLowerCase()}${langMeta.ext || '.txt'}`;
    const blob = new Blob([snippet.code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast(`Downloaded as ${filename}`, 'info');
  };

  // Delete snippet using deleteToken
  const handleDelete = async (customToken) => {
    const token = customToken || localDeleteToken;
    if (!token) {
      showToast('No deletion token found.', 'error');
      return;
    }

    setIsDeleting(true);
    try {
      const res = await snippetApi.deleteSnippet(id, token);
      if (res.success) {
        localStorage.removeItem(`snipdrop_token_${id}`);
        showToast('Snippet deleted permanently.', 'success');
        navigate('/snippets');
      } else {
        showToast(res.message || 'Failed to delete snippet.', 'error');
      }
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    } finally {
      setIsDeleting(false);
      setDeleteModalOpen(false);
    }
  };

  // 1. Expired Snippet View (Section 8 Requirement)
  if (isExpired) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-6">
          <Clock className="w-8 h-8" />
        </div>
        <h2 className="text-3xl font-extrabold text-white mb-3">
          This snippet has expired.
        </h2>
        <p className="text-slate-400 text-sm leading-relaxed mb-8">
          The creator configured this snippet to automatically expire.
          Its code content has been permanently removed from the server.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/create"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-sm font-semibold transition-colors shadow-lg shadow-brand-500/20"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create New Snippet</span>
          </Link>
          <Link
            to="/snippets"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium transition-colors"
          >
            <span>Browse Snippets</span>
          </Link>
        </div>
      </div>
    );
  }

  // 2. Loading State
  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12">
        <SnippetViewSkeleton />
      </div>
    );
  }

  // 3. Error State (Not Found or Server Error)
  if (error || !snippet) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Snippet Not Found</h2>
        <p className="text-slate-400 text-sm mb-8 leading-relaxed">
          {error || "The snippet you are looking for doesn't exist or has been removed."}
        </p>
        <div className="flex justify-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
          >
            Go Back
          </button>
          <Link
            to="/create"
            className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold"
          >
            Create Snippet
          </Link>
        </div>
      </div>
    );
  }

  const langMeta = getLanguageMeta(snippet.language);
  const lineCount = snippet.code ? snippet.code.split('\n').length : 1;
  const editorHeight = Math.min(750, Math.max(280, lineCount * 22 + 40));

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Top Navigation Row: Back Button */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-white transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span>Back</span>
        </button>

        <div className="flex items-center gap-2">
          {localDeleteToken && (
            <button
              type="button"
              onClick={() => setDeleteModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-medium transition-colors"
              title="You created this snippet. Click to delete."
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>
          )}

          <Link
            to="/create"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-brand-400 hover:text-brand-300 border border-slate-700 text-xs font-medium transition-colors"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>New</span>
          </Link>
        </div>
      </div>

      {/* Snippet Header Info */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 mb-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="space-y-3 flex-1">
            {/* Language and Expire tags */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-800 border border-slate-700 text-slate-200">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: langMeta.color }}
                />
                {langMeta.name}
              </span>

              {snippet.expiresAt ? (
                <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/20">
                  <Clock className="w-3 h-3" />
                  Expires {new Date(snippet.expiresAt).toLocaleDateString()}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-md bg-slate-800/80 text-slate-400 border border-slate-700/60">
                  Never expires
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight break-words">
              {snippet.title}
            </h1>

            {/* Description */}
            {snippet.description && (
              <p className="text-slate-300 text-sm leading-relaxed max-w-3xl whitespace-pre-line">
                {snippet.description}
              </p>
            )}

            {/* Tags */}
            {snippet.tags && snippet.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {snippet.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-mono bg-slate-800 text-slate-300 border border-slate-700/60"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Meta counters (Views, Created Date) */}
          <div className="flex md:flex-col items-center md:items-end justify-between gap-3 text-xs text-slate-400 pt-3 md:pt-0 border-t md:border-t-0 border-slate-800">
            {/* View counter (Section 7: 127 views) */}
            <div className="flex items-center gap-1.5 font-mono text-slate-200 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800">
              <Eye className="w-4 h-4 text-brand-400" />
              <span className="font-semibold text-white">{snippet.viewCount || 0}</span>
              <span>{(snippet.viewCount || 0) === 1 ? 'view' : 'views'}</span>
            </div>

            {/* Created time */}
            <div className="flex items-center gap-1.5 text-slate-400">
              <Calendar className="w-3.5 h-3.5" />
              <span>Created {new Date(snippet.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Code Viewer Container */}
      <div className="rounded-2xl border border-slate-700/80 bg-slate-900/90 shadow-2xl overflow-hidden mb-8">
        {/* Viewer Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-2 font-mono text-xs text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
            <span className="ml-2 font-semibold text-slate-200">{snippet.title}</span>
            <span className="text-slate-500">({lineCount} lines)</span>
          </div>

          {/* Action Buttons: Copy Code, Share, Download, Raw (Section 6 Requirement) */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Raw Toggle */}
            <button
              type="button"
              onClick={() => setShowRaw(!showRaw)}
              className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-medium border border-slate-700 transition-colors"
            >
              {showRaw ? 'Editor View' : 'Raw Text'}
            </button>

            {/* Download */}
            <button
              type="button"
              onClick={handleDownload}
              title="Download file"
              className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-medium border border-slate-700 transition-colors flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden sm:inline">Download</span>
            </button>

            {/* Share Button (Web Share API with copy fallback) */}
            <button
              type="button"
              onClick={handleShare}
              className="px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-medium border border-slate-700 transition-colors flex items-center gap-1.5"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 font-semibold">Link Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 text-slate-400" />
                  <span>Share</span>
                </>
              )}
            </button>

            {/* Copy Code Button (Section 6 Requirement: changes to ✓ Copied) */}
            <button
              type="button"
              onClick={handleCopyCode}
              className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-md shadow-brand-500/20 transition-all active:scale-95 flex items-center gap-1.5 border border-brand-400/30"
            >
              {copiedCode ? (
                <>
                  <Check className="w-4 h-4 text-white" />
                  <span>✓ Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Code</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Code Content */}
        {showRaw ? (
          <div className="p-4 bg-[#1e1e1e] overflow-x-auto text-xs font-mono text-slate-200 leading-relaxed selection:bg-brand-500">
            <pre>{snippet.code}</pre>
          </div>
        ) : (
          <div className="bg-[#1e1e1e] overflow-hidden">
            <Editor
              height={`${editorHeight}px`}
              language={langMeta.monaco || 'javascript'}
              value={snippet.code}
              theme="vs-dark"
              options={{
                readOnly: true,
                domReadOnly: true,
                fontSize: 14,
                lineNumbers: 'on',
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                automaticLayout: true,
                tabSize: 2,
                wordWrap: 'on',
                fontFamily: '"JetBrains Mono", "Fira Code", Consolas, monospace',
                folding: true,
                contextmenu: false,
              }}
              loading={
                <div className="h-64 flex items-center justify-center text-slate-500 text-xs font-mono">
                  Rendering syntax highlighting...
                </div>
              }
            />
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="max-w-md w-full rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-2">Delete Snippet?</h3>
            <p className="text-xs text-slate-400 mb-6 leading-relaxed">
              This action cannot be undone. The snippet code and URL will be permanently removed immediately.
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => handleDelete()}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Delete Permanently'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
