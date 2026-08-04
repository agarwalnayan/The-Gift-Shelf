import mongoose from 'mongoose';

const imageSchema = new mongoose.Schema(
  {
    url: { type: String, default: '' },
    publicId: { type: String, default: '' },
  },
  { _id: false }
);

// Tier configuration for Buy More Save More promotions
const tierSchema = new mongoose.Schema(
  {
    minQuantity: {
      type: Number,
      required: true,
      min: 1,
    },
    discountType: {
      type: String,
      enum: ['flat', 'percentage', 'fixed_price'],
      required: true,
    },
    discountValue: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false }
);

// Target configuration - what products/categories the promotion applies to
const targetConfigSchema = new mongoose.Schema(
  {
    scope: {
      type: String,
      enum: ['entire_cart', 'categories', 'collections', 'products'],
      required: true,
    },
    categoryIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
    productIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    collectionTags: [{ type: String, trim: true }],
  },
  { _id: false }
);

// Eligibility configuration
const eligibilityConfigSchema = new mongoose.Schema(
  {
    userTypes: {
      type: [String],
      enum: ['everyone', 'guests', 'logged_in', 'new_customers', 'returning_customers'],
      default: ['everyone'],
    },
    minOrderValue: {
      type: Number,
      default: 0,
      min: 0,
    },
    maxOrderValue: {
      type: Number,
      default: null,
      min: 0,
    },
  },
  { _id: false }
);

// Buy More Save More specific configuration
const buyMoreSaveMoreConfigSchema = new mongoose.Schema(
  {
    pricingMethod: {
      type: String,
      enum: ['fixed_bundle_price', 'flat_discount', 'percentage_discount', 'tier_pricing'],
      required: true,
    },
    quantityRule: {
      type: String,
      enum: ['mixed_products', 'same_product_only'],
      default: 'mixed_products',
    },
    tiers: {
      type: [tierSchema],
      default: [],
    },
  },
  { _id: false }
);

// Flat/Percentage discount configuration
const discountConfigSchema = new mongoose.Schema(
  {
    discountType: {
      type: String,
      enum: ['flat', 'percentage'],
      required: true,
    },
    discountValue: {
      type: Number,
      required: true,
      min: 0,
    },
    maxDiscount: {
      type: Number,
      default: null,
      min: 0,
    },
  },
  { _id: false }
);

// Buy X Get Y configuration
const buyXGetYConfigSchema = new mongoose.Schema(
  {
    buyQuantity: {
      type: Number,
      required: true,
      min: 1,
    },
    getQuantity: {
      type: Number,
      required: true,
      min: 1,
    },
    getProductsFree: {
      type: Boolean,
      default: true,
    },
    getProductIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    getCategoryIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
  },
  { _id: false }
);

// Free shipping configuration
const freeShippingConfigSchema = new mongoose.Schema(
  {
    minOrderValue: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false }
);

// Free gift configuration
const freeGiftConfigSchema = new mongoose.Schema(
  {
    giftProductId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    minOrderValue: {
      type: Number,
      default: 0,
      min: 0,
    },
    maxGiftsPerOrder: {
      type: Number,
      default: 1,
      min: 1,
    },
  },
  { _id: false }
);

// Bundle pricing configuration
const bundlePricingConfigSchema = new mongoose.Schema(
  {
    bundleProducts: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        quantity: { type: Number, required: true, min: 1 },
      },
    ],
    bundlePrice: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false }
);

// Category/Collection discount configuration
const categoryDiscountConfigSchema = new mongoose.Schema(
  {
    discountType: {
      type: String,
      enum: ['flat', 'percentage'],
      required: true,
    },
    discountValue: {
      type: Number,
      required: true,
      min: 0,
    },
    maxDiscount: {
      type: Number,
      default: null,
      min: 0,
    },
  },
  { _id: false }
);

// First order offer configuration
const firstOrderConfigSchema = new mongoose.Schema(
  {
    discountType: {
      type: String,
      enum: ['flat', 'percentage'],
      required: true,
    },
    discountValue: {
      type: Number,
      required: true,
      min: 0,
    },
    maxDiscount: {
      type: Number,
      default: null,
      min: 0,
    },
  },
  { _id: false }
);

// Festival offer configuration
const festivalConfigSchema = new mongoose.Schema(
  {
    festivalName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    discountType: {
      type: String,
      enum: ['flat', 'percentage'],
      required: true,
    },
    discountValue: {
      type: Number,
      required: true,
      min: 0,
    },
    maxDiscount: {
      type: Number,
      default: null,
      min: 0,
    },
  },
  { _id: false }
);

