const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const recoverySchema = new Schema ({
    recovery: {
        type: String,
        required: true,
        trim: true
    },  
    user_email: {
        type: String,
        required: true,
        trim: true
    },
    isUsed: {
        type: Boolean,
        default: false,
    },
    expiry: {
        type: Date,
        required: true
      },
},
{ timestamps: true }
);

const gmailRecoveryCode = mongoose.model("Recovery", recoverySchema);

module.exports = gmailRecoveryCode;