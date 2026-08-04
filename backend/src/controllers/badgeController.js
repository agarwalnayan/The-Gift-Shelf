import mongoose from 'mongoose';
import Badge from '../models/Badge.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import {
  createBadgeSchema,
  updateBadgeSchema,
  badgeStatusSchema,
} from '../validations/badgeValidation.js';

const isValidObjectId = (value) =>
  mongoose.Types.ObjectId.isValid(value) && String(new mongoose.Types.ObjectId(value)) === value;

const isAdminUser = (req) => Boolean(req.user && ['admin', 'superadmin'].includes(req.user.role));

export const createBadge = asyncHandler(async (req, res) => {
  const { name, slug, badgeText, description, backgroundColor, textColor, icon, priority, active } = req.body;

  const badge = await Badge.create({
    name,
    slug,
    badgeText,
    description,
    backgroundColor,
    textColor,
    icon,
    priority,
    active,
    createdBy: req.user._id,
    updatedBy: req.user._id,
  });

  res.status(201).json(new ApiResponse(201, { badge }, 'Badge created successfully'));
});

export const getBadges = asyncHandler(async (req, res) => {
  const { active, search } = req.query;
  const filter = { isDeleted: { $ne: true } };

  if (active !== undefined) {
    filter.active = active === 'true';
  }

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { badgeText: { $regex: search, $options: 'i' } },
    ];
  }

  const badges = await Badge.find(filter).sort({ priority: -1, createdAt: -1 });

  res.status(200).json(new ApiResponse(200, { badges }, 'Badges fetched successfully'));
});

export const getBadgeById = asyncHandler(async (req, res) => {
  const badge = await Badge.findOne({ _id: req.params.id, isDeleted: { $ne: true } });

  if (!badge) throw new ApiError(404, 'Badge not found');

  res.status(200).json(new ApiResponse(200, { badge }, 'Badge fetched successfully'));
});

export const updateBadge = asyncHandler(async (req, res) => {
  const badge = await Badge.findOne({ _id: req.params.id, isDeleted: { $ne: true } });
  if (!badge) throw new ApiError(404, 'Badge not found');

  const { name, slug, badgeText, description, backgroundColor, textColor, icon, priority, active } = req.body;

  if (name !== undefined) badge.name = name;
  if (slug !== undefined) badge.slug = slug;
  if (badgeText !== undefined) badge.badgeText = badgeText;
  if (description !== undefined) badge.description = description;
  if (backgroundColor !== undefined) badge.backgroundColor = backgroundColor;
  if (textColor !== undefined) badge.textColor = textColor;
  if (icon !== undefined) badge.icon = icon;
  if (priority !== undefined) badge.priority = priority;
  if (active !== undefined) badge.active = active;

  badge.updatedBy = req.user._id;
  await badge.save();

  res.status(200).json(new ApiResponse(200, { badge }, 'Badge updated successfully'));
});

export const updateBadgeStatus = asyncHandler(async (req, res) => {
  const badge = await Badge.findOne({ _id: req.params.id, isDeleted: { $ne: true } });
  if (!badge) throw new ApiError(404, 'Badge not found');

  const { active } = req.body;
  badge.active = active;
  badge.updatedBy = req.user._id;
  await badge.save();

  res.status(200).json(new ApiResponse(200, { badge }, 'Badge status updated successfully'));
});

export const deleteBadge = asyncHandler(async (req, res) => {
  const badge = await Badge.findOne({ _id: req.params.id, isDeleted: { $ne: true } });
  if (!badge) throw new ApiError(404, 'Badge not found');

  badge.isDeleted = true;
  badge.deletedAt = new Date();
  badge.updatedBy = req.user._id;
  await badge.save();

  res.status(200).json(new ApiResponse(200, null, 'Badge deleted successfully'));
});

export const getActiveBadges = asyncHandler(async (req, res) => {
  const badges = await Badge.find({ active: true, isDeleted: { $ne: true } })
    .sort({ priority: -1, createdAt: -1 });

  res.status(200).json(new ApiResponse(200, { badges }, 'Active badges fetched successfully'));
});
