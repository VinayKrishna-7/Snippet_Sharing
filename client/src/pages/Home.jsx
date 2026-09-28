import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Code2,
  PlusCircle,
  Compass,
  Zap,
  Share2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Loader2,
  FileCode,
  FolderGit2,
} from 'lucide-react';
import CodeEditor from '../components/CodeEditor';
import LanguageSelect from '../components/LanguageSelect';
import SnippetCard from '../components/SnippetCard';
import { snippetApi, getErrorMessage } from '../services/api';
import { useToast } from '../components/Toast';

export default function Home() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  // Quick Creator State (Real functional editor on landing page)
  const [title, setTitle] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [code, setCode] = useState('');
  const [expiration, setExpiration] = useState('never');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Live Recent Snippets from Database
  const [recentSnippets, setRecentSnippets] = useState([]);
  const [loadingSnippets, setLoadingSnippets] = useState(true);

  // Load real snippets from API
  useEffect(() => {
    async function loadRecent() {
      try {
        const res = await snippetApi.getSnippets({ limit: 3, sort: 'newest' });
        if (res.success && res.data?.snippets) {
          setRecentSnippets(res.data.snippets);
        }
      } catch {
        // Silently catch in dev
      } finally {
        setLoadingSnippets(false);
      }
    }
    loadRecent();
  }, []);

  // Handle Quick Create right from Home
  const handleQuickCreate = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!title.trim()) {
      setErrorMsg('Please enter a snippet title.');
      return;
    }
    if (!code.trim()) {
      setErrorMsg('Please paste or write some code in the editor.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await snippetApi.createSnippet({
        title: title.trim(),
        language,
        code,
        expiration,
      });

      if (response.success && (response.snippet || response.data)) {
        const data = response.snippet || response.data;
        if (data.deleteToken && data.id) {
          try {
            localStorage.setItem(`snipdrop_token_${data.id}`, data.deleteToken);
          } catch {
            // private mode fallback
          }
        }
        showToast('Snippet created successfully!', 'success');
        navigate(`/s/${data.id || data.shortId}`);
      } else {
        setErrorMsg(response.message || 'Failed to create snippet.');
      }
    } catch (err) {
      setErrorMsg(getErrorMessage(err));
      showToast(getErrorMessage(err), 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-24 py-10 sm:py-16">
      {/* Hero Section */}
      <section className="relative text-center max-w-5xl mx-auto px-4">
        {/* Glow backdrop */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[32rem] h-[32rem] bg-brand-500/10 blur-[120px] pointer-events-none rounded-full" />

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-brand-500/30 text-brand-300 text-xs font-medium mb-6 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-brand-400" />
          <span>The Zero-Friction Code Pasting Experience</span>
        </div>

        {/* Title & Tagline */}
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white mb-6 leading-[1.15]">
          Share code instantly.{' '}
          <span className="bg-gradient-to-r from-brand-400 via-indigo-300 to-cyan-400 bg-clip-text text-transparent">
            No account required.
          </span>
        </h1>

        <p className="text-base sm:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
          SnipDrop is a fast, developer-first snippet sharing platform.
          Paste your code, select your language, set an optional expiration, and get a shareable URL in seconds.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
          <Link
            to="/create"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-semibold text-base shadow-lg shadow-brand-500/25 transition-all hover:scale-105 active:scale-95 border border-brand-400/40"
          >
            <PlusCircle className="w-5 h-5" />
            <span>Create Snippet</span>
          </Link>
          <Link
            to="/snippets"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 font-semibold text-base border border-slate-700 hover:border-slate-600 transition-all hover:scale-105 active:scale-95"
          >
            <Compass className="w-5 h-5 text-slate-400" />
            <span>Browse Snippets</span>
          </Link>
        </div>

        {/* Real Live Quick Paste Editor directly in Hero */}
        <div className="text-left max-w-3xl mx-auto rounded-2xl bg-slate-900/90 border border-slate-700/80 shadow-2xl p-5 sm:p-6 backdrop-blur-xl">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500/80" />
              <span className="w-3 h-3 rounded-full bg-amber-500/80" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
              <span className="ml-2 font-mono text-xs text-slate-300 font-medium">Quick Snippet Creator</span>
            </div>
            <span className="text-[11px] text-emerald-400 font-mono flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Live & Ready
            </span>
          </div>

          <form onSubmit={handleQuickCreate} className="space-y-4">
            {errorMsg && (
              <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-500/30 text-rose-300 text-xs">
                {errorMsg}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <input
                  type="text"
                  placeholder="Snippet title (e.g. JWT Auth Helper, SQL Migration)..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={150}
                  className="w-full px-3.5 py-2 rounded-lg bg-slate-950 border border-slate-700/80 text-white text-xs placeholder-slate-500 focus:border-brand-500 outline-none"
                />
              </div>
              <div>
                <LanguageSelect
                  value={language}
                  onChange={(val) => setLanguage(val)}
                />
              </div>
            </div>

            <CodeEditor
              value={code}
              onChange={(val) => setCode(val)}
              language={language}
              height="260px"
            />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span>Expires in:</span>
                <select
                  value={expiration}
                  onChange={(e) => setExpiration(e.target.value)}
                  className="px-2.5 py-1 rounded bg-slate-950 border border-slate-700 text-slate-300 text-xs outline-none focus:border-brand-500"
                >
                  <option value="never">Never</option>
                  <option value="1h">1 hour</option>
                  <option value="1d">1 day</option>
                  <option value="7d">7 days</option>
                  <option value="30d">30 days</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-md shadow-brand-500/20 transition-all active:scale-95 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Creating Snippet...</span>
                  </>
                ) : (
                  <>
                    <span>Share Snippet Now</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Real Live Community Snippets Section */}
      {recentSnippets.length > 0 && (
        <section className="max-w-5xl mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                <FolderGit2 className="w-5 h-5 text-brand-400" />
                <span>Recently Shared Snippets</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Real code shared by developers</p>
            </div>
            <Link
              to="/snippets"
              className="text-xs text-brand-400 hover:text-brand-300 font-semibold inline-flex items-center gap-1"
            >
              <span>View all</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {recentSnippets.map((snippet) => (
              <SnippetCard key={snippet.shortId || snippet._id} snippet={snippet} />
            ))}
          </div>
        </section>
      )}

      {/* How It Works Section */}
      <section className="max-w-5xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
            How SnipDrop Works
          </h2>
          <p className="text-slate-400 text-sm max-w-xl mx-auto">
            From raw snippet to shareable link in under 10 seconds with zero friction.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Step 1 */}
          <div className="relative p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all group">
            <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/20 text-brand-400 flex items-center justify-center font-bold text-sm mb-4 group-hover:scale-110 transition-transform">
              1
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Paste Your Code</h3>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
              Drop code into our Monaco Editor with full syntax highlighting across 16+ languages and tab formatting.
            </p>
          </div>

          {/* Step 2 */}
          <div className="relative p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all group">
            <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/20 text-brand-400 flex items-center justify-center font-bold text-sm mb-4 group-hover:scale-110 transition-transform">
              2
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Set Preferences</h3>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
              Add an optional title, description, searchable tags, and choose automatic expiration (1 hour to 30 days).
            </p>
          </div>

          {/* Step 3 */}
          <div className="relative p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all group">
            <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/20 text-brand-400 flex items-center justify-center font-bold text-sm mb-4 group-hover:scale-110 transition-transform">
              3
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Share The Link</h3>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
              Instantly receive a unique short URL. Anyone with the link can view, copy, and inspect the code cleanly.
            </p>
          </div>
        </div>
      </section>

      {/* Feature Cards Section (Section 3 Requirement) */}
      <section className="max-w-5xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
            Developer-First Features
          </h2>
          <p className="text-slate-400 text-sm max-w-xl mx-auto">
            Everything you need to share code snippets cleanly without bloat or paywalls.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1 */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-brand-500/40 transition-all duration-300">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h4 className="text-base font-semibold text-white mb-1.5">No login required</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Zero accounts, no passwords, no email verification. Jump straight in and start sharing immediately.
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-brand-500/40 transition-all duration-300">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-4">
              <Zap className="w-6 h-6" />
            </div>
            <h4 className="text-base font-semibold text-white mb-1.5">Instant sharing</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              High-speed backend generates your short link in milliseconds with automated rate protection.
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-brand-500/40 transition-all duration-300">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-4">
              <Code2 className="w-6 h-6" />
            </div>
            <h4 className="text-base font-semibold text-white mb-1.5">Syntax highlighting</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Powered by VS Code's Monaco engine with line numbers, auto-indent, and sleek dark themes.
            </p>
          </div>

          {/* Card 4 */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-brand-500/40 transition-all duration-300">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4">
              <Share2 className="w-6 h-6" />
            </div>
            <h4 className="text-base font-semibold text-white mb-1.5">Shareable URLs</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Short, clean, memorable URLs with native Web Share API support.
            </p>
          </div>
        </div>
      </section>

      {/* Call to action */}
      <section className="max-w-4xl mx-auto px-4">
        <div className="rounded-3xl bg-gradient-to-r from-brand-900/50 via-slate-900 to-indigo-950/60 border border-brand-500/30 p-8 sm:p-12 text-center relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
          <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4">
            Ready to share some code?
          </h3>
          <p className="text-slate-300 text-sm max-w-lg mx-auto mb-8">
            Paste your code snippet right now. No sign-up, no captcha, just instant developer productivity.
          </p>
          <Link
            to="/create"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-white font-semibold text-sm transition-all shadow-lg shadow-brand-500/30 hover:scale-105 active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create Your Snippet</span>
          </Link>
        </div>
      </section>
    </div>
  );
}
