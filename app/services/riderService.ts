import { ContractId } from '@hashgraph/sdk';
import { WalletInterface } from './wallets/walletInterface';
import { ContractFunctionParameterBuilder } from './wallets/contractFunctionParameterBuilder';

const CONTRACT_ADDRESS = '0.0.7162853';

const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:5000/api/v1';

// Type definitions for rider registration
export interface RiderData {
  name: string;
  phoneNumber: string; // Changed from number to string
  vehicleNumber: string;
  homeAddress: string;
  country: string;
  capacity: number; // uint256
  vehicleImage: string; // HFS ID
  vehicleRegistration: string; // HFS ID
  vehicleType: VehicleType;
  profilePicture?: string; // HFS ID
  driversLicense?: string; // HFS ID
  insuranceCertificate?: string; // HFS ID
  vehicleMakeModel?: string; // HFS ID
  vehiclePlateNumber?: string; // HFS ID
  vehicleColor?: string; // HFS ID
}

export enum VehicleType {
  Bike = 0,
  Car = 1,
  Truck = 2,
  Van = 3,
}

export enum RiderStatus {
  Pending = 0,
  Approved = 1,
  Rejected = 2,
  Banned = 3,
}

export interface RiderDetails {
  id: number;
  name: string;
  phoneNumber: string; // Changed from number to string
  vehicleNumber: string;
  walletAddress: string;
  homeAddress: string;
  riderStatus: RiderStatus;
  country: string;
  capacity: number;
  vehicleImage: string; // HFS ID
  vehicleRegistrationImage: string; // HFS ID
  vehicleType: VehicleType;
  profilePicture?: string; // HFS ID
}

export interface RiderRegistrationResult {
  success: boolean;
  txHash?: string;
  riderId?: number;
  error?: string;
  web2Saved?: boolean;
  web2Error?: string;
}

export interface CheckRiderResult {
  isRegistered: boolean;
  riderId?: number;
  riderDetails?: RiderDetails;
  riderStatus?: RiderStatus;
  error?: string;
}

interface TransactionResult {
  from?: string;
  result?: string;
  error_message?: string;
  logs?: unknown[];
}

export type WalletData = [string, WalletInterface | null, string];

const delay = (ms: number): Promise<void> => new Promise((res) => setTimeout(res, ms));

/**
 * Convert IPFS CID string to hex string for smart contract bytes parameter
 */
function ipfsHashToBytes(ipfsHash: string): string {
  try {
    if (!ipfsHash || ipfsHash.trim().length === 0) {
      throw new Error('Empty  hash provided');
    }

    const encoder = new TextEncoder();
    const bytes = encoder.encode(ipfsHash);

    const hexString =
      '0x' +
      Array.from(bytes)
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');

    console.log(
      `  - Converted Image hash "${ipfsHash}" to hex (${bytes.length} bytes): ${hexString.substring(0, 20)}...`,
    );

    return hexString;
  } catch (error) {
    console.error('Error converting Image hash to bytes:', error);
    throw new Error(`Failed to convert Image hash to bytes: ${error}`);
  }
}

/**
 * Save rider data to Web2 backend after successful hedera DLT registration
 *
 */
