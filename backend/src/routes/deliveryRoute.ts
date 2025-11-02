import express from 'express';
import {
  validateR,
  updateStatus,
  pickRide,
  allPickUpByRider,
  GetAllRiders,
  GetRiderById,
  UpdateRiderApproval,
  RegisterRider,
  CheckRiderRegistration,
} from '../controllers/deliveryController.js';

const route = express.Router();

// Rider registration
route.post('/riders', RegisterRider);

// Check if rider is already registered (by ID or wallet address)
route.get('/riders/check/:identifier', CheckRiderRegistration);

// Get all riders
route.get('/riders', GetAllRiders);

// Get rider by ID
route.get('/riders/:riderId', GetRiderById);

// Update rider approval status
route.patch('/riders/:riderId/approval', UpdateRiderApproval);

// Pickup routes
route.post('/pick-ride/:user/:item', pickRide);
route.post('/validate-ride/:rider/:pick-up-id', validateR);
route.post('/update-status/:rider/:pick-up-id', updateStatus);
route.get('/total-ride/:rider', allPickUpByRider);

export default route;
