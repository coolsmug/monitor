const mongoose = require('mongoose');
const Schema = mongoose.Schema;

SchoolSchema = new Schema({
    school_id: {
        type: String,
        required: true,
    },
    
    school_name: {
        type: String,
        required: true,
    },
    country: {
        type : String,
        required: true,
    },
    state: {
        type : String,
        required: true,
    },
    city: {
        type : String,
        required: true,
    },
    address: {
        type : String,
        required: true,
    },
    address2: {
        type : String,
        required: true,
    },
    phone_no : {
        type:String,
        required: true,
    },
    phone_no2 : {
        type:String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
      },
    website: {
        type: String,
        required: true,
    },
    img: {
        data: Buffer,
        contentType: String,
    },
    fees:{ 
        type: String, 
        default: 'pending' 
    },
    status: { 
        type: Boolean, 
        default: false,
      },
    expiry: {
        type: Date,
        required: true
      },


}, { timestamps: true })

const School = mongoose.model('School', SchoolSchema);
module.exports = School;