import { Request, Response } from 'express';
import { Rider } from '../interface/deliveryInterface.js';
import { User, UserRole } from '../models/userModel.js';
import { checkWalletRoles } from '../services/authService.js';

/**
 * Verify rider by phone number
 * POST /api/v1/riders/verify-phone
 */
export const verifyRiderPhone = async (req: Request, res: Response) => {
  try {
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({
        status: 'error',
        message: 'Phone number is required',
      });
    }

    // Find rider by phone number
    const rider = await Rider.findOne({ phoneNumber: phoneNumber });

    if (!rider) {
      return res.status(404).json({
        status: 'error',
        message: 'Rider not found. Please complete registration first.',
      });
    }

    // Check if rider is approved
    if (rider.approvalStatus !== 'Approved') {
      return res.status(403).json({
        status: 'error',
        message: `Your account is ${rider.approvalStatus.toLowerCase()}. Please wait for admin approval.`,
        data: {
          approvalStatus: rider.approvalStatus,
        },
      });
    }

    return res.status(200).json({
      status: 'success',
      message: 'Rider verified successfully',
      data: {
        riderId: rider.id,
        name: rider.name,
        phoneNumber: rider.phoneNumber,
        vehicleType: rider.vehicleType,
        vehicleNumber: rider.vehicleNumber,
        capacity: rider.capacity,
        riderStatus: rider.riderStatus,
        approvalStatus: rider.approvalStatus,
        walletAddress: rider.walletAddress,
      },
    });
  } catch (error: any) {
    console.error('Error verifying rider:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to verify rider',
    });
  }
};

/**
 * Verify user by phone number
 * POST /api/v1/users/verify-phone
 */
export const verifyUserPhone = async (req: Request, res: Response) => {
  try {
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({
        status: 'error',
        message: 'Phone number is required',
      });
    }

    // Find user by phone number
    let user = await User.findOne({ phoneNumber: phoneNumber });

    // If user doesn't exist, create a new one (auto-registration)
    if (!user) {
      // Generate a unique user ID
      const lastUser = await User.findOne().sort({ id: -1 }).limit(1);
      const newUserId = lastUser ? lastUser.id + 1 : 1;

      user = new User({
        id: newUserId,
        name: `User_${newUserId}`, // Default name, can be updated later
        phoneNumber: phoneNumber,
        role: 'Recycler',
        status: 'Active',
      });

      await user.save();

      console.log('✅ New user auto-registered:', user.id);
    }

    // Check if user is active
    if (user.status !== 'Active') {
      return res.status(403).json({
        status: 'error',
        message: `Your account is ${user.status.toLowerCase()}. Please contact support.`,
      });
    }

    return res.status(200).json({
      status: 'success',
      message: 'User verified successfully',
      data: {
        userId: user.id,
        name: user.name,
        phoneNumber: user.phoneNumber,
        email: user.email,
        walletAddress: user.walletAddress,
        role: user.roles,
        status: user.status,
        totalRecycled: user.totalRecycled,
        totalEarnings: user.totalEarnings,
        co2Saved: user.co2Saved,
      },
    });
  } catch (error: any) {
    console.error('Error verifying user:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to verify user',
    });
  }
};

/**
 * Update user profile
 * PUT /api/v1/users/profile
 */
export const updateUserProfile = async (req: Request, res: Response) => {
  try {
    const { userId, name, email, address, country, profileImage } = req.body;

    if (!userId) {
      return res.status(400).json({
        status: 'error',
        message: 'User ID is required',
      });
    }

    const user = await User.findOne({ id: userId });

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found',
      });
    }

    // Update fields if provided
    if (name) user.name = name;
    if (email) user.email = email;
    if (address) user.address = address;
    if (country) user.country = country;
    if (profileImage) user.profileImage = profileImage;

    await user.save();

    return res.status(200).json({
      status: 'success',
      message: 'Profile updated successfully',
      data: {
        userId: user.id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        address: user.address,
        country: user.country,
        profileImage: user.profileImage,
      },
    });
  } catch (error: any) {
    console.error('Error updating user profile:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to update profile',
    });
  }
};

/**
 * Get user by ID
 * GET /api/v1/users/:userId
 */
