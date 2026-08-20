/**
 * Order Notification Service
 * Handles email notifications for order events
 */

import Order from '../models/Order.js';
import User from '../models/User.js';
import { sendEmail } from './emailService.js';
import {
  buildOrderConfirmationEmail,
  buildPaymentReceivedEmail,
  buildPaymentFailedEmail,
  buildPaymentRefundedEmail,
  buildOrderStatusEmail,
  buildTrackingUpdateEmail,
} from './orderEmailTemplates.js';

/**
 * Check if email should be sent based on field changes
 * Prevents duplicate emails for unchanged values
 */
const shouldSendEmail = (previousData, currentData, fieldsToCheck) => {
  if (!previousData) return true; // First time, send email
  
  for (const field of fieldsToCheck) {
    const prevValue = previousData[field];
    const currValue = currentData[field];
    
    if (prevValue !== currValue) {
      return true; // At least one field changed
    }
  }
  
  return false; // No relevant changes
};

/**
 * Send order confirmation email
 */
export const sendOrderConfirmation = async (orderId) => {
  try {
    const order = await Order.findById(orderId).populate('user', 'name email');
    if (!order) {
      console.log(`[orderNotification] No order found for order ${orderId}`);
      return false;
    }

    // For guest orders (user: null), use shipping address email
    const recipientEmail = order.user?.email || order.shippingAddress.email;
    const recipientName = order.user?.name || order.shippingAddress.fullName;

    if (!recipientEmail) {
      console.log(`[orderNotification] No email found for order ${orderId}`);
      return false;
    }

    const { subject, html } = buildOrderConfirmationEmail(order, recipientName);
    const sent = await sendEmail({ to: recipientEmail, subject, html });
    
    if (sent) {
      console.log(`[orderNotification] Order confirmation email sent to ${recipientEmail} for order #${order._id.toString().slice(-8).toUpperCase()}`);
    }
    
    return sent;
  } catch (error) {
    console.error(`[orderNotification] Failed to send order confirmation email:`, error.message);
    return false;
  }
};

/**
 * Send payment status change email
 */
export const sendPaymentStatusNotification = async (orderId, previousPaymentStatus) => {
  try {
    const order = await Order.findById(orderId).populate('user', 'name email');
    if (!order || !order.user?.email) {
      console.log(`[orderNotification] No order or user email found for order ${orderId}`);
      return false;
    }

    // Only send if payment status actually changed
    if (previousPaymentStatus === order.paymentStatus) {
      console.log(`[orderNotification] Payment status unchanged for order ${orderId}, skipping email`);
      return false;
    }

    let emailBuilder;
    switch (order.paymentStatus) {
      case 'paid':
        emailBuilder = buildPaymentReceivedEmail;
        break;
      case 'failed':
        emailBuilder = buildPaymentFailedEmail;
        break;
      case 'refunded':
        emailBuilder = buildPaymentRefundedEmail;
        break;
      default:
        console.log(`[orderNotification] No email template for payment status: ${order.paymentStatus}`);
        return false;
    }

    const { subject, html } = emailBuilder(order, order.user.name);
    const sent = await sendEmail({ to: order.user.email, subject, html });
    
    if (sent) {
      console.log(`[orderNotification] Payment status email sent to ${order.user.email} for order #${order._id.toString().slice(-8).toUpperCase()}`);
    }
    
    return sent;
  } catch (error) {
    console.error(`[orderNotification] Failed to send payment status email:`, error.message);
    return false;
  }
};

/**
 * Send order status change email
 */
export const sendOrderStatusNotification = async (orderId, previousOrderStatus) => {
  try {
    const order = await Order.findById(orderId).populate('user', 'name email');
    if (!order || !order.user?.email) {
      console.log(`[orderNotification] No order or user email found for order ${orderId}`);
      return false;
    }

    // Only send if order status actually changed
    if (previousOrderStatus === order.orderStatus) {
      console.log(`[orderNotification] Order status unchanged for order ${orderId}, skipping email`);
      return false;
    }

    // Don't send emails for pending status (initial state)
    if (order.orderStatus === 'pending') {
      console.log(`[orderNotification] Skipping email for pending status on order ${orderId}`);
      return false;
    }

    const { subject, html } = buildOrderStatusEmail(order, order.user.name, previousOrderStatus);
    const sent = await sendEmail({ to: order.user.email, subject, html });
    
    if (sent) {
      console.log(`[orderNotification] Order status email sent to ${order.user.email} for order #${order._id.toString().slice(-8).toUpperCase()}`);
    }
    
    return sent;
  } catch (error) {
    console.error(`[orderNotification] Failed to send order status email:`, error.message);
    return false;
  }
};

/**
 * Send tracking update email
 */
export const sendTrackingNotification = async (orderId, previousCourierData) => {
  try {
    const order = await Order.findById(orderId).populate('user', 'name email');
    if (!order || !order.user?.email) {
      console.log(`[orderNotification] No order or user email found for order ${orderId}`);
      return false;
    }

    // Check if any tracking field actually changed
    const trackingFields = ['name', 'trackingId', 'trackingUrl'];
    const currentCourierData = {
      name: order.courier?.name || '',
      trackingId: order.courier?.trackingId || '',
      trackingUrl: order.courier?.trackingUrl || '',
    };

    if (!shouldSendEmail(previousCourierData, currentCourierData, trackingFields)) {
      console.log(`[orderNotification] Tracking data unchanged for order ${orderId}, skipping email`);
      return false;
    }

    // Only send if there's meaningful tracking information
    if (!currentCourierData.trackingId && !currentCourierData.name) {
      console.log(`[orderNotification] No meaningful tracking data for order ${orderId}, skipping email`);
      return false;
    }

    const { subject, html } = buildTrackingUpdateEmail(order, order.user.name);
    const sent = await sendEmail({ to: order.user.email, subject, html });
    
    if (sent) {
      console.log(`[orderNotification] Tracking update email sent to ${order.user.email} for order #${order._id.toString().slice(-8).toUpperCase()}`);
    }
    
    return sent;
  } catch (error) {
    console.error(`[orderNotification] Failed to send tracking update email:`, error.message);
    return false;
  }
};

/**
 * Combined notification handler for order updates
 * This is the main entry point for order notifications
 */
export const notifyOrderUpdate = async (orderId, updateType, previousData = null) => {
  try {
    switch (updateType) {
      case 'order_created':
        return await sendOrderConfirmation(orderId);
      case 'payment_status_changed':
        return await sendPaymentStatusNotification(orderId, previousData?.paymentStatus);
      case 'order_status_changed':
        return await sendOrderStatusNotification(orderId, previousData?.orderStatus);
      case 'tracking_updated':
        return await sendTrackingNotification(orderId, previousData?.courier);
      default:
        console.log(`[orderNotification] Unknown update type: ${updateType}`);
        return false;
    }
  } catch (error) {
    console.error(`[orderNotification] Failed to process order notification:`, error.message);
    return false;
  }
};