async function saveRiderToBackend(
  riderData: RiderData,
  walletAddress: string,
  riderId: number,
): Promise<{ success: boolean; error?: string }> {
  try {
    console.log(`\n- Saving rider data to Web2 backend...`);
    console.log(`  - Backend URL: ${BACKEND_API_URL}/delivery/riders`);

    // Map vehicle type to backend format
    let backendVehicleType: string;
    switch (riderData.vehicleType) {
      case VehicleType.Bike:
        backendVehicleType = 'Bike';
        break;
      case VehicleType.Car:
        backendVehicleType = 'Car';
        break;
      case VehicleType.Truck:
        backendVehicleType = 'Truck';
        break;
      case VehicleType.Van:
        backendVehicleType = 'Van';
        break;
      default:
        backendVehicleType = 'Car';
    }

    // Prepare payload for backend (simpler structure)
    const backendPayload = {
      id: riderId,
      walletAddress,
      name: riderData.name,
      phoneNumber: riderData.phoneNumber,
      vehicleNumber: riderData.vehicleNumber,
      homeAddress: riderData.homeAddress,
      vehicleType: backendVehicleType,
      country: riderData.country,
      capacity: riderData.capacity,

      // Hedera File IDs for documents
      profileImage: riderData.profilePicture,
      driversLicense: riderData.driversLicense,
      vehicleRegistration: riderData.vehicleRegistration,
      insuranceCertificate: riderData.insuranceCertificate,
      vehiclePhotos: riderData.vehicleImage,

      // Additional vehicle details
      vehicleMakeModel: riderData.vehicleMakeModel,
      vehiclePlateNumber: riderData.vehiclePlateNumber,
      vehicleColor: riderData.vehicleColor,
    };

    console.log(`  - Payload prepared for backend`);

    const response = await fetch(`${BACKEND_API_URL}/delivery/riders`, {
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
 * Register a new rider/agent on the hedera DLT with profile picture
 * @param walletData - [accountId, walletInterface, network]
 * @param riderData - Rider registration data
 * @returns Promise<RiderRegistrationResult>
 */
export async function registerRider(
  walletData: WalletData,
  riderData: RiderData,
): Promise<RiderRegistrationResult> {
  console.log(`\n=======================================`);
  console.log(`- Registering rider on hedera DLT...🟠`);

  try {
    const [accountId, walletInterface, network] = walletData;

    if (!walletInterface) {
      throw new Error('Wallet interface not available');
    }

    // Validate phone number (now a string)
    if (!riderData.phoneNumber || riderData.phoneNumber.trim().length === 0) {
      throw new Error('Phone number is required');
    }

    // Validate vehicle type
    if (!Object.values(VehicleType).includes(riderData.vehicleType)) {
      throw new Error('Invalid vehicle type');
    }

    // FIRST: Check if rider is already registered
    console.log(`- Checking existing rider registration...`);
    const existingRegistration = await checkRiderRegistration(walletData);
    if (existingRegistration.isRegistered) {
      return {
        success: false,
        error: 'Rider already registered',
        riderId: existingRegistration.riderId,
      };
    }

    console.log(`- Registering new rider: ${riderData.name}`);
    console.log(`- Account ID: ${accountId}`);
    console.log(`- Vehicle: ${riderData.vehicleNumber} (${VehicleType[riderData.vehicleType]})`);
    console.log(`- Phone: ${riderData.phoneNumber}`);
    console.log(`- Capacity: ${riderData.capacity} kg`);
    console.log(`- Vehicle Image Hedera HFS: ${riderData.vehicleImage}`);
    console.log(`- Vehicle Registration HFS: ${riderData.vehicleRegistration}`);
    console.log(`- Profile Picture HFS: ${riderData.profilePicture || 'Not provided'}`);

    // Convert IPFS hashes to hex strings (ethers.js compatible format)
    console.log(`- Converting HFS hashes to hex strings...`);
    const vehicleImageHex = ipfsHashToBytes(riderData.vehicleImage);
    const vehicleRegistrationHex = ipfsHashToBytes(riderData.vehicleRegistration);
    const profilePictureHex = riderData.profilePicture
      ? ipfsHashToBytes(riderData.profilePicture)
      : '0x'; // Empty bytes if no profile picture

    const functionParameters = new ContractFunctionParameterBuilder()
      .addParam({
        type: 'string',
        name: '_name',
        value: riderData.name,
      })
      .addParam({
        type: 'string',
        name: '_number',
        value: riderData.phoneNumber, // Now string
      })
      .addParam({
        type: 'string',
        name: '_vehicleNumber',
        value: riderData.vehicleNumber,
      })
      .addParam({
        type: 'string',
        name: '_homeAddress',
        value: riderData.homeAddress,
      })
      .addParam({
        type: 'string',
        name: '_country',
        value: riderData.country,
      })
      .addParam({
        type: 'uint256',
        name: '_capacity',
        value: riderData.capacity,
      })
      .addParam({
        type: 'bytes',
        name: '_image',
        value: vehicleImageHex,
      })
      .addParam({
        type: 'bytes',
        name: '_vehicleRegistration',
        value: vehicleRegistrationHex,
      })
      .addParam({
        type: 'uint8',
        name: '_vehicleType',
        value: riderData.vehicleType,
      })
      .addParam({
        type: 'bytes',
        name: '_picture',
        value: profilePictureHex, // NEW: Profile picture parameter
      });

    // Execute the contract function
    const contractId = ContractId.fromString(CONTRACT_ADDRESS);
    const gasLimit = 500000; // Increased gas limit for profile picture

    console.log(`- Executing riderApplication contract function...`);
    const transactionResult = await walletInterface.executeContractFunction(
      contractId,
      'riderApplication',
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
    const success = await checkTransactionStatus(txHash, network, accountId);

    if (success.isSuccessful) {
      console.log(`- Rider registration on hedera DLT completed successfully ✅`);

      // Get the rider ID from the hedera DLT
      const riderId = await getRiderIdFromTransaction(txHash, network);

      if (!riderId) {
        console.error(`❌ CRITICAL: Could not retrieve rider ID from hedera DLT`);
        return {
          success: false,
          error:
            'Registration succeeded but could not retrieve rider ID. Please contact support with this transaction hash: ' +
            txHash,
        };
      }

      console.log(`✅ Rider ID retrieved from hedera DLT: ${riderId}`);

      // Save to Web2 backend
      console.log(`\n- Proceeding to save rider data to Web2 backend...`);
      const backendResult = await saveRiderToBackend(riderData, accountId, riderId);

      return {
        success: true,
        txHash: txHash,
        riderId: riderId,
        web2Saved: backendResult.success,
        web2Error: backendResult.error,
      };
    } else {
      throw new Error(success.error || 'Transaction failed');
    }
  } catch (error: unknown) {
    console.error(`- Rider registration error:`, error);

    let errorMessage: string = 'Rider registration failed';

    if (error instanceof Error) {
      const message = error.message.toLowerCase();

      if (message.includes('already registered')) {
        errorMessage = 'Rider already registered';
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
      } else if (message.includes('phone number')) {
        errorMessage = error.message;
      } else if (message.includes('gas') || message.includes('limit')) {
        errorMessage = 'Transaction failed due to gas limit';
      } else if (message.includes('network') || message.includes('connection')) {
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

// services/riderService.ts (continued)

/**
 * Validate rider data before registration
 * @param riderData - Rider data to validate
 * @returns Validation result with errors if any
 */
export function validateRiderData(riderData: RiderData): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Name validation
  if (!riderData.name || riderData.name.trim().length === 0) {
    errors.push('Name is required');
  } else if (riderData.name.trim().length < 2) {
    errors.push('Name must be at least 2 characters long');
  } else if (riderData.name.trim().length > 100) {
    errors.push('Name cannot exceed 100 characters');
  }

  // Phone number validation (now string)
  if (!riderData.phoneNumber || riderData.phoneNumber.trim().length === 0) {
    errors.push('Phone number is required');
  } else if (riderData.phoneNumber.trim().length < 1) {
    errors.push('Phone number must be at least 1 character long');
  }

  // Vehicle number validation
  if (!riderData.vehicleNumber || riderData.vehicleNumber.trim().length === 0) {
    errors.push('Vehicle number is required');
  }

  // Home address validation
  if (!riderData.homeAddress || riderData.homeAddress.trim().length === 0) {
    errors.push('Home address is required');
  } else if (riderData.homeAddress.trim().length < 10) {
    errors.push('Home address must be at least 10 characters long');
  }

  // Country validation
  if (!riderData.country || riderData.country.trim().length === 0) {
    errors.push('Country is required');
  }

  // Capacity validation
  if (riderData.capacity <= 0) {
    errors.push('Capacity must be greater than 0');
  }

  // Vehicle image validation (required)
  if (!riderData.vehicleImage || riderData.vehicleImage.trim().length === 0) {
    errors.push('Vehicle image is required');
  }

  // Vehicle registration validation (required)
  if (!riderData.vehicleRegistration || riderData.vehicleRegistration.trim().length === 0) {
    errors.push('Vehicle registration document is required');
  }

  // Vehicle type validation
  if (!Object.values(VehicleType).includes(riderData.vehicleType)) {
    errors.push('Invalid vehicle type');
  }

  // Profile picture is optional, but validate if provided
  if (riderData.profilePicture && riderData.profilePicture.trim().length === 0) {
    errors.push('Profile picture HFS hash is invalid');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Export contract address for external use
 */
export const getContractAddress = (): string => CONTRACT_ADDRESS;

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
  console.log(`  Account ID: ${accountId}`);

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
              errorMessage = decoded || 'Rider already registered';
              console.log(`  - Decoded error: ${errorMessage}`);
            } catch (_decodeErr) {
              console.log(`  - Could not decode error message`, _decodeErr);
              errorMessage = 'Rider already registered';
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
 * Get rider ID from successful transaction
 */
/**
 * Get rider ID from successful transaction by parsing RiderApplied event
 */
async function getRiderIdFromTransaction(txHash: string, network: string): Promise<number | null> {
  try {
    const mirrorNodeUrl =
      network === 'testnet'
        ? 'https://testnet.mirrornode.hedera.com'
        : 'https://mainnet.mirrornode.hedera.com';

    const response = await fetch(`${mirrorNodeUrl}/api/v1/contracts/results/${txHash}`);

    if (response.ok) {
      const txData = await response.json();

      // Parse logs to find RiderApplied event
      if (txData.logs && txData.logs.length > 0) {
        console.log(`  - Transaction logs found, parsing RiderApplied event...`);

        // RiderApplied event signature: RiderApplied(uint256 indexed riderId, address indexed wallet, string name)
        // Topic[0] = event signature hash
        // Topic[1] = riderId (indexed)
        // Topic[2] = wallet address (indexed)

        for (const log of txData.logs) {
          // Check if this is the RiderApplied event (first topic is event signature)
          if (log.topics && log.topics.length >= 2) {
            // Topic[1] contains the riderId (uint256)
            const riderIdHex = log.topics[1];
            const riderId = parseInt(riderIdHex, 16);

            console.log(`  ✅ Extracted rider ID from event: ${riderId}`);
            return riderId;
          }
        }

        console.log(`  - Could not find RiderApplied event in logs`);
      }
    }

    return null;
  } catch (error) {
    console.error('Error getting rider ID from transaction:', error);
    return null;
  }
}
/**
 * Check if a rider is registered and get their status
 * @param walletData - [accountId, walletInterface, network]
 * @returns Promise<CheckRiderResult>
 */
export async function checkRiderRegistration(walletData: WalletData): Promise<CheckRiderResult> {
  try {
    const [accountId, walletInterface, network] = walletData;

    if (!walletInterface) {
      return {
        isRegistered: false,
        error: 'Wallet interface not available',
      };
    }

    console.log(`- Checking rider registration for account: ${accountId}`);

    const mirrorNodeUrl =
      network === 'testnet'
        ? 'https://testnet.mirrornode.hedera.com'
        : 'https://mainnet.mirrornode.hedera.com';

    try {
      // Get contract results and filter client-side
      const response = await fetch(
        `${mirrorNodeUrl}/api/v1/contracts/${CONTRACT_ADDRESS}/results?limit=25&order=desc`,
      );

      if (response.ok) {
        const data = await response.json();
        const results = data.results || [];

        // Normalize account ID for comparison
        const normalizedAccountId = accountId.toLowerCase();

        // Filter transactions from this account
        const accountTransactions = results.filter((tx: TransactionResult) => {
          if (!tx.from) return false;
          const txFrom = tx.from.toLowerCase();
          return (
            txFrom === normalizedAccountId ||
            txFrom === `0x${accountId.replace(/\./g, '')}`.toLowerCase()
          );
        });

        // Look for successful transactions
        const successfulRegistrations = accountTransactions.filter(
          (tx: TransactionResult) => tx.result === 'SUCCESS',
        );

        if (successfulRegistrations.length > 0) {
          console.log(`- Found existing rider registration for account: ${accountId}`);

          return {
            isRegistered: true,
            riderId: undefined,
            riderDetails: undefined,
            riderStatus: RiderStatus.Pending,
          };
        }

        // Check for reverted transactions (already registered)
        const failedRegistrations = accountTransactions.filter((tx: TransactionResult) => {
          if (tx.result !== 'CONTRACT_REVERT_EXECUTED' || !tx.error_message) {
            return false;
          }

          const decodedError = decodeContractError(tx.error_message);
          return decodedError && decodedError.toLowerCase().includes('already registered');
        });

        if (failedRegistrations.length > 0) {
          console.log(
            `- Found failed registration attempts (rider already registered): ${accountId}`,
          );

          return {
            isRegistered: true,
            riderId: undefined,
            riderDetails: undefined,
            riderStatus: RiderStatus.Pending,
          };
        }
      }
    } catch (apiError) {
      console.log('Mirror node check failed:', apiError);
    }

    return { isRegistered: false };
  } catch (error: unknown) {
    console.error(`- Check rider registration error:`, error);

    let errorMessage: string = 'Failed to check rider registration';
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    return {
      isRegistered: false,
      error: errorMessage,
    };
  }
}
