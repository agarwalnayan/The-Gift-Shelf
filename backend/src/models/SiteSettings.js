import mongoose from 'mongoose';

const imageSchema = new mongoose.Schema(
  {
    url: { type: String, default: '' },
    publicId: { type: String, default: '' },
  },
  { _id: false }
);

// Singleton document holding the two homepage/site-wide configuration
// blocks that don't behave like list items (only one is ever "current"):
// the Dynamic Announcement Bar and the Launch Welcome Popup.
const announcementBarSchema = new mongoose.Schema(
  {
    enabled: { type: Boolean, default: false },
    message: { type: String, trim: true, maxlength: 200, default: '' },
    linkText: { type: String, trim: true, maxlength: 40, default: '' },
    linkUrl: { type: String, trim: true, maxlength: 300, default: '' },
    backgroundColor: { type: String, trim: true, default: '#1c1c1c' },
    textColor: { type: String, trim: true, default: '#fdfaf6' },
    dismissible: { type: Boolean, default: true },
  },
  { _id: false }
);

const welcomePopupSchema = new mongoose.Schema(
  {
    enabled: { type: Boolean, default: false },
    title: { type: String, trim: true, maxlength: 120, default: '' },
    description: { type: String, trim: true, maxlength: 400, default: '' },
    image: { type: imageSchema, default: () => ({}) },
    ctaText: { type: String, trim: true, maxlength: 40, default: '' },
    ctaLink: { type: String, trim: true, maxlength: 300, default: '' },
    delaySeconds: { type: Number, default: 2, min: 0, max: 60 },
    showOncePerSession: { type: Boolean, default: true },
  },
  { _id: false }
);

const policyPagesSchema = new mongoose.Schema(
  {
    privacyPolicy: {
      type: String,
      default: '',
    },
    shippingPolicy: {
      type: String,
      default: '',
    },
    returnPolicy: {
      type: String,
      default: '',
    },
    termsAndConditions: {
      type: String,
      default: '',
    },
    aboutUs: {
      type: String,
      default: '',
    },
  },
  { _id: false }
);

// Store-wide checkout/commerce configuration — everything the Premium
// Cart & Checkout experience needs from Admin so nothing is hardcoded on
// the storefront (shipping, WhatsApp ordering charge, payment options,
// checkout banner message, and the return/replacement policy copy).
const commerceSettingsSchema = new mongoose.Schema(
  {
    freeShippingThreshold: { type: Number, default: 999, min: 0 },
    shippingCharge: { type: Number, default: 49, min: 0 },
    whatsappCharge: { type: Number, default: 50, min: 0 },
    whatsappNumber: { type: String, trim: true, default: '' },
    checkoutMessage: { type: String, trim: true, maxlength: 240, default: '' },
    paymentOptions: {
      razorpay: { type: Boolean, default: true },
      whatsapp: { type: Boolean, default: true },
    },
    returnPolicy: { type: String, trim: true, default: '' },
    replacementPolicy: { type: String, trim: true, default: '' },
  },
  { _id: false }
);

const siteSettingsSchema = new mongoose.Schema(
  {
    singletonKey: {
      type: String,
      default: 'main',
      unique: true,
    },
    announcementBar: {
      type: announcementBarSchema,
      default: () => ({}),
    },
    welcomePopup: {
      type: welcomePopupSchema,
      default: () => ({}),
    },
    commerce: {
      type: commerceSettingsSchema,
      default: () => ({}),
    },
    policies: {
      type: policyPagesSchema,
      default: () => ({}),
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  { timestamps: true }
);

/** Fetches the singleton settings doc, creating it with defaults if absent. */
siteSettingsSchema.statics.getSingleton = async function () {
  let settings = await this.findOne({ singletonKey: 'main' });
  if (!settings) {
    settings = await this.create({ singletonKey: 'main' });
  }
  return settings;
};

const SiteSettings = mongoose.model('SiteSettings', siteSettingsSchema);

export default SiteSettings;