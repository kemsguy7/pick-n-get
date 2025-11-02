import express from 'express';
import multer from 'multer';
import { uploadDocument, uploadMultipleDocuments } from '../controllers/uploadController.js';

const router = express.Router();

// Configure multer for memory storage
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allowed file types
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type. Allowed: ${allowedTypes.join(', ')}`));
    }
  },
});

// Single file upload
router.post('/document', upload.single('file'), uploadDocument);

// Multiple files upload
router.post('/documents', upload.array('files', 10), uploadMultipleDocuments);

export default router;
