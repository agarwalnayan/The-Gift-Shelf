import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import SiteSettings from '../models/SiteSettings.js';
import Promotion from '../models/Promotion.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import { createRazorpayOrder, verifyRazorpaySignature } from '../services/razorpayService.js';
import { validateCouponForSubtotal } from './couponController.js';
import PromotionService from '../services/promotionService.js';
import { notifyOrderUpdate } from '../services/orderNotificationService.js';
import { decrementStock } from '../utils/inventoryUtils.js';
import { validateCustomization } from '../utils/customizationValidation.js';
import User from '../models/User.js';
import { generateInvoice } from '../services/invoiceService.js';


export const createOrder = asyncHandler(async (req, res) => {
  const { shippingAddress, paymentMethod, giftMessage = '', orderNotes = '', promotionId } = req.body;

  if (!['razorpay', 'whatsapp', 'gpay'].includes(paymentMethod)) {
    throw new ApiError(400, 'Please select a valid payment method');
  }

  // Validate shipping address
  if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.phone || 
      !shippingAddress.line1 || !shippingAddress.city || !shippingAddress.state || 
      !shippingAddress.postalCode || !shippingAddress.country) {
    throw new ApiError(400, 'Please provide complete shipping address');
  }

  // Validate phone number (10 digits for India)
  const phoneRegex = /^[6-9]\d{9}$/;
  if (!phoneRegex.test(shippingAddress.phone.replace(/\D/g, ''))) {
    throw new ApiError(400, 'Please provide a valid 10-digit phone number');
  }

  // Validate postal code (6 digits for India)
  const postalCodeRegex = /^\d{6}$/;
  if (!postalCodeRegex.test(shippingAddress.postalCode)) {
    throw new ApiError(400, 'Please provide a valid 6-digit postal code');
  }

  const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
  if (!cart || cart.items.length === 0) throw new ApiError(400, 'Your cart is empty');

  const settings = await SiteSettings.getSingleton();
  const { freeShippingThreshold, shippingCharge, whatsappCharge, paymentOptions } = settings.commerce;

  if (paymentMethod === 'whatsapp' && !paymentOptions.whatsapp) {
    throw new ApiError(400, 'WhatsApp ordering is currently unavailable');
  }
  if (paymentMethod === 'razorpay' && !paymentOptions.razorpay) {
    throw new ApiError(400, 'Online payment is currently unavailable');
  }

  const orderItems = cart.items.map((item) => {
    let variantName = null;
    if (item.variantSku && item.product.variants) {
      const variant = item.product.variants.find(v => v.sku === item.variantSku);
      if (variant && variant.attributes && variant.attributes.length > 0) {
        variantName = variant.attributes.map(attr => attr.value).join(' / ');
      }
    }
    
    return {
      product: item.product._id,
      name: item.product.name,
      image: item.product.images?.[0]?.url || '',
      variantSku: item.variantSku || null,
      variantName,
      quantity: item.quantity,
      price: item.priceAtAddition,
      customizations: item.customizations,
      customizationPrice: item.customizationPrice,
    };
  });

  const itemsPrice = orderItems.reduce(
    (sum, item) => sum + (item.price + item.customizationPrice) * item.quantity,
    0
  );

  const { coupon, discount: couponDiscount } = await validateCouponForSubtotal(cart.couponCode, itemsPrice);

  // Evaluate promotion if provided
  let promotionDiscount = 0;
  let appliedPromotion = null;
  let hasFreeShipping = false;

  if (promotionId) {
    const promotion = await Promotion.findOne({ _id: promotionId, status: 'active', isDeleted: { $ne: true } });
    if (!promotion) {
      throw new ApiError(400, 'Invalid or inactive promotion');
    }

    const cartItems = cart.items.map((item) => ({
      productId: item.product._id,
      quantity: item.quantity,
      price: item.priceAtAddition,
      categoryId: item.product.category,
      variantSku: item.variantSku,
    }));

    const evaluatedPromotions = await PromotionService.evaluatePromotions(
      cartItems,
      itemsPrice,
      req.user._id,
      false // TODO: determine if new customer from order history
    );

    const matchingPromotion = evaluatedPromotions.find(p => p.promotionId.toString() === promotionId);
    if (matchingPromotion) {
      promotionDiscount = matchingPromotion.discountAmount;
      appliedPromotion = matchingPromotion;
      hasFreeShipping = matchingPromotion.freeShipping;
    }
  }

  const totalDiscount = couponDiscount + promotionDiscount;
  const discountedSubtotal = itemsPrice - totalDiscount;

  // Calculate shipping - check both free shipping threshold and promotion
  const shippingPrice = hasFreeShipping ? 0 : (discountedSubtotal >= freeShippingThreshold ? 0 : shippingCharge);
  const whatsappSurcharge = paymentMethod === 'whatsapp' ? whatsappCharge : 0;
  
  // GST removed store-wide — no tax component in the total.
  const totalPrice = Number((discountedSubtotal + shippingPrice + whatsappSurcharge).toFixed(2));

  // Validate total is not negative
  if (totalPrice < 0) {
    throw new ApiError(400, 'Invalid order total');
  }

  const stockRequirements = {};
  for (const item of orderItems) {
    const key = `${item.product}_${item.variantSku || 'base'}`;
    if (!stockRequirements[key]) {
      stockRequirements[key] = {
        productId: item.product,
        variantSku: item.variantSku,
        name: item.name,
        quantity: 0
      };
    }
    stockRequirements[key].quantity += item.quantity;
  }

  for (const reqItem of Object.values(stockRequirements)) {
    const product = await Product.findById(reqItem.productId);
    if (!product || !product.isActive || product.isDeleted) {
      throw new ApiError(400, `Product ${reqItem.name} is no longer available`);
    }
    let availableStock = product.stock;
    if (reqItem.variantSku) {
      const variant = product.variants.find(v => v.sku === reqItem.variantSku && v.isActive);
      if (!variant) throw new ApiError(400, `Variant for ${reqItem.name} is no longer available`);
      availableStock = variant.stock;
    }
    if (availableStock < reqItem.quantity) {
      throw new ApiError(400, `Insufficient Stock: ${reqItem.name} is out of stock or does not have enough quantity.`);
    }
  }

  const order = await Order.create({
    user: req.user._id,
    orderItems,
    shippingAddress,
    paymentMethod,
    giftMessage,
    orderNotes,
    couponCode: coupon?.code || null,
    promotionId: appliedPromotion ? promotionId : null,
    promotionName: appliedPromotion ? appliedPromotion.promotionName : null,
    promotionDiscount,
    itemsPrice,
    cataloguePrice: itemsPrice, // For regular orders, catalogue equals items price
    shippingPrice,
    discountPrice: totalDiscount,
    whatsappCharge: whatsappSurcharge,
    taxPrice: 0,
    totalPrice,
  });

  if (paymentMethod === 'razorpay') {
    const razorpayOrder = await createRazorpayOrder(totalPrice, order._id.toString());
    order.paymentResult = { razorpayOrderId: razorpayOrder.id, status: 'created' };
    await order.save();

    return res
      .status(201)
      .json(new ApiResponse(201, { order, razorpayOrder }, 'Order created, proceed to payment'));
  }

  // For WhatsApp orders, validate promotion is still applicable before finalizing
  if (order.promotionId) {
    const promotion = await Promotion.findById(order.promotionId);
    if (!promotion || promotion.status !== 'active' || promotion.isDeleted) {
      throw new ApiError(400, 'Promotion is no longer available');
    }
    if (promotion.maxUses && promotion.usedCount >= promotion.maxUses) {
      throw new ApiError(400, 'Promotion has reached its usage limit');
    }
  }

  // WhatsApp orders are confirmed manually over chat — the order is already
  // created in the database (admin sees it immediately, exactly like a
  // Razorpay order) before we ever redirect the customer. Stock is reserved
  // and the cart is cleared now because, like COD, placing the order IS the
  // successful action here — there's no separate online payment step left
  // to fail or be cancelled.
  for (const item of orderItems) {
    await decrementStock(item);
  }

  // Increment promotion usage count if promotion was applied
  if (order.promotionId) {
    const promotion = await Promotion.findById(order.promotionId);
    if (promotion) {
      await promotion.incrementUsage();
    }
  }

  cart.items = [];
  cart.couponCode = null;
  await cart.save();

  const orderNumber = order._id.toString().slice(-8).toUpperCase();

  const itemLines = orderItems
    .map((item) => {
      const personalization = item.customizations?.length
        ? ` (${item.customizations
          .map((c) => `${c.label}: ${Array.isArray(c.value) ? c.value.join(', ') : c.value}`)
          .join('; ')})`
        : '';
      return `- ${item.name} x${item.quantity}${personalization}`;
    })
    .join('\n');

  const addressLine = [
    shippingAddress.line1,
    shippingAddress.line2,
    `${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.postalCode}`,
    shippingAddress.country,
  ]
    .filter(Boolean)
    .join(', ');

  const whatsappText = [
    'Hi! I would like to confirm my order.',
    '',
    `Order ID: #${orderNumber}`,
    `Name: ${shippingAddress.fullName}`,
    `Phone: ${shippingAddress.phone}`,
    `Address: ${addressLine}`,
    '',
    'Items:',
    itemLines,
    '',
    `Total: ₹${totalPrice}`,
  ].join('\n');

  const whatsappMessage = encodeURIComponent(whatsappText);
  const whatsappLink = settings.commerce.whatsappNumber
    ? `https://wa.me/${settings.commerce.whatsappNumber.replace(/\D/g, '')}?text=${whatsappMessage}`
    : null;

  const emailSent = await notifyOrderUpdate(order._id, 'order_created');

  res.status(201).json(new ApiResponse(
    201,
    { order, whatsappLink, emailSent },
    emailSent
      ? 'Order placed successfully'
      : 'Order placed, but the confirmation email could not be sent'
  ));
});

