import mongoose from 'mongoose';

const festivalSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    enabled: {
      type: Boolean,
      default: false,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    desktopBanner: {
      url: { type: String, default: '' },
      publicId: { type: String, default: '' },
    },
    mobileBanner: {
      url: { type: String, default: '' },
      publicId: { type: String, default: '' },
    },
    festivalBadge: {
      url: { type: String, default: '' },
      publicId: { type: String, default: '' },
    },
    themeColor: {
      type: String,
      trim: true,
      default: '#C8A46B',
    },
    announcement: {
      enabled: { type: Boolean, default: false },
      message: { type: String, trim: true, default: '' },
      linkText: { type: String, trim: true, default: '' },
      linkUrl: { type: String, trim: true, default: '' },
      backgroundColor: { type: String, trim: true, default: '#F59E0B' },
      textColor: { type: String, trim: true, default: '#FFFFFF' },
      dismissible: { type: Boolean, default: true },
    },
    featuredTags: [{
      type: String,
      trim: true,
    }],
    featuredCollections: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'BudgetCollection',
      default: [],
    },
    displayOrder: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
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
  },
  { timestamps: true }
);

// Index for finding active festivals within date range
festivalSchema.index({ enabled: 1, isActive: 1, startDate: 1, endDate: 1 });
festivalSchema.index({ slug: 1 });

const Festival = mongoose.model('Festival', festivalSchema);

export default Festival;
