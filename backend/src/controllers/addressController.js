import pincodeService from '../services/pincodeService.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';

/**
 * Lookup location information for a PIN code
 */
export const lookupPincode = asyncHandler(async (req, res) => {
  const { pincode } = req.params;

  if (!pincode) {
    throw new ApiError(400, 'PIN code is required');
  }

  try {
    const locationData = await pincodeService.lookupPincode(pincode);
    res.status(200).json(new ApiResponse(200, locationData, 'PIN code lookup successful'));
  } catch (error) {
    throw new ApiError(400, error.message || 'PIN code lookup failed');
  }
});