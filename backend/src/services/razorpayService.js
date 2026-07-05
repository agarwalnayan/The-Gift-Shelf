import crypto from 'crypto';
import { razorpayInstance } from '../config/razorpay.js';
import { env } from '../config/env.js';
import ApiError from '../utils/ApiError.js';

export const createRazorpayOrder = async (amountInRupees, receiptId) => {
  try {
    const order = await razorpayInstance.orders.create({
      amount: Math.round(amountInRupees * 100),
      currency: 'INR',
      receipt: receiptId,
    });
    return order;
  } catch (error) {
    throw new ApiError(500, 'Failed to create Razorpay order');
  }
};

export const verifyRazorpaySignature = ({
  razorpayOrderId,
  razorpayPaymentId,
  razorpaySignature,
}) => {
  const generatedSignature = crypto
    .createHmac('sha256', env.razorpay.keySecret)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest('hex');

  return generatedSignature === razorpaySignature;
};
