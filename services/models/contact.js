const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const contactSchema = new Schema ({

    names : {
        type: String,
        required: true,
        trim: true
    },
   
    email: {
        type: String,
        required: true,
        trim: true
    },
    subject: {
        type: String,
    },
     messages: {
        type: String,
    },
    mobile: {
        type: String,
    },
    createdAt: {
        type: Date,
        default: Date.now // Set default value to the current date and time when the document is created
    },

},
{ timestamps: true }
);

const Contact = mongoose.model("Contact", contactSchema);

module.exports = Career;