const path = require('path');
const multer = require('multer');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${file.fieldname}-${uniqueSuffix}`);
  },
});

// Define the maximum size for uploading
// picture i.e. 1 MB. it is optional
const maxSize = 1 * 1000 * 1000;

const filesToAccept = function (req, file, cb) {
  let fileTypes = '';

  if (file.fieldname === 'cv') {
    fileTypes = /pdf/;
  } else if (file.fieldname === 'profilePicture') {
    fileTypes = /png|jpeg|jpg/;
  }

  // Set the filetypes, it is optional
  //const filetypes = /pdf|png|jpeg|jpg/;
  const mimetype = fileTypes.test(file.mimetype);

  const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());

  if (mimetype && extname) {
    return cb(null, true);
  }

  cb(`Error: File upload only supports the following filetypes - ${fileTypes}`);
};

const upload = multer({
  storage: storage,
  limits: { fileSize: maxSize },
  fileFilter: filesToAccept,
}).fields([
  { name: 'cv', maxCount: 1 },
  { name: 'profilePicture', maxCount: 1 },
]);

module.exports = upload;
