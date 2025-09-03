const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const eventSchema = new Schema ({
    event_name : {
        type: String,
    },
    venue : {
        type: String,
    },
    dates: {
        type: String
    },
    content: {
        type: String
    },
    start: {
        type: String
    },
    end: {
        type: String
    },
    excerpt: {
      type: String,
      maxlength: 300,
    },
    img: {
        url: String,
        publicId: String,
      }, 
    event_type: {
        type: String,
        enum: ['upcoming', 'past'],
        default: 'upcoming'
      },
    event_status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
      },   
      slug: { type: String, unique: true },   
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
{timestamps: true} );

const Event = mongoose.model('Event', eventSchema );
module.exports = Event;