import multer from 'multer';
import path from 'path';
import cloudinary from '../config/cloudinary.js';

// Custom Cloudinary Storage Engine
const storage = {
    _handleFile: (req, file, cb) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: 'construx_uploads',
                resource_type: 'auto',
            },
            (error, result) => {
                if (error) {
                    return cb(error);
                }
                cb(null, {
                    path: result.secure_url,
                    filename: result.public_id,
                    originalname: file.originalname,
                    mimetype: result.format ? `${result.resource_type}/${result.format}` : file.mimetype,
                    size: result.bytes,
                });
            }
        );
        file.stream.pipe(uploadStream);
    },
};

const checkFileType = (file, cb) => {
    // Allowed file extensions
    const filetypes = /jpg|jpeg|png|mp4|mkv|avi|mov/;
    // Check extension
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    // Check mime
    const mimetype = /jpeg|jpg|png|mp4|mpeg|quicktime|video/.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb('Images and Videos only!');
    }
};

const upload = multer({
    storage: storage,
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    },
});

export default upload;
