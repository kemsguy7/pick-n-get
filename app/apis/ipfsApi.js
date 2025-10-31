// Browser-compatible IPFS API using Pinata
console.log("Initializing IPFS API with Pinata...");


const PINATA_JWT = process.env.NEXT_PUBLIC_IPFS_WRITE_JWT;
const PINATA_GATEWAY = process.env.NEXT_PUBLIC_GATEWAY_URL || "https://gateway.pinata.cloud";

if (!PINATA_JWT) {
  console.error("Missing NEXT_PUBLIC_IPFS_WRITE_JWT environment variable");
}

/**
 * Upload a file to IPFS using Pinata REST API
 * @param {File} file - The file to upload
 * @param {string} fileName - Optional custom filename
 * @returns {Promise<{success: boolean, cid?: string, url?: string, error?: string}>}
 */
export const uploadToIPFS = async (file, fileName = null) => {
  console.log("Starting IPFS upload...");
    console.log("🚀 uploadToIPFS called with file:", file?.name);
  console.log("🔑 PINATA_JWT exists:", !!PINATA_JWT);
  console.log("File details:", {
    name: file?.name,
    size: file?.size,
    type: file?.type,
    customFileName: fileName
  });

  if (!file) {
    console.error("No file provided for upload");
    return {
      success: false,
      error: "No file selected"
    };
  }

  if (!PINATA_JWT) {
    console.error("Pinata JWT not configured");
    return {
      success: false,
      error: "IPFS upload not configured. Missing API key."
    };
  }

  try {
    console.log("Uploading file to Pinata...");
    
    // Create FormData for file upload
    const formData = new FormData();
    formData.append('file', file);
    
    // Add metadata
    const metadata = {
      name: fileName || file.name || 'uploaded-file',
      keyvalues: {
        uploadedAt: new Date().toISOString(),
        originalName: file.name,
        fileSize: file.size.toString(),
        contentType: file.type
      }
    };
    
    formData.append('pinataMetadata', JSON.stringify(metadata));
    
    // Upload using Pinata API
    const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PINATA_JWT}`
      },
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Pinata API error:", errorData);
      throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    
    console.log("Upload successful!");
    console.log("Upload result:", result);

    // Generate the public URL
    const publicUrl = `${PINATA_GATEWAY}/ipfs/${result.IpfsHash}`;
    
    console.log("Public URL generated:", publicUrl);

    return {
      success: true,
      cid: result.IpfsHash,
      url: publicUrl,
      metadata: {
        name: metadata.name,
        size: result.PinSize,
        timestamp: result.Timestamp
      }
    };

  } catch (error) {
    console.error("IPFS upload failed:", error);
    
    let errorMessage = "Failed to upload file to IPFS";
    
    if (error.message.includes('401')) {
      errorMessage = "Invalid Pinata API key";
    } else if (error.message.includes('413')) {
      errorMessage = "File size exceeds limit";
    } else if (error.message.includes('Network')) {
      errorMessage = "Network error - please check your connection";
    } else {
      errorMessage = error.message || "Upload failed";
    }

    return {
      success: false,
      error: errorMessage
    };
  }
};

/**
 * Test Pinata connection by making a simple API call
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const testPinataConnection = async () => {
  try {
    console.log("🔌 Testing Pinata connection...");
    
    // Test connection by making a simple request to Pinata
    const response = await fetch('https://api.pinata.cloud/data/testAuthentication', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${PINATA_JWT}`
      }
    });

    if (response.ok) {
      console.log("✅ Pinata connection test successful");
      return { success: true };
    } else {
      const errorText = await response.text();
      console.error("❌ Pinata connection test failed:", response.status, errorText);
      return { 
        success: false, 
        error: `Pinata API error: ${response.status}` 
      };
    }

  } catch (error) {
    console.error("❌ Pinata connection test failed:", error);
    
    let errorMessage = "Failed to connect to Pinata";
    
    if (error.message.includes('Network')) {
      errorMessage = "Network error - please check your connection";
    } else if (error.message.includes('401')) {
      errorMessage = "Invalid Pinata API key";
    } else {
      errorMessage = error.message || "Connection failed";
    }

    return { 
      success: false, 
      error: errorMessage 
    };
  }
};

