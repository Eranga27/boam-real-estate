import multer from 'multer';
import path from 'path';

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename(req, file, cb) {
    cb(
      null,
      `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
    );
  },
});

// Upload validation failures are client errors (400), not server errors
function uploadError(message: string): Error {
  return Object.assign(new Error(message), { status: 400 });
}

function checkFileType(file: Express.Multer.File, cb: multer.FileFilterCallback) {
  // Listing forms send their property video in the "video" field
  if (file.fieldname === 'video') {
    const videoExt = /\.(mp4|mov|webm)$/i.test(path.extname(file.originalname));
    const videoMime = /^video\/(mp4|quicktime|webm)$/.test(file.mimetype);
    if (videoExt && videoMime) {
      return cb(null, true);
    }
    return cb(uploadError('Videos must be MP4, MOV or WebM files.'));
  }

  const filetypes = /jpg|jpeg|png/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(uploadError('Images only! Please upload JPG or PNG files.'));
  }
}

const upload = multer({
  storage,
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
});

export default upload;
