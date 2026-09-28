import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Filter,
  ArrowUpDown,
  PlusCircle,
  FolderGit2,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import SnippetCard from '../components/SnippetCard';
import { SnippetCardSkeleton } from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import { snippetApi, getErrorMessage } from '../services/api';
import { LANGUAGES } from '../utils/languages';

export default function BrowseSnippets() {
  const [snippets, setSnippets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter/Sort/Search State
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('all');
  const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'views'
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  });

  // Fetch snippets from backend
  const fetchSnippets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await snippetApi.getSnippets({
        search: activeSearch,
        language: selectedLanguage,
        sort: sortBy,
        page: currentPage,
        limit: 9,
      });

      if (response.success && response.data) {
        setSnippets(response.data.snippets || []);
        if (response.data.pagination) {
          setPagination(response.data.pagination);
        }
      } else {
        setError('Failed to load snippets.');
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [activeSearch, selectedLanguage, sortBy, currentPage]);

  useEffect(() => {
    fetchSnippets();
  }, [fetchSnippets]);

  // Handle Search Submission
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    setActiveSearch(searchTerm.trim());
  };

  // Reset filters
  const handleClearFilters = () => {
    setSearchTerm('');
    setActiveSearch('');
    setSelectedLanguage('all');
    setSortBy('newest');
    setCurrentPage(1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-brand-500/20 text-brand-300 text-xs font-medium mb-3">
            <FolderGit2 className="w-3.5 h-3.5 text-brand-400" />
            <span>Community Snippets</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Browse Snippets
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Explore recently shared code snippets from developers around the world.
          </p>
        </div>

        <Link
          to="/create"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-sm font-semibold shadow-md shadow-brand-500/20 transition-all hover:scale-105 active:scale-95 border border-brand-400/30 self-start md:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Snippet</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl mb-8 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search Input */}
          <form onSubmit={handleSearchSubmit} className="md:col-span-6 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by title, description, or tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-24 py-2.5 rounded-xl bg-slate-950 border border-slate-700/80 text-white text-sm placeholder-slate-500 focus:border-brand-500 outline-none transition-colors"
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold transition-colors"
            >
              Search
            </button>
          </form>

          {/* Language Filter */}
          <div className="md:col-span-3 relative">
            <Filter className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <select
              value={selectedLanguage}
              onChange={(e) => {
                setSelectedLanguage(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-8 py-2.5 rounded-xl bg-slate-950 border border-slate-700/80 text-white text-sm focus:border-brand-500 outline-none transition-colors appearance-none cursor-pointer"
            >
              <option value="all">All Languages</option>
              {LANGUAGES.map((lang) => (
                <option key={lang.id} value={lang.id}>
                  {lang.name}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Selector */}
          <div className="md:col-span-3 relative">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-8 py-2.5 rounded-xl bg-slate-950 border border-slate-700/80 text-white text-sm focus:border-brand-500 outline-none transition-colors appearance-none cursor-pointer"
            >
              <option value="newest">Sort: Newest First</option>
              <option value="views">Sort: Most Viewed</option>
            </select>
          </div>
        </div>

        {/* Active filter summary & Clear button */}
        {(activeSearch || selectedLanguage !== 'all' || sortBy !== 'newest') && (
          <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
            <div className="flex items-center gap-2">
              <span>Active filters:</span>
              {activeSearch && (
                <span className="px-2 py-0.5 rounded bg-brand-500/20 text-brand-300 font-mono">
                  "{activeSearch}"
                </span>
              )}
              {selectedLanguage !== 'all' && (
                <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-200 capitalize">
                  {selectedLanguage}
                </span>
              )}
              {sortBy !== 'newest' && (
                <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-200">
                  Most viewed
                </span>
              )}
            </div>
            <button
              onClick={handleClearFilters}
              className="text-xs text-brand-400 hover:text-brand-300 underline font-medium"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>

      {/* Snippet Grid or States */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <SnippetCardSkeleton key={i} />
          ))}
        </div>
      ) : error ? (
        <ErrorMessage
          title="Could not load snippets"
          message={error}
          onRetry={fetchSnippets}
        />
      ) : snippets.length === 0 ? (
        /* Empty State (Section 19 Requirement) */
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-12 text-center max-w-md mx-auto my-12">
          <div className="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto mb-4 text-slate-400">
            <FolderGit2 className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">No snippets found.</h3>
          <p className="text-xs text-slate-400 mb-6 leading-relaxed">
            {activeSearch || selectedLanguage !== 'all'
              ? 'No snippets matched your search filters. Try adjusting your query or resetting filters.'
              : 'Be the first developer to share a code snippet with the world!'}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/create"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create the first snippet</span>
            </Link>
            {(activeSearch || selectedLanguage !== 'all') && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
      ) : (
        <>
          {/* Results Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            {snippets.map((snippet) => (
              <SnippetCard key={snippet.shortId || snippet.id} snippet={snippet} />
            ))}
          </div>

          {/* Pagination Controls */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-slate-800 pt-6">
              <span className="text-xs text-slate-400">
                Page <span className="font-semibold text-white">{currentPage}</span> of{' '}
                <span className="font-semibold text-white">{pagination.totalPages}</span> ({pagination.total} snippets)
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={!pagination.hasPrevPage}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="inline-flex items-center gap-1 px-3.5 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs font-medium text-slate-300 hover:bg-slate-800 disabled:opacity-40 disabled:pointer-events-none transition-colors"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Previous</span>
                </button>

                <button
                  type="button"
                  disabled={!pagination.hasNextPage}
                  onClick={() => setCurrentPage((p) => p + 1)}
                  className="inline-flex items-center gap-1 px-3.5 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs font-medium text-slate-300 hover:bg-slate-800 disabled:opacity-40 disabled:pointer-events-none transition-colors"
                >
                  <span>Next</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
