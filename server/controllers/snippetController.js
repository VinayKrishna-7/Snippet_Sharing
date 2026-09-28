import Snippet from '../models/Snippet.js';
import { generateShortId, generateDeleteToken } from '../utils/generateId.js';
import { isValidLanguage } from '../utils/languages.js';

/**
 * Parse expiration string to a Date object or null
 * @param {string} expiration - 'never' | '1h' | '1d' | '7d' | '30d'
 * @returns {Date|null}
 */
function parseExpiration(expiration) {
  if (!expiration || expiration === 'never') return null;

  const now = Date.now();
  switch (expiration) {
    case '1h':
      return new Date(now + 60 * 60 * 1000);
    case '1d':
      return new Date(now + 24 * 60 * 60 * 1000);
    case '7d':
      return new Date(now + 7 * 24 * 60 * 60 * 1000);
    case '30d':
      return new Date(now + 30 * 24 * 60 * 60 * 1000);
    default:
      return null;
  }
}

/**
 * Format and sanitize tags array
 * @param {any} rawTags
 * @returns {string[]}
 */
function sanitizeTags(rawTags) {
  if (!rawTags) return [];

  let tagList = [];
  if (Array.isArray(rawTags)) {
    tagList = rawTags;
  } else if (typeof rawTags === 'string') {
    tagList = rawTags.split(',').map((t) => t.trim());
  }

  // Sanitize, filter empty, lowercase, deduplicate, limit to 10
  const cleaned = tagList
    .map((tag) => String(tag).trim().toLowerCase())
    .filter((tag) => tag.length > 0 && tag.length <= 30);

  return [...new Set(cleaned)].slice(0, 10);
}

/**
 * @route   POST /api/snippets
 * @desc    Create a new code snippet
 * @access  Public
 */
