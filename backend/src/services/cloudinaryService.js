import cloudinary from '../config/cloudinary.js';
import ApiError from '../utils/ApiError.js';

const streamUpload = (buffer, folder) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image' },
      (error, result) => {
        if (result) resolve(result);
        else reject(error);
      }
    );
    uploadStream.end(buffer);
  });
};

export const uploadImage = async (fileBuffer, folder = 'tgs/products') => {
  try {
    const result = await streamUpload(fileBuffer, folder);
    return { url: result.secure_url, publicId: result.public_id };
  } catch (error) {
    throw new ApiError(500, 'Image upload failed');
  }
};

export const uploadImages = async (files, folder = 'tgs/products') => {
  const uploads = files.map((file) => uploadImage(file.buffer, folder));
  return Promise.all(uploads);
};

export const deleteImage = async (publicId) => {
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    throw new ApiError(500, 'Image deletion failed');
  }
};
