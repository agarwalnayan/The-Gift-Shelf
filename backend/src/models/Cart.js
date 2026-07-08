import mongoose from 'mongoose';

/**
 * Generic customization value — mirrors Product.customizationOptionSchema
 * closely enough to trace back to the option (`key`), but stores what the
 * customer actually chose (`value`) plus the price it added, snapshotted at
 * the time it was added so later admin edits to the option don't retroactively
 * change what's already in someone's cart.
 */
const customizationValueSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, trim: true },
    label: { type: String, required: true, trim: true },
    type: { type: String, required: true },
    value: { type: mongoose.Schema.Types.Mixed, required: true },
    additionalPrice: { type: Number, default: 0, min: 0 },
  },
  { _id: false }
);

const cartItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    variantSku: {
      type: String,
      default: null,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
    priceAtAddition: {
      type: Number,
      required: true,
    },
    customizations: {
      type: [customizationValueSchema],
      default: [],
    },
    customizationPrice: {
      type: Number,
      default: 0,
      min: 0,
    },
  }
);

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    items: [cartItemSchema],
    couponCode: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

const Cart = mongoose.model('Cart', cartSchema);

export default Cart;
