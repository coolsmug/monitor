const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const blogSchema = new Schema ({
    headline: {
        type: String
    },
    img:{
        url: String,
        publicId: String,
      },
    author: {
        type: String
    },
    content: {
        type: String
    },
    category: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now 
    }
}, 
{timestamps: true});

const Blog = mongoose.model('Blog', blogSchema );
module.exports = Blog;