import { ContractId } from '@hashgraph/sdk';
import { WalletInterface } from './wallets/walletInterface';
import { ContractFunctionParameterBuilder } from './wallets/contractFunctionParameterBuilder';

const PRODUCT_CONTRACT_ADDRESS = '0.0.7165733';
const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:5000/api/v1';

// Type definitions for product operations
export interface ProducerData {
  name: string;
  country: string;
  phoneNumber: string;
}

export interface ProductData {
  name: string;
  quantity: number;
  description: string;
  imageFileId: string; // Hedera File ID
  amount: number; // Price in HBAR (will be converted to integer)
}

export interface ProductItem {
  productId: number;
  name: string;
  quantity: number;
  owner: string;
  description: string;
  data: string; // Hedera File ID
  amount: string; // In tinybars
  productStatus: ProductStatus;
}

export enum ProductStatus {
  Available = 0,
  NotAvailable = 1,
}

export interface RegisterProducerResult {
  success: boolean;
  txHash?: string;
  registrationId?: number;
  error?: string;
  web2Saved?: boolean;
  web2Error?: string;
}

export interface AddProductResult {
  success: boolean;
  txHash?: string;
  productId?: number;
  error?: string;
}

export interface ShopProductResult {
  success: boolean;
  txHash?: string;
  error?: string;
}

export type WalletData = [string, WalletInterface | null, string];

const delay = (ms: number): Promise<void> => new Promise((res) => setTimeout(res, ms));

/**
 * Convert HBAR amount to integer (removing decimals)
 * The smart contract will multiply by 10^8 internally
 */
function hbarToInteger(hbarAmount: number): number {
  // ✅ FIX: Convert decimal HBAR to integer
  // If user enters 3.91 HBAR, convert to 391 (multiply by 100, then contract multiplies by 10^6)
  // OR just use Math.floor to remove decimals and let contract handle the rest

  // Option 1: Remove decimals completely (safest for BigNumber)
  const integerAmount = Math.floor(hbarAmount);

  console.log(
    `  - Converting HBAR amount: ${hbarAmount} → ${integerAmount} (integer for contract)`,
  );

  return integerAmount;
}

/**
 * Convert IPFS/Hedera File ID to hex bytes for smart contract
 */
function fileIdToBytes(fileId: string): string {
  try {
    if (!fileId || fileId.trim().length === 0) {
      throw new Error('Empty file ID provided');
    }

    const encoder = new TextEncoder();
    const bytes = encoder.encode(fileId);

    const hexString =
      '0x' +
      Array.from(bytes)
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');

    console.log(
      `  - Converted file ID "${fileId}" to hex (${bytes.length} bytes): ${hexString.substring(0, 20)}...`,
    );

    return hexString;
  } catch (error) {
    console.error('Error converting file ID to bytes:', error);
    throw new Error(`Failed to convert file ID to bytes: ${error}`);
  }
}

/**
 * Save producer data to Web2 backend after successful blockchain registration
 */
