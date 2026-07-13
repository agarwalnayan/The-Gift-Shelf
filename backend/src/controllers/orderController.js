import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import SiteSettings from '../models/SiteSettings.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import { createRazorpayOrder, verifyRazorpaySignature } from '../services/razorpayService.js';
import { validateCouponForSubtotal } from './couponController.js';

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

export const createOrder = asyncHandler(async (req, res) => {
  const { shippingAddress, paymentMethod, giftMessage = '', orderNotes = '' } = req.body;

  if (!['razorpay', 'whatsapp'].includes(paymentMethod)) {
    throw new ApiError(400, 'Please select a valid payment method');
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

  const orderItems = cart.items.map((item) => ({
    product: item.product._id,
    name: item.product.name,
    image: item.product.images[0]?.url,
    variantSku: item.variantSku || null,
    quantity: item.quantity,
    price: item.priceAtAddition,
    customizations: item.customizations,
    customizationPrice: item.customizationPrice,
  }));

  const itemsPrice = orderItems.reduce(
    (sum, item) => sum + (item.price + item.customizationPrice) * item.quantity,
    0
  );

  const { coupon, discount: discountPrice } = await validateCouponForSubtotal(cart.couponCode, itemsPrice);

  const shippingPrice = itemsPrice - discountPrice >= freeShippingThreshold ? 0 : shippingCharge;
  const whatsappSurcharge = paymentMethod === 'whatsapp' ? whatsappCharge : 0;
  // GST removed store-wide — no tax component in the total.
  const totalPrice = Number((itemsPrice - discountPrice + shippingPrice + whatsappSurcharge).toFixed(2));

  const order = await Order.create({
    user: req.user._id,
    orderItems,
    shippingAddress,
    paymentMethod,
    giftMessage,
    orderNotes,
    couponCode: coupon?.code || null,
    itemsPrice,
    shippingPrice,
    discountPrice,
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

  // WhatsApp orders are confirmed manually over chat — the order is already
  // created in the database (admin sees it immediately, exactly like a
  // Razorpay order) before we ever redirect the customer. Stock is reserved
  // and the cart is cleared now because, like COD, placing the order IS the
  // successful action here — there's no separate online payment step left
  // to fail or be cancelled.
  for (const item of orderItems) {
    await decrementStock(item);
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

  res.status(201).json(new ApiResponse(201, { order, whatsappLink }, 'Order placed successfully'));
});

export const verifyPayment = asyncHandler(async (req, res) => {
  const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

  const isValid = verifyRazorpaySignature({ razorpayOrderId, razorpayPaymentId, razorpaySignature });
  if (!isValid) throw new ApiError(400, 'Payment verification failed');

  const order = await Order.findById(orderId);
  if (!order) throw new ApiError(404, 'Order not found');

  order.isPaid = true;
  order.paidAt = new Date();
  order.orderStatus = 'processing';
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

  const cart = await Cart.findOne({ user: order.user });
  if (cart) {
    cart.items = [];
    cart.couponCode = null;
    await cart.save();
  }

  res.status(200).json(new ApiResponse(200, { order }, 'Payment verified successfully'));
});

export const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.status(200).json(new ApiResponse(200, { orders, count: orders.length }, 'Orders fetched successfully'));
});

export const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email');
  if (!order) throw new ApiError(404, 'Order not found');

  const isOwner = order.user._id.toString() === req.user._id.toString();
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
  order.orderStatus = orderStatus;

  if (orderStatus === 'delivered') order.deliveredAt = new Date();
  if (orderStatus === 'cancelled') order.cancelledAt = new Date();

  await order.save();

  res.status(200).json(new ApiResponse(200, { order }, 'Order status updated successfully'));
});

export const updatePaymentStatus = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) throw new ApiError(404, 'Order not found');

  const { paymentStatus } = req.body;
  if (!['pending', 'paid', 'failed', 'refunded'].includes(paymentStatus)) {
    throw new ApiError(400, 'Please provide a valid payment status');
  }

  order.paymentStatus = paymentStatus;
  // Keep the existing boolean in sync so older views relying on it stay accurate.
  order.isPaid = paymentStatus === 'paid';
  if (paymentStatus === 'paid' && !order.paidAt) order.paidAt = new Date();

  await order.save();

  res.status(200).json(new ApiResponse(200, { order }, 'Payment status updated successfully'));
});

export const updateOrderTracking = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) throw new ApiError(404, 'Order not found');

  const { courierName, trackingId, trackingUrl, internalNotes } = req.body;

  order.courier = {
    name: courierName !== undefined ? courierName : order.courier?.name || '',
    trackingId: trackingId !== undefined ? trackingId : order.courier?.trackingId || '',
    trackingUrl: trackingUrl !== undefined ? trackingUrl : order.courier?.trackingUrl || '',
  };
  if (internalNotes !== undefined) order.internalNotes = internalNotes;

  await order.save();

  res.status(200).json(new ApiResponse(200, { order }, 'Order tracking updated successfully'));
});

export const deleteOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) throw new ApiError(404, 'Order not found');

  await order.deleteOne();

  res.status(200).json(new ApiResponse(200, null, 'Order deleted successfully'));
});