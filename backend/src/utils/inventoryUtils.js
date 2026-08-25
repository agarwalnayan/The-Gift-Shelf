import Product from '../models/Product.js';

/**
 * Atomically decrements the stock of a product or its variant.
 * 
 * @param {Object} item - The order item containing product ID, variant SKU (optional), and quantity.
 */
export const decrementStock = async (item) => {
  if (item.variantSku) {
    await Product.updateOne(
      { _id: item.product, 'variants.sku': item.variantSku },
      { $inc: { 'variants.$.stock': -item.quantity } }
    );
  } else {
    await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.quantity } });
  }
};
