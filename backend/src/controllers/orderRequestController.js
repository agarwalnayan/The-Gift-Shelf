import crypto from 'crypto';
import OrderRequest from '../models/OrderRequest.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import SiteSettings from '../models/SiteSettings.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import { env } from '../config/env.js';

const TOKEN_EXPIRY_DAYS = 7;
const TOKEN_EXPIRY_MS = TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000;

const generateSecureToken = () => {
  const rawToken = crypto.randomBytes(32).toString('hex');
  return {
    rawToken,
    hashedToken: crypto.createHash('sha256').update(rawToken).digest('hex'),
  };
};

const decrementStock = async (item) => {
  if (item.variantSku) {
    await Product.updateOne(
      { _id: item.product, 'variants.sku': item.variantSku },
      { $inc: { 'variants.$.stock': -item.quantity } }
    );
  } else {
    await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.quantity } });
  }
};

// Admin: Create OrderRequest
export const createOrderRequest = asyncHandler(async (req, res) => {
  const { source, items, agreedPrice, discount, internalNotes } = req.body;

  // Validate products and variants exist and have sufficient stock
  for (const item of items) {
    const product = await Product.findById(item.product);
    if (!product || !product.isActive || product.isDeleted) {
      throw new ApiError(400, `Product ${item.name} is no longer available`);
    }

    if (item.variantSku) {
      const variant = product.variants.find(v => v.sku === item.variantSku && v.isActive);
      if (!variant) {
        throw new ApiError(400, `Variant for ${item.name} is no longer available`);
      }
      if (variant.stock < item.quantity) {
        throw new ApiError(400, `Insufficient stock for ${item.name} variant`);
      }
    } else {
      if (product.stock < item.quantity) {
        throw new ApiError(400, `Insufficient stock for ${item.name}`);
      }
    }
  }

  const { rawToken, hashedToken } = generateSecureToken();
  const expiresAt = new Date(Date.now() + TOKEN_EXPIRY_MS);

  const orderRequest = await OrderRequest.create({
    token: hashedToken,
    status: 'pending',
    source,
    items,
    agreedPrice,
    discount: discount || 0,
    paymentMethod: 'gpay',
    paymentStatus: 'paid',
    internalNotes: internalNotes || '',
    expiresAt,
    createdBy: req.user._id,
  });

  const completionUrl = `${env.clientUrl.replace(/\/$/, '')}/social-order/${rawToken}`;

  res.status(201).json(new ApiResponse(201, {
    orderRequest,
    completionUrl,
  }, 'Order request created successfully'));
});

// Admin: List OrderRequests
export const getOrderRequests = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const filter = status ? { status } : {};
  const skip = (Number(page) - 1) * Number(limit);

  const [orderRequests, total] = await Promise.all([
    OrderRequest.find(filter)
      .populate('createdBy', 'name email')
      .populate('completedOrder', '_id orderStatus totalPrice')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    OrderRequest.countDocuments(filter),
  ]);

  res.status(200).json(
    new ApiResponse(200, { orderRequests, total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) }, 'Order requests fetched successfully')
  );
});

// Admin: Get OrderRequest by ID
export const getOrderRequestById = asyncHandler(async (req, res) => {
  const orderRequest = await OrderRequest.findById(req.params.id)
    .populate('createdBy', 'name email')
    .populate('completedOrder', '_id orderStatus totalPrice');

  if (!orderRequest) {
    throw new ApiError(404, 'Order request not found');
  }

  res.status(200).json(new ApiResponse(200, { orderRequest }, 'Order request fetched successfully'));
});

// Admin: Cancel OrderRequest
export const cancelOrderRequest = asyncHandler(async (req, res) => {
  const orderRequest = await OrderRequest.findById(req.params.id);

  if (!orderRequest) {
    throw new ApiError(404, 'Order request not found');
  }

  if (orderRequest.status !== 'pending') {
    throw new ApiError(400, 'Only pending order requests can be cancelled');
  }

  orderRequest.status = 'cancelled';
  await orderRequest.save();

  res.status(200).json(new ApiResponse(200, { orderRequest }, 'Order request cancelled successfully'));
});

// Public: Get OrderRequest by token (no auth required)
export const getPublicOrderRequest = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const orderRequest = await OrderRequest.findOne({ token: hashedToken })
    .populate('items.product', 'name images price discountPrice stock variants');

  if (!orderRequest) {
    throw new ApiError(404, 'Invalid or expired order request link');
  }

  if (orderRequest.status !== 'pending') {
    throw new ApiError(400, `This order request has been ${orderRequest.status}`);
  }

  if (new Date() > orderRequest.expiresAt) {
    orderRequest.status = 'expired';
    await orderRequest.save();
    throw new ApiError(400, 'This order request has expired');
  }

  res.status(200).json(new ApiResponse(200, { orderRequest }, 'Order request fetched successfully'));
});

