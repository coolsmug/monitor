const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const blogSchema = new Schema({
  img: {
    url: String,
    publicId: String,
  },
  headline: {
    type: String,
  },
  slug: {
    type: String,
    unique: true,
  },
  author: {
    type: String,
  },
  content: {
    type: String,
  },
  excerpt: {
    type: String,
    maxlength: 300,
  },
  category: {
    type: String,
  },
  tags: [String],

 status: {
  type: String,
  enum: ['draft', 'published', 'archived'],
  default: 'draft',
  set: v => v.toLowerCase()
},
  metaDescription: {
    type: String,
    maxlength: 160,
  },
  readTime: {
    type: String,
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  schoolId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'School'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {timestamps: true});

const Blog = mongoose.model('Blog', blogSchema);
module.exports = Blog;
