import { ContractId } from '@hashgraph/sdk';
import { WalletInterface } from './wallets/walletInterface';
import { ContractFunctionParameterBuilder } from './wallets/contractFunctionParameterBuilder';

// Contract address on Hedera testnet
const CONTRACT_ADDRESS = '0.0.7162853';

// Type definitions
export interface RecycleItemData {
  type: string; // "plastic", "metal", "glass", etc.
  weight: number; // in kg
  description: string; // item description
  imageData?: string; // base64 encoded image data (optional)
}

export interface RecycleResult {
  success: boolean;
  txHash?: string;
  itemId?: number;
  estimatedEarnings?: number;
  error?: string;
}

export interface UserRecyclingHistory {
  success: boolean;
  items?: RecycledItem[];
  totalWeight?: number;
  totalEarnings?: number;
  error?: string;
}

export interface RecycledItem {
  itemId: number;
  weight: number;
  itemType: string;
  itemStatus: string;
  description: string;
  estimatedEarnings: number;
}

// Wallet data type matching your existing structure
export type WalletData = [string, WalletInterface | null, string];

// ItemType enum mapping to match your smart contract
export enum ItemType {
  PAPER = 0,
  PLASTIC = 1,
  METALS = 2,
  GLASS = 3,
  ELECTRONICS = 4,
  TEXTILES = 5,
  OTHERS = 6,
}

// ItemStatus enum mapping
export enum ItemStatus {
  PENDING_CONFIRMATION = 0,
  CONFIRMED = 1,
  SOLD = 2,
  PAID = 3,
}

// Simple delay function
const delay = (ms: number): Promise<void> => new Promise((res) => setTimeout(res, ms));

/**
 * Map category ID to ItemType enum and proper string for contract
 */
function mapCategoryToItemType(categoryId: string): {
  enumValue: ItemType;
  contractString: string;
} {
  const mapping: Record<string, { enumValue: ItemType; contractString: string }> = {
    paper: { enumValue: ItemType.PAPER, contractString: 'paper' },
    plastic: { enumValue: ItemType.PLASTIC, contractString: 'plastic' },
    metal: { enumValue: ItemType.METALS, contractString: 'metals' },
    glass: { enumValue: ItemType.GLASS, contractString: 'glass' },
    electronic: { enumValue: ItemType.ELECTRONICS, contractString: 'electronics' },
    textile: { enumValue: ItemType.TEXTILES, contractString: 'textiles' },
  };

  return mapping[categoryId] || { enumValue: ItemType.OTHERS, contractString: 'others' };
}

/**
 * Convert file to bytes for smart contract
 */
// async function fileToBytes(file: File): Promise<string> {
//   return new Promise((resolve, reject) => {
//     const reader = new FileReader();
//     reader.onload = () => {
//       try {
//         const arrayBuffer = reader.result as ArrayBuffer;
//         const bytes = new Uint8Array(arrayBuffer);
//         const hexString = '0x' + Array.from(bytes)
//           .map(b => b.toString(16).padStart(2, '0'))
//           .join('');
//         resolve(hexString);
//       } catch (error) {
//         reject(error);
//       }
//     };
//     reader.onerror = () => reject(new Error('Failed to read file'));
//     reader.readAsArrayBuffer(file);
//   });
// }

/**
 * Submit recycling item to blockchain
 * @param walletData - [accountId, walletInterface, network]
 * @param itemData - Recycling item data
 * @returns Promise<RecycleResult>
 */
