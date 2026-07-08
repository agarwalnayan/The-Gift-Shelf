import mongoose from 'mongoose';
import slugify from 'slugify';

const imageSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String, required: true },
    isPrimary: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
  },
  { _id: false }
);

const seoSchema = new mongoose.Schema(
  {
    metaTitle: { type: String, trim: true, maxlength: 70, default: '' },
    metaDescription: { type: String, trim: true, maxlength: 160, default: '' },
    keywords: {
      type: [String],
      default: [],
      set: (keywords) =>
        Array.isArray(keywords) ? keywords.map((keyword) => keyword.trim()).filter(Boolean) : keywords,
    },
  },
  { _id: false }
);

const dimensionsSchema = new mongoose.Schema(
  {
    length: { type: Number, min: 0, default: 0 },
    width: { type: Number, min: 0, default: 0 },
    height: { type: Number, min: 0, default: 0 },
    unit: { type: String, enum: ['cm', 'in'], default: 'cm' },
  },
  { _id: false }
);

const weightSchema = new mongoose.Schema(
  {
    value: { type: Number, min: 0, default: 0 },
    unit: { type: String, enum: ['g', 'kg'], default: 'g' },
  },
  { _id: false }
);

/**
 * A variant attribute is a free-form name/value pair (e.g. { name: 'Color', value: 'Red' }).
 * Using a generic attribute list instead of fixed color/size/material fields means new
 * variant dimensions (e.g. "Engraving Style") can be introduced later with zero schema changes.
 */
const variantAttributeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    value: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const variantSchema = new mongoose.Schema(
  {
    sku: { type: String, required: true, trim: true },
    attributes: {
      type: [variantAttributeSchema],
      validate: {
        validator: (arr) => arr.length > 0,
        message: 'A variant must have at least one attribute (e.g. Color, Size)',
      },
    },
    price: { type: Number, min: 0, default: null },
    stock: { type: Number, min: 0, default: 0 },
    images: { type: [imageSchema], default: [] },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

/**
 * Validation rules are intentionally a loose bag of optional constraints
 * rather than per-type fixed fields, so a single schema covers every
 * customization type (present and future) without branching.
 */
const customizationValidationSchema = new mongoose.Schema(
  {
    minLength: { type: Number, min: 0 },
    maxLength: { type: Number, min: 0 },
    minSelections: { type: Number, min: 0 },
    maxSelections: { type: Number, min: 0 },
    allowedFileTypes: { type: [String], default: undefined },
    maxFileSizeMB: { type: Number, min: 0 },
    minDate: { type: Date },
    maxDate: { type: Date },
    pattern: { type: String },
  },
  { _id: false }
);

/**
 * `type` is stored as a plain string, not a Mongoose enum. The list of
 * supported values lives in `utils/customizationTypes.js` and is enforced at
 * the Joi/controller layer — adding a new customization type is therefore a
 * one-file change, never a database migration.
 */
const customizationOptionSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, trim: true },
    label: { type: String, required: true, trim: true, maxlength: 100 },
    type: { type: String, required: true },
    isEnabled: { type: Boolean, default: true },
    isRequired: { type: Boolean, default: false },
    additionalPrice: { type: Number, default: 0, min: 0 },
    choices: { type: [String], default: [] },
    placeholder: { type: String, trim: true, default: '' },
    helpText: { type: String, trim: true, default: '' },
    displayOrder: { type: Number, default: 0 },
    validation: { type: customizationValidationSchema, default: () => ({}) },
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      maxlength: 150,
    },
    slug: {
      type: String,
      unique: true,
    },
    sku: {
      type: String,
      required: true,
      unique: true,
    },
    brand: {
      type: String,
      trim: true,
      maxlength: 100,
      default: '',
    },
    description: {
      type: String,
      required: [true, 'Product description is required'],
    },
    shortDescription: {
      type: String,
      maxlength: 250,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Product category is required'],
    },
    subCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      default: null,
    },
    price: {
      type: Number,
      required: [true, 'Product price is required'],
      min: 0,
    },
    discountPrice: {
      type: Number,
      min: 0,
      default: 0,
    },
    costPrice: {
      type: Number,
      min: 0,
      default: 0,
    },
    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    lowStockThreshold: {
      type: Number,
      min: 0,
      default: 5,
    },
    images: {
      type: [imageSchema],
      validate: {
        validator: (arr) => arr.length > 0,
        message: 'At least one product image is required',
      },
    },
    tags: [{ type: String, trim: true }],
    occasion: [{ type: String, trim: true }],
    recipient: [{ type: String, trim: true }],
    material: {
      type: String,
      trim: true,
      default: '',
    },
    weight: {
      type: weightSchema,
      default: () => ({}),
    },
    dimensions: {
      type: dimensionsSchema,
      default: () => ({}),
    },
    attributes: [
      {
        key: { type: String, trim: true },
        value: { type: String, trim: true },
      },
    ],
    variants: {
      type: [variantSchema],
      default: [],
    },
    customizationOptions: {
      type: [customizationOptionSchema],
      default: [],
    },
    seo: {
      type: seoSchema,
      default: () => ({}),
    },
    ratingsAverage: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    ratingsCount: {
      type: Number,
      default: 0,
    },
    publishStatus: {
      type: String,
      enum: ['draft', 'published'],
      default: 'published',
    },
    isFeatured: {
      type: Boolean,
      default: false,
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

productSchema.index({ name: 'text', description: 'text', tags: 'text', brand: 'text', occasion: 'text', recipient: 'text' });
productSchema.index({ isDeleted: 1, isActive: 1, publishStatus: 1 });
productSchema.index({ category: 1 });
productSchema.index({ subCategory: 1 });
productSchema.index({ 'variants.sku': 1 }, { unique: true, sparse: true });

productSchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.slug = `${slugify(this.name, { lower: true, strict: true })}-${Date.now()
      .toString(36)}`;
  }
  next();
});

productSchema.virtual('finalPrice').get(function () {
  return this.discountPrice > 0 ? this.discountPrice : this.price;
});

productSchema.virtual('stockStatus').get(function () {
  if (this.stock <= 0) return 'out_of_stock';
  if (this.stock <= (this.lowStockThreshold ?? 5)) return 'low_stock';
  return 'in_stock';
});

productSchema.virtual('primaryImage').get(function () {
  if (!this.images?.length) return null;
  return this.images.find((image) => image.isPrimary) || this.images[0];
});

productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

const Product = mongoose.model('Product', productSchema);

export default Product;
