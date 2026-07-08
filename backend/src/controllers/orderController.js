import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import { createRazorpayOrder, verifyRazorpaySignature } from '../services/razorpayService.js';

const SHIPPING_FLAT_RATE = 49;
const TAX_RATE = 0.05;

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
  const { shippingAddress, paymentMethod } = req.body;

  const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
  if (!cart || cart.items.length === 0) throw new ApiError(400, 'Your cart is empty');

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
  const shippingPrice = itemsPrice > 999 ? 0 : SHIPPING_FLAT_RATE;
  const taxPrice = Number((itemsPrice * TAX_RATE).toFixed(2));
  const totalPrice = Number((itemsPrice + shippingPrice + taxPrice).toFixed(2));

  const order = await Order.create({
    user: req.user._id,
    orderItems,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    shippingPrice,
    taxPrice,
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

  for (const item of orderItems) {
    await decrementStock(item);
  }

  cart.items = [];
  await cart.save();

  res.status(201).json(new ApiResponse(201, { order }, 'Order placed successfully'));
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
