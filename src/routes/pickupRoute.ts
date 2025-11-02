import express from 'express';
import { findRiders, createPickupRequest } from '../controllers/pickupController.js';
import {
  trackPickup,
  getUserActivePickups,
  getUserPickupHistory,
} from '../controllers/pickupTrackingController.js';

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
