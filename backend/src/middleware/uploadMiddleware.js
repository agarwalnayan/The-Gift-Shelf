import multer from 'multer';
import ApiError from '../utils/ApiError.js';

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'image/gif', 'image/svg+xml'];
  const hasAllowedMime = allowedTypes.includes(file.mimetype) || file.mimetype.startsWith('image/');
  const hasAllowedExtension = /\.(jpe?g|png|webp|gif|svg)$/i.test(file.originalname || '');
  const isAllowed = hasAllowedMime || hasAllowedExtension;

  if (isAllowed) {
    cb(null, true);
  } else {
    cb(new ApiError(400, 'Only image files are allowed'), false);
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});