export async function createSnippet(req, res, next) {
  try {
    const { title, description, language, code, tags, expiration } = req.body;

    // Validate Title
    if (!title || typeof title !== 'string' || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Snippet title is required.',
      });
    }
    const cleanTitle = title.trim();
    if (cleanTitle.length > 150) {
      return res.status(400).json({
        success: false,
        message: 'Snippet title cannot exceed 150 characters.',
      });
    }

    // Validate Code
    if (!code || typeof code !== 'string' || !code.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Snippet code content cannot be empty.',
      });
    }
    if (code.length > 100000) {
      return res.status(400).json({
        success: false,
        message: 'Snippet code cannot exceed 100,000 characters.',
      });
    }

    // Validate Language
    if (!language || !isValidLanguage(language)) {
      return res.status(400).json({
        success: false,
        message: 'A valid programming language must be selected from the supported list.',
      });
    }

    // Validate Description
    const cleanDescription = description && typeof description === 'string'
      ? description.trim()
      : '';
    if (cleanDescription.length > 500) {
      return res.status(400).json({
        success: false,
        message: 'Description cannot exceed 500 characters.',
      });
    }

    // Validate Tags
    const cleanTags = sanitizeTags(tags);

    // Calculate Expiration
    const expiresAt = parseExpiration(expiration);

    // Generate unique shortId with collision fallback
    let shortId = generateShortId(7);
    let attempts = 0;
    while (await Snippet.exists({ shortId })) {
      shortId = generateShortId(7 + Math.floor(attempts / 3));
      attempts++;
      if (attempts > 10) break;
    }

    // Generate private delete token
    const deleteToken = generateDeleteToken();

    // Create snippet document
    const snippet = await Snippet.create({
      shortId,
      title: cleanTitle,
      description: cleanDescription,
      language: language.toLowerCase().trim(),
      code,
      tags: cleanTags,
      expiresAt,
      deleteToken,
      viewCount: 0,
    });

    const responsePayload = {
      id: snippet.shortId,
      shortId: snippet.shortId,
      title: snippet.title,
      url: `/s/${snippet.shortId}`,
      deleteToken, // Provided to the creator once upon creation
    };

    return res.status(201).json({
      success: true,
      snippet: responsePayload,
      data: responsePayload,
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * @route   GET /api/snippets/:id
 * @desc    Get a single snippet by short ID and increment view count
 * @access  Public
 */
export async function getSnippetById(req, res, next) {
  try {
    const { id } = req.params;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Invalid snippet identifier provided.',
      });
    }

    // Find snippet by shortId
    const snippet = await Snippet.findOne({ shortId: id });

    // Handle snippet not found
    if (!snippet) {
      return res.status(404).json({
        success: false,
        message: 'Snippet not found.',
      });
    }

    // Check expiration: if expired, return 410 Gone, do not return code, do not increment viewCount
    if (snippet.isExpired()) {
      return res.status(410).json({
        success: false,
        message: 'This snippet has expired.',
        expired: true,
      });
    }

    // Increment view counter atomically
    const updatedSnippet = await Snippet.findByIdAndUpdate(
      snippet._id,
      { $inc: { viewCount: 1 } },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      snippet: updatedSnippet,
      data: updatedSnippet,
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * @route   GET /api/snippets
 * @desc    Get paginated recent snippets with search, filter, and sort
 * @access  Public
 */
export async function getRecentSnippets(req, res, next) {
  try {
    const {
      search,
      language,
      sort = 'newest',
      page = 1,
      limit = 9,
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 9));
    const skip = (pageNum - 1) * limitNum;

    // Filter out expired snippets
    const filter = {
      $or: [
        { expiresAt: null },
        { expiresAt: { $gt: new Date() } },
      ],
    };

    // Filter by programming language
    if (language && language.trim() && language.toLowerCase() !== 'all') {
      filter.language = language.toLowerCase().trim();
    }

    // Search query on title, description, or tags
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filter.$and = [
        {
          $or: [
            { title: searchRegex },
            { description: searchRegex },
            { tags: searchRegex },
          ],
        },
      ];
    }

    // Determine sort order
    let sortOptions = { createdAt: -1 };
    if (sort === 'views') {
      sortOptions = { viewCount: -1, createdAt: -1 };
    } else {
      sortOptions = { createdAt: -1 };
    }

    // Execute queries concurrently
    const [total, snippets] = await Promise.all([
      Snippet.countDocuments(filter),
      Snippet.find(filter)
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum)
        .select('-deleteToken'),
    ]);

    const totalPages = Math.ceil(total / limitNum) || 1;

    return res.status(200).json({
      success: true,
      data: {
        snippets,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages,
          hasNextPage: pageNum < totalPages,
          hasPrevPage: pageNum > 1,
        },
      },
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * @route   DELETE /api/snippets/:id
 * @desc    Securely delete a snippet using its private delete token
 * @access  Public (Protected with token)
 */
export async function deleteSnippet(req, res, next) {
  try {
    const { id } = req.params;
    const token = req.body?.deleteToken || req.headers['x-delete-token'];

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'A private deletion token is required to delete this snippet.',
      });
    }

    const snippet = await Snippet.findOne({ shortId: id }).select('+deleteToken');

    if (!snippet) {
      return res.status(404).json({
        success: false,
        message: 'Snippet not found.',
      });
    }

    if (snippet.deleteToken !== token.trim()) {
      return res.status(403).json({
        success: false,
        message: 'Invalid deletion token. You do not have permission to delete this snippet.',
      });
    }

    await Snippet.deleteOne({ _id: snippet._id });

    return res.status(200).json({
      success: true,
      message: 'Snippet deleted successfully.',
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * @route   GET /api/snippets/meta/stats
 * @desc    Get aggregate stats for dashboard/landing page
 * @access  Public
 */
export async function getStats(req, res, next) {
  try {
    const activeFilter = {
      $or: [
        { expiresAt: null },
        { expiresAt: { $gt: new Date() } },
      ],
    };

    const [totalSnippets, aggregateViews] = await Promise.all([
      Snippet.countDocuments(activeFilter),
      Snippet.aggregate([
        { $match: activeFilter },
        { $group: { _id: null, totalViews: { $sum: '$viewCount' } } },
      ]),
    ]);

    const totalViews = aggregateViews[0]?.totalViews || 0;

    return res.status(200).json({
      success: true,
      data: {
        totalSnippets,
        totalViews,
      },
    });
  } catch (error) {
    return next(error);
  }
}
