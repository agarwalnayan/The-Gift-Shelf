/**
 * Order Email Templates
 * Reusable email templates for order notifications
 */

const getOrderNumber = (order) => order._id.toString().slice(-8).toUpperCase();

const buildOrderItemsTable = (orderItems) => {
  return orderItems
    .map(
      (item) => {
        let customizationText = '';
        if (item.customizations && item.customizations.length > 0) {
          const customizations = item.customizations.map(c => {
            const label = c.label || c.key;
            const value = c.value;
            return `<div style="font-size: 12px; color: #666; margin-top: 4px;">${label}: ${value}</div>`;
          }).join('');
          customizationText = customizations;
        }
        return `
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #eee;">
            <div style="font-weight: 500;">${item.name} ${item.variantSku ? `(${item.variantSku})` : ''} × ${item.quantity}</div>
            ${customizationText}
          </td>
          <td style="padding: 12px 0; border-bottom: 1px solid #eee; text-align: right; vertical-align: top;">
            ₹${(item.price + item.customizationPrice) * item.quantity}
          </td>
        </tr>
      `;
      }
    )
    .join('');
};

const buildOrderSummary = (order) => {
  const rows = [
    { label: 'Subtotal', value: `₹${order.itemsPrice}` },
    { label: 'Shipping', value: order.shippingPrice > 0 ? `₹${order.shippingPrice}` : 'Free' },
    { label: 'Discount', value: order.discountPrice > 0 ? `-₹${order.discountPrice}` : '₹0' },
  ];

  if (order.whatsappCharge > 0) {
    rows.push({ label: 'WhatsApp Charge', value: `₹${order.whatsappCharge}` });
  }

  rows.push({ label: 'Total', value: `₹${order.totalPrice}`, bold: true });

  return rows
    .map(
      (row) => `
        <tr>
          <td style="padding: 4px 0; ${row.bold ? 'font-weight: bold;' : ''}">${row.label}</td>
          <td style="padding: 4px 0; text-align: right; ${row.bold ? 'font-weight: bold;' : ''}">${row.value}</td>
        </tr>
      `
    )
    .join('');
};

const getPaymentMethodText = (paymentMethod) => {
  const methods = {
    razorpay: 'Online Payment (Razorpay)',
    whatsapp: 'WhatsApp',
    gpay: 'Google Pay',
    cod: 'Cash on Delivery',
  };
  return methods[paymentMethod] || paymentMethod;
};

const getGreeting = (customerName) => `Hi ${customerName || 'there'},`;

const getSignOff = () => `
  <p style="margin-top: 24px;">If you have any questions, reply to this email or contact us at support@thegiftshelf.in.</p>
  <p style="margin-top: 8px;">Best regards,<br>The Gift Shelf Team</p>
`;

const getEmailBase = (subject, content) => `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${subject}</title>
  </head>
  <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
    <div style="background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
      <div style="text-align: center; margin-bottom: 30px;">
        <img src="https://thegiftshelf.in/logo.png" alt="The Gift Shelf" style="width: 150px; height: auto; max-width: 100%;">
      </div>
      ${content}
    </div>
  </body>
  </html>
`;

/**
 * Order Confirmation Email
 */
