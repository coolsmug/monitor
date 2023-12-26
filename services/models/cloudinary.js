const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
  cloudinaryUrl: {
    type: String,
    required: true
  },
  // Other fields...
});

const File = mongoose.model('File', fileSchema);

module.exports = File;
