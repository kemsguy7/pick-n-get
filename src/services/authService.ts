import { User, UserRole } from '../models/userModel';
import { Rider, ApprovalStatus } from '../interface/deliveryInterface';

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
}

/**
 * Check wallet address and return all roles from backend DB
 */
export async function checkWalletRoles(walletAddress: string): Promise<UserRoleInfo> {
  const roles: string[] = [];
  let userData: UserRoleInfo['userData'];
  let riderData: UserRoleInfo['riderData'];

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
  }

  // Determine primary role (priority order)
  const rolesPriority = ['SuperAdmin', 'Admin', 'Rider', 'Recycler'];
  const primaryRole = rolesPriority.find((r) => roles.includes(r)) || 'Guest';

  return {
    walletAddress,
    roles: [...new Set(roles)], // Remove duplicates
    primaryRole,
    userData,
    riderData,
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
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Failed to add role',
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
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Failed to remove role',
    };
  }
}
