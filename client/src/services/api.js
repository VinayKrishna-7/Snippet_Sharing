import axios from 'axios';

// Use environment variable if provided, fallback to relative /api (proxied by Vite in dev)
const API_BASE_URL = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL.replace(/\/$/, '')}/api`
  : '/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

/**
 * Extract clean user-friendly error message from Axios errors
 */
export function getErrorMessage(error) {
  if (error.response) {
    // Expired snippet 410 status
    if (error.response.status === 410) {
      return error.response.data?.message || 'This snippet has expired.';
    }
    // Rate limit 429 status
    if (error.response.status === 429) {
      return error.response.data?.message || 'Too many requests. Please slow down and try again.';
    }
    // 404
    if (error.response.status === 404) {
      return error.response.data?.message || 'The requested snippet was not found.';
    }
    return error.response.data?.message || error.response.data?.error || `Error: ${error.response.statusText}`;
  } else if (error.request) {
    return 'Unable to connect to the server. Please check your internet connection or verify the backend is running.';
  } else {
    return error.message || 'An unexpected error occurred.';
  }
}

/**
 * Snippet API methods
 */
export const snippetApi = {
  // Create snippet
  createSnippet: async (snippetData) => {
    const response = await apiClient.post('/snippets', snippetData);
    return response.data;
  },

  // Get snippet by short ID
  getSnippetById: async (id) => {
    const response = await apiClient.get(`/snippets/${id}`);
    return response.data;
  },

  // Browse recent snippets with filter/search/sort/pagination
  getSnippets: async ({ search = '', language = '', sort = 'newest', page = 1, limit = 9 } = {}) => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (language && language !== 'all') params.append('language', language);
    if (sort) params.append('sort', sort);
    if (page) params.append('page', page);
    if (limit) params.append('limit', limit);

    const response = await apiClient.get(`/snippets?${params.toString()}`);
    return response.data;
  },

  // Delete snippet using private delete token
  deleteSnippet: async (id, deleteToken) => {
    const response = await apiClient.delete(`/snippets/${id}`, {
      data: { deleteToken },
      headers: {
        'x-delete-token': deleteToken,
      },
    });
    return response.data;
  },

  // Aggregate statistics for landing page
  getStats: async () => {
    try {
      const response = await apiClient.get('/snippets/meta/stats');
      return response.data;
    } catch {
      return { success: true, data: { totalSnippets: 0, totalViews: 0 } };
    }
  },
};

export default apiClient;