// Public: Complete OrderRequest (no auth required)
export const completeOrderRequest = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const { fullName, phone, email, line1, line2, city, state, postalCode, country, giftMessage, orderNotes } = req.body;

  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const orderRequest = await OrderRequest.findOne({ token: hashedToken });

  if (!orderRequest) {
    throw new ApiError(404, 'Invalid or expired order request link');
  }

  if (orderRequest.status !== 'pending') {
    throw new ApiError(400, `This order request has been ${orderRequest.status}`);
  }

  if (new Date() > orderRequest.expiresAt) {
    orderRequest.status = 'expired';
    await orderRequest.save();
    throw new ApiError(400, 'This order request has expired');
  }

  // Atomic status transition to prevent duplicate submissions
  const updated = await OrderRequest.findOneAndUpdate(
    { _id: orderRequest._id, status: 'pending' },
    { status: 'completed' },
    { new: true }
  );

  if (!updated) {
    throw new ApiError(400, 'This order request has already been completed');
  }

  try {
    // Validate products and stock again
    for (const item of orderRequest.items) {
      const product = await Product.findById(item.product);
      if (!product || !product.isActive || product.isDeleted) {
        throw new ApiError(400, `Product ${item.name} is no longer available`);
      }

      if (item.variantSku) {
        const variant = product.variants.find(v => v.sku === item.variantSku && v.isActive);
        if (!variant) {
          throw new ApiError(400, `Variant for ${item.name} is no longer available`);
        }
        if (variant.stock < item.quantity) {
          throw new ApiError(400, `Insufficient stock for ${item.name} variant`);
        }
      } else {
        if (product.stock < item.quantity) {
          throw new ApiError(400, `Insufficient stock for ${item.name}`);
        }
      }
    }

    // Create or find user
    let user;
    if (email) {
      user = await User.findOne({ email });
      if (!user) {
        // Generate a random password for social order customers
        const tempPassword = crypto.randomBytes(16).toString('hex');
        user = await User.create({
          name: fullName,
          email,
          password: tempPassword,
          phone,
        });
      }
    } else {
      // For customers without email, find or create user by phone only
      user = await User.findOne({ phone });
      if (!user) {
        const tempPassword = crypto.randomBytes(16).toString('hex');
        user = await User.create({
          name: fullName,
          password: tempPassword,
          phone,
        });
      }
    }

    // Use the Admin's agreed price directly - no server recalculation
    // The Admin has already agreed on the price with the customer
    const agreedPrice = orderRequest.agreedPrice;
    const discount = orderRequest.discount || 0;

    // Calculate items price for record-keeping only
    const itemsPrice = orderRequest.items.reduce(
      (sum, item) => sum + (item.price + item.customizationPrice) * item.quantity,
      0
    );

    const settings = await SiteSettings.getSingleton();
    const { freeShippingThreshold, shippingCharge } = settings.commerce;

    const discountedSubtotal = itemsPrice - discount;
    const shippingPrice = discountedSubtotal >= freeShippingThreshold ? 0 : shippingCharge;

    const shippingAddress = {
      fullName,
      phone,
      line1,
      line2: line2 || '',
      city,
      state,
      postalCode,
      country: country || 'India',
    };

    // Create the Order using Admin's agreed price
    const order = await Order.create({
      user: user._id,
      orderItems: orderRequest.items,
      shippingAddress,
      paymentMethod: 'gpay',
      orderSource: orderRequest.source,
      giftMessage: giftMessage || '',
      orderNotes: orderNotes || '',
      itemsPrice,
      shippingPrice,
      discountPrice: discount,
      whatsappCharge: 0,
      taxPrice: 0,
      totalPrice: agreedPrice,
      isPaid: true,
      paidAt: new Date(),
      paymentStatus: 'paid',
      orderStatus: 'confirmed',
    });

    // Deduct stock
    for (const item of orderRequest.items) {
      await decrementStock(item);
    }

    // Link order to orderRequest
    orderRequest.completedOrder = order._id;
    await orderRequest.save();

    res.status(201).json(new ApiResponse(201, { order }, 'Order completed successfully'));
  } catch (error) {
    // Revert status on error
    orderRequest.status = 'pending';
    await orderRequest.save();
    throw error;
  }
});
