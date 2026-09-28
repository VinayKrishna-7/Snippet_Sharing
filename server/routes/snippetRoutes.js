import express from 'express';
import {
  createSnippet,
  getSnippetById,
  getRecentSnippets,
  deleteSnippet,
  getStats,
} from '../controllers/snippetController.js';
import { apiLimiter, createSnippetLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Metadata & stats
router.get('/meta/stats', apiLimiter, getStats);

// List & search snippets
router.get('/', apiLimiter, getRecentSnippets);

// Create new snippet (protected with strict rate limiter)
router.post('/', createSnippetLimiter, createSnippet);

// Single snippet details (increments view count on success)
router.get('/:id', apiLimiter, getSnippetById);

// Delete snippet (requires private deleteToken)
router.delete('/:id', apiLimiter, deleteSnippet);

export default router;
