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
