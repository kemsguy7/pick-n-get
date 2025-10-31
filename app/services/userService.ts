import { ContractId } from '@hashgraph/sdk';
import { WalletInterface } from './wallets/walletInterface';
import { ContractFunctionParameterBuilder } from './wallets/contractFunctionParameterBuilder';

const CONTRACT_ADDRESS = '0.0.7153245';

// Type definitions
export interface UserData {
  name: string;
  homeAddress: string;
  phoneNumber: string;
  profilePicture?: string; // IPFS CID (optional)
}

export interface UserDetails {
  id: number;
  userAddress: string;
  homeAddress: string;
  phoneNumber: string; // Changed from number to string
  name: string;
  profilePicture?: string; // Added
}

export interface RegistrationResult {
  success: boolean;
  txHash?: string;
  userId?: number;
  error?: string;
}

export interface CheckRegistrationResult {
  isRegistered: boolean;
  userId?: number;
  userDetails?: UserDetails;
  error?: string;
}

interface MirrorNodeTransaction {
  result?: string;
  function_parameters?: string;
  error_message?: string;
}

export type WalletData = [string, WalletInterface | null, string];

const delay = (ms: number): Promise<void> => new Promise((res) => setTimeout(res, ms));

/**
 * Convert IPFS CID string to hex string for smart contract bytes parameter
 */
function ipfsHashToBytes(ipfsHash: string): string {
  try {
    if (!ipfsHash || ipfsHash.trim().length === 0) {
      throw new Error('Empty IPFS hash provided');
    }
    const encoder = new TextEncoder();
    const bytes = encoder.encode(ipfsHash);
    const hexString =
      '0x' +
      Array.from(bytes)
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
    console.log(`  - Converted IPFS hash to hex (${bytes.length} bytes)`);
    return hexString;
  } catch (error) {
    console.error('Error converting IPFS hash to bytes:', error);
    throw new Error(`Failed to convert IPFS hash to bytes: ${error}`);
  }
}

/**
 * Register a new user on the blockchain
 */
export async function registerUser(
  walletData: WalletData,
  userData: UserData,
): Promise<RegistrationResult> {
  console.log(`\n=======================================`);
  console.log(`- Registering user on blockchain...🟠`);

  try {
    const [accountId, walletInterface, network] = walletData;

    if (!walletInterface) {
      throw new Error('Wallet interface not available');
    }

    // Validate phone number (at least 4 characters)
    if (!userData.phoneNumber || userData.phoneNumber.trim().length < 4) {
      throw new Error('Phone number must be at least 4 characters');
    }

    // Check if user is already registered
    console.log(`- Checking existing registration...`);
    const existingRegistration = await checkUserRegistration(walletData);
    if (existingRegistration.isRegistered) {
      return {
        success: false,
        error: 'User already registered',
        userId: existingRegistration.userId,
      };
    }

    console.log(`- Registering new user: ${userData.name}`);
    console.log(`- Account ID: ${accountId}`);
    console.log(`- Phone: ${userData.phoneNumber}`);

    // Convert profile picture IPFS to bytes if provided
    const profilePictureHex = userData.profilePicture
      ? ipfsHashToBytes(userData.profilePicture)
      : '0x';

    // Build contract function parameters
    // Contract signature: _registerUser(string _address, string _number, string _name, bytes _picture)
    const functionParameters = new ContractFunctionParameterBuilder()
      .addParam({
        type: 'string',
        name: '_address',
        value: userData.homeAddress,
      })
      .addParam({
        type: 'string', // Changed from uint8
        name: '_number',
        value: userData.phoneNumber, // Now string
      })
      .addParam({
        type: 'string',
        name: '_name',
        value: userData.name,
      })
      .addParam({
        type: 'bytes', // Added profile picture
        name: '_picture',
        value: profilePictureHex,
      });

    const contractId = ContractId.fromString(CONTRACT_ADDRESS);
    const gasLimit = 350000; // Increased for profile picture

    console.log(`- Executing contract function...`);
    const transactionResult = await walletInterface.executeContractFunction(
      contractId,
      'registerUser',
      functionParameters,
      gasLimit,
    );

    if (!transactionResult) {
      throw new Error('Transaction failed - no transaction ID returned');
    }

    const txHash = transactionResult.toString();
    console.log(`- Transaction submitted: ${txHash}`);
    console.log(`- Waiting for transaction confirmation...`);
    await delay(3000);

    const success = await checkTransactionStatus(txHash, network, accountId);

    if (success.isSuccessful) {
      console.log(`- User registration completed successfully ✅`);
      return {
        success: true,
        txHash: txHash,
        userId: undefined, // No longer using phoneNumber as numeric ID
      };
    } else {
      throw new Error(success.error || 'Transaction failed');
    }
  } catch (error: unknown) {
    console.error(`- Registration error:`, error);

    let errorMessage: string = 'Registration failed';

    if (error instanceof Error) {
      const message = error.message.toLowerCase();

      if (message.includes('already registered') || message.includes('user already have an id')) {
        errorMessage = 'User already registered';
      } else if (message.includes('insufficient funds')) {
        errorMessage = 'Insufficient HBAR balance for transaction';
      } else if (message.includes('rejected')) {
        errorMessage = 'Transaction rejected by user';
      } else if (message.includes('phone number')) {
        errorMessage = error.message;
      } else if (message.includes('gas')) {
        errorMessage = 'Transaction failed due to gas limit';
      } else if (message.includes('network')) {
        errorMessage = 'Network error - please check your connection';
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
            const decoded = decodeContractError(txData.error_message);
            errorMessage = decoded || 'User already registered';
          }
          return { isSuccessful: false, error: errorMessage };
        } else if (txData.result && txData.result.includes('FAIL')) {
          return {
            isSuccessful: false,
            error: txData.error_message || 'Transaction failed',
          };
        }
      }
    } catch (error) {
      console.log(`- Mirror node check attempt ${attempt + 1} failed`, error);
    }
  }

  return {
    isSuccessful: false,
    error: 'Could not verify transaction status - please check HashScan',
  };
}

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
    console.log('Failed to decode contract error', err);
    return null;
  }
}

