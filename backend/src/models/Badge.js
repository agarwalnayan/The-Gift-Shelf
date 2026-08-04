import mongoose from 'mongoose';

const badgeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Badge name is required'],
      trim: true,
      unique: true,
      maxlength: 100,
    },
    slug: {
      type: String,
      required: [true, 'Badge slug is required'],
      trim: true,
      unique: true,
      lowercase: true,
    },
    badgeText: {
      type: String,
      required: [true, 'Badge text is required'],
      trim: true,
      maxlength: 50,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
      default: '',
    },
    backgroundColor: {
      type: String,
      required: [true, 'Background color is required'],
      trim: true,
      default: '#F59E0B',
      match: [/^#[0-9A-Fa-f]{6}$/, 'Background color must be a valid hex color'],
    },
    textColor: {
      type: String,
      required: [true, 'Text color is required'],
      trim: true,
      default: '#FFFFFF',
      match: [/^#[0-9A-Fa-f]{6}$/, 'Text color must be a valid hex color'],
    },
    icon: {
      type: String,
      trim: true,
      default: '',
    },
    priority: {
      type: Number,
      default: 0,
      min: 0,
    },
    active: {
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

// Indexes for efficient queries
badgeSchema.index({ active: 1, priority: -1 });
badgeSchema.index({ slug: 1 });

// Pre-save hook to generate slug from name if not provided
badgeSchema.pre('save', function (next) {
  if (this.isModified('name') && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
  next();
});

const Badge = mongoose.model('Badge', badgeSchema);

export default Badge;
