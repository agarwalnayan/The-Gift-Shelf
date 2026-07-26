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
    heroTitle: {
      type: String,
      trim: true,
      default: '',
    },
    heroSubtitle: {
      type: String,
      trim: true,
      default: '',
    },
    primaryCtaText: {
      type: String,
      trim: true,
      default: '',
    },
    primaryCtaLink: {
      type: String,
      trim: true,
      default: '',
    },
    secondaryCtaText: {
      type: String,
      trim: true,
      default: '',
    },
    secondaryCtaLink: {
      type: String,
      trim: true,
      default: '',
    },
    deliveryMessage: {
      type: String,
      trim: true,
      default: '',
    },
    countdownDate: {
      type: Date,
    },
    festivalBadge: {
      url: { type: String, default: '' },
      publicId: { type: String, default: '' },
    },
    landingPage: {
      type: String,
      trim: true,
      default: '',
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
    featuredProducts: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'Product',
      default: [],
    },
    featuredCollections: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'BudgetCollection',
      default: [],
    },
    upcomingFestival: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Festival',
      default: null,
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
