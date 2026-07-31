import mongoose from "mongoose";

const imageSchema = new mongoose.Schema(
  {
    url: { type: String, default: '' },
    publicId: { type: String, default: '' },
  },
  { _id: false }
);

const catalogMasterSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    type: {
      type: String,
      enum: ["tag", "occasion", "recipient"],
      required: true,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    image: {
      type: imageSchema,
      default: () => ({}),
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    displayOrder: {
      type: Number,
      default: 0,
    },

    showOnHomepage: {
      type: Boolean,
      default: false,
    },

    homepageDisplayOrder: {
      type: Number,
      default: 0,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

catalogMasterSchema.index(
  {
    slug: 1,
    type: 1,
  },
  {
    unique: true,
  }
);
catalogMasterSchema.index(
  {
    name: 1,
    type: 1,
  },
  {
    unique: true,
  }
);
catalogMasterSchema.index(
  {
    type: 1,
    isActive: 1,
  },
  {
    unique: false,
  }
);

catalogMasterSchema.index({
  name: "text",
});
catalogMasterSchema.virtual("label").get(function () {
  return this.name;
});
export default mongoose.model("CatalogMaster", catalogMasterSchema);