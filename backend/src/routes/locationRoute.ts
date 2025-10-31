import express from 'express';
import { updateLocation, getLocation, removeLocation } from '../controllers/locationController.ts';

const route = express.Router();

// Update rider location
route.post('/update', updateLocation);

// Get rider location
route.get('/:riderId', getLocation);

// Remove rider location (go offline)
route.delete('/:riderId', removeLocation);

export default route;
