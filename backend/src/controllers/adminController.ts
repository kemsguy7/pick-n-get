import { Request, Response } from 'express';
import {
  updateRiderApproval,
  getPendingRiders,
  updateRiderDetails,
  getRiderById,
} from '../services/deliveryService';
import { checkWalletRoles } from '../services/authService';

/**
 * Get pending riders for admin approval
 * GET /api/v1/admin/riders/pending
 */
export const getPendingRidersForApproval = async (req: Request, res: Response) => {
  try {
    // TODO: Add admin authentication middleware
    // For now, i'm skipping  auth check

    const result = await getPendingRiders();

    return res.status(200).json(result);
  } catch (error: any) {
    console.error('Error getting pending riders:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to get pending riders',
    });
  }
};

/**
 * Update rider approval status (approve/reject)
 * PATCH /api/v1/admin/riders/:riderId/approval
 */
export const updateRiderApprovalStatus = async (req: Request, res: Response) => {
  try {
    const { riderId } = req.params;
    const { status, adminWallet } = req.body;

    // Validate admin permissions
    if (adminWallet) {
      const adminRoles = await checkWalletRoles(adminWallet);
      if (!adminRoles.roles.includes('Admin') && !adminRoles.roles.includes('SuperAdmin')) {
        return res.status(403).json({
          status: 'error',
          message: 'Insufficient permissions. Admin role required.',
        });
      }
    }

    // Map frontend status to backend action
    let action: 'approve' | 'reject';
    if (status === 'approve') {
      action = 'approve';
    } else if (status === 'reject') {
      action = 'reject';
    } else {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid status. Must be "approve" or "reject"',
      });
    }

    console.log(`🎯 Admin approval request: ${action} rider ${riderId}`);

    const result = await updateRiderApproval(parseInt(riderId), action);

    if (result.status === 'error') {
      return res.status(404).json(result);
    }

    console.log(`✅ Admin approval completed: ${result.message}`);

    return res.status(200).json(result);
  } catch (error: any) {
    console.error('❌ Error updating rider approval:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to update rider approval',
    });
  }
};

/**
 * Update rider details (capacity, status, etc.)
 * PATCH /api/v1/admin/riders/:riderId
 */
export const updateRiderDetailsAdmin = async (req: Request, res: Response) => {
  try {
    const { riderId } = req.params;
    const updates = req.body;

    console.log(`🔄 Admin updating rider ${riderId}:`, updates);

    const result = await updateRiderDetails(parseInt(riderId), updates);

    if (result.status === 'error') {
      return res.status(404).json(result);
    }

    console.log(`✅ Rider details updated: ${result.message}`);

    return res.status(200).json(result);
  } catch (error: any) {
    console.error('❌ Error updating rider details:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to update rider details',
    });
  }
};

/**
 * Get rider details for admin review
 * GET /api/v1/admin/riders/:riderId
 */
export const getRiderDetailsForAdmin = async (req: Request, res: Response) => {
  try {
    const { riderId } = req.params;

    const result = await getRiderById(parseInt(riderId));

    if (result.status === 'error') {
      return res.status(404).json(result);
    }

    return res.status(200).json(result);
  } catch (error: any) {
    console.error('❌ Error getting rider details:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to get rider details',
    });
  }
};

/**
 * Check wallet roles for admin authentication
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
 * Save rider from blockchain to backend
 * POST /api/v1/auth/save-rider
 */
export const saveRiderFromBlockchain = async (req: Request, res: Response) => {
  try {
    const riderData = req.body;

    console.log('💾 Saving rider from blockchain:', riderData.walletAddress);

    // Import createRider function
    const { createRider } = require('../services/deliveryService');

    const result = await createRider(riderData);

    if (result.status === 'error') {
      return res.status(400).json(result);
    }

    console.log('✅ Rider saved to backend successfully');

    return res.status(201).json(result);
  } catch (error: any) {
    console.error('❌ Error saving rider from blockchain:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to save rider from blockchain',
    });
  }
};
