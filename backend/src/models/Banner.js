import mongoose from 'mongoose';

const imageSchema = new mongoose.Schema(
  {
    url: { type: String, default: '' },
    publicId: { type: String, default: '' },
  },
  { _id: false }
);

// A single model backs both the Hero Slider ("hero") and the Promotional
// Banner placements ("promo") on the storefront homepage. Reusing one
// schema/controller/route set (distinguished by `type`) avoids duplicating
// near-identical CRUD for two content shapes that only differ in placement.
const bannerSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['hero', 'promo'],
      required: true,
      index: true,
    },
    title: {
      type: String,
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters'],
      default: '',
    },
    subtitle: {
      type: String,
      trim: true,
      maxlength: [200, 'Subtitle cannot exceed 200 characters'],
      default: '',
    },
    description: {
      type: String,
      trim: true,
      maxlength: [400, 'Description cannot exceed 400 characters'],
      default: '',
    },
    image: {
      type: imageSchema,
      default: () => ({}),
    },
    mobileImage: {
      type: imageSchema,
      default: () => ({}),
    },
    ctaText: {
      type: String,
      trim: true,
      maxlength: 40,
      default: '',
    },
    ctaLink: {
      type: String,
      trim: true,
      maxlength: 300,
      default: '',
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
    startDate: {
      type: Date,
      default: null,
    },
    endDate: {
      type: Date,
      default: null,
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

bannerSchema.index({ type: 1, isDeleted: 1, isActive: 1, displayOrder: 1 });

/**
 * A banner is "live" for storefront display when active, not soft-deleted,
 * and (if scheduling dates are set) within its start/end window.
 */
bannerSchema.statics.liveFilter = function (type) {
  const now = new Date();
  return {
    type,
    isDeleted: { $ne: true },
    isActive: true,
    $and: [
      { $or: [{ startDate: null }, { startDate: { $lte: now } }] },
      { $or: [{ endDate: null }, { endDate: { $gte: now } }] },
    ],
  };
};

const Banner = mongoose.model('Banner', bannerSchema);

export default Banner;
