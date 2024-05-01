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
    school_motto: {
        type : String,
        
    },
    country: {
        type : String,
       
    },
    state: {
        type : String,
       
    },
    city: {
        type : String,
        
    },
    address: {
        type : String,
       
    },
    address2: {
        type : String,
        
    },
    phone_no : {
        type:String,
        
    },
    phone_no2 : {
        type:String,
        
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
       
    },
    img:{
        url: String,       // Cloudinary URL
        publicId: String,  // Cloudinary Public ID 
      
      },
    fees:{ 
        type: String, 
        default: 'pending' 
    },
    status: { 
        type: Boolean, 
        default: true,
      },
    verified: { 
        type: Boolean, 
        default: false,
      },
    expiry: {
        type: Date,
        required: true
      },
      createdAt: {
        type: Date,
        default: Date.now // Set default value to the current date and time when the document is created
    }


}, { timestamps: true })

const School = mongoose.model('School', SchoolSchema);
module.exports = School;