import { User, UserRole } from '../models/userModel.js';
import { Rider, ApprovalStatus } from '../interface/deliveryInterface.js';
import { Producer } from '../models/productModel.js';

const SUPER_ADMIN_WALLET = process.env.SUPER_ADMIN_WALLET || '';

export interface UserRoleInfo {
  walletAddress: string;
  roles: string[];
  primaryRole: string;
  userData?: {
    userId?: number;
    name?: string;
    profileImage?: string;
  };
  riderData?: {
    riderId: number;
    approvalStatus: string;
    riderStatus: string;
  };
  vendorData?: {
    vendorId: number;
    registrationId: number;
    approvalStatus: string;
    businessName: string;
  };
}

/**
 * Check wallet address and return all roles from backend DB
 */
export async function checkWalletRoles(walletAddress: string): Promise<UserRoleInfo> {
  const roles: string[] = [];
  let primaryRole = 'Guest';
  let userData: UserRoleInfo['userData'];
  let riderData: UserRoleInfo['riderData'];
  let vendorData: UserRoleInfo['vendorData'];

  // ✅ Check if wallet is SuperAdmin (from env)
  if (SUPER_ADMIN_WALLET && walletAddress.toLowerCase() === SUPER_ADMIN_WALLET.toLowerCase()) {
    return {
      walletAddress,
      roles: ['SuperAdmin', 'Admin', 'Rider', 'Recycler'],
      primaryRole: 'SuperAdmin',
    };
  }

  // Check if wallet is registered as User/Recycler/Admin in DB
  const user = await User.findOne({ walletAddress });

  if (user) {
    roles.push(...user.roles);
    userData = {
      userId: user.id,
      name: user.name,
      profileImage: user.profileImage,
    };

    // Set primary role based on user roles
    if (user.roles.includes(UserRole.SuperAdmin as UserRole)) {
      primaryRole = 'SuperAdmin';
    } else if (user.roles.includes(UserRole.Admin as UserRole)) {
      primaryRole = 'Admin';
    } else if (user.roles.includes(UserRole.Recycler as UserRole)) {
      primaryRole = 'Recycler';
    }
  }

  // Check if wallet is registered as Rider in DB
  const rider = await Rider.findOne({ walletAddress });
  if (rider && rider.approvalStatus === ApprovalStatus.Approve) {
    if (!roles.includes('Rider')) {
      roles.push('Rider');
    }

    riderData = {
      riderId: rider.id,
      approvalStatus: rider.approvalStatus,
      riderStatus: rider.riderStatus,
    };

    // Rider takes priority over Recycler
    if (primaryRole === 'Recycler' || primaryRole === 'Guest') {
      primaryRole = 'Rider';
    }
  }

  // ✅ Check if wallet is registered as Producer/Vendor in DB
  const producer = await Producer.findOne({ walletAddress });
  if (producer) {
    if (!roles.includes('Vendor')) {
      roles.push('Vendor');
    }

    vendorData = {
      vendorId: producer.registrationId,
      registrationId: producer.registrationId,
      approvalStatus: producer.isVerified ? 'Approved' : 'Pending',
      businessName: producer.businessName || producer.name,
    };

    // ✅ Vendor takes priority (most recent addition)
    if (primaryRole === 'Recycler' || primaryRole === 'Rider' || primaryRole === 'Guest') {
      primaryRole = 'Vendor';
    }
  }

  // Remove duplicates and ensure at least one role
  const uniqueRoles = Array.from(new Set(roles));
  const finalRoles = uniqueRoles.length > 0 ? uniqueRoles : ['Guest'];

  // If primaryRole is still Guest but we have roles, use the first role
  const finalPrimaryRole =
    primaryRole === 'Guest' && uniqueRoles.length > 0 ? uniqueRoles[0] : primaryRole;

  return {
    walletAddress,
    roles: finalRoles,
    primaryRole: finalPrimaryRole,
    userData,
    riderData,
    vendorData,
  };
}

/**
 * Add role to user
 */
export async function addRoleToUser(
  walletAddress: string,
  role: UserRole,
): Promise<{ success: boolean; message: string }> {
  try {
    const user = await User.findOne({ walletAddress });

    if (!user) {
      return {
        success: false,
        message: 'User not found',
      };
    }

    // Check if role already exists
    if (user.roles.includes(role)) {
      return {
        success: false,
        message: `User already has ${role} role`,
      };
    }

    // Add role
    user.roles.push(role);
    await user.save();

    return {
      success: true,
      message: `${role} role added successfully`,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to add role';
    return {
      success: false,
      message,
    };
  }
}

/**
 * Remove role from user
 */
export async function removeRoleFromUser(
  walletAddress: string,
  role: UserRole,
): Promise<{ success: boolean; message: string }> {
  try {
    const user = await User.findOne({ walletAddress });

    if (!user) {
      return {
        success: false,
        message: 'User not found',
      };
    }

    // Remove role
    user.roles = user.roles.filter((r) => r !== role) as UserRole[];

    // Ensure at least one role remains
    if (user.roles.length === 0) {
      user.roles = [UserRole.Recycler];
    }

    await user.save();

    return {
      success: true,
      message: `${role} role removed successfully`,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to remove role';
    return {
      success: false,
      message,
    };
  }
}
