import express from 'express';
import {
  getPendingRidersForApproval,
  updateRiderApprovalStatus,
  updateRiderDetailsAdmin,
  getRiderDetailsForAdmin,
  checkWalletAuth,
  saveRiderFromBlockchain,
} from '../controllers/adminController.js';

import {
  getDashboardStats,
  getUserStats,
  getRiderStats,
  getRecentActivity,
  getSystemAlerts,
} from '../controllers/adminController_stats.js';

const router = express.Router();

//Admin authentication
router.post('/auth/check-wallet', checkWalletAuth);
router.post('/auth/save-rider', saveRiderFromBlockchain);

//Admin rider management
router.get('/riders/pending', getPendingRidersForApproval);
router.get('/riders/:riderId', getRiderDetailsForAdmin);
router.patch('/riders/:riderId', updateRiderDetailsAdmin);
router.patch('/riders/:riderId/approval', updateRiderApprovalStatus);

// Dashboard stats endpoints
router.get('/stats/dashboard', getDashboardStats);
router.get('/stats/users', getUserStats);
router.get('/stats/riders', getRiderStats);
router.get('/activity/recent', getRecentActivity);
router.get('/alerts/system', getSystemAlerts);

export default router;