export async function checkUserRegistration(
  walletData: WalletData,
): Promise<CheckRegistrationResult> {
  try {
    const [accountId, walletInterface, network] = walletData;

    if (!walletInterface) {
      return {
        isRegistered: false,
        error: 'Wallet interface not available',
      };
    }

    const mirrorNodeUrl =
      network === 'testnet'
        ? 'https://testnet.mirrornode.hedera.com'
        : 'https://mainnet.mirrornode.hedera.com';

    try {
      const evmAddress = accountId.startsWith('0x')
        ? accountId
        : `0x${accountId.replace(/\./g, '')}`;

      const response = await fetch(
        `${mirrorNodeUrl}/api/v1/contracts/results?from=${evmAddress}&to=${CONTRACT_ADDRESS}&limit=10`,
      );

      if (response.ok) {
        const data = await response.json();
        const results = data.results || [];

        const successfulRegistrations = results.filter(
          (tx: MirrorNodeTransaction) =>
            tx.result === 'SUCCESS' &&
            tx.function_parameters &&
            tx.function_parameters.includes('a2b5e320'),
        );

        if (successfulRegistrations.length > 0) {
          return { isRegistered: true };
        }

        const failedRegistrations = results.filter((tx: MirrorNodeTransaction) => {
          if (tx.result !== 'CONTRACT_REVERT_EXECUTED' || !tx.error_message) {
            return false;
          }
          const decodedError = decodeContractError(tx.error_message);
          return (
            decodedError &&
            (decodedError.toLowerCase().includes('already') ||
              decodedError.toLowerCase().includes('have an id'))
          );
        });

        if (failedRegistrations.length > 0) {
          return { isRegistered: true };
        }
      }
    } catch (apiError) {
      console.log('Mirror node check failed:', apiError);
    }

    return { isRegistered: false };
  } catch (error: unknown) {
    console.error(`- Check registration error:`, error);
    return {
      isRegistered: false,
      error: error instanceof Error ? error.message : 'Failed to check registration',
    };
  }
}

export function validateUserData(userData: UserData): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!userData.name || userData.name.trim().length === 0) {
    errors.push('Name is required');
  } else if (userData.name.trim().length < 2) {
    errors.push('Name must be at least 2 characters long');
  } else if (userData.name.trim().length > 100) {
    errors.push('Name cannot exceed 100 characters');
  }

  if (!userData.homeAddress || userData.homeAddress.trim().length === 0) {
    errors.push('Home address is required');
  } else if (userData.homeAddress.trim().length < 10) {
    errors.push('Home address must be at least 10 characters long');
  } else if (userData.homeAddress.trim().length > 500) {
    errors.push('Home address cannot exceed 500 characters');
  }

  // Phone number validation - now string with minimum length
  if (!userData.phoneNumber || userData.phoneNumber.trim().length === 0) {
    errors.push('Phone number is required');
  } else if (userData.phoneNumber.trim().length < 4) {
    errors.push('Phone number must be at least 4 characters long');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export const getContractAddress = (): string => CONTRACT_ADDRESS;
