import { User, UserRole } from '../models/userModel.js';
import { Rider } from '../interface/deliveryInterface.js';
import { Producer } from '../models/productModel.js';

/**
 * Check wallet roles across contract and backend
 * Returns comprehensive role information
 */
export const checkWalletRoles = async (walletAddress: string) => {
  console.log(`🔍 Checking roles for wallet: ${walletAddress}`);

  const roles: string[] = [];
  let primaryRole = 'Guest';
  let userData = null;
  let riderData = null;
  let vendorData = null;

  // Normalize wallet address
  const normalizedAddress = walletAddress.toLowerCase();

  try {
    //Check User in backend
    const user = await User.findOne({
      walletAddress: { $regex: new RegExp(`^${normalizedAddress}$`, 'i') },
    });

    if (user) {
      console.log(`✅ User found in backend:`, user.roles);
      roles.push(...user.roles);
      userData = {
        userId: user.id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
      };

      if (user.roles.includes(UserRole.Admin)) {
        primaryRole = 'Admin';
      } else if (user.roles.includes(UserRole.Vendor)) {
        primaryRole = 'Vendor';
      } else if (user.roles.includes(UserRole.Rider)) {
        primaryRole = 'Rider';
      } else if (user.roles.includes(UserRole.Recycler)) {
        primaryRole = 'Recycler';
      }
    }

    // 2️⃣ Check Rider in backend
    const rider = await Rider.findOne({
      walletAddress: { $regex: new RegExp(`^${normalizedAddress}$`, 'i') },
    });

    if (rider) {
      console.log(`✅ Rider found in backend:`, rider.approvalStatus);
      if (!roles.includes('Rider')) {
        roles.push('Rider');
      }
      riderData = {
        riderId: rider.id,
        approvalStatus: rider.approvalStatus,
        riderStatus: rider.riderStatus,
      };

      if (rider.approvalStatus === 'Approved' && primaryRole === 'Guest') {
        primaryRole = 'Rider';
      }
    }

    // 3️⃣ Check Producer/Vendor in backend
    let producer = await Producer.findOne({
      walletAddress: { $regex: new RegExp(`^${normalizedAddress}$`, 'i') },
    });

    // If not in backend, check smart contract
    if (!producer) {
      console.log('🔍 Producer not in backend, checking smart contract...');

      const contractCheck = await checkProducerInContract(walletAddress);

      if (contractCheck.isRegistered) {
        console.log('✅ Producer found in smart contract, syncing to backend...');

        // Create producer in backend
        producer = await Producer.create({
          registrationId: Date.now(),
          walletAddress,
          name: user?.name || 'Vendor',
          businessName: user?.name || 'Vendor Business',
          country: user?.country || 'Unknown',
          phoneNumber: user?.phoneNumber || 'Unknown',
          isVerified: true,
          totalProducts: 0,
          totalRevenue: 0,
          totalSales: 0,
          avgRating: 0,
          monthlyGrowth: 0,
        });

        // Add Vendor role to user if exists
        if (user && !user.roles.includes(UserRole.Vendor as any)) {
          user.roles.push(UserRole.Vendor as any);
          await user.save();
        }

        console.log('✅ Synced producer from contract to backend');
      }
    }

    if (producer) {
      console.log(`✅ Producer/Vendor found:`, producer.isVerified);
      if (!roles.includes('Vendor')) {
        roles.push('Vendor');
      }
      vendorData = {
        producerId: producer.registrationId,
        businessName: producer.businessName,
        isVerified: producer.isVerified,
        totalProducts: producer.totalProducts,
      };

      if (primaryRole === 'Guest' || primaryRole === 'Recycler') {
        primaryRole = 'Vendor';
      }
    }

    // If no roles found, default to Guest
    if (roles.length === 0) {
      roles.push('Guest');
    }

    console.log(`📊 Final roles for ${walletAddress}:`, roles, `Primary: ${primaryRole}`);

    return {
      walletAddress,
      roles,
      primaryRole,
      userData,
      riderData,
      vendorData,
    };
  } catch (error) {
    console.error('Error checking wallet roles:', error);
    throw error;
  }
};

/**
 * Check if producer is registered in Product smart contract
 */
async function checkProducerInContract(walletAddress: string): Promise<{
  isRegistered: boolean;
  txHash?: string;
}> {
  try {
    const network = process.env.HEDERA_NETWORK || 'testnet';
    const PRODUCT_CONTRACT_ID = '0.0.7165733';
    const mirrorNodeUrl =
      network === 'testnet'
        ? 'https://testnet.mirrornode.hedera.com'
        : 'https://mainnet.mirrornode.hedera.com';

    const response = await fetch(
      `${mirrorNodeUrl}/api/v1/contracts/${PRODUCT_CONTRACT_ID}/results?limit=100&order=desc`,
    );

    if (!response.ok) {
      return { isRegistered: false };
    }

    const data = await response.json();
    const results = data.results || [];

    const normalizedAddress = walletAddress.toLowerCase();

    // Look for successful registerProducer transactions
    const registration = results.find((tx: any) => {
      if (!tx.from) return false;

      const txFrom = tx.from.toLowerCase();
      const isFromWallet =
        txFrom === normalizedAddress ||
        txFrom === `0x${walletAddress.replace(/\./g, '')}`.toLowerCase();

      const isRegisterProducer = tx.function_parameters?.startsWith('0x4bf0201b');
      const isSuccessful = tx.result === 'SUCCESS';

      return isFromWallet && isRegisterProducer && isSuccessful;
    });

    if (registration) {
      return {
        isRegistered: true,
        txHash: registration.hash,
      };
    }

    return { isRegistered: false };
  } catch (error) {
    console.error('Error checking producer in contract:', error);
    return { isRegistered: false };
  }
}
