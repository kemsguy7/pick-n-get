import { Request, Response } from 'express';
import { Rider } from '../interface/deliveryInterface';
import { User, UserRole } from '../models/userModel';
import { checkWalletRoles } from '../services/authService';

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
