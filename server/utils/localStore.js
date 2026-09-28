import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../data');
const DATA_FILE = path.join(DATA_DIR, 'snippets.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Store starts clean with no fake or mocked data
const SEED_SNIPPETS = [];

/**
 * Load snippets from disk or initialize with seeds
 */
function readSnippetsFromFile() {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      fs.writeFileSync(DATA_FILE, JSON.stringify(SEED_SNIPPETS, null, 2), 'utf-8');
      return [...SEED_SNIPPETS];
    }
    const data = fs.readFileSync(DATA_FILE, 'utf-8');
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.warn('[LocalStore] Could not read local store, using in-memory store:', error.message);
    return [...SEED_SNIPPETS];
  }
}

/**
 * Write snippets to disk
 */
function writeSnippetsToFile(snippets) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(snippets, null, 2), 'utf-8');
  } catch (error) {
    console.warn('[LocalStore] Could not write to local store:', error.message);
  }
}

let inMemorySnippets = readSnippetsFromFile();

function wrapDoc(doc) {
  if (!doc) return null;
  const clone = { ...doc };
  clone.isExpired = function () {
    if (!this.expiresAt) return false;
    return new Date(this.expiresAt).getTime() <= Date.now();
  };
  return clone;
}

export const localStore = {
  create: async (data) => {
    const doc = {
      _id: 'local_' + Date.now() + Math.random().toString(36).substring(2, 7),
      shortId: data.shortId,
      title: data.title,
      description: data.description || '',
      language: data.language,
      code: data.code,
      tags: data.tags || [],
      viewCount: data.viewCount || 0,
      expiresAt: data.expiresAt ? new Date(data.expiresAt).toISOString() : null,
      deleteToken: data.deleteToken,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    inMemorySnippets.unshift(doc);
    writeSnippetsToFile(inMemorySnippets);
    return wrapDoc(doc);
  },

  exists: async (filter) => {
    const exists = inMemorySnippets.some((s) => {
      if (filter.shortId && s.shortId === filter.shortId) return true;
      return false;
    });
    return exists;
  },

  findOne: (filter) => {
    let selectFields = null;

    const execute = () => {
      const match = inMemorySnippets.find((s) => {
        if (filter.shortId && s.shortId === filter.shortId) return true;
        if (filter._id && s._id === filter._id) return true;
        return false;
      });

      if (!match) return null;
      const wrapped = wrapDoc(match);
      if (selectFields && !selectFields.includes('+deleteToken')) {
        delete wrapped.deleteToken;
      }
      return wrapped;
    };

    return {
      select: function (fields) {
        selectFields = fields;
        return this;
      },
      then: function (resolve, reject) {
        try {
          resolve(execute());
        } catch (e) {
          reject(e);
        }
      },
    };
  },

  findByIdAndUpdate: async (id, update, options) => {
    const index = inMemorySnippets.findIndex((s) => s._id === id || s.shortId === id);
    if (index === -1) return null;

    const doc = inMemorySnippets[index];
    if (update.$inc && update.$inc.viewCount) {
      doc.viewCount = (doc.viewCount || 0) + update.$inc.viewCount;
    }
    doc.updatedAt = new Date().toISOString();
    inMemorySnippets[index] = doc;
    writeSnippetsToFile(inMemorySnippets);
    return wrapDoc(doc);
  },

  countDocuments: async (filter) => {
    const results = filterSnippets(inMemorySnippets, filter);
    return results.length;
  },

  find: (filter) => {
    let sortOptions = { createdAt: -1 };
    let skipCount = 0;
    let limitCount = 50;

    const execute = () => {
      let filtered = filterSnippets(inMemorySnippets, filter);

      if (sortOptions.viewCount) {
        filtered.sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0));
      } else {
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      }

      const paginated = filtered.slice(skipCount, skipCount + limitCount);
      return paginated.map((item) => {
        const doc = wrapDoc(item);
        delete doc.deleteToken;
        return doc;
      });
    };

    const queryObj = {
      sort: function (s) {
        sortOptions = s || sortOptions;
        return this;
      },
      skip: function (s) {
        skipCount = s || 0;
        return this;
      },
      limit: function (l) {
        limitCount = l || 50;
        return this;
      },
      select: function () {
        return this;
      },
      then: function (resolve, reject) {
        try {
          resolve(execute());
        } catch (e) {
          reject(e);
        }
      },
    };

    return queryObj;
  },

  deleteOne: async (filter) => {
    const initialLen = inMemorySnippets.length;
    inMemorySnippets = inMemorySnippets.filter((s) => {
      if (filter._id && s._id === filter._id) return false;
      if (filter.shortId && s.shortId === filter.shortId) return false;
      return true;
    });
    writeSnippetsToFile(inMemorySnippets);
    return { deletedCount: initialLen - inMemorySnippets.length };
  },

  aggregate: async () => {
    const active = inMemorySnippets.filter((s) => {
      if (!s.expiresAt) return true;
      return new Date(s.expiresAt).getTime() > Date.now();
    });
    const totalViews = active.reduce((sum, s) => sum + (s.viewCount || 0), 0);
    return [{ totalViews }];
  },
};

function filterSnippets(snippets, filter) {
  const now = Date.now();

  return snippets.filter((s) => {
    // Check expiration
    if (s.expiresAt && new Date(s.expiresAt).getTime() <= now) {
      return false;
    }

    // Language filter
    if (filter.language && s.language !== filter.language) {
      return false;
    }

    // Search filter
    if (filter.$and && filter.$and[0] && filter.$and[0].$or) {
      const orClauses = filter.$and[0].$or;
      const titleRegex = orClauses[0]?.title;
      if (titleRegex && !titleRegex.test(s.title) && !titleRegex.test(s.description || '') && !s.tags?.some((t) => titleRegex.test(t))) {
        return false;
      }
    }

    return true;
  });
}
