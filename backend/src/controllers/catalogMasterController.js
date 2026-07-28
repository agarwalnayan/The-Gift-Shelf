import CatalogMaster from "../models/CatalogMaster.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";

/**
 * @desc    Create Catalog Master
 * @route   POST /api/v1/catalog-masters
 * @access  Private (Admin)
 */
export const createCatalogMaster = asyncHandler(async (req, res) => {
  const {
    name,
    slug,
    type,
    displayOrder = 0,
    isActive = true,
    description = "",
  } = req.body;

  const existing = await CatalogMaster.findOne({
    slug,
    type,
  });

  if (existing) {
    throw new ApiError(
      400,
      `${type.charAt(0).toUpperCase() + type.slice(1)} already exists`
    );
  }

  const master = await CatalogMaster.create({
    name,
    slug,
    type,
    description,
    displayOrder,
    isActive,
    createdBy: req.user._id,
    updatedBy: req.user._id,
  });

  res
    .status(201)
    .json(new ApiResponse(201, { master }, "Catalog master created successfully"));
});

/**
 * @desc    Get Catalog Masters
 * @route   GET /api/v1/catalog-masters
 * @access  Private (Admin)
 */
export const getCatalogMasters = asyncHandler(async (req, res) => {
  const {
    type,
    isActive,
    search,
  } = req.query;

  const filter = {};

  if (type) {
    filter.type = type;
  }

  if (isActive !== undefined) {
    filter.isActive = isActive === "true";
  }

  if (search) {
    filter.name = {
      $regex: search,
      $options: "i",
    };
  }

  const masters = await CatalogMaster.find(filter)
    .sort({
      displayOrder: 1,
      name: 1,
    })
    .populate("createdBy", "name")
    .populate("updatedBy", "name");

  res.status(200).json(
    new ApiResponse(
      200,
      {
        masters,
      },
      "Catalog masters fetched successfully"
    )
  );
});

/**
 * @desc    Get Single Catalog Master
 * @route   GET /api/v1/catalog-masters/:id
 * @access  Private (Admin)
 */
export const getCatalogMasterById = asyncHandler(async (req, res) => {
  const master = await CatalogMaster.findById(req.params.id)
    .populate("createdBy", "name email")
    .populate("updatedBy", "name email");

  if (!master) {
    throw new ApiError(404, "Catalog master not found");
  }

  res.status(200).json(
    new ApiResponse(
      200,
      {
        master,
      },
      "Catalog master fetched successfully"
    )
  );
});

/**
 * @desc    Update Catalog Master
 * @route   PATCH /api/v1/catalog-masters/:id
 * @access  Private (Admin)
 */
export const updateCatalogMaster = asyncHandler(async (req, res) => {
  const master = await CatalogMaster.findById(req.params.id);

  if (!master) {
    throw new ApiError(404, "Catalog master not found");
  }

  if (
    req.body.slug &&
    req.body.slug !== master.slug
  ) {
    const duplicate = await CatalogMaster.findOne({
      slug: req.body.slug,
      type: req.body.type || master.type,
      _id: { $ne: master._id },
    });

    if (duplicate) {
      throw new ApiError(
        400,
        "Another catalog master with this slug already exists"
      );
    }
  }

  Object.assign(master, req.body);

  master.updatedBy = req.user._id;

  await master.save();

  res.status(200).json(
    new ApiResponse(
      200,
      {
        master,
      },
      "Catalog master updated successfully"
    )
  );
});

/**
 * @desc    Update Catalog Master Status
 * @route   PATCH /api/v1/catalog-masters/:id/status
 * @access  Private (Admin)
 */
export const updateCatalogMasterStatus = asyncHandler(async (req, res) => {
  const { isActive } = req.body;

  const master = await CatalogMaster.findById(req.params.id);

  if (!master) {
    throw new ApiError(404, "Catalog master not found");
  }

  master.isActive = isActive;
  master.updatedBy = req.user._id;

  await master.save();

  res.status(200).json(
    new ApiResponse(
      200,
      {
        master,
      },
      "Catalog master status updated successfully"
    )
  );
});

/**
 * @desc    Delete Catalog Master
 * @route   DELETE /api/v1/catalog-masters/:id
 * @access  Private (Admin)
 */
export const deleteCatalogMaster = asyncHandler(async (req, res) => {
  const master = await CatalogMaster.findById(req.params.id);

  if (!master) {
    throw new ApiError(404, "Catalog master not found");
  }

  await master.deleteOne();

  res
    .status(200)
    .json(new ApiResponse(200, null, "Catalog master deleted successfully"));
});

/**
 * @desc    Get Catalog Masters for Homepage
 * @route   GET /api/v1/catalog-masters/homepage
 * @access  Public
 */
export const getHomepageCatalogMasters = asyncHandler(async (req, res) => {
  const { type } = req.query;

  if (!type || !['recipient', 'occasion'].includes(type)) {
    throw new ApiError(400, 'Valid type (recipient or occasion) is required');
  }

  const masters = await CatalogMaster.find({
    type,
    isActive: true,
  })
    .sort({ displayOrder: 1 })
    .limit(6);

  res.status(200).json(
    new ApiResponse(
      200,
      { masters },
      `Homepage ${type}s fetched successfully`
    )
  );
});