// Custom rule configuration (flexible JSON for future types)
const customRuleConfigSchema = new mongoose.Schema(
  {
    ruleName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    config: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { _id: false }
);

const promotionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Promotion name is required'],
      trim: true,
      unique: true,
      maxlength: 200,
    },
    slug: {
      type: String,
      required: [true, 'Promotion slug is required'],
      trim: true,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
      default: '',
    },
    type: {
      type: String,
      required: true,
      enum: [
        'buy_more_save_more',
        'flat_discount',
        'percentage_discount',
        'buy_x_get_y',
        'free_shipping',
        'free_gift',
        'bundle_pricing',
        'category_discount',
        'collection_discount',
        'first_order_offer',
        'festival_offer',
        'custom_rule',
      ],
      index: true,
    },
    status: {
      type: String,
      enum: ['draft', 'scheduled', 'active', 'expired', 'archived'],
      default: 'draft',
      index: true,
    },
    // Target configuration
    target: {
      type: targetConfigSchema,
      default: () => ({ scope: 'entire_cart' }),
    },
    // Eligibility configuration
    eligibility: {
      type: eligibilityConfigSchema,
      default: () => ({ userTypes: ['everyone'], minOrderValue: 0 }),
    },
    // Type-specific configurations (only one will be set based on type)
    buyMoreSaveMoreConfig: {
      type: buyMoreSaveMoreConfigSchema,
      default: null,
    },
    discountConfig: {
      type: discountConfigSchema,
      default: null,
    },
    buyXGetYConfig: {
      type: buyXGetYConfigSchema,
      default: null,
    },
    freeShippingConfig: {
      type: freeShippingConfigSchema,
      default: null,
    },
    freeGiftConfig: {
      type: freeGiftConfigSchema,
      default: null,
    },
    bundlePricingConfig: {
      type: bundlePricingConfigSchema,
      default: null,
    },
    categoryDiscountConfig: {
      type: categoryDiscountConfigSchema,
      default: null,
    },
    firstOrderConfig: {
      type: firstOrderConfigSchema,
      default: null,
    },
    festivalConfig: {
      type: festivalConfigSchema,
      default: null,
    },
    customRuleConfig: {
      type: customRuleConfigSchema,
      default: null,
    },
    // Scheduling
    startDate: {
      type: Date,
      default: null,
    },
    endDate: {
      type: Date,
      default: null,
    },
    // Display settings
    bannerImage: {
      type: imageSchema,
      default: () => ({}),
    },
    badgeText: {
      type: String,
      trim: true,
      maxlength: 50,
      default: '',
    },
    backgroundColor: {
      type: String,
      trim: true,
      default: '#10B981',
      match: [/^#[0-9A-Fa-f]{6}$/, 'Background color must be a valid hex color'],
    },
    textColor: {
      type: String,
      trim: true,
      default: '#FFFFFF',
      match: [/^#[0-9A-Fa-f]{6}$/, 'Text color must be a valid hex color'],
    },
    icon: {
      type: String,
      trim: true,
      default: '',
    },
    showOnProductPage: {
      type: Boolean,
      default: true,
    },
    showInCart: {
      type: Boolean,
      default: true,
    },
    priority: {
      type: Number,
      default: 0,
      index: true,
    },
    // Usage limits
    maxUses: {
      type: Number,
      default: null,
      min: 0,
    },
    usedCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    maxUsesPerUser: {
      type: Number,
      default: null,
      min: 0,
    },
    // Metadata
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

// Indexes for efficient queries
promotionSchema.index({ status: 1, startDate: 1, endDate: 1, priority: -1 });
promotionSchema.index({ type: 1, status: 1 });
promotionSchema.index({ 'target.scope': 1, status: 1 });

// Virtual to check if promotion is currently active
promotionSchema.virtual('isActive').get(function () {
  if (this.status !== 'active') return false;
  if (this.startDate && this.startDate > new Date()) return false;
  if (this.endDate && this.endDate < new Date()) return false;
  return true;
});

// Virtual to check if promotion has reached usage limits
promotionSchema.virtual('isUsageLimitReached').get(function () {
  if (this.maxUses && this.usedCount >= this.maxUses) return true;
  return false;
});

// Method to increment usage count atomically
promotionSchema.methods.incrementUsage = async function () {
  await Promotion.findByIdAndUpdate(this._id, { $inc: { usedCount: 1 } });
};

// Method to check if user has exceeded per-user limit
promotionSchema.methods.checkUserUsageLimit = async function (userId) {
  if (!this.maxUsesPerUser) return false;
  // This would need to be implemented with order tracking
  // For now, return false (not exceeded)
  return false;
};

// Pre-save hook to update status based on dates and generate slug
promotionSchema.pre('save', function (next) {
  if (this.isModified('name') && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
  
  if (this.isModified('startDate') || this.isModified('endDate') || this.isModified('status')) {
    const now = new Date();
    
    // Auto-update status based on dates if not manually set to draft/archived
    if (this.status !== 'draft' && this.status !== 'archived') {
      if (this.startDate && this.startDate > now) {
        this.status = 'scheduled';
      } else if (this.endDate && this.endDate < now) {
        this.status = 'expired';
      } else if (!this.startDate || this.startDate <= now) {
        this.status = 'active';
      }
    }
  }
  next();
});

const Promotion = mongoose.model('Promotion', promotionSchema);

export default Promotion;
