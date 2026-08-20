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
        const item = orderRequest.items.find(i => 
          i.customizations && i.customizations.some(c => c.key === submittedCustomization.key)
        );
        
        if (!item) {
          throw new ApiError(400, `Invalid customization key: ${submittedCustomization.key}`);
        }

        const product = await Product.findById(item.product);
        if (!product) {
          throw new ApiError(400, 'Product not found');
        }

        const option = product.customizationOptions.find(o => o.key === submittedCustomization.key);
        if (!option) {
          throw new ApiError(400, `Customization option not found: ${submittedCustomization.key}`);
        }

        if (!option.isEnabled) {
          throw new ApiError(400, `Customization option is disabled: ${option.label}`);
        }

        // Validate required field
        if (option.isRequired && (!submittedCustomization.value || submittedCustomization.value === '')) {
          throw new ApiError(400, `${option.label} is required`);
        }

        // Validate type
        if (submittedCustomization.type !== option.type) {
          throw new ApiError(400, `Invalid customization type for ${option.label}`);
        }

        // Validate choices
        if (option.choices && option.choices.length > 0) {
          const submittedValue = Array.isArray(submittedCustomization.value) 
            ? submittedCustomization.value 
            : [submittedCustomization.value];
          const invalidChoices = submittedValue.filter(v => v && !option.choices.includes(v));
          if (invalidChoices.length > 0) {
            throw new ApiError(400, `Invalid choice for ${option.label}`);
          }
        }

        // Validate length constraints
        if (option.validation && typeof submittedCustomization.value === 'string') {
          const { minLength, maxLength } = option.validation;
          if (minLength && submittedCustomization.value.length < minLength) {
            throw new ApiError(400, `${option.label} must be at least ${minLength} characters`);
          }
          if (maxLength && submittedCustomization.value.length > maxLength) {
            throw new ApiError(400, `${option.label} must not exceed ${maxLength} characters`);
          }
        }

        // Ensure additionalPrice matches product configuration (customer cannot change price)
        if (submittedCustomization.additionalPrice !== (option.additionalPrice || 0)) {
          throw new ApiError(400, 'Cannot modify customization price');
        }
      }

      // Apply validated customizations
      finalOrderItems = orderRequest.items.map((item, index) => {
        const updatedCustomization = updatedCustomizations.find(c => c.key === item.customizations?.[0]?.key);
        if (updatedCustomization) {
          return {
            ...item,
            customizations: [updatedCustomization],
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

      // Send order confirmation email (async, don't block response)
      notifyOrderUpdate(order._id, 'order_created').catch(() => {});

      res.status(201).json(new ApiResponse(201, { 
        order, 
        accountCreated: createAccount 
      }, 'Order completed successfully'));
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
