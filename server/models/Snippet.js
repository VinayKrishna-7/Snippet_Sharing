import mongoose from 'mongoose';
import { localStore } from '../utils/localStore.js';

const snippetSchema = new mongoose.Schema(
  {
    shortId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
      default: '',
    },
    language: {
      type: String,
      required: [true, 'Programming language is required'],
      lowercase: true,
      trim: true,
      index: true,
    },
    code: {
      type: String,
      required: [true, 'Snippet code is required'],
      maxlength: [100000, 'Code snippet cannot exceed 100,000 characters'],
    },
    tags: {
      type: [
        {
          type: String,
          trim: true,
          maxlength: [30, 'Tag cannot exceed 30 characters'],
        },
      ],
      validate: [
        (val) => val.length <= 10,
        'Cannot have more than 10 tags',
      ],
      default: [],
    },
    viewCount: {
      type: Number,
      default: 0,
      min: 0,
      index: true,
    },
    expiresAt: {
      type: Date,
      default: null,
      index: true,
    },
    deleteToken: {
      type: String,
      select: false,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        delete ret._id;
        delete ret.__v;
        delete ret.deleteToken;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      transform: (doc, ret) => {
        delete ret._id;
        delete ret.__v;
        delete ret.deleteToken;
        return ret;
      },
    },
  }
);

snippetSchema.methods.isExpired = function () {
  if (!this.expiresAt) return false;
  return new Date(this.expiresAt).getTime() <= Date.now();
};

snippetSchema.index({ createdAt: -1 });
snippetSchema.index({ viewCount: -1 });
snippetSchema.index({ language: 1, createdAt: -1 });
snippetSchema.index({ tags: 1 });

const SnippetModel = mongoose.model('Snippet', snippetSchema);

/**
 * Universal Snippet Data Adapter:
 * Uses real MongoDB Mongoose model when connected (readyState === 1).
 * Seamlessly uses localStore when MongoDB is not running or Atlas URI is not yet configured.
 */
const Snippet = {
  create: async (doc) => {
    if (mongoose.connection.readyState === 1) {
      return SnippetModel.create(doc);
    }
    return localStore.create(doc);
  },

  exists: async (filter) => {
    if (mongoose.connection.readyState === 1) {
      return SnippetModel.exists(filter);
    }
    return localStore.exists(filter);
  },

  findOne: (filter) => {
    if (mongoose.connection.readyState === 1) {
      return SnippetModel.findOne(filter);
    }
    return localStore.findOne(filter);
  },

  find: (filter) => {
    if (mongoose.connection.readyState === 1) {
      return SnippetModel.find(filter);
    }
    return localStore.find(filter);
  },

  findByIdAndUpdate: async (id, update, options) => {
    if (mongoose.connection.readyState === 1) {
      return SnippetModel.findByIdAndUpdate(id, update, options);
    }
    return localStore.findByIdAndUpdate(id, update, options);
  },

  countDocuments: async (filter) => {
    if (mongoose.connection.readyState === 1) {
      return SnippetModel.countDocuments(filter);
    }
    return localStore.countDocuments(filter);
  },

  deleteOne: async (filter) => {
    if (mongoose.connection.readyState === 1) {
      return SnippetModel.deleteOne(filter);
    }
    return localStore.deleteOne(filter);
  },

  aggregate: async (pipeline) => {
    if (mongoose.connection.readyState === 1) {
      return SnippetModel.aggregate(pipeline);
    }
    return localStore.aggregate(pipeline);
  },
};

export default Snippet;