export const verifyPayment = asyncHandler(async (req, res) => {
  const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

  const isValid = verifyRazorpaySignature({ razorpayOrderId, razorpayPaymentId, razorpaySignature });
  if (!isValid) throw new ApiError(400, 'Payment verification failed');

  const order = await Order.findById(orderId);
  if (!order) throw new ApiError(404, 'Order not found');

  // Prevent duplicate payment verification
  if (order.isPaid) {
    return res.status(200).json(new ApiResponse(200, { order }, 'Payment already verified'));
  }

  // Validate promotion is still applicable before confirming payment
  if (order.promotionId) {
    const promotion = await Promotion.findById(order.promotionId);
    if (!promotion || promotion.status !== 'active' || promotion.isDeleted) {
      throw new ApiError(400, 'Promotion is no longer available');
    }
    if (promotion.maxUses && promotion.usedCount >= promotion.maxUses) {
      throw new ApiError(400, 'Promotion has reached its usage limit');
    }
  }

  order.isPaid = true;
  order.paidAt = new Date();
  order.orderStatus = 'confirmed';
  order.paymentStatus = 'paid';
  order.paymentResult = {
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
    status: 'paid',
  };
  await order.save();

  for (const item of order.orderItems) {
    await decrementStock(item);
  }

  // Increment promotion usage count if promotion was applied
  if (order.promotionId) {
    const promotion = await Promotion.findById(order.promotionId);
    if (promotion) {
      await promotion.incrementUsage();
    }
  }

  // Clear cart only if order has a user (guest orders don't have carts)
  if (order.user) {
    const cart = await Cart.findOne({ user: order.user });
    if (cart) {
      cart.items = [];
      cart.couponCode = null;
      await cart.save();
    }
  }

  res.status(200).json(new ApiResponse(200, { order }, 'Payment verified successfully'));
});

