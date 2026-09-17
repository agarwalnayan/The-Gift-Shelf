/**
 * Order Notification Service
 * Handles email notifications and in-app notifications for order events
 */

import Order from '../models/Order.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import { sendEmail } from './emailService.js';
import { generateInvoice } from './invoiceService.js';
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
 * Create in-app notification for user
 */
const createInAppNotification = async (userId, type, title, message, orderId = null, metadata = {}) => {
  try {
    if (!userId) {
      console.log('[orderNotification] No userId provided, skipping in-app notification');
      return null;
    }

    const notification = await Notification.create({
      user: userId,
      type,
      title,
      message,
      order: orderId,
      read: false,
      metadata,
    });

    console.log(`[orderNotification] In-app notification created for user ${userId}`);
    return notification;
  } catch (error) {
    console.error('[orderNotification] Failed to create in-app notification:', error.message);
    return null;
  }
};

/**
 * Get status message for notifications
 */
const getStatusMessage = (status) => {
  const messages = {
    confirmed: 'Your order has been confirmed and is being prepared.',
    preparing: 'Your order is currently being prepared.',
    packed: 'Your order has been packed and is ready for shipping.',
    shipped: 'Your order has been shipped!',
    out_for_delivery: 'Your order is out for delivery and will reach you soon.',
    delivered: 'Your order has been delivered. We hope you love it! We\'d also love your feedback.',
    cancelled: 'Your order has been cancelled as requested.',
    returned: 'Your return has been processed.',
  };
  return messages[status] || `Your order status is now ${status}.`;
};

/**
 * Get status label for notifications
 */
const getStatusLabel = (status) => {
  const labels = {
    confirmed: 'Confirmed',
    preparing: 'Preparing',
    packed: 'Packed',
    shipped: 'Shipped',
    out_for_delivery: 'Out for Delivery',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
    returned: 'Returned',
  };
  return labels[status] || status;
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

    // Generate invoice PDF attachment
    let attachments = [];
    try {
      const invoiceBuffer = await generateInvoice(order);
      const orderNumber = order._id.toString().slice(-8).toUpperCase();
      attachments.push({
        filename: `TGS-Invoice-${orderNumber}.pdf`,
        content: invoiceBuffer,
        contentType: 'application/pdf',
      });
      console.log(`[orderNotification] Invoice PDF generated for order #${orderNumber}`);
    } catch (invoiceError) {
      console.error(`[orderNotification] Failed to generate invoice PDF:`, invoiceError.message);
      // Continue without invoice - don't fail the email
    }

    const sent = await sendEmail({ to: recipientEmail, subject, html, attachments });
    
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
    const recipientEmail = order?.user?.email || order?.shippingAddress?.email;
    const recipientName = order?.user?.name || order?.shippingAddress?.fullName;
    if (!order || !recipientEmail) {
      console.log(`[orderNotification] No order or recipient email found for order ${orderId}`);
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

    const { subject, html } = emailBuilder(order, recipientName);
    const sent = await sendEmail({ to: recipientEmail, subject, html });
    
    if (sent) {
      console.log(`[orderNotification] Payment status email sent to ${recipientEmail} for order #${order._id.toString().slice(-8).toUpperCase()}`);
    }
    
    return sent;
  } catch (error) {
    console.error(`[orderNotification] Failed to send payment status email:`, error.message);
    return false;
  }
};

/**
 * Send order status change email and create in-app notification
 */
export const sendOrderStatusNotification = async (orderId, previousOrderStatus) => {
  try {
    const order = await Order.findById(orderId).populate('user', 'name email');
    if (!order) {
      console.log(`[orderNotification] No order found for order ${orderId}`);
      return false;
    }

    // Only send if order status actually changed
    if (previousOrderStatus === order.orderStatus) {
      console.log(`[orderNotification] Order status unchanged for order ${orderId}, skipping notification`);
      return false;
    }

    // Don't send emails for pending status (initial state)
    if (order.orderStatus === 'pending') {
      console.log(`[orderNotification] Skipping email for pending status on order ${orderId}`);
      return false;
    }

    const orderNumber = order._id.toString().slice(-8).toUpperCase();
    const statusLabel = getStatusLabel(order.orderStatus);
    const statusMessage = getStatusMessage(order.orderStatus);
    let emailSent = false;

    const recipientEmail = order.user?.email || order.shippingAddress?.email;
    const recipientName = order.user?.name || order.shippingAddress?.fullName;

    if (recipientEmail) {
      const { subject, html } = buildOrderStatusEmail(order, recipientName, previousOrderStatus);
      emailSent = await sendEmail({ to: recipientEmail, subject, html });
      
      if (emailSent) {
        console.log(`[orderNotification] Order status email sent to ${recipientEmail} for order #${orderNumber}`);
      }
    }

    // Create in-app notification if user exists
    if (order.user?._id) {
      const notificationMetadata = {
        orderNumber,
        previousStatus: previousOrderStatus,
        newStatus: order.orderStatus
      };

      // Add review CTAs for delivered status
      if (order.orderStatus === 'delivered') {
        notificationMetadata.googleReviewUrl = 'https://g.page/r/CSv_GIDZaJlyECk/review';
        notificationMetadata.whatsappUrl = 'https://wa.me/917872030408';
        notificationMetadata.whatsappNumber = '7872030408';
        notificationMetadata.cashbackOffer = 'Get up to ₹100 cashback on your next order';
      }

      await createInAppNotification(
        order.user._id,
        'order_status_changed',
        `Order ${statusLabel}`,
        `Your TGS order #${orderNumber} ${statusMessage}`,
        order._id,
        notificationMetadata
      );
    }
    
    return emailSent;
  } catch (error) {
    console.error(`[orderNotification] Failed to send order status notification:`, error.message);
    return false;
  }
};

/**
 * Send tracking update email
 */
export const sendTrackingNotification = async (orderId, previousCourierData) => {
  try {
    const order = await Order.findById(orderId).populate('user', 'name email');
    const recipientEmail = order?.user?.email || order?.shippingAddress?.email;
    const recipientName = order?.user?.name || order?.shippingAddress?.fullName;
    if (!order || !recipientEmail) {
      console.log(`[orderNotification] No order or recipient email found for order ${orderId}`);
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

    const { subject, html } = buildTrackingUpdateEmail(order, recipientName);
    const sent = await sendEmail({ to: recipientEmail, subject, html });
    
    if (sent) {
      console.log(`[orderNotification] Tracking update email sent to ${recipientEmail} for order #${order._id.toString().slice(-8).toUpperCase()}`);
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