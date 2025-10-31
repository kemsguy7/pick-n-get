import express from 'express';
import {
  getAgentActivePickups,
  getAvailableJobs,
  acceptPickupJob,
  updatePickupStatus,
  getAgentStats,
} from '../controllers/agentController.ts';

const router = express.Router();

// Agent pickup management routes
router.get('/:riderId/pickups/active', getAgentActivePickups);
router.get('/:riderId/pickups/available', getAvailableJobs);
router.post('/:riderId/pickups/:pickupId/accept', acceptPickupJob);
router.patch('/:riderId/pickups/:pickupId/status', updatePickupStatus);

// Agent statistics
router.get('/:riderId/stats', getAgentStats);

export default router;
