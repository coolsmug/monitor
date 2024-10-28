const multer = require('multer');

// Configure multer
const storage = multer.diskStorage({
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});

const upload = multer({ storage });

// Middleware to handle multiple file uploads
exports.uploadMultiple = upload.fields([
    { name: 'img', maxCount: 1 },
    { name: 'image', maxCount: 1 }
]);