export const getUserById = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const user = await User.findOne({ id: parseInt(userId) });

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found',
      });
    }

    return res.status(200).json({
      status: 'success',
      data: {
        userId: user.id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        walletAddress: user.walletAddress,
        role: user.roles,
        status: user.status,
        address: user.address,
        country: user.country,
        profileImage: user.profileImage,
        totalRecycled: user.totalRecycled,
        totalEarnings: user.totalEarnings,
        co2Saved: user.co2Saved,
        totalPickups: user.totalPickups,
        createdAt: user.createdAt,
      },
    });
  } catch (error: any) {
    console.error('Error getting user:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to get user',
    });
  }
};

/**
 * Save user to backend after contract registration
 * POST /api/v1/auth/save-user
 * Body: { walletAddress, name, phoneNumber, homeAddress, profilePicture }
 */
export const saveUserFromContract = async (req: Request, res: Response) => {
  try {
    const { walletAddress, name, phoneNumber, homeAddress, profilePicture } = req.body;

    if (!walletAddress) {
      return res.status(400).json({
        status: 'error',
        message: 'Wallet address is required',
      });
    }

    // Check if user already exists
    let user = await User.findOne({ walletAddress });

    if (user) {
      // Update existing user
      user.name = name || user.name;
      user.phoneNumber = phoneNumber || user.phoneNumber;
      user.address = homeAddress || user.address;
      user.profileImage = profilePicture || user.profileImage;

      // Ensure Recycler role exists
      if (!user.roles.includes(UserRole.Recycler)) {
        user.roles.push(UserRole.Recycler);
      }

      await user.save();

      return res.status(200).json({
        status: 'success',
        message: 'User updated successfully',
        data: {
          userId: user.id,
          walletAddress: user.walletAddress,
          roles: user.roles,
        },
      });
    }

    // Create new user
    const lastUser = await User.findOne().sort({ id: -1 }).limit(1);
    const newUserId = lastUser ? lastUser.id + 1 : 1;

    const newUser = await User.create({
      id: newUserId,
      name: name || `User_${newUserId}`,
      phoneNumber: phoneNumber || '',
      walletAddress,
      address: homeAddress,
      profileImage: profilePicture, // Hedera File ID
      roles: [UserRole.Recycler],
      status: 'Active',
    });

    console.log(`✅ User saved to backend: ${walletAddress}`);

    return res.status(201).json({
      status: 'success',
      message: 'User created successfully',
      data: {
        userId: newUser.id,
        walletAddress: newUser.walletAddress,
        roles: newUser.roles,
      },
    });
  } catch (error: any) {
    console.error('Save user error:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to save user',
    });
  }
};

/**
 * Check wallet roles for authentication
 * POST /api/v1/auth/check-wallet
 */
export const checkWalletAuth = async (req: Request, res: Response) => {
  try {
    const { walletAddress } = req.body;

    if (!walletAddress) {
      return res.status(400).json({
        status: 'error',
        message: 'Wallet address is required',
      });
    }

    const roleInfo = await checkWalletRoles(walletAddress);

    return res.status(200).json({
      status: 'success',
      data: roleInfo,
    });
  } catch (error: any) {
    console.error('Error checking wallet roles:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to check wallet roles',
    });
  }
};

/**
 * Sync vendor/producer status from smart contract
 * This checks if a wallet is registered in the Product contract
 * and updates the backend database accordingly
 *
 * POST /api/v1/auth/sync-vendor-status
 */
