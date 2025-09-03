const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TestSchema = new Schema ({
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

const Testimony = mongoose.model('Testimony', testimonySchema );
module.exports = Testimony;