import express from 'express';
import { findRiders, createPickupRequest } from '../controllers/pickupController.ts';
import {
  trackPickup,
  getUserActivePickups,
  getUserPickupHistory,
} from '../controllers/pickupTrackingController.ts';

const router = express.Router();

// Find nearest available riders
router.post('/find-riders', findRiders);

// Create pickup request
router.post('/create', createPickupRequest);

// Tracking Routes
router.get('/track/:pickupId', trackPickup);
router.get('/user/:userId/active', getUserActivePickups);
router.get('/user/:userId/history', getUserPickupHistory);

export default router;