export const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.status(200).json(new ApiResponse(200, { orders, count: orders.length }, 'Orders fetched successfully'));
});

export const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('user', 'name email')
    .populate('orderItems.product', 'name images price discountPrice stock variants');
  if (!order) throw new ApiError(404, 'Order not found');

  // Guest orders (user: null) can only be accessed by admins
  const isOwner = order.user && order.user._id.toString() === req.user._id.toString();
  const isAdmin = ['admin', 'superadmin'].includes(req.user.role);
  if (!isOwner && !isAdmin) throw new ApiError(403, 'Not authorized to view this order');

  res.status(200).json(new ApiResponse(200, { order }, 'Order fetched successfully'));
});

export const getAllOrders = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const filter = status ? { orderStatus: status } : {};
  const skip = (Number(page) - 1) * Number(limit);

  const [orders, total] = await Promise.all([
    Order.find(filter).populate('user', 'name email').sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    Order.countDocuments(filter),
  ]);

  res.status(200).json(
    new ApiResponse(200, { orders, total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) }, 'Orders fetched successfully')
  );
});

export const updateOrderStatus = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) throw new ApiError(404, 'Order not found');

  const { orderStatus } = req.body;
  
  // Validate order status
  const validStatuses = ['pending', 'confirmed', 'preparing', 'packed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'returned'];
  if (!validStatuses.includes(orderStatus)) {
    throw new ApiError(400, 'Invalid order status');
  }

  // Store previous status for notification and history
  const previousStatus = order.orderStatus;

  // Only proceed if status actually changed
  if (previousStatus === orderStatus) {
    return res.status(200).json(new ApiResponse(200, { order }, 'Order status unchanged'));
  }

  // Handle cancellation - restore stock
  if (orderStatus === 'cancelled' && previousStatus !== 'cancelled') {
    for (const item of order.orderItems) {
      if (item.variantSku) {
        await Product.updateOne(
          { _id: item.product, 'variants.sku': item.variantSku },
          { $inc: { 'variants.$.stock': item.quantity } }
        );
      } else {
        await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } });
      }
    }
  }

  // Update status and add to history
  order.orderStatus = orderStatus;
  order.statusHistory.push({
    status: orderStatus,
    changedBy: req.user._id,
    changedAt: new Date(),
  });

  if (orderStatus === 'delivered') order.deliveredAt = new Date();
  if (orderStatus === 'cancelled') {
    order.cancelledAt = new Date();
    order.cancelReason = req.body.cancelReason || '';
  }

  await order.save();

  const emailSent = orderStatus === 'pending'
    ? null
    : await notifyOrderUpdate(order._id, 'order_status_changed', { orderStatus: previousStatus });

  res.status(200).json(new ApiResponse(
    200,
    { order, emailSent },
    emailSent !== false
      ? 'Order status updated successfully'
      : 'Order status updated, but the notification email could not be sent'
  ));
});

