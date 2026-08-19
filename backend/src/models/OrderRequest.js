import mongoose from 'mongoose';

const orderItemCustomizationSchema = new mongoose.Schema(
  {
    key: { type: String, required: true },
    label: { type: String, required: true },
    type: { type: String, required: true },
    value: { type: mongoose.Schema.Types.Mixed, required: true },
    additionalPrice: { type: Number, default: 0 },
  },
  { _id: false }
);

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    name: { type: String, required: true },
    image: { type: String, required: true },
    variantSku: { type: String, default: null },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true },
    customizations: {
      type: [orderItemCustomizationSchema],
      default: [],
    },
    customizationPrice: { type: Number, default: 0 },
  },
  { _id: false }
);

const orderRequestSchema = new mongoose.Schema(
  {
    token: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'cancelled', 'expired'],
      default: 'pending',
      required: true,
    },
    source: {
      type: String,
      enum: ['instagram', 'whatsapp'],
      required: true,
    },
    items: {
      type: [orderItemSchema],
      validate: {
        validator: (arr) => arr.length > 0,
        message: 'Order request must contain at least one item',
      },
    },
    agreedPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    discount: {
      type: Number,
      default: 0,
      min: 0,
    },
    paymentMethod: {
      type: String,
      enum: ['gpay'],
      default: 'gpay',
    },
    paymentStatus: {
      type: String,
      enum: ['paid'],
      default: 'paid',
    },
    internalNotes: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: '',
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    completedOrder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

orderRequestSchema.index({ token: 1, status: 1 });
orderRequestSchema.index({ status: 1, createdAt: -1 });
orderRequestSchema.index({ createdBy: 1 });

const OrderRequest = mongoose.model('OrderRequest', orderRequestSchema);

export default OrderRequest;
