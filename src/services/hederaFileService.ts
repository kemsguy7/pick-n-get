import {
  Client,
  PrivateKey,
  FileCreateTransaction,
  FileAppendTransaction,
  FileContentsQuery,
  Hbar,
  FileId,
} from '@hashgraph/sdk';

/**
 * Hedera File Service Configuration
 */
interface HederaConfig {
  operatorId: string;
  operatorKey: string;
  network: 'testnet' | 'mainnet';
}

/**
 * File Upload Result
 */
export interface FileUploadResult {
  success: boolean;
  fileId?: string;
  error?: string;
  metadata?: {
    fileName: string;
    fileSize: number;
    uploadedAt: string;
  };
}

/**
 * Initialize Hedera Client
 */
function initializeHederaClient(config: HederaConfig): Client {
  let client: Client;

  if (config.network === 'testnet') {
    client = Client.forTestnet();
  } else {
    client = Client.forMainnet();
  }

  // Handle both hex string and PrivateKey object
  let operatorKey: PrivateKey;

  if (typeof config.operatorKey === 'string') {
    // Remove '0x' prefix if present
    const keyString = config.operatorKey.startsWith('0x')
      ? config.operatorKey.slice(2)
      : config.operatorKey;

    operatorKey = PrivateKey.fromStringECDSA(keyString);
  } else {
    operatorKey = config.operatorKey as PrivateKey;
  }

  client.setOperator(config.operatorId, operatorKey);

  return client;
}
/**
 * Get Hedera config from environment variables
 */
export function getHederaConfig(): HederaConfig {
  const operatorId = process.env.HEDERA_OPERATOR_ID;
  const operatorKey = process.env.HEDERA_OPERATOR_KEY;
  const network = (process.env.HEDERA_NETWORK || 'testnet') as 'testnet' | 'mainnet';

  if (!operatorId || !operatorKey) {
    throw new Error(
      'Hedera credentials not configured. Please set HEDERA_OPERATOR_ID and HEDERA_OPERATOR_KEY',
    );
  }

  return { operatorId, operatorKey, network };
}

/**
 * Upload file to Hedera File Service
 * Handles files of any size by chunking
 */
export async function uploadToHederaFS(
  fileBuffer: Buffer,
  fileName: string,
  config?: HederaConfig,
): Promise<FileUploadResult> {
  console.log(`📤 Starting Hedera File Service upload for: ${fileName}`);
  console.log(`📊 File size: ${fileBuffer.length} bytes`);

  try {
    const hederaConfig = config || getHederaConfig();
    const client = initializeHederaClient(hederaConfig);

    // Hedera File Service chunk size (4KB per transaction)
    const CHUNK_SIZE = 4096;
    const fileSize = fileBuffer.length;

    // Create file with first chunk
    const firstChunk = fileBuffer.slice(0, Math.min(CHUNK_SIZE, fileSize));

    console.log('📝 Creating file on Hedera network...');

    const fileCreateTx = new FileCreateTransaction()
      .setKeys([client.operatorPublicKey!])
      .setContents(firstChunk)
      .setMaxTransactionFee(new Hbar(2));

    const fileCreateSubmit = await fileCreateTx.execute(client);
    const fileCreateRx = await fileCreateSubmit.getReceipt(client);
    const fileId = fileCreateRx.fileId;

    if (!fileId) {
      throw new Error('Failed to create file on Hedera network');
    }

    console.log(`✅ File created with ID: ${fileId.toString()}`);

    // Append remaining chunks if file is larger than 4KB
    if (fileSize > CHUNK_SIZE) {
      console.log(
        `📦 Appending ${Math.ceil((fileSize - CHUNK_SIZE) / CHUNK_SIZE)} additional chunks...`,
      );

      for (let i = CHUNK_SIZE; i < fileSize; i += CHUNK_SIZE) {
        const chunk = fileBuffer.slice(i, Math.min(i + CHUNK_SIZE, fileSize));

        const fileAppendTx = new FileAppendTransaction()
          .setFileId(fileId)
          .setContents(chunk)
          .setMaxTransactionFee(new Hbar(2));

        await fileAppendTx.execute(client);

        console.log(`✅ Appended chunk ${Math.floor(i / CHUNK_SIZE) + 1}`);
      }
    }

    console.log(`🎉 File upload complete: ${fileId.toString()}`);

    return {
      success: true,
      fileId: fileId.toString(),
      metadata: {
        fileName,
        fileSize,
        uploadedAt: new Date().toISOString(),
      },
    };
  } catch (error: any) {
    console.error('❌ Hedera File Service upload failed:', error);

    return {
      success: false,
      error: error.message || 'Failed to upload file to Hedera File Service',
    };
  }
}

/**
 * Retrieve file contents from Hedera File Service
 */
export async function getFileFromHederaFS(
  fileIdString: string,
  config?: HederaConfig,
): Promise<{ success: boolean; content?: Buffer; error?: string }> {
  console.log(`📥 Retrieving file from Hedera: ${fileIdString}`);

  try {
    const hederaConfig = config || getHederaConfig();
    const client = initializeHederaClient(hederaConfig);

    const fileId = FileId.fromString(fileIdString);

    const query = new FileContentsQuery().setFileId(fileId).setMaxQueryPayment(new Hbar(1));

    const contents = await query.execute(client);

    console.log(`✅ File retrieved successfully: ${contents.length} bytes`);

    return {
      success: true,
      content: Buffer.from(contents),
    };
  } catch (error: any) {
    console.error('❌ Failed to retrieve file from Hedera:', error);

    return {
      success: false,
      error: error.message || 'Failed to retrieve file from Hedera File Service',
    };
  }
}

/**
 * Validate file before upload
 */
export function validateFile(
  file: Express.Multer.File,
  options: {
    maxSize?: number;
    allowedTypes?: string[];
  } = {},
): { isValid: boolean; errors?: string[] } {
  const errors: string[] = [];

  // Default: 10MB max
  const maxSize = options.maxSize || 10 * 1024 * 1024;

  // Default allowed types
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
  if (!allowedTypes.includes(file.mimetype)) {
    errors.push(`File type ${file.mimetype} not allowed. Allowed: ${allowedTypes.join(', ')}`);
  }

  return {
    isValid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
  };
}