export const buildOrderConfirmationEmail = (order, customerName) => {
  const orderNumber = getOrderNumber(order);
  const subject = `Order Confirmed — #${orderNumber}`;
  
  const isSocialOrder = order.orderSource !== 'website';
  const paymentNote = isSocialOrder 
    ? '<p style="color: #28a745;"><strong>Your payment via Google Pay has been received.</strong></p>'
    : '<p>Your payment is being processed.</p>';

  const shippingAddress = order.shippingAddress || {};
  const shippingAddressHtml = `
    <div style="background-color: #f8f9fa; padding: 16px; border-radius: 4px; margin: 20px 0;">
      <h3 style="margin: 0 0 12px 0; font-size: 16px; color: #333;">DELIVERY DETAILS</h3>
      <p style="margin: 4px 0; font-size: 14px;"><strong>Name:</strong> ${shippingAddress.fullName || 'N/A'}</p>
      <p style="margin: 4px 0; font-size: 14px;"><strong>Phone:</strong> ${shippingAddress.phone || 'N/A'}</p>
      <p style="margin: 4px 0; font-size: 14px;"><strong>Email:</strong> ${shippingAddress.email || 'N/A'}</p>
      <p style="margin: 4px 0; font-size: 14px;"><strong>Address:</strong></p>
      <p style="margin: 4px 0; font-size: 14px; padding-left: 12px;">${shippingAddress.line1 || ''}${shippingAddress.line2 ? ', ' + shippingAddress.line2 : ''}</p>
      <p style="margin: 4px 0; font-size: 14px; padding-left: 12px;">${shippingAddress.city || ''}, ${shippingAddress.state || ''} ${shippingAddress.postalCode || ''}</p>
      <p style="margin: 4px 0; font-size: 14px; padding-left: 12px;">${shippingAddress.country || 'India'}</p>
    </div>
  `;

  const content = `
    <h1 style="color: #333; font-size: 24px; margin-bottom: 8px;">ORDER CONFIRMED</h1>
    
    ${getGreeting(customerName)}
    <p style="color: #666;">Thank you for your order. Your order has been confirmed successfully.</p>
    
    <div style="margin: 24px 0; padding: 16px; background-color: #f0f8ff; border-left: 4px solid #007bff; border-radius: 4px;">
      <p style="margin: 0; font-size: 14px;"><strong>Order ID:</strong> #${orderNumber}</p>
    </div>
    
    <h2 style="color: #333; font-size: 18px; margin: 24px 0 12px 0; border-bottom: 2px solid #e9ecef; padding-bottom: 8px;">ORDER SUMMARY</h2>
    
    <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
      <thead>
        <tr style="border-bottom: 2px solid #dee2e6;">
          <th style="text-align: left; padding: 12px 8px; font-size: 14px; color: #495057;">Product</th>
          <th style="text-align: right; padding: 12px 8px; font-size: 14px; color: #495057;">Price</th>
        </tr>
      </thead>
      <tbody>
        ${buildOrderItemsTable(order.orderItems)}
      </tbody>
    </table>
    
    <h2 style="color: #333; font-size: 18px; margin: 24px 0 12px 0; border-bottom: 2px solid #e9ecef; padding-bottom: 8px;">PAYMENT</h2>
    <p style="margin: 8px 0; font-size: 14px;"><strong>Payment Method:</strong> ${getPaymentMethodText(order.paymentMethod)}</p>
    <p style="margin: 8px 0; font-size: 14px;"><strong>Payment Status:</strong> <span style="color: #28a745; font-weight: 500;">${order.paymentStatus === 'paid' ? 'Paid' : 'Pending'}</span></p>
    ${paymentNote}
    
    <h2 style="color: #333; font-size: 18px; margin: 24px 0 12px 0; border-bottom: 2px solid #e9ecef; padding-bottom: 8px;">ORDER TOTAL</h2>
    <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
      ${buildOrderSummary(order)}
    </table>
    
    ${shippingAddressHtml}
    
    <h2 style="color: #333; font-size: 18px; margin: 24px 0 12px 0; border-bottom: 2px solid #e9ecef; padding-bottom: 8px;">ORDER STATUS</h2>
    <p style="margin: 8px 0; font-size: 14px;"><strong>Status:</strong> <span style="color: #28a745; font-weight: 500;">${order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}</span></p>
    
    <p style="margin-top: 24px; color: #666;">We'll notify you when your order is shipped.</p>
    ${getSignOff()}
  `;

  return { subject, html: getEmailBase(subject, content) };
};

/**
 * Payment Received Email
 */
export const buildPaymentReceivedEmail = (order, customerName) => {
  const orderNumber = getOrderNumber(order);
  const subject = `Payment Received — Order #${orderNumber}`;
  
  const content = `
    ${getGreeting(customerName)}
    <p>Great news! We've received your payment for order #${orderNumber}.</p>
    
    <p><strong>Order ID:</strong> #${orderNumber}</p>
    <p><strong>Amount:</strong> ₹${order.totalPrice}</p>
    <p><strong>Payment Method:</strong> ${getPaymentMethodText(order.paymentMethod)}</p>
    
    <p>Your order is now being processed and we'll notify you when it ships.</p>
    ${getSignOff()}
  `;

  return { subject, html: getEmailBase(subject, content) };
};

/**
 * Payment Failed Email
 */
