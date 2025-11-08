import { Request, Response } from 'express';
import { uploadToHederaFS, validateFile, getFileFromHederaFS } from '../services/hederaFileService.js';

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
      allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf', 'image/webp'],
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

/**
 * ✅ NEW: Retrieve and serve file from Hedera File Service
 * GET /api/v1/upload/file/:fileId
 */
export const getFile = async (req: Request, res: Response) => {
  try {
    const { fileId } = req.params;

    if (!fileId) {
      return res.status(400).json({
        status: 'error',
        message: 'File ID is required',
      });
    }

    console.log(`📥 Retrieving file: ${fileId}`);

    // Retrieve file from Hedera
    const result = await getFileFromHederaFS(fileId);

    if (!result.success || !result.content) {
      return res.status(404).json({
        status: 'error',
        message: 'File not found or failed to retrieve',
        error: result.error,
      });
    }

    // Determine content type based on file extension or content
    let contentType = 'application/octet-stream';

    // Try to detect content type from buffer
    const buffer = result.content;

    // Check magic numbers for common image types
    if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
      contentType = 'image/jpeg';
    } else if (
      buffer[0] === 0x89 &&
      buffer[1] === 0x50 &&
      buffer[2] === 0x4e &&
      buffer[3] === 0x47
    ) {
      contentType = 'image/png';
    } else if (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46) {
      contentType = 'image/gif';
    } else if (
      buffer[0] === 0x52 &&
      buffer[1] === 0x49 &&
      buffer[2] === 0x46 &&
      buffer[3] === 0x46
    ) {
      contentType = 'image/webp';
    } else if (
      buffer[0] === 0x25 &&
      buffer[1] === 0x50 &&
      buffer[2] === 0x44 &&
      buffer[3] === 0x46
    ) {
      contentType = 'application/pdf';
    }

    // Set cache headers for better performance
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
    res.setHeader('Content-Length', buffer.length);

    console.log(`✅ Serving file: ${fileId} (${contentType}, ${buffer.length} bytes)`);

    return res.send(buffer);
  } catch (error: any) {
    console.error('File retrieval error:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to retrieve file',
    });
  }
};
