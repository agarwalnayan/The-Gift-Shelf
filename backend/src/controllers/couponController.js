import Coupon from '../models/Coupon.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';

/**
 * Shared helper: looks up an active coupon by code and computes the
 * discount for a given subtotal. Used by both the cart (preview) and the
 * order controller (final calculation) so the two never drift apart.
 */
export const validateCouponForSubtotal = async (code, subtotal) => {
    if (!code) return { coupon: null, discount: 0 };

    const coupon = await Coupon.findOne({ code: code.trim().toUpperCase() });
    if (!coupon || !coupon.isActive) {
        throw new ApiError(404, 'This coupon code is invalid or has expired');
    }
    if (coupon.expiresAt && coupon.expiresAt.getTime() < Date.now()) {
        throw new ApiError(400, 'This coupon has expired');
    }
    if (subtotal < coupon.minOrderValue) {
        throw new ApiError(400, `Add ₹${(coupon.minOrderValue - subtotal).toFixed(2)} more to use this coupon`);
    }

    const discount = coupon.computeDiscount(subtotal);
    return { coupon, discount };
};

export const createCoupon = asyncHandler(async (req, res) => {
    const { code, type, value, minOrderValue, maxDiscount, isActive, expiresAt } = req.body;

    const coupon = await Coupon.create({
        code,
        type,
        value,
        minOrderValue: minOrderValue ?? 0,
        maxDiscount: maxDiscount || null,
        isActive: isActive ?? true,
        expiresAt: expiresAt || null,
        createdBy: req.user._id,
    });

    res.status(201).json(new ApiResponse(201, { coupon }, 'Coupon created successfully'));
});

export const getCoupons = asyncHandler(async (req, res) => {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.status(200).json(new ApiResponse(200, { coupons, count: coupons.length }, 'Coupons fetched successfully'));
});

export const updateCoupon = asyncHandler(async (req, res) => {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) throw new ApiError(404, 'Coupon not found');

    const { code, type, value, minOrderValue, maxDiscount, isActive, expiresAt } = req.body;

    if (code !== undefined) coupon.code = code;
    if (type !== undefined) coupon.type = type;
    if (value !== undefined) coupon.value = value;
    if (minOrderValue !== undefined) coupon.minOrderValue = minOrderValue;
    if (maxDiscount !== undefined) coupon.maxDiscount = maxDiscount || null;
    if (isActive !== undefined) coupon.isActive = isActive;
    if (expiresAt !== undefined) coupon.expiresAt = expiresAt || null;

    await coupon.save();

    res.status(200).json(new ApiResponse(200, { coupon }, 'Coupon updated successfully'));
});

export const deleteCoupon = asyncHandler(async (req, res) => {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) throw new ApiError(404, 'Coupon not found');
    await coupon.deleteOne();

    res.status(200).json(new ApiResponse(200, null, 'Coupon deleted successfully'));
});