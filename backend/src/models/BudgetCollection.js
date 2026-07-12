import mongoose from 'mongoose';

const imageSchema = new mongoose.Schema(
  {
    url: { type: String, default: '' },
    publicId: { type: String, default: '' },
  },
  { _id: false }
);

// Fixed set of 3 price tiers shown on the homepage. `tier` is a unique key
// admins upsert into (no free-form creation), which keeps the section to
// exactly the 3 requested bands while still being fully admin-editable
// (label, image, link override, active/inactive, display order).
const budgetCollectionSchema = new mongoose.Schema(
  {
    tier: {
      type: String,
      enum: ['under-499', '500-999', 'premium'],
      required: true,
      unique: true,
    },
    label: {
      type: String,
      required: [true, 'Label is required'],
      trim: true,
      maxlength: [80, 'Label cannot exceed 80 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [200, 'Description cannot exceed 200 characters'],
      default: '',
    },
    minPrice: {
      type: Number,
      default: 0,
      min: 0,
    },
    maxPrice: {
      type: Number,
      default: null,
      min: 0,
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
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  { timestamps: true }
);

budgetCollectionSchema.statics.DEFAULT_TIERS = [
  { tier: 'under-499', label: 'Under ₹499', minPrice: 0, maxPrice: 499, displayOrder: 0 },
  { tier: '500-999', label: '₹500 – ₹999', minPrice: 500, maxPrice: 999, displayOrder: 1 },
  { tier: 'premium', label: 'Premium', minPrice: 1000, maxPrice: null, displayOrder: 2 },
];

const BudgetCollection = mongoose.model('BudgetCollection', budgetCollectionSchema);

export default BudgetCollection;
