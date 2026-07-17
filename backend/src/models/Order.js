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

const shippingAddressSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    line1: { type: String, required: true },
    line2: { type: String },
    city: { type: String, required: true },
    state: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true },
  },
  { _id: false }
);

// Fulfillment/shipping details the admin fills in once an order is handed
// to a courier. Kept as a simple embedded object (not its own collection)
// since it only ever applies to the single order it lives on.
const courierSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, default: '' },
    trackingId: { type: String, trim: true, default: '' },
    trackingUrl: { type: String, trim: true, default: '' },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    orderItems: {
      type: [orderItemSchema],
      validate: {
        validator: (arr) => arr.length > 0,
        message: 'Order must contain at least one item',
      },
    },
    shippingAddress: {
      type: shippingAddressSchema,
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ['razorpay', 'whatsapp', 'cod'],
      required: true,
    },
    paymentResult: {
      razorpayOrderId: { type: String },
      razorpayPaymentId: { type: String },
      razorpaySignature: { type: String },
      status: { type: String },
    },
    couponCode: { type: String, default: null },
    giftMessage: { type: String, trim: true, maxlength: 300, default: '' },
    orderNotes: { type: String, trim: true, maxlength: 300, default: '' },
    itemsPrice: { type: Number, required: true, default: 0 },
    shippingPrice: { type: Number, required: true, default: 0 },
    discountPrice: { type: Number, required: true, default: 0 },
    whatsappCharge: { type: Number, required: true, default: 0 },
    // GST removed store-wide; retained (always 0) so historical documents stay valid.
    taxPrice: { type: Number, required: true, default: 0 },
    totalPrice: { type: Number, required: true, default: 0 },
    isPaid: { type: Boolean, default: false },
    paidAt: { type: Date },
    // Granular admin-controlled payment state. `isPaid` is kept in sync
    // (true only when paymentStatus === 'paid') so existing views that
    // already read the boolean keep working without changes.
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },
    orderStatus: {
      type: String,
      enum: ['pending', 'confirmed', 'preparing', 'packed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'returned'],
      default: 'pending',
    },
    courier: {
      type: courierSchema,
      default: () => ({}),
    },
    internalNotes: { type: String, trim: true, maxlength: 1000, default: '' },
    deliveredAt: { type: Date },
    cancelledAt: { type: Date },
    cancelReason: { type: String },
  },
  { timestamps: true }
);

const Order = mongoose.model('Order', orderSchema);

export default Order;