export const syncVendorStatus = async (req: Request, res: Response) => {
  try {
    const { walletAddress } = req.body;

    if (!walletAddress) {
      return res.status(400).json({
        status: 'error',
        message: 'Wallet address is required',
      });
    }

    console.log(`🔄 Syncing vendor status for: ${walletAddress}`);

    // Check if producer exists in contract via Mirror Node
    const network = process.env.HEDERA_NETWORK || 'testnet';
    const PRODUCT_CONTRACT_ID = '0.0.7165733';
    const mirrorNodeUrl =
      network === 'testnet'
        ? 'https://testnet.mirrornode.hedera.com'
        : 'https://mainnet.mirrornode.hedera.com';

    try {
      // Get recent contract transactions
      const response = await fetch(
        `${mirrorNodeUrl}/api/v1/contracts/${PRODUCT_CONTRACT_ID}/results?limit=100&order=desc`,
      );

      if (response.ok) {
        const data = await response.json();
        const results = data.results || [];

        // Normalize wallet address for comparison
        const normalizedAddress = walletAddress.toLowerCase();

        // Look for registerProducer transactions from this address
        const producerRegistrations = results.filter((tx: any) => {
          if (!tx.from) return false;
          const txFrom = tx.from.toLowerCase();

          // Check if transaction is from this wallet
          const isFromWallet =
            txFrom === normalizedAddress ||
            txFrom === `0x${walletAddress.replace(/\./g, '')}`.toLowerCase();

          // Check if it's a successful registerProducer call
          const isRegisterProducer = tx.function_parameters?.startsWith('0x4bf0201b'); // registerProducer selector
          const isSuccessful = tx.result === 'SUCCESS';

          return isFromWallet && isRegisterProducer && isSuccessful;
        });

        console.log(`📊 Found ${producerRegistrations.length} producer registrations`);

        if (producerRegistrations.length > 0) {
          console.log('✅ Producer found in contract');

          // Update backend database
          const user = await User.findOne({ walletAddress });

          if (user) {
            // Add Vendor role if not present
            if (!user.roles.includes(UserRole.Vendor as any)) {
              user.roles.push(UserRole.Vendor as any);
              await user.save();
              console.log('✅ Added Vendor role to existing user');
            }

            // Create or update producer record
            let producer = await require('../models/productModel').Producer.findOne({
              walletAddress,
            });

            if (!producer) {
              producer = await require('../models/productModel').Producer.create({
                registrationId: Date.now(),
                walletAddress,
                name: user.name || 'Vendor',
                businessName: user.name || 'Vendor Business',
                country: user.country || 'Unknown',
                phoneNumber: user.phoneNumber || 'Unknown',
                isVerified: true,
                totalProducts: 0,
                totalRevenue: 0,
                totalSales: 0,
                avgRating: 0,
                monthlyGrowth: 0,
              });
              console.log('✅ Created producer record in backend');
            }

            return res.status(200).json({
              status: 'success',
              message: 'Vendor status synced successfully',
              data: {
                walletAddress: user.walletAddress,
                roles: user.roles,
                primaryRole: 'Vendor',
                vendorData: {
                  producerId: producer.registrationId,
                  isVerified: producer.isVerified,
                },
                syncedFromContract: true,
              },
            });
          } else {
            // User doesn't exist in backend, create them
            const lastUser = await User.findOne().sort({ id: -1 }).limit(1);
            const newUserId = lastUser ? lastUser.id + 1 : 1;

            const newUser = await User.create({
              id: newUserId,
              name: `Vendor_${newUserId}`,
              phoneNumber: '',
              walletAddress,
              roles: [UserRole.Vendor],
              status: 'Active',
            });

            // Create producer record
            const producer = await require('../models/productModel').Producer.create({
              registrationId: Date.now(),
              walletAddress,
              name: `Vendor_${newUserId}`,
              businessName: `Vendor Business ${newUserId}`,
              country: 'Unknown',
              phoneNumber: 'Unknown',
              isVerified: true,
            });

            console.log('✅ Created new user and producer from contract data');

            return res.status(200).json({
              status: 'success',
              message: 'Vendor status synced successfully',
              data: {
                walletAddress: newUser.walletAddress,
                roles: newUser.roles,
                primaryRole: 'Vendor',
                vendorData: {
                  producerId: producer.registrationId,
                  isVerified: producer.isVerified,
                },
                syncedFromContract: true,
              },
            });
          }
        } else {
          console.log('❌ Producer not found in contract');

          return res.status(404).json({
            status: 'error',
            message: 'Vendor not registered in smart contract',
            data: {
              isRegistered: false,
              needsRegistration: true,
            },
          });
        }
      }
    } catch (mirrorError) {
      console.error('Mirror node error:', mirrorError);
      // Continue to fallback check
    }

    // Fallback: Check if user exists in backend
    const user = await User.findOne({ walletAddress });

    if (user && user.roles.includes(UserRole.Vendor as any)) {
      return res.status(200).json({
        status: 'success',
        message: 'Vendor status confirmed from backend',
        data: {
          walletAddress: user.walletAddress,
          roles: user.roles,
          primaryRole: 'Vendor',
          syncedFromContract: false,
        },
      });
    }

    return res.status(404).json({
      status: 'error',
      message: 'Vendor not found in contract or backend',
      data: {
        isRegistered: false,
        needsRegistration: true,
      },
    });
  } catch (error: any) {
    console.error('Sync vendor status error:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to sync vendor status',
    });
  }
};
