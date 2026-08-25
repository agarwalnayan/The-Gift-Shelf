import axios from 'axios';

/**
 * Pincode Lookup Service
 * Provides Indian PIN-code to location information lookup
 * Uses postalcodes.in API (free, no authentication required)
 */

class PincodeService {
  constructor() {
    this.baseUrl = 'https://api.postalpincode.in/pincode';
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes cache
  }

  /**
   * Lookup location information for a given PIN code
   * @param {string} pincode - 6-digit Indian PIN code
   * @returns {Promise<Object>} Location information
   */
  async lookupPincode(pincode) {
    // Validate PIN code format
    if (!pincode || !/^\d{6}$/.test(pincode)) {
      throw new Error('Invalid PIN code format. Must be 6 digits.');
    }

    // Check cache first
    const cacheKey = pincode;
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }

    try {
      const response = await axios.get(`${this.baseUrl}/${pincode}`, {
        timeout: 5000, // 5 second timeout
        headers: {
          'Accept': 'application/json',
        }
      });

      // External API returns an array, not an object
      if (!response.data || !Array.isArray(response.data) || response.data.length === 0 || response.data[0].Status !== 'Success') {
        throw new Error('PIN code not found');
      }

      const postOffice = response.data[0].PostOffice?.[0];
      if (!postOffice) {
        throw new Error('No location data found for this PIN code');
      }

      const locationData = {
        pincode: pincode,
        city: postOffice.District || postOffice.Block || '',
        state: postOffice.State || '',
        district: postOffice.District || '',
        country: postOffice.Country || 'India',
        circle: postOffice.Circle || '',
        region: postOffice.Region || '',
      };

      // Cache the result
      this.cache.set(cacheKey, {
        data: locationData,
        timestamp: Date.now()
      });

      return locationData;

    } catch (error) {
      if (error.code === 'ECONNABORTED') {
        throw new Error('PIN code lookup timeout. Please try again.');
      }
      
      if (error.response) {
        throw new Error('PIN code service unavailable. Please enter city and state manually.');
      }

      // Re-throw validation errors
      if (error.message.includes('Invalid PIN code') || error.message.includes('not found')) {
        throw error;
      }

      // Generic error for API failures
      throw new Error('Unable to lookup PIN code. Please enter city and state manually.');
    }
  }

  /**
   * Clear cache (useful for testing or forced refresh)
   */
  clearCache() {
    this.cache.clear();
  }
}

// Export singleton instance
export default new PincodeService();