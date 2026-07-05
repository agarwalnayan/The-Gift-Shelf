import mongoose from 'mongoose';
import slugify from 'slugify';

const imageSchema = new mongoose.Schema(
  {
    url: { type: String, default: '' },
    publicId: { type: String, default: '' },
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
        Array.isArray(keywords)
          ? keywords.map((keyword) => keyword.trim()).filter(Boolean)
          : keywords,
    },
  },
  { _id: false }
);

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      trim: true,
      maxlength: [150, 'Category name cannot exceed 150 characters'],
    },
    slug: {
      type: String,
      unique: true,
      index: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
      default: '',
    },
    shortDescription: {
      type: String,
      trim: true,
      maxlength: [300, 'Short description cannot exceed 300 characters'],
      default: '',
    },
    image: {
      type: imageSchema,
      default: () => ({}),
    },
    banner: {
      type: imageSchema,
      default: () => ({}),
    },
    parentCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      default: null,
      index: true,
    },
    level: {
      type: Number,
      default: 0,
      min: 0,
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
    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },
    showOnHomepage: {
      type: Boolean,
      default: false,
    },
    seo: {
      type: seoSchema,
      default: () => ({}),
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

categorySchema.index({ parentCategory: 1, displayOrder: 1 });
categorySchema.index({ isDeleted: 1, isActive: 1 });
categorySchema.index({ name: 'text', description: 'text', shortDescription: 'text' });

categorySchema.pre('save', async function (next) {
  if (this.isModified('name') || !this.slug) {
    const baseSlug = slugify(this.name, { lower: true, strict: true });
    let candidateSlug = baseSlug;
    let counter = 1;

    const Model = this.constructor;
    while (await Model.exists({ slug: candidateSlug, _id: { $ne: this._id } })) {
      candidateSlug = `${baseSlug}-${counter}`;
      counter += 1;
    }

    this.slug = candidateSlug;
  }

  next();
});

/**
 * Determines whether assigning `newParentId` as the parent of `categoryId`
 * would create a circular reference in the category tree.
 * Returns true when `categoryId` is found among the ancestors of `newParentId`.
 */
categorySchema.statics.wouldCreateCycle = async function (categoryId, newParentId) {
  if (!newParentId) return false;
  if (String(newParentId) === String(categoryId)) return true;

  let current = await this.findById(newParentId).select('parentCategory');

  while (current) {
    if (!current.parentCategory) return false;
    if (String(current.parentCategory) === String(categoryId)) return true;
    current = await this.findById(current.parentCategory).select('parentCategory');
  }

  return false;
};

categorySchema.methods.toTreeNode = function () {
  return {
    _id: this._id,
    name: this.name,
    slug: this.slug,
    image: this.image,
    parentCategory: this.parentCategory,
    level: this.level,
    displayOrder: this.displayOrder,
    isActive: this.isActive,
    isFeatured: this.isFeatured,
    showOnHomepage: this.showOnHomepage,
    children: [],
  };
};

const Category = mongoose.model('Category', categorySchema);

export default Category;
