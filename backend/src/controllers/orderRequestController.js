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
import { notifyOrderUpdate } from '../services/orderNotificationService.js';
import { decrementStock } from '../utils/inventoryUtils.js';
import { validateCustomization } from '../utils/customizationValidation.js';

const TOKEN_EXPIRY_DAYS = 7;
const TOKEN_EXPIRY_MS = TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000;

const generateSecureToken = () => {
  const rawToken = crypto.randomBytes(32).toString('hex');
  return {
    rawToken,
    hashedToken: crypto.createHash('sha256').update(rawToken).digest('hex'),
  };
};


// Admin: Create OrderRequest
export const createOrderRequest = asyncHandler(async (req, res) => {
  const { source, items, agreedPrice, discount, internalNotes } = req.body;

  // Validate products and variants exist and have sufficient stock
  // Also validate prices server-side to prevent frontend manipulation
  const validatedItems = [];
  for (const item of items) {
    const product = await Product.findById(item.product);
    if (!product || !product.isActive || product.isDeleted) {
      throw new ApiError(400, `Product ${item.name} is no longer available`);
    }

    let availableStock = product.stock;
    let cataloguePrice = product.price;
    
    if (item.variantSku) {
      const variant = product.variants.find(v => v.sku === item.variantSku && v.isActive);
      if (!variant) {
        throw new ApiError(400, `Variant for ${item.name} is no longer available`);
      }
      if (variant.stock < item.quantity) {
        throw new ApiError(400, `Insufficient stock for ${item.name} variant`);
      }
      availableStock = variant.stock;
      cataloguePrice = variant.price ?? product.price;
    } else {
      if (product.stock < item.quantity) {
        throw new ApiError(400, `Insufficient stock for ${item.name}`);
      }
    }

    // Server-side price validation: ensure the price matches catalogue price
    // Admin can still set different agreedPrice at order level, but item prices must be accurate
    if (item.price !== cataloguePrice) {
      console.warn(`[Social Order] Price mismatch for ${product.name}: frontend sent ${item.price}, catalogue price is ${cataloguePrice}`);
    }

    validatedItems.push({
      ...item,
      price: cataloguePrice, // Use server-authoritative price
      image: product.images?.[0]?.url || '', // Ensure image is set
    });
  }

  const { rawToken, hashedToken } = generateSecureToken();
  const expiresAt = new Date(Date.now() + TOKEN_EXPIRY_MS);

  const orderRequest = await OrderRequest.create({
    token: hashedToken,
    status: 'pending',
    source,
    items: validatedItems,
    agreedPrice,
    discount: discount || 0,
    paymentMethod: 'gpay',
    paymentStatus: 'paid',
    internalNotes: internalNotes || '',
    expiresAt,
    createdBy: req.user._id,
  });

  const completionUrl = `${env.customerUrl.replace(/\/$/, '')}/social-order/${rawToken}`;

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
    .populate('items.product', 'name images price discountPrice stock variants customizationOptions');

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

  // Disable caching for this endpoint to prevent 304 responses
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');

  res.status(200).json(new ApiResponse(200, { orderRequest }, 'Order request fetched successfully'));
});

// Public: Complete OrderRequest (no auth required)
export const completeOrderRequest = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const { fullName, phone, email, line1, line2, city, state, postalCode, country, giftMessage, orderNotes, createAccount, password, updatedCustomizations } = req.body;

  // Email is now required for order notifications
  if (!email) {
    throw new ApiError(400, 'Email is required to complete your order');
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new ApiError(400, 'Please provide a valid email address');
  }

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

    // Handle user creation with optional account creation
    let user = null;
    let userCreated = false;
    
    if (createAccount) {
      // Customer wants to create an account with their password
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        throw new ApiError(409, 'This email already has a TGS account. Please log in to your account.');
      }
      // Create user with customer-provided password
      user = await User.create({
        name: fullName,
        email,
        password,
        phone,
      });
      userCreated = true;
    }
    // If createAccount is false, user remains null (guest order)

    // Use the Admin's agreed price directly - no server recalculation
    // The Admin has already agreed on the price with the customer
    const agreedPrice = orderRequest.agreedPrice;
    const discount = orderRequest.discount || 0;

    // Validate and apply customer-edited customizations if provided
    let finalOrderItems = orderRequest.items;
    if (updatedCustomizations && updatedCustomizations.length > 0) {
      // Validate each submitted customization
      for (const submittedCustomization of updatedCustomizations) {
        // Validate itemIndex is within bounds
        const { itemIndex } = submittedCustomization;
        if (typeof itemIndex !== 'number' || itemIndex < 0 || itemIndex >= orderRequest.items.length) {
          throw new ApiError(400, `Invalid item index: ${itemIndex}`);
        }

        const item = orderRequest.items[itemIndex];
        
        if (!item) {
          throw new ApiError(400, `Item not found at index ${itemIndex}`);
        }

        const product = await Product.findById(item.product);
        if (!product) {
          throw new ApiError(400, 'Product not found');
        }

        // Validate using utility
        const validatedCustomization = validateCustomization(product, submittedCustomization);
        // Ensure we store the properly validated one by modifying the array element
        Object.assign(submittedCustomization, validatedCustomization);
      }

      // Apply validated customizations by itemIndex
      finalOrderItems = orderRequest.items.map((item, index) => {
        const itemCustomizations = updatedCustomizations.filter(c => c.itemIndex === index);
        if (itemCustomizations.length > 0) {
          return {
            ...item,
            customizations: itemCustomizations,
          };
        }
        return item;
      });
    }

    // Calculate items price for record-keeping only
    const itemsPrice = finalOrderItems.reduce(
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
      email,
      line1,
      line2: line2 || '',
      city,
      state,
      postalCode,
      country: country || 'India',
    };

    try {
      // Create the Order using Admin's agreed price
      const order = await Order.create({
        user: user?._id, // null for guest orders
        orderItems: finalOrderItems,
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
      for (const item of finalOrderItems) {
        await decrementStock(item);
      }

      // Link order to orderRequest
      orderRequest.completedOrder = order._id;
      await orderRequest.save();

      const emailSent = await notifyOrderUpdate(order._id, 'order_created');

      res.status(201).json(new ApiResponse(201, { 
        order, 
        accountCreated: createAccount,
        emailSent,
      }, emailSent
        ? 'Order completed successfully'
        : 'Order completed, but the confirmation email could not be sent'));
    } catch (error) {
      // Rollback user creation if order/inventory failed
      if (userCreated && user) {
        await User.findByIdAndDelete(user._id);
      }
      throw error;
    }
  } catch (error) {
    // Revert status on error
    orderRequest.status = 'pending';
    await orderRequest.save();
    throw error;
  }
});