async function saveProducerToBackend(
  producerData: ProducerData,
  walletAddress: string,
  registrationId: number,
): Promise<{ success: boolean; error?: string }> {
  try {
    console.log(`\n- Saving producer data to Web2 backend...`);
    console.log(`  - Backend URL: ${BACKEND_API_URL}/products/producers`);

    const backendPayload = {
      registrationId,
      walletAddress,
      name: producerData.name,
      country: producerData.country,
      phoneNumber: producerData.phoneNumber,
    };

    console.log(`  - Payload prepared for backend`);

    const response = await fetch(`${BACKEND_API_URL}/products/producers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(backendPayload),
    });

    const responseData = await response.json();

    if (!response.ok) {
      console.error(`  - Backend save failed:`, responseData);
      return {
        success: false,
        error: responseData.message || 'Failed to save to backend database',
      };
    }

    console.log(`  - Successfully saved to backend ✅`);
    return { success: true };
  } catch (error) {
    console.error(`  - Error saving to backend:`, error);
    let errorMessage = 'Failed to save to backend database';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Register a new producer/vendor on the blockchain
 * @param walletData - [accountId, walletInterface, network]
 * @param producerData - Producer registration data
 * @returns Promise<RegisterProducerResult>
 */
export async function registerProducer(
  walletData: WalletData,
  producerData: ProducerData,
): Promise<RegisterProducerResult> {
  console.log(`\n=======================================`);
  console.log(`- Registering producer on blockchain...🟠`);

  try {
    const [accountId, walletInterface, network] = walletData;

    if (!walletInterface) {
      throw new Error('Wallet interface not available');
    }

    // Validate producer data
    if (!producerData.name || producerData.name.trim().length === 0) {
      throw new Error('Producer name is required');
    }
    if (!producerData.country || producerData.country.trim().length === 0) {
      throw new Error('Country is required');
    }
    if (!producerData.phoneNumber || producerData.phoneNumber.trim().length === 0) {
      throw new Error('Phone number is required');
    }

    console.log(`- Registering new producer: ${producerData.name}`);
    console.log(`- Account ID: ${accountId}`);
    console.log(`- Country: ${producerData.country}`);
    console.log(`- Phone: ${producerData.phoneNumber}`);

    // Build contract function parameters
    const functionParameters = new ContractFunctionParameterBuilder()
      .addParam({
        type: 'address',
        name: '_producer',
        value: accountId,
      })
      .addParam({
        type: 'string',
        name: '_name',
        value: producerData.name,
      })
      .addParam({
        type: 'string',
        name: '_country',
        value: producerData.country,
      })
      .addParam({
        type: 'uint256',
        name: '_phoneNumber',
        value: producerData.phoneNumber,
      });

    // Execute the contract function
    const contractId = ContractId.fromString(PRODUCT_CONTRACT_ADDRESS);
    const gasLimit = 300000;

    console.log(`- Executing registerProducer contract function...`);
    const transactionResult = await walletInterface.executeContractFunction(
      contractId,
      'registerProducer',
      functionParameters,
      gasLimit,
    );

    if (!transactionResult) {
      throw new Error('Transaction failed - no transaction ID returned');
    }

    const txHash = transactionResult.toString();
    console.log(`- Transaction submitted: ${txHash}`);

    // Wait for transaction to be processed
    console.log(`- Waiting for transaction confirmation...`);
    await delay(3000);

    // Check transaction status
    const success = await checkTransactionStatus(txHash, network);

    if (success.isSuccessful) {
      console.log(`- Producer registration on blockchain completed successfully ✅`);

      const registrationId = Date.now();

      // Save to Web2 backend
      console.log(`\n- Proceeding to save producer data to Web2 backend...`);
      const backendResult = await saveProducerToBackend(producerData, accountId, registrationId);

      return {
        success: true,
        txHash: txHash,
        registrationId: registrationId,
        web2Saved: backendResult.success,
        web2Error: backendResult.error,
      };
    } else {
      throw new Error(success.error || 'Transaction failed');
    }
  } catch (error: unknown) {
    console.error(`- Producer registration error:`, error);

    let errorMessage: string = 'Producer registration failed';

    if (error instanceof Error) {
      const message = error.message.toLowerCase();

      if (message.includes('already registered')) {
        errorMessage = 'Producer already registered';
      } else if (
        message.includes('insufficient funds') ||
        message.includes('insufficient balance')
      ) {
        errorMessage = 'Insufficient HBAR balance for transaction';
      } else if (
        message.includes('user rejected') ||
        message.includes('user denied') ||
        message.includes('rejected')
      ) {
        errorMessage = 'Transaction rejected by user';
      } else {
        errorMessage = error.message;
      }
    }

    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Add a new product to the marketplace
 * @param walletData - [accountId, walletInterface, network]
 * @param productData - Product details
 * @returns Promise<AddProductResult>
 */
export async function addProduct(
  walletData: WalletData,
  productData: ProductData,
): Promise<AddProductResult> {
  console.log(`\n=======================================`);
  console.log(`- Adding product to marketplace...🟠`);

  try {
    const [accountId, walletInterface, network] = walletData;
    console.log(accountId);
    if (!walletInterface) {
      throw new Error('Wallet interface not available');
    }

    // Validate product data
    if (!productData.name || productData.name.trim().length === 0) {
      throw new Error('Product name is required');
    }
    if (productData.quantity <= 0) {
      throw new Error('Quantity must be greater than 0');
    }
    if (!productData.description || productData.description.trim().length === 0) {
      throw new Error('Product description is required');
    }
    if (!productData.imageFileId || productData.imageFileId.trim().length === 0) {
      throw new Error('Product image is required');
    }
    if (productData.amount <= 0) {
      throw new Error('Price must be greater than 0');
    }

    console.log(`- Adding product: ${productData.name}`);
    console.log(`- Quantity: ${productData.quantity}`);
    console.log(`- Price: ${productData.amount} HBAR`);
    console.log(`- Image File ID: ${productData.imageFileId}`);

    // ✅ FIX: Convert HBAR to integer for BigNumber
    const integerAmount = hbarToInteger(productData.amount);

    // Convert image file ID to bytes
    const imageHex = fileIdToBytes(productData.imageFileId);

    // Build contract function parameters
    const functionParameters = new ContractFunctionParameterBuilder()
      .addParam({
        type: 'string',
        name: '_name',
        value: productData.name,
      })
      .addParam({
        type: 'uint256',
        name: '_quantity',
        value: productData.quantity,
      })
      .addParam({
        type: 'string',
        name: '_description',
        value: productData.description,
      })
      .addParam({
        type: 'bytes',
        name: '_data',
        value: imageHex,
      })
      .addParam({
        type: 'uint256',
        name: '_amount',
        value: integerAmount, // ✅ FIX: Use integer instead of decimal
      });

    // Execute the contract function
    const contractId = ContractId.fromString(PRODUCT_CONTRACT_ADDRESS);
    const gasLimit = 500000;

    console.log(`- Executing addProduct contract function...`);
    const transactionResult = await walletInterface.executeContractFunction(
      contractId,
      'addProduct',
      functionParameters,
      gasLimit,
    );

    if (!transactionResult) {
      throw new Error('Transaction failed - no transaction ID returned');
    }

    const txHash = transactionResult.toString();
    console.log(`- Transaction submitted: ${txHash}`);

    // Wait for transaction to be processed
    console.log(`- Waiting for transaction confirmation...`);
    await delay(3000);

    // Check transaction status
    const success = await checkTransactionStatus(txHash, network);

    if (success.isSuccessful) {
      console.log(`- Product added successfully ✅`);

      const productId = Date.now();

      return {
        success: true,
        txHash: txHash,
        productId: productId,
      };
    } else {
      throw new Error(success.error || 'Transaction failed');
    }
  } catch (error: unknown) {
    console.error(`- Add product error:`, error);

    let errorMessage: string = 'Failed to add product';

    if (error instanceof Error) {
      const message = error.message.toLowerCase();

      if (message.includes('not authorized') || message.includes('not registered')) {
        errorMessage = 'You must be a registered producer to add products';
      } else {
        errorMessage = error.message;
      }
    }

    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Purchase a product from the marketplace
 * @param walletData - [accountId, walletInterface, network]
 * @param productId - Product ID to purchase
 * @param quantity - Quantity to purchase
 * @returns Promise<ShopProductResult>
 */
export async function shopProduct(
  walletData: WalletData,
  productId: number,
  quantity: number,
): Promise<ShopProductResult> {
  console.log(`\n=======================================`);
  console.log(`- Purchasing product from marketplace...🟠`);

  try {
    const [accountId, walletInterface, network] = walletData;

    if (!walletInterface) {
      throw new Error('Wallet interface not available');
    }

    console.log(`- Purchasing product ID: ${productId}`);
    console.log(`- Quantity: ${quantity}`);
    console.log(`- Buyer: ${accountId}`);

    const product = await getProductFromBackend(productId);

    if (!product) {
      throw new Error('Product not found');
    }

    console.log(`- Product found: ${product.name}`);
    console.log(`- Product price: ${product.amount} tinybars`);

    if (product.quantity < quantity) {
      throw new Error(`Only ${product.quantity} items available`);
    }

    if (product.productStatus !== ProductStatus.Available) {
      throw new Error('Product is not available');
    }

    // ✅ Calculate payment in tinybars
    const pricePerItemTinybars = BigInt(product.amount);
    const totalPaymentTinybars = pricePerItemTinybars * BigInt(quantity);

    console.log(`- Price per item: ${Number(pricePerItemTinybars) / 1e8} HBAR`);
    console.log(
      `- Total payment: ${Number(totalPaymentTinybars) / 1e8} HBAR (${totalPaymentTinybars} tinybars)`,
    );

    const functionParameters = new ContractFunctionParameterBuilder()
      .addParam({
        type: 'uint256',
        name: '_productId',
        value: productId,
      })
      .addParam({
        type: 'uint256',
        name: '_quantity',
        value: quantity,
      });

    const contractId = ContractId.fromString(PRODUCT_CONTRACT_ADDRESS);
    const gasLimit = 500000;

    console.log(`- Executing shopProduct with payment: ${Number(totalPaymentTinybars) / 1e8} HBAR`);

    // ✅ Pass tinybars as string
    const transactionResult = await walletInterface.executeContractFunction(
      contractId,
      'shopProduct',
      functionParameters,
      gasLimit,
      totalPaymentTinybars.toString(), // ✅ Pass as string in tinybars
    );

    if (!transactionResult) {
      throw new Error('Transaction failed - no transaction ID returned');
    }

    const txHash = transactionResult.toString();
    console.log(`- Transaction submitted: ${txHash}`);

    await delay(3000);

    const success = await checkTransactionStatus(txHash, network);

    if (success.isSuccessful) {
      console.log(`- Product purchased successfully ✅`);
      return {
        success: true,
        txHash: txHash,
      };
    } else {
      throw new Error(success.error || 'Transaction failed');
    }
  } catch (error: unknown) {
    console.error(`- Product purchase error:`, error);

    let errorMessage: string = 'Failed to purchase product';

    if (error instanceof Error) {
      const message = error.message.toLowerCase();

      if (message.includes('non-payable')) {
        errorMessage = 'Contract function is not payable. Check smart contract configuration.';
      } else if (message.includes('insufficient')) {
        errorMessage = 'Insufficient HBAR balance';
      } else {
        errorMessage = error.message;
      }
    }

    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Get product details from smart contract
 * Helper function to fetch product before purchase
 */
// async function getProductFromContract(
//   walletData: WalletData,
//   productId: number,
// ): Promise<ProductItem | null> {
//   try {
//     const [, , network] = walletData;

//     const mirrorNodeUrl =
//       network === 'testnet'
//         ? 'https://testnet.mirrornode.hedera.com'
//         : 'https://mainnet.mirrornode.hedera.com';

//     // Call the contract's getProduct view function
//     // This is a simplified approach - you may need to adjust based on your contract
//     const contractAddress = PRODUCT_CONTRACT_ADDRESS.replace(/\./g, '');
//     const paddedContractAddress = '0x' + contractAddress.padStart(40, '0');

//     // Encode function call: products(uint256)
//     const functionSelector = '0x7acc0b20'; // Keccak256 of "products(uint256)"
//     const paddedProductId = productId.toString(16).padStart(64, '0');
//     const data = functionSelector + paddedProductId;

//     const response = await fetch(`${mirrorNodeUrl}/api/v1/contracts/call`, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({
//         data,
//         to: paddedContractAddress,
//         estimate: false,
//       }),
//     });

//     if (!response.ok) {
//       console.error('Failed to fetch product from contract');
//       return null;
//     }

//     const result = await response.json();

//     // Parse the result (this is simplified - adjust based on your contract's return format)
//     // You may need to decode the hex result properly

//     // For now, return a mock to test - replace with actual parsing
//     console.log('Contract call result:', result);

//     // ⚠️ TODO: Properly decode the contract response
//     // For now, fetch from backend instead
//     return await getProductFromBackend(productId);
//   } catch (error) {
//     console.error('Error fetching product from contract:', error);
//     return null;
//   }
// }

/**
 * Fallback: Get product from backend
 */
async function getProductFromBackend(productId: number): Promise<ProductItem | null> {
  try {
    const response = await fetch(`${BACKEND_API_URL}/products/${productId}`);

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    const product = data.data;

    // ✅ FIX: Backend stores price in HBAR (e.g., 1 HBAR)
    // Convert to tinybars for internal calculations
    const priceInHBAR = product.price; // e.g., 1
    const amountInTinybars = BigInt(Math.floor(priceInHBAR * 1e8)); // Convert to 100000000

    console.log(`📦 Product from backend:`);
    console.log(`   - Name: ${product.name}`);
    console.log(`   - Price: ${priceInHBAR} HBAR`);
    console.log(`   - Amount in tinybars: ${amountInTinybars}`);

    return {
      productId: product.productId,
      name: product.name,
      quantity: product.quantity,
      owner: product.walletAddress,
      description: product.description,
      data: product.imageFileId,
      amount: amountInTinybars.toString(),
      productStatus:
        product.status === 'Available' ? ProductStatus.Available : ProductStatus.NotAvailable,
    };
  } catch (error) {
    console.error('Error fetching product from backend:', error);
    return null;
  }
}

/**
 * Check transaction status using Hedera Mirror Node
 */
async function checkTransactionStatus(
  evmTxHash: string,
  network: string,
): Promise<{ isSuccessful: boolean; error?: string }> {
  const mirrorNodeUrl =
    network === 'testnet'
      ? 'https://testnet.mirrornode.hedera.com'
      : 'https://mainnet.mirrornode.hedera.com';

  console.log(`- Checking transaction status for: ${evmTxHash}`);

  for (let attempt = 0; attempt < 8; attempt++) {
    try {
      await delay(2000);

      const response = await fetch(`${mirrorNodeUrl}/api/v1/contracts/results/${evmTxHash}`);

      if (response.ok) {
        const txData = await response.json();

        console.log(`  - Transaction result: ${txData.result}`);

        if (txData.error_message) {
          console.log(`  - Error message: ${txData.error_message}`);
        }

        if (txData.result === 'SUCCESS') {
          return { isSuccessful: true };
        } else if (txData.result === 'CONTRACT_REVERT_EXECUTED') {
          let errorMessage = 'Transaction reverted';

          if (txData.error_message) {
            try {
              const decoded = decodeContractError(txData.error_message);
              errorMessage = decoded || errorMessage;
              console.log(`  - Decoded error: ${errorMessage}`);
            } catch (_decodeErr) {
              console.log(`  - Could not decode error message`, _decodeErr);
            }
          }

          return { isSuccessful: false, error: errorMessage };
        } else if (txData.result && txData.result.includes('FAIL')) {
          return {
            isSuccessful: false,
            error: txData.error_message || 'Transaction failed',
          };
        }

        console.log(`  - Attempt ${attempt + 1}: Transaction still pending...`);
      } else if (response.status === 404) {
        console.log(`  - Attempt ${attempt + 1}: Transaction not yet available...`);
      } else {
        console.log(`  - Attempt ${attempt + 1}: API error ${response.status}`);
      }
    } catch (error) {
      console.log(`  - Mirror node check attempt ${attempt + 1} failed:`, error);
    }
  }

  return {
    isSuccessful: false,
    error: 'Could not verify transaction status - please check HashScan',
  };
}

/**
 * Decode contract error message from hex
 */
function decodeContractError(errorHex: string): string | null {
  try {
    if (!errorHex || errorHex === '0x') return null;

    const hex = errorHex.startsWith('0x') ? errorHex.slice(2) : errorHex;

    // Check for standard Solidity error (Error(string))
    if (hex.startsWith('08c379a0')) {
      const dataStart = 8 + 64;
      const lengthHex = hex.slice(dataStart, dataStart + 64);
      const length = parseInt(lengthHex, 16);

      const stringStart = dataStart + 64;
      const stringHex = hex.slice(stringStart, stringStart + length * 2);

      const errorMessage = Buffer.from(stringHex, 'hex').toString('utf8');
      return errorMessage;
    }

    return null;
  } catch (err) {
    console.log('Error decoding contract error:', err);
    return null;
  }
}

/**
 * Check if an address is registered as a producer
 */
export async function checkProducerRegistration(
  walletData: WalletData,
): Promise<{ isRegistered: boolean; error?: string }> {
  try {
    const [accountId, , network] = walletData;

    console.log(`- Checking producer registration for account: ${accountId}`);

    const mirrorNodeUrl =
      network === 'testnet'
        ? 'https://testnet.mirrornode.hedera.com'
        : 'https://mainnet.mirrornode.hedera.com';

    try {
      const response = await fetch(
        `${mirrorNodeUrl}/api/v1/contracts/${PRODUCT_CONTRACT_ADDRESS}/results?limit=25&order=desc`,
      );

      if (response.ok) {
        const data = await response.json();
        const results = data.results || [];

        const normalizedAccountId = accountId.toLowerCase();

        const accountTransactions = results.filter((tx: { from?: string }) => {
          if (!tx.from) return false;
          const txFrom = tx.from.toLowerCase();
          return (
            txFrom === normalizedAccountId ||
            txFrom === `0x${accountId.replace(/\./g, '')}`.toLowerCase()
          );
        });

        const successfulRegistrations = accountTransactions.filter(
          (tx: { result?: string }) => tx.result === 'SUCCESS',
        );

        if (successfulRegistrations.length > 0) {
          console.log(`- Found existing producer registration for account: ${accountId}`);
          return { isRegistered: true };
        }
      }
    } catch (apiError) {
      console.log('Mirror node check failed:', apiError);
    }

    return { isRegistered: false };
  } catch (error: unknown) {
    console.error(`- Check producer registration error:`, error);

    let errorMessage: string = 'Failed to check producer registration';
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    return {
      isRegistered: false,
      error: errorMessage,
    };
  }
}

/**
 * Export contract address for external use
 */
export const getProductContractAddress = (): string => PRODUCT_CONTRACT_ADDRESS;
