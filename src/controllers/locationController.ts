import { Request, Response } from 'express';
import {
  updateRiderLocation,
  getRiderLocation,
  deleteRiderLocation,
} from '../services/locationService.js';

/**
 * Update rider location
 * POST /api/v1/location/update
 */
export const updateLocation = async (req: Request, res: Response) => {
  try {
    const { riderId, lat, lng, heading } = req.body;

    // Validate required fields
    if (!riderId || lat === undefined || lng === undefined) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing required fields: riderId, lat, lng',
      });
    }

    // Parse and validate numeric values
    const riderIdNum = parseInt(riderId);
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);

    if (isNaN(riderIdNum) || isNaN(latitude) || isNaN(longitude)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid numeric values',
      });
    }

    const result = await updateRiderLocation(riderIdNum, {
      lat: latitude,
      lng: longitude,
      heading: heading ? parseFloat(heading) : undefined,
      timestamp: Date.now(),
    });

    if (!result.success) {
      return res.status(400).json({
        status: 'error',
        message: result.error || 'Failed to update location',
      });
    }

    return res.status(200).json({
      status: 'success',
      message: result.message,
    });
  } catch (error) {
    console.error('Error in updateLocation controller:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to update location';
    return res.status(500).json({
      status: 'error',
      message: errorMessage,
    });
  }
};

/**
 * Get rider location
 * GET /api/v1/location/:riderId
 */
export const getLocation = async (req: Request, res: Response) => {
  try {
    const { riderId } = req.params;

    const riderIdNum = parseInt(riderId);
    if (isNaN(riderIdNum)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid rider ID',
      });
    }

    const location = await getRiderLocation(riderIdNum);

    if (!location) {
      return res.status(404).json({
        status: 'error',
        message: 'Location not found for this rider',
      });
    }

    return res.status(200).json({
      status: 'success',
      data: location,
    });
  } catch (error) {
    console.error('Error in getLocation controller:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to get location';
    return res.status(500).json({
      status: 'error',
      message: errorMessage,
    });
  }
};

/**
 * Delete rider location (go offline)
 * DELETE /api/v1/location/:riderId
 */
export const removeLocation = async (req: Request, res: Response) => {
  try {
    const { riderId } = req.params;

    const riderIdNum = parseInt(riderId);
    if (isNaN(riderIdNum)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid rider ID',
      });
    }

    const result = await deleteRiderLocation(riderIdNum);

    if (!result.success) {
      return res.status(400).json({
        status: 'error',
        message: result.error || 'Failed to remove location',
      });
    }

    return res.status(200).json({
      status: 'success',
      message: result.message,
    });
  } catch (error) {
    console.error('Error in removeLocation controller:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to remove location';
    return res.status(500).json({
      status: 'error',
      message: errorMessage,
    });
  }
};