/**
 * Upload multiple files to IPFS
 * @param {File[]} files - Array of files to upload
 * @returns {Promise<{success: boolean, uploads?: Array, errors?: Array}>}
 */
export const uploadMultipleToIPFS = async (files) => {
  console.log(`Starting bulk upload of ${files.length} files...`);
  
  if (!files || files.length === 0) {
    console.error("No files provided for bulk upload");
    return {
      success: false,
      error: "No files provided"
    };
  }

  const uploads = [];
  const errors = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    console.log(`Uploading file ${i + 1}/${files.length}: ${file.name}`);
    
    const result = await uploadToIPFS(file);
    
    if (result.success) {
      uploads.push({
        index: i,
        fileName: file.name,
        cid: result.cid,
        url: result.url,
        metadata: result.metadata
      });
      console.log(`File ${i + 1} uploaded successfully`);
    } else {
      errors.push({
        index: i,
        fileName: file.name,
        error: result.error
      });
      console.error(`File ${i + 1} upload failed:`, result.error);
    }
  }

  console.log(`Bulk upload complete: ${uploads.length} successful, ${errors.length} failed`);

  return {
    success: errors.length === 0,
    uploads,
    errors: errors.length > 0 ? errors : undefined,
    summary: {
      total: files.length,
      successful: uploads.length,
      failed: errors.length
    }
  };
};

/**
 * Fetch file content from IPFS using CID
 * @param {string} cid - The IPFS content identifier
 * @returns {Promise<{success: boolean, url?: string, error?: string}>}
 */
export const fetchFromIPFS = async (cid) => {
  console.log("Fetching file from IPFS...");
  console.log("CID:", cid);

  if (!cid || cid.trim().length === 0) {
    console.error("No CID provided");
    return {
      success: false,
      error: "No CID provided"
    };
  }

  try {
    // Generate the public URL directly
    const fileUrl = `${PINATA_GATEWAY}/ipfs/${cid}`;
    
    console.log("File URL generated successfully");
    console.log("URL:", fileUrl);

    return {
      success: true,
      url: fileUrl,
      cid: cid
    };

  } catch (error) {
    console.error("Failed to fetch from IPFS:", error);

    return {
      success: false,
      error: error.message || "Failed to fetch file from IPFS"
    };
  }
};

/**
 * Validate file before upload
 * @param {File} file - The file to validate
 * @param {object} options - Validation options
 * @returns {Promise<{isValid: boolean, errors?: string[]}>}
 */
export const validateFile = async (file, options = {}) => {
  console.log("Validating file...");
  console.log("File:", file?.name);
  console.log("Options:", options);

  const errors = [];
  
  // Default validation options
  const {
    maxSize = 10 * 1024 * 1024, // 10MB default
    allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'],
    requiredExtensions = ['jpg', 'jpeg', 'png', 'pdf']
  } = options;

  if (!file) {
    errors.push("No file provided");
    return { isValid: false, errors };
  }

  // Check file size
  if (file.size > maxSize) {
    const maxSizeMB = maxSize / (1024 * 1024);
    errors.push(`File size (${(file.size / (1024 * 1024)).toFixed(2)}MB) exceeds limit (${maxSizeMB}MB)`);
  }

  // Check file type
  if (allowedTypes && allowedTypes.length > 0) {
    const isAllowed = allowedTypes.some(type => {
      if (type.includes('*')) {
        const baseType = type.split('/')[0];
        return file.type.startsWith(baseType);
      }
      return file.type === type;
    });

    if (!isAllowed) {
      errors.push(`File type ${file.type} is not allowed. Allowed types: ${allowedTypes.join(', ')}`);
    }
  }

  // Check file extension if required
  if (requiredExtensions && requiredExtensions.length > 0) {
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    if (!fileExtension || !requiredExtensions.includes(fileExtension)) {
      errors.push(`File extension not allowed. Allowed: ${requiredExtensions.join(', ')}`);
    }
  }

  console.log(`File validation ${errors.length === 0 ? 'passed' : 'failed'}:`, {
    isValid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined
  });

  return {
    isValid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined
  };
};

export default {
  uploadToIPFS,
  uploadMultipleToIPFS,
  fetchFromIPFS,
  validateFile
};