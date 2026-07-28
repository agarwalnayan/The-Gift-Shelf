import Product from '../models/Product.js';

/**
 * ProductBulkService - Handles bulk product updates
 * Uses MongoDB bulkWrite() for efficient batch operations
 */
class ProductBulkService {
  /**
   * Bulk update products
   * @param {Array} productIds - Array of product IDs to update
   * @param {String} operation - 'add' or 'remove'
   * @param {String} field - 'tags', 'recipient', or 'occasion'
   * @param {Array} values - Array of values to add or remove
   * @returns {Promise<Object>} Result with modifiedCount
   */
  static async bulkUpdate({ productIds, operation, field, values }) {
    if (!productIds || productIds.length === 0) {
      throw new Error('No product IDs provided');
    }

    if (!operation || !['add', 'remove'].includes(operation)) {
      throw new Error('Invalid operation. Must be "add" or "remove"');
    }

    if (!field || !['tags', 'recipient', 'occasion'].includes(field)) {
      throw new Error('Invalid field. Must be "tags", "recipient", or "occasion"');
    }

    if (!values || values.length === 0) {
      throw new Error('No values provided');
    }

    const bulkOps = productIds.map((productId) => {
      if (operation === 'add') {
        return {
          updateOne: {
            filter: { _id: productId },
            update: {
              $addToSet: {
                [field]: { $each: values },
              },
            },
          },
        };
      } else {
        return {
          updateOne: {
            filter: { _id: productId },
            update: {
              $pullAll: {
                [field]: values,
              },
            },
          },
        };
      }
    });

    const result = await Product.bulkWrite(bulkOps);

    return {
      modifiedCount: result.modifiedCount,
      matchedCount: result.matchedCount,
    };
  }
}

export default ProductBulkService;
