import { ContractId } from '@hashgraph/sdk';
import { WalletInterface } from './wallets/walletInterface';
import { ContractFunctionParameterBuilder } from './wallets/contractFunctionParameterBuilder';

const CONTRACT_ADDRESS = '0.0.7162853';

export type WalletData = [string, WalletInterface | null, string];

export interface ConfirmItemData {
  riderId: number;
  userId: number;
  recycleItemId: number;
}

export interface ConfirmItemResult {
  success: boolean;
  txHash?: string;
  error?: string;
}

export interface PayUserData {
  userId: number;
  recycledItemId: number;
  amount: number; // in tinybars
}

export interface PayUserResult {
  success: boolean;
  txHash?: string;
  amountPaid?: number;
  error?: string;
}

const delay = (ms: number): Promise<void> => new Promise((res) => setTimeout(res, ms));

/**
 * Rider confirms item pickup on blockchain
 * Called when rider physically collects the item and verifies it
 */
export async function confirmItemOnBlockchain(
  walletData: WalletData,
  confirmData: ConfirmItemData,
): Promise<ConfirmItemResult> {
  console.log(`\n=======================================`);
  console.log(`- Confirming item pickup on blockchain...🟠`);

  try {
    const [accountId, walletInterface, network] = walletData;

    if (!walletInterface) {
      throw new Error('Wallet interface not available');
    }

    console.log(`- Rider ID: ${confirmData.riderId}`);
    console.log(`- User ID: ${confirmData.userId}`);
    console.log(`- Item ID: ${confirmData.recycleItemId}`);

    // Build contract function parameters
    // Contract signature: confirmItem(uint256 _riderId, uint256 _userId, uint256 _recycleItemId)
    const functionParameters = new ContractFunctionParameterBuilder()
      .addParam({
        type: 'uint256',
        name: '_riderId',
        value: confirmData.riderId,
      })
      .addParam({
        type: 'uint256',
        name: '_userId',
        value: confirmData.userId,
      })
      .addParam({
        type: 'uint256',
        name: '_recycleItemId',
        value: confirmData.recycleItemId,
      });

    const contractId = ContractId.fromString(CONTRACT_ADDRESS);
    const gasLimit = 300000;

    console.log(`- Executing confirmItem contract function...`);
    const transactionResult = await walletInterface.executeContractFunction(
      contractId,
      'confirmItem',
      functionParameters,
      gasLimit,
    );

    if (!transactionResult) {
      throw new Error('Transaction failed - no transaction ID returned');
    }

    const txHash = transactionResult.toString();
    console.log(`- Transaction submitted: ${txHash}`);
    console.log(`- Waiting for confirmation...`);
    await delay(3000);

    const success = await checkTransactionStatus(txHash, network, accountId);

    if (success.isSuccessful) {
      console.log(`- Item confirmation completed successfully ✅`);
      return {
        success: true,
        txHash: txHash,
      };
    } else {
      throw new Error(success.error || 'Transaction failed');
    }
  } catch (error: unknown) {
    console.error(`- Confirm item error:`, error);

    let errorMessage: string = 'Failed to confirm item on blockchain';

    if (error instanceof Error) {
      const message = error.message.toLowerCase();

      if (message.includes('not an approved rider')) {
        errorMessage = 'You are not an approved rider';
      } else if (message.includes('only rider wallet can confirm')) {
        errorMessage = 'Only the assigned rider can confirm this item';
      } else if (message.includes('no recycle item')) {
        errorMessage = 'No recycling item found for this user';
      } else if (message.includes('invalid item id')) {
        errorMessage = 'Invalid item ID';
      } else if (message.includes('item mismatch')) {
        errorMessage = 'Item mismatch - please check the item ID';
      } else if (message.includes('insufficient funds')) {
        errorMessage = 'Insufficient HBAR balance for transaction';
      } else if (message.includes('rejected')) {
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
 * Admin pays user for confirmed recycling item
 * Called after item is delivered to facility and processed
 */
export async function payUserOnBlockchain(
  walletData: WalletData,
  payData: PayUserData,
): Promise<PayUserResult> {
  console.log(`\n=======================================`);
  console.log(`- Processing payment on blockchain...🟠`);

  try {
    const [accountId, walletInterface, network] = walletData;

    if (!walletInterface) {
      throw new Error('Wallet interface not available');
    }

    console.log(`- User ID: ${payData.userId}`);
    console.log(`- Item ID: ${payData.recycledItemId}`);
    console.log(`- Amount: ${payData.amount} tinybars`);

    // Build contract function parameters with payment
    // Contract signature: payUser(uint256 _userId, uint256 _recycledItemId) external payable
    const functionParameters = new ContractFunctionParameterBuilder()
      .addParam({
        type: 'uint256',
        name: '_userId',
        value: payData.userId,
      })
      .addParam({
        type: 'uint256',
        name: '_recycledItemId',
        value: payData.recycledItemId,
      });

    const contractId = ContractId.fromString(CONTRACT_ADDRESS);
    const gasLimit = 350000;

    console.log(`- Executing payUser contract function with payment...`);
    const transactionResult = await walletInterface.executeContractFunction(
      contractId,
      'payUser',
      functionParameters,
      gasLimit,
      //   payData.amount, // Include payment amount
    );

    if (!transactionResult) {
      throw new Error('Transaction failed - no transaction ID returned');
    }

    const txHash = transactionResult.toString();
    console.log(`- Transaction submitted: ${txHash}`);
    console.log(`- Waiting for confirmation...`);
    await delay(3000);

    const success = await checkTransactionStatus(txHash, network, accountId);

    if (success.isSuccessful) {
      console.log(`- Payment completed successfully ✅`);
      return {
        success: true,
        txHash: txHash,
        amountPaid: payData.amount,
      };
    } else {
      throw new Error(success.error || 'Transaction failed');
    }
  } catch (error: unknown) {
    console.error(`- Pay user error:`, error);

    let errorMessage: string = 'Failed to process payment on blockchain';

    if (error instanceof Error) {
      const message = error.message.toLowerCase();

      if (message.includes('notconfirmed')) {
        errorMessage = 'Item has not been confirmed yet';
      } else if (message.includes('alreadypaid')) {
        errorMessage = 'User has already been paid for this item';
      } else if (message.includes('insufficient contract balance')) {
        errorMessage = 'Contract has insufficient balance for payment';
      } else if (message.includes('transfer failed')) {
        errorMessage = 'Payment transfer failed';
      } else if (message.includes('insufficient funds')) {
        errorMessage = 'Insufficient HBAR balance for transaction';
      } else if (message.includes('not authorised')) {
        errorMessage = 'Only admin can process payments';
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
  console.log(accountId);

  for (let attempt = 0; attempt < 8; attempt++) {
    try {
      await delay(2000);

      const response = await fetch(`${mirrorNodeUrl}/api/v1/contracts/results/${evmTxHash}`);

      if (response.ok) {
        const txData = await response.json();

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

/**
 * Get contract address for external use
 */
export const getContractAddress = (): string => CONTRACT_ADDRESS;
