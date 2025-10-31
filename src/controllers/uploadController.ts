// src/controllers/uploadController.ts
import { Request, Response } from 'express';
import { uploadToHederaFS, validateFile } from '../services/hederaFileService';

/**
 * Upload a single document to Hedera File Service
 * POST /api/v1/upload/document
 */
export const uploadDocument = async (req: Request, res: Response) => {
  try {
    // Check if file exists
    if (!req.file) {
      return res.status(400).json({
        status: 'error',
        message: 'No file uploaded',
      });
    }

    const file = req.file;

    // Validate file
    const validation = validateFile(file, {
      maxSize: 10 * 1024 * 1024, // 10MB
      allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'],
    });

    if (!validation.isValid) {
      return res.status(400).json({
        status: 'error',
        message: 'File validation failed',
        errors: validation.errors,
      });
    }

    // Upload to Hedera
    const result = await uploadToHederaFS(file.buffer, file.originalname);

    if (!result.success) {
      return res.status(500).json({
        status: 'error',
        message: 'Failed to upload file to Hedera',
        error: result.error,
      });
    }

    return res.status(200).json({
      status: 'success',
      message: 'File uploaded successfully to Hedera File Service',
      data: {
        fileId: result.fileId,
        fileName: file.originalname,
        fileSize: file.size,
        mimeType: file.mimetype,
        uploadedAt: result.metadata?.uploadedAt,
      },
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to upload document',
    });
  }
};

/**
 * Upload multiple documents to Hedera File Service
 * POST /api/v1/upload/documents
 */
export const uploadMultipleDocuments = async (req: Request, res: Response) => {
  try {
    // Check if files exist (req.files should be an array for multer array upload)
    const files = req.files as Express.Multer.File[] | undefined;

    if (!files || files.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'No files uploaded',
      });
    }

    const uploadResults: any[] = [];
    const errors: any[] = [];

    // Upload each file
    for (const file of files) {
      // Validate
      const validation = validateFile(file);

      if (!validation.isValid) {
        errors.push({
          fileName: file.originalname,
          errors: validation.errors,
        });
        continue;
      }

      // Upload to Hedera
      const result = await uploadToHederaFS(file.buffer, file.originalname);

      if (result.success) {
        uploadResults.push({
          fileName: file.originalname,
          fileId: result.fileId,
          fileSize: file.size,
          mimeType: file.mimetype,
        });
      } else {
        errors.push({
          fileName: file.originalname,
          error: result.error,
        });
      }
    }

    return res.status(200).json({
      status: errors.length === 0 ? 'success' : 'partial_success',
      message: `Uploaded ${uploadResults.length} of ${files.length} files`,
      data: {
        uploaded: uploadResults,
        failed: errors.length > 0 ? errors : undefined,
      },
    });
  } catch (error: any) {
    console.error('Multiple upload error:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to upload documents',
    });
  }
};
