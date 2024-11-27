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
     pageImage: { 
        url: String,      
        publicId: String,
    },
    img: { 
        url: String,      
        publicId: String,
    },
    schoolId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'School'
      },
      
    createdAt: {
        type: Date,
        default: Date.now // Set default value to the current date and time when the document is created
    }
}, 
{timestamps: true} );

const Event = mongoose.model('Event', eventSchema );
module.exports = Event;