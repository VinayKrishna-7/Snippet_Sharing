import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Code2,
  Clock,
  Tag as TagIcon,
  Sparkles,
  ArrowRight,
  Loader2,
  X,
  AlertCircle,
} from 'lucide-react';
import CodeEditor from '../components/CodeEditor';
import LanguageSelect from '../components/LanguageSelect';
import { snippetApi, getErrorMessage } from '../services/api';
import { useToast } from '../components/Toast';
import { getLanguageMeta } from '../utils/languages';

const EXPIRATION_OPTIONS = [
  { id: 'never', label: 'Never' },
  { id: '1h', label: '1 hour' },
  { id: '1d', label: '1 day' },
  { id: '7d', label: '7 days' },
  { id: '30d', label: '30 days' },
];

export default function CreateSnippet() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [code, setCode] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState([]);
  const [expiration, setExpiration] = useState('never');

  // UI State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Handle language change
  const handleLanguageChange = (newLangId) => {
    setLanguage(newLangId);
  };

  // Reset to starter template
  const handleResetTemplate = () => {
    const meta = getLanguageMeta(language);
    setCode(meta.template || '');
    showToast(`Loaded ${meta.name} starter template`, 'info');
  };

  // Tag Management
  const handleAddTag = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag();
    }
  };

  const addTag = () => {
    const cleanTag = tagInput.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');
    if (!cleanTag) return;

    if (tags.length >= 10) {
      setFormError('You can add up to 10 tags maximum.');
      return;
    }

    if (tags.includes(cleanTag)) {
      setTagInput('');
      return;
    }

    setTags([...tags, cleanTag]);
    setTagInput('');
    setFormError('');
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  // Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    // Frontend validation
    if (!title.trim()) {
      setFormError('Please enter a snippet title.');
      return;
    }
    if (title.trim().length > 150) {
      setFormError('Title must be 150 characters or less.');
      return;
    }
    if (!code.trim()) {
      setFormError('Please provide some code in the editor.');
      return;
    }
    if (code.length > 100000) {
      setFormError('Code size exceeds 100,000 characters limit.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await snippetApi.createSnippet({
        title: title.trim(),
        description: description.trim(),
        language,
        code,
        tags,
        expiration,
      });

      if (response.success && (response.snippet || response.data)) {
        const snippetData = response.snippet || response.data;
        showToast('Snippet created successfully!', 'success');

        // Store deleteToken in localStorage for convenient management by the creator
        if (snippetData.deleteToken && snippetData.id) {
          try {
            localStorage.setItem(`snipdrop_token_${snippetData.id}`, snippetData.deleteToken);
          } catch {
            // localStorage might be unavailable in private browsing
          }
        }

        // Redirect to newly created snippet page
        navigate(`/s/${snippetData.id || snippetData.shortId}`);
      } else {
        setFormError(response.message || 'Failed to create snippet.');
      }
    } catch (err) {
      const message = getErrorMessage(err);
      setFormError(message);
      showToast(message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 sm:py-12">
      {/* Page Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-brand-500/20 text-brand-300 text-xs font-medium mb-3">
          <Sparkles className="w-3.5 h-3.5 text-brand-400" />
          <span>New Snippet</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
          Create Code Snippet
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Paste your code, configure options, and instantly get your shareable link.
        </p>
      </div>

      {/* Error alert if any */}
      {formError && (
        <div className="mb-6 p-4 rounded-xl bg-rose-950/40 border border-rose-500/30 flex items-start gap-3 text-rose-200 text-sm animate-in fade-in duration-200">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-semibold">Validation Error:</span> {formError}
          </div>
          <button
            type="button"
            onClick={() => setFormError('')}
            className="text-rose-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Top Controls Grid: Title & Language */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Title */}
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">
              Snippet Title <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. React Debounce Hook, Python Binary Search, SQL Join..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={150}
              required
              className="w-full px-4 py-2.5 rounded-lg bg-slate-900 border border-slate-700/80 hover:border-slate-600 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30 text-white text-sm placeholder-slate-500 transition-all outline-none"
            />
            <div className="flex justify-end mt-1">
              <span className="text-[11px] text-slate-500">{title.length}/150</span>
            </div>
          </div>

          {/* Language Selector */}
          <div>
            <LanguageSelect
              value={language}
              onChange={handleLanguageChange}
            />
          </div>
        </div>

        {/* Code Editor */}
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">
            Source Code <span className="text-rose-400">*</span>
          </label>
          <CodeEditor
            value={code}
            onChange={(val) => setCode(val)}
            language={language}
            onResetTemplate={handleResetTemplate}
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">
            Description <span className="text-slate-500 text-[11px] normal-case">(optional)</span>
          </label>
          <textarea
            placeholder="What does this code do? Add any context, instructions, or notes here..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={500}
            rows={3}
            className="w-full px-4 py-3 rounded-lg bg-slate-900 border border-slate-700/80 hover:border-slate-600 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30 text-white text-sm placeholder-slate-500 transition-all outline-none resize-y"
          />
          <div className="flex justify-end mt-1">
            <span className="text-[11px] text-slate-500">{description.length}/500</span>
          </div>
        </div>

        {/* Bottom Options: Tags & Expiration */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-5 rounded-xl bg-slate-900/60 border border-slate-800">
          {/* Tags Input */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">
              Tags <span className="text-slate-500 text-[11px] normal-case">(up to 10)</span>
            </label>
            <div className="flex gap-2 mb-2">
              <div className="relative flex-1">
                <TagIcon className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="e.g. react, hooks, mongodb"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                  className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-950 border border-slate-700/80 text-white text-xs placeholder-slate-500 focus:border-brand-500 outline-none"
                />
              </div>
              <button
                type="button"
                onClick={addTag}
                className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors border border-slate-700"
              >
                Add
              </button>
            </div>

            {/* Rendered Chips */}
            <div className="flex flex-wrap gap-1.5 min-h-[1.75rem]">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-brand-500/10 border border-brand-500/20 text-brand-300 text-xs font-mono"
                >
                  #{tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:text-white"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              {tags.length === 0 && (
                <span className="text-[11px] text-slate-500 italic">No tags added yet. Press Enter or comma to add.</span>
              )}
            </div>
          </div>

          {/* Expiration Dropdown */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">
              Expiration <span className="text-slate-500 text-[11px] normal-case">(auto-delete)</span>
            </label>
            <div className="grid grid-cols-5 gap-2">
              {EXPIRATION_OPTIONS.map((opt) => {
                const isSelected = expiration === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setExpiration(opt.id)}
                    className={`py-2 px-2 text-center rounded-lg border text-xs font-medium transition-all ${
                      isSelected
                        ? 'bg-brand-600 border-brand-500 text-white shadow-md shadow-brand-500/20 font-semibold'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] text-slate-500 mt-2 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>
                {expiration === 'never'
                  ? 'Snippet will remain available permanently.'
                  : `Snippet link will automatically expire in ${expiration}.`}
              </span>
            </p>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4 flex items-center justify-end gap-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-xl shadow-brand-500/25 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:pointer-events-none border border-brand-400/40"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Creating Snippet...</span>
              </>
            ) : (
              <>
                <span>Create Snippet</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