export const updatePaymentStatus = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) throw new ApiError(404, 'Order not found');

  const { paymentStatus } = req.body;
  if (!['pending', 'paid', 'failed', 'refunded'].includes(paymentStatus)) {
    throw new ApiError(400, 'Please provide a valid payment status');
  }

  // Store previous payment status for notification
  const previousPaymentStatus = order.paymentStatus;

  order.paymentStatus = paymentStatus;
  // Keep the existing boolean in sync so older views relying on it stay accurate.
  order.isPaid = paymentStatus === 'paid';
  if (paymentStatus === 'paid' && !order.paidAt) order.paidAt = new Date();

  await order.save();

  const emailSent = await notifyOrderUpdate(
    order._id,
    'payment_status_changed',
    { paymentStatus: previousPaymentStatus }
  );

  res.status(200).json(new ApiResponse(
    200,
    { order, emailSent },
    emailSent ? 'Payment status updated successfully' : 'Payment status updated, but the notification email could not be sent'
  ));
});

export const updateOrderTracking = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) throw new ApiError(404, 'Order not found');

  const { courierName, trackingId, trackingUrl, internalNotes } = req.body;

  // Store previous courier data for notification
  const previousCourierData = {
    name: order.courier?.name || '',
    trackingId: order.courier?.trackingId || '',
    trackingUrl: order.courier?.trackingUrl || '',
  };

  order.courier = {
    name: courierName !== undefined ? courierName : order.courier?.name || '',
    trackingId: trackingId !== undefined ? trackingId : order.courier?.trackingId || '',
    trackingUrl: trackingUrl !== undefined ? trackingUrl : order.courier?.trackingUrl || '',
  };
  if (internalNotes !== undefined) order.internalNotes = internalNotes;

  await order.save();

  const emailSent = await notifyOrderUpdate(
    order._id,
    'tracking_updated',
    { courier: previousCourierData }
  );

  res.status(200).json(new ApiResponse(
    200,
    { order, emailSent },
    emailSent ? 'Order tracking updated successfully' : 'Order tracking updated, but the notification email could not be sent'
  ));
});