export const buildPaymentFailedEmail = (order, customerName) => {
  const orderNumber = getOrderNumber(order);
  const subject = `Payment Failed — Order #${orderNumber}`;
  
  const content = `
    ${getGreeting(customerName)}
    <p>We were unable to process your payment for order #${orderNumber}.</p>
    
    <p><strong>Order ID:</strong> #${orderNumber}</p>
    <p><strong>Amount:</strong> ₹${order.totalPrice}</p>
    
    <p>Please try again or contact us if you continue to experience issues.</p>
    ${getSignOff()}
  `;

  return { subject, html: getEmailBase(subject, content) };
};

/**
 * Payment Refunded Email
 */
export const buildPaymentRefundedEmail = (order, customerName) => {
  const orderNumber = getOrderNumber(order);
  const subject = `Payment Refunded — Order #${orderNumber}`;
  
  const content = `
    ${getGreeting(customerName)}
    <p>Your payment for order #${orderNumber} has been refunded.</p>
    
    <p><strong>Order ID:</strong> #${orderNumber}</p>
    <p><strong>Refund Amount:</strong> ₹${order.totalPrice}</p>
    
    <p>The refund should appear in your account within 5-7 business days, depending on your payment provider.</p>
    ${getSignOff()}
  `;

  return { subject, html: getEmailBase(subject, content) };
};

/**
 * Order Status Update Email
 */
export const buildOrderStatusEmail = (order, customerName, previousStatus) => {
  const orderNumber = getOrderNumber(order);
  const statusLabels = {
    confirmed: 'Confirmed',
    preparing: 'Preparing',
    packed: 'Packed',
    shipped: 'Shipped',
    out_for_delivery: 'Out for Delivery',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
    returned: 'Returned',
  };
  
  const currentStatusLabel = statusLabels[order.orderStatus] || order.orderStatus;
  const subject = `Order ${currentStatusLabel} — #${orderNumber}`;
  
  let statusMessage = '';
  if (order.orderStatus === 'confirmed') {
    statusMessage = 'Your order has been confirmed and is being prepared.';
  } else if (order.orderStatus === 'preparing') {
    statusMessage = 'Your order is currently being prepared.';
  } else if (order.orderStatus === 'packed') {
    statusMessage = 'Your order has been packed and is ready for shipping.';
  } else if (order.orderStatus === 'shipped') {
    statusMessage = 'Your order has been shipped!';
  } else if (order.orderStatus === 'out_for_delivery') {
    statusMessage = 'Your order is out for delivery and will reach you soon.';
  } else if (order.orderStatus === 'delivered') {
    statusMessage = 'Your order has been delivered. Thank you for shopping with us!';
  } else if (order.orderStatus === 'cancelled') {
    statusMessage = 'Your order has been cancelled as requested.';
  } else if (order.orderStatus === 'returned') {
    statusMessage = 'Your return has been processed.';
  }

  const content = `
    ${getGreeting(customerName)}
    <p>${statusMessage}</p>
    
    <p><strong>Order ID:</strong> #${orderNumber}</p>
    <p><strong>Status:</strong> ${currentStatusLabel}</p>
    
    ${order.orderStatus === 'shipped' && order.courier?.trackingId ? `
      <p><strong>Courier:</strong> ${order.courier.name || 'N/A'}</p>
      <p><strong>Tracking ID:</strong> ${order.courier.trackingId}</p>
      ${order.courier.trackingUrl ? `<p><strong>Track:</strong> <a href="${order.courier.trackingUrl}">${order.courier.trackingUrl}</a></p>` : ''}
    ` : ''}
    
    ${getSignOff()}
  `;

  return { subject, html: getEmailBase(subject, content) };
};

/**
 * Tracking Update Email
 */
export const buildTrackingUpdateEmail = (order, customerName) => {
  const orderNumber = getOrderNumber(order);
  const subject = `Tracking Updated — Order #${orderNumber}`;
  
  const content = `
    ${getGreeting(customerName)}
    <p>Your order tracking information has been updated.</p>
    
    <p><strong>Order ID:</strong> #${orderNumber}</p>
    <p><strong>Courier:</strong> ${order.courier?.name || 'N/A'}</p>
    <p><strong>Tracking ID:</strong> ${order.courier?.trackingId || 'N/A'}</p>
    ${order.courier?.trackingUrl ? `<p><strong>Track:</strong> <a href="${order.courier.trackingUrl}">${order.courier.trackingUrl}</a></p>` : ''}
    
    ${getSignOff()}
  `;

  return { subject, html: getEmailBase(subject, content) };
};