const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:5000/api/v1';

/**
 * Upload result from backend
 */
export interface HederaUploadResult {
  success: boolean;
  fileId?: string;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
  uploadedAt?: string;
  error?: string;
}

/**
 * Upload a single file to Hedera via backend
 */
export const uploadToHedera = async (
  file: File,
  onProgress?: (progress: number) => void,
): Promise<HederaUploadResult> => {
  console.log('🚀 Uploading to Hedera:', file.name);

  try {
    const formData = new FormData();
    formData.append('file', file);

    const xhr = new XMLHttpRequest();

    // Track upload progress
    if (onProgress) {
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percentComplete = (e.loaded / e.total) * 100;
          onProgress(Math.round(percentComplete));
        }
      });
    }

    const response = await new Promise<Response>((resolve, reject) => {
      xhr.open('POST', `${BACKEND_URL}/upload/document`);

      xhr.onload = () => {
        resolve(
          new Response(xhr.responseText, {
            status: xhr.status,
            statusText: xhr.statusText,
          }),
        );
      };

      xhr.onerror = () => reject(new Error('Network error'));
      xhr.send(formData);
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('❌ Upload failed:', result);
      return {
        success: false,
        error: result.message || result.error || 'Upload failed',
      };
    }

    console.log('✅ Upload successful:', result.data.fileId);

    return {
      success: true,
      fileId: result.data.fileId,
      fileName: result.data.fileName,
      fileSize: result.data.fileSize,
      mimeType: result.data.mimeType,
      uploadedAt: result.data.uploadedAt,
    };
  } catch (error: unknown) {
    console.error('❌ Hedera upload error:', error);

    let errorMessage = 'Failed to upload to Hedera';
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    }

    return {
      success: false,
      error: errorMessage,
    };
  }
};

/**
 * Upload multiple files to Hedera
 */
export const uploadMultipleToHedera = async (
  files: File[],
  onProgress?: (fileIndex: number, progress: number) => void,
): Promise<{ uploaded: HederaUploadResult[]; failed: HederaUploadResult[] }> => {
  console.log(`📦 Uploading ${files.length} files to Hedera...`);

  const uploaded: HederaUploadResult[] = [];
  const failed: HederaUploadResult[] = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];

    const result = await uploadToHedera(file, (progress) => {
      if (onProgress) {
        onProgress(i, progress);
      }
    });

    if (result.success) {
      uploaded.push(result);
    } else {
      failed.push({ ...result, fileName: file.name });
    }
  }

  return { uploaded, failed };
};

/**
 * Validate file before upload
 */
export const validateFile = (
  file: File,
  options: {
    maxSize?: number;
    allowedTypes?: string[];
  } = {},
): { isValid: boolean; errors?: string[] } => {
  const errors: string[] = [];

  const maxSize = options.maxSize || 10 * 1024 * 1024; // 10MB
  const allowedTypes = options.allowedTypes || [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'application/pdf',
  ];

  // Check file size
  if (file.size > maxSize) {
    errors.push(
      `File size (${(file.size / (1024 * 1024)).toFixed(2)}MB) exceeds limit (${(maxSize / (1024 * 1024)).toFixed(2)}MB)`,
    );
  }

  // Check file type
  if (!allowedTypes.includes(file.type)) {
    errors.push(`File type ${file.type} not allowed. Allowed: ${allowedTypes.join(', ')}`);
  }

  return {
    isValid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
  };
};