export const deleteOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) throw new ApiError(404, 'Order not found');

  await order.deleteOne();

  res.status(200).json(new ApiResponse(200, null, 'Order deleted successfully'));
});

// Admin: Create Manual Order
export const createManualOrder = asyncHandler(async (req, res) => {
  const { 
    userId, newCustomer, shippingAddress, 
    paymentMethod, paymentStatus, orderItems, 
    agreedPrice, shippingPrice, couponCode, 
    giftMessage = '', orderNotes = '', internalNotes = '', 
    sendEmail = false 
  } = req.body;

  if (!['razorpay', 'whatsapp', 'cod', 'gpay'].includes(paymentMethod)) {
    throw new ApiError(400, 'Please select a valid payment method');
  }

  if (!['pending', 'paid', 'failed', 'refunded'].includes(paymentStatus)) {
    throw new ApiError(400, 'Please select a valid payment status');
  }

  // Validate shipping address
  if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.phone || 
      !shippingAddress.line1 || !shippingAddress.city || !shippingAddress.state || 
      !shippingAddress.postalCode || !shippingAddress.country) {
    throw new ApiError(400, 'Please provide complete shipping address');
  }

  if (!orderItems || orderItems.length === 0) {
    throw new ApiError(400, 'Order must contain at least one item');
  }

  // Verify stock and validate customizations
  const finalOrderItems = [];
  const stockRequirements = {};

  for (const item of orderItems) {
    const product = await Product.findById(item.product);
    if (!product || !product.isActive || product.isDeleted) {
      throw new ApiError(400, `Product ${item.name || item.product} is no longer available`);
    }

    let availableStock = product.stock;
    if (item.variantSku) {
      const variant = product.variants.find(v => v.sku === item.variantSku && v.isActive);
      if (!variant) throw new ApiError(400, `Variant for ${product.name} is no longer available`);
      availableStock = variant.stock;
    }

    const key = `${item.product}_${item.variantSku || 'base'}`;
    if (!stockRequirements[key]) {
      stockRequirements[key] = { name: product.name, quantity: 0, availableStock };
    }
    stockRequirements[key].quantity += item.quantity;
    
    if (stockRequirements[key].quantity > stockRequirements[key].availableStock) {
      throw new ApiError(400, `Insufficient Stock: ${product.name} does not have enough quantity.`);
    }

    const validatedCustomizations = [];
    if (item.customizations && Array.isArray(item.customizations)) {
      for (const custom of item.customizations) {
        validatedCustomizations.push(validateCustomization(product, custom));
      }
    }

    // Determine catalogue price from DB (used for itemsPrice record-keeping).
    // For variant products: use the matched variant's price.
    // For base products: use product.price.
    // Falls back to 0 only if the product data has no price (shouldn't happen, but prevents a Mongoose required error).
    let basePrice;
    if (item.variantSku) {
      const matchedVariant = product.variants.find(v => v.sku === item.variantSku);
      basePrice = matchedVariant?.price ?? product.price ?? 0;
    } else {
      basePrice = product.price ?? 0;
    }

    const customizationPrice = validatedCustomizations.reduce((acc, curr) => acc + (curr.additionalPrice || 0), 0);

    // image is required by the Order schema — use the first product image if available, otherwise empty string.
    const itemImage = product.images?.[0]?.url || '';
    
    // Generate variant name from attributes if variant is selected
    let variantName = null;
    if (item.variantSku && product.variants) {
      const variant = product.variants.find(v => v.sku === item.variantSku);
      if (variant && variant.attributes && variant.attributes.length > 0) {
        variantName = variant.attributes.map(attr => attr.value).join(' / ');
      }
    }

    finalOrderItems.push({
      product: product._id,
      name: product.name,
      image: itemImage,
      variantSku: item.variantSku || null,
      variantName,
      quantity: item.quantity,
      price: basePrice,
      customizations: validatedCustomizations,
      customizationPrice,
    });
  }

  let finalUser = null;
  let userCreated = false;

  if (newCustomer) {
    const existingUser = await User.findOne({ email: newCustomer.email });
    if (existingUser) {
      throw new ApiError(409, 'A customer with this email already exists.');
    }
    finalUser = await User.create({
      name: newCustomer.name,
      email: newCustomer.email,
      phone: newCustomer.phone,
      password: newCustomer.password,
    });
    userCreated = true;
  } else if (userId) {
    const existingUser = await User.findById(userId);
    if (!existingUser) throw new ApiError(404, 'Selected customer not found');
    finalUser = existingUser;
  }

  const itemsPrice = finalOrderItems.reduce(
    (sum, item) => sum + (item.price + item.customizationPrice) * item.quantity,
    0
  );

  // Validate coupon if provided - uses existing TGS coupon validation logic
  let couponDiscount = 0;
  let appliedCoupon = null;
  
  if (couponCode) {
    try {
      const result = await validateCouponForSubtotal(couponCode, itemsPrice);
      couponDiscount = result.discount;
      appliedCoupon = result.coupon;
    } catch (error) {
      // Coupon validation failed - throw error to prevent order creation
      throw new ApiError(400, error.message || 'Invalid coupon code');
    }
  }

  // Calculate final amount: manual selling price - coupon discount + shipping
  // Following existing TGS business rule where coupon applies to catalogue but discount applies to manual price
  const finalAmount = agreedPrice - couponDiscount + (shippingPrice || 0);
  
  // Ensure final amount is never negative
  if (finalAmount < 0) {
    throw new ApiError(400, 'Coupon discount cannot exceed order total');
  }

  try {
    const order = await Order.create({
      user: finalUser ? finalUser._id : null,
      orderItems: finalOrderItems,
      shippingAddress,
      paymentMethod,
      orderSource: 'manual',
      giftMessage,
      orderNotes,
      internalNotes,
      itemsPrice,
      cataloguePrice: itemsPrice, // Store original catalogue value for manual orders
      shippingPrice: shippingPrice || 0,
      discountPrice: couponDiscount, // Store coupon discount as discountPrice
      couponCode: appliedCoupon ? appliedCoupon.code : null,
      whatsappCharge: 0,
      taxPrice: 0,
      totalPrice: finalAmount, // Use calculated final amount
      isPaid: paymentStatus === 'paid',
      paidAt: paymentStatus === 'paid' ? new Date() : undefined,
      paymentStatus,
      orderStatus: 'confirmed',
    });

    for (const item of finalOrderItems) {
      await decrementStock(item);
    }

    const emailSent = sendEmail && shippingAddress.email
      ? await notifyOrderUpdate(order._id, 'order_created')
      : false;

    res.status(201).json(new ApiResponse(
      201,
      { order, accountCreated: userCreated, emailSent },
      emailSent || !sendEmail
        ? 'Manual order created successfully'
        : 'Manual order created, but the confirmation email could not be sent'
    ));
  } catch (error) {
    if (userCreated && finalUser) {
      await User.findByIdAndDelete(finalUser._id);
    }
    throw error;
  }
});

/**
 * Download invoice for an order
 * Customers can only download their own orders
 * Admins can download any order
 */
export const downloadOrderInvoice = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    throw new ApiError(404, 'Order not found');
  }

  // Security check: customers can only access their own orders
  const isAdmin = req.user.role === 'admin' || req.user.role === 'superadmin';
  const isOwnOrder = order.user && order.user.toString() === req.user._id.toString();

  if (!isAdmin && !isOwnOrder) {
    throw new ApiError(403, 'You do not have permission to access this invoice');
  }

  try {
    const invoiceBuffer = await generateInvoice(order);
    const orderNumber = order._id.toString().slice(-8).toUpperCase();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="TGS-Invoice-${orderNumber}.pdf"`);
    res.send(invoiceBuffer);
  } catch (error) {
    console.error('[orderController] Failed to generate invoice:', error.message);
    throw new ApiError(500, 'Failed to generate invoice');
  }
});