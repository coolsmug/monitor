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
        trim: true,
    },
    school_motto: {
        type : String,
        trim: true,
        
    },
    country: {
        type : String,
       trim: true,
    },
    state: {
        type : String,
        trim: true,
       
    },
    city: {
        type : String,
        trim: true,
        
    },
    address: {
        type : String,
        trim: true,
       
    },
    address2: {
        type : String,
        trim: true, 
    },
    phone_no : {
        type:String,
        trim: true,
        
    },
    phone_no2 : {
        type:String,
        trim: true,
        
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        lowercase: true,
        match: [/\S+@\S+\.\S+/, 'is invalid'],
    },
    password: {
        type: String,
        required: true,
      },
    website: {
        type: String,
        trim: true,
       
    },
     image:{
        url: String,       
        publicId: String,

        },
    img:{
        url: String,       
        publicId: String,  
      
      },
   
    fees:{ 
        type: String, 
        default: 'pending' 
    },
    opening_day:{ 
        type: String,
        trim: true, 
    },
    closing_day:{ 
        type: String,  
        trim: true,
    },
    opening_hour:{ 
        type: String,  
        trim: true,
    },
    closing_hour:{ 
        type: String,  
        trim: true,
    },
    subdomain: {
        type: String,
        unique: true,
        lowercase: true,
        trim: true
      },
      
    about:{ 
        type: String, 
      
    },
    mission:{ 
        type: String, 
        
    },
    career: {
        type: String,
    },

    vision:{ 
        type: String, 
       
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
      x: {
    type: String,
    trim: true
  },
  instagram: {
    type: String,
    trim: true
  },
  facebook: {
    type: String,
    trim: true
  },
  linkedin: {
    type: String,
    trim: true
  },
      createdAt: {
        type: Date,
        default: Date.now // Set default value to the current date and time when the document is created
    }


}, { timestamps: true })

const School = mongoose.model('School', SchoolSchema);
module.exports = School;