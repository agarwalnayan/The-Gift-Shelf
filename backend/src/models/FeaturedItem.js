import mongoose from 'mongoose';

const imageSchema = new mongoose.Schema(
  {
    url: { type: String, default: '' },
    publicId: { type: String, default: '' },
  },
  { _id: false }
);

// DEPRECATED: This model is deprecated in favor of CatalogMaster.
// Homepage now uses CatalogMaster for recipients and occasions.
// Kept for backward compatibility with admin panel during migration.
// TODO: Remove after admin panel migration to CatalogMaster is complete.
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
