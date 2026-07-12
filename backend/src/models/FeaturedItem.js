import mongoose from 'mongoose';

const imageSchema = new mongoose.Schema(
  {
    url: { type: String, default: '' },
    publicId: { type: String, default: '' },
  },
  { _id: false }
);

// Backs both the "Featured Recipient" and "Featured Occasion" homepage
// sections (distinguished by `type`). `value` maps directly to the existing
// Product.recipient / Product.occasion string-array fields so the storefront
// tile can link straight into the existing /products?recipient=... or
// /products?occasion=... filters with no new product-side taxonomy needed.
const featuredItemSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['recipient', 'occasion'],
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [80, 'Name cannot exceed 80 characters'],
    },
    value: {
      type: String,
      required: [true, 'Value is required'],
      trim: true,
      maxlength: [80, 'Value cannot exceed 80 characters'],
    },
    image: {
      type: imageSchema,
      default: () => ({}),
    },
    displayOrder: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

featuredItemSchema.index({ type: 1, isDeleted: 1, isActive: 1, displayOrder: 1 });

// Business rule: admin can feature at most 6 items per type on the homepage.
featuredItemSchema.statics.MAX_ITEMS_PER_TYPE = 6;

const FeaturedItem = mongoose.model('FeaturedItem', featuredItemSchema);

export default FeaturedItem;
