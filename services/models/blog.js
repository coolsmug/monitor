const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const blogSchema = new Schema ({
    img:{
        url: String, 
        publicId: String,
      },
    image:{
        url: String, 
        publicId: String,
    },
    headline: {
        type: String
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
    schoolId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'School'
      },  
    createdAt: {
        type: Date,
        default: Date.now 
    }
}, 
{timestamps: true});

const Blog = mongoose.model('Blog', blogSchema );
module.exports = Blog;