export async function recycleItem(
  walletData: WalletData,
  itemData: RecycleItemData,
): Promise<RecycleResult> {
  console.log(`\n=======================================`);
  console.log(`- Submitting recycling item to blockchain...🟠`);

  try {
    const [accountId, walletInterface, network] = walletData;

    if (!walletInterface) {
      throw new Error('Wallet interface not available');
    }

    // Validate input data
    if (!itemData.type || !itemData.weight || itemData.weight <= 0) {
      throw new Error('Invalid item data: type and weight are required');
    }

    const itemTypeMapping = mapCategoryToItemType(itemData.type);

    console.log(`- Item type: ${itemData.type} -> ${itemTypeMapping.contractString}`);
    console.log(`- Weight: ${itemData.weight} kg`);
    console.log(`- Description: ${itemData.description}`);

    // Convert weight to grams (contract expects uint256)
    const weightInGrams = Math.floor(itemData.weight * 1000);

    // Prepare image data (empty bytes if no image)
    const imageBytes = itemData.imageData || '0x';

    // Build contract function parameters
    const functionParameters = new ContractFunctionParameterBuilder()
      .addParam({
        type: 'string',
        name: '_type',
        value: itemTypeMapping.contractString,
      })
      .addParam({
        type: 'uint256',
        name: '_weight',
        value: weightInGrams,
      })
      .addParam({
        type: 'string',
        name: '_description',
        value: itemData.description || 'Recycling item',
      })
      .addParam({
        type: 'bytes',
        name: '_data',
        value: imageBytes,
      });

    // Execute the contract function
    const contractId = ContractId.fromString(CONTRACT_ADDRESS);
    const gasLimit = 400000; // Higher gas limit for recycleItem

    console.log(`- Executing recycleItem contract function...`);
    const transactionResult = await walletInterface.executeContractFunction(
      contractId,
      'recycleItem',
      functionParameters,
      gasLimit,
    );

    if (!transactionResult) {
      throw new Error('Transaction failed - no transaction ID returned');
    }

    const txHash = transactionResult.toString();
    console.log(`- Transaction submitted: ${txHash}`);

    // Wait for transaction confirmation
    console.log(`- Waiting for transaction confirmation...`);
    await delay(3000);

    // Check transaction status
    const success = await checkTransactionStatus(txHash, network, accountId);

    if (success.isSuccessful) {
      console.log(`- Recycling item submitted successfully ✅`);

      // Calculate estimated earnings (this would come from contract rates in real implementation)
      const mockRate = getMockRateForItemType(itemTypeMapping.enumValue);
      const estimatedEarnings = itemData.weight * mockRate;

      return {
        success: true,
        txHash: txHash,
        itemId: 1, // Would be extracted from transaction events
        estimatedEarnings: estimatedEarnings,
      };
    } else {
      throw new Error(success.error || 'Transaction failed');
    }
  } catch (error: unknown) {
    console.error(`- Recycle item error:`, error);

    let errorMessage: string = 'Failed to submit recycling item';

    if (error instanceof Error) {
      const message = error.message.toLowerCase();

      if (message.includes('usernotregistered') || message.includes('not registered')) {
        errorMessage = 'User not registered. Please register first.';
      } else if (message.includes('invalid weight')) {
        errorMessage = 'Invalid weight. Weight must be greater than 0.';
      } else if (message.includes('insufficient funds')) {
        errorMessage = 'Insufficient HBAR balance for transaction';
      } else if (message.includes('rejected') || message.includes('denied')) {
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
 * Get mock rates for different item types (for estimation)
 * In production, this would query the contract's rates mapping
 */
function getMockRateForItemType(itemType: ItemType): number {
  const rates: Record<ItemType, number> = {
    [ItemType.PAPER]: 50,
    [ItemType.PLASTIC]: 120,
    [ItemType.METALS]: 180,
    [ItemType.GLASS]: 110,
    [ItemType.ELECTRONICS]: 280,
    [ItemType.TEXTILES]: 70,
    [ItemType.OTHERS]: 30,
  };

  return rates[itemType] || 30;
}

/**
 * Check transaction status using Hedera Mirror Node
 */
async function checkTransactionStatus(
  evmTxHash: string,
  network: string,
  accountId: string,
): Promise<{ isSuccessful: boolean; error?: string }> {
  const mirrorNodeUrl =
    network === 'testnet'
      ? 'https://testnet.mirrornode.hedera.com'
      : 'https://mainnet.mirrornode.hedera.com';

  console.log(`- Checking transaction status for: ${evmTxHash}`);
  console.log(`- Account ID: ${accountId}`);

  for (let attempt = 0; attempt < 8; attempt++) {
    try {
      await delay(2000);

      const response = await fetch(`${mirrorNodeUrl}/api/v1/contracts/results/${evmTxHash}`);

      if (response.ok) {
        const txData = await response.json();

        console.log(`- Transaction result:`, txData.result);

        if (txData.result === 'SUCCESS') {
          return { isSuccessful: true };
        } else if (txData.result === 'CONTRACT_REVERT_EXECUTED') {
          let errorMessage = 'Transaction reverted';

          if (txData.error_message) {
            try {
              const decoded = decodeContractError(txData.error_message);
              errorMessage = decoded || 'Contract execution failed';
            } catch (error) {
              console.log(`- Could not decode error message:`, error);
            }
          }

          return { isSuccessful: false, error: errorMessage };
        }

        console.log(`- Attempt ${attempt + 1}: Transaction still pending...`);
      } else if (response.status === 404) {
        console.log(`- Attempt ${attempt + 1}: Transaction not yet available...`);
      }
    } catch (error) {
      console.log(`- Mirror node check attempt ${attempt + 1} failed:`, error);
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
