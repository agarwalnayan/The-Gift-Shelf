/**
 * Invoice Generation Service
 * Generates PDF invoices from Order data
 */

import { PDFDocument } from 'pdfkit';
import { Buffer } from 'buffer';

const getOrderNumber = (order) => order._id.toString().slice(-8).toUpperCase();

const formatDate = (date) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

const formatCurrency = (amount) => `₹${Number(amount).toFixed(2)}`;

/**
 * Generate invoice PDF from order
 * Returns Buffer containing PDF data
 */
export const generateInvoicePDF = async (order) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      const chunks = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      const orderNumber = getOrderNumber(order);
      const invoiceDate = formatDate(order.createdAt);

      // Header - TGS Branding
      doc.fontSize(24).font('Helvetica-Bold').text('The Gift Shelf', 50, 50);
      doc.fontSize(10).font('Helvetica').text('Thoughtful gifts. Made more personal.', 50, 80);
      
      // Invoice Title
      doc.fontSize(18).font('Helvetica-Bold').text('INVOICE / ORDER SUMMARY', 50, 120);
      
      // Invoice Details
      doc.fontSize(10).font('Helvetica');
      doc.text(`Invoice No: INV-${orderNumber}`, 50, 150);
      doc.text(`Invoice Date: ${invoiceDate}`, 50, 165);
      doc.text(`Order ID: #${orderNumber}`, 50, 180);

      // Customer Details
      doc.fontSize(12).font('Helvetica-Bold').text('Bill To:', 50, 220);
      doc.fontSize(10).font('Helvetica');
      
      const shippingAddress = order.shippingAddress || {};
      doc.text(shippingAddress.fullName || 'N/A', 50, 240);
      doc.text(shippingAddress.email || 'N/A', 50, 255);
      doc.text(shippingAddress.phone || 'N/A', 50, 270);
      doc.text(shippingAddress.line1 || '', 50, 285);
      if (shippingAddress.line2) doc.text(shippingAddress.line2, 50, 300);
      doc.text(`${shippingAddress.city || ''}, ${shippingAddress.state || ''} ${shippingAddress.postalCode || ''}`, 50, 315);
      doc.text(shippingAddress.country || 'India', 50, 330);

      // Order Details
      doc.fontSize(12).font('Helvetica-Bold').text('Order Details:', 300, 220);
      doc.fontSize(10).font('Helvetica');
      doc.text(`Order Date: ${invoiceDate}`, 300, 240);
      doc.text(`Payment Method: ${order.paymentMethod || 'N/A'}`, 300, 255);
      doc.text(`Payment Status: ${order.paymentStatus || 'N/A'}`, 300, 270);

      // Order Items Table Header
      const tableTop = 380;
      doc.fontSize(10).font('Helvetica-Bold');
      doc.text('Item', 50, tableTop);
      doc.text('Qty', 350, tableTop);
      doc.text('Price', 400, tableTop);
      doc.text('Total', 480, tableTop);
      
      doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();

      // Order Items
      let y = tableTop + 30;
      doc.fontSize(9).font('Helvetica');
      
      order.orderItems.forEach((item) => {
        const variantPrice = item.price + item.customizationPrice;
        const lineTotal = variantPrice * item.quantity;
        
        doc.fontSize(10).font('Helvetica');
        let itemText = `${item.name}`;
        if (item.variantName) {
          itemText += `\nVariant: ${item.variantName}`;
        }
        if (item.customizations && item.customizations.length > 0) {
          itemText += `\n(Personalized)`;
        }
        doc.text(itemText, 50, y);
        doc.text(`Qty: ${item.quantity}`, 300, y);
        doc.text(formatCurrency(variantPrice), 380, y);
        doc.text(formatCurrency(lineTotal), 480, y);
        y += 25;

        // Customizations if any
        if (item.customizations && item.customizations.length > 0) {
          item.customizations.forEach((customization) => {
            y += 12;
            doc.fontSize(8).font('Helvetica').text(
              `  ${customization.label}: ${customization.value}`,
              50,
              y,
              { width: 280 }
            );
            doc.fontSize(9);
          });
        }

        y += 20;

        // New page if needed
        if (y > 700) {
          doc.addPage();
          y = 50;
        }
      });

      // Summary Section
      y += 20;
      doc.moveTo(50, y).lineTo(550, y).stroke();
      y += 20;

      doc.fontSize(10).font('Helvetica');
      
      // For manual orders, show catalogue price and special price adjustment
      if (order.orderSource === 'manual' && order.cataloguePrice !== order.itemsPrice) {
        doc.text('Catalogue Price:', 400, y);
        doc.text(formatCurrency(order.cataloguePrice), 480, y);
        y += 15;
        
        const specialPriceAdjustment = order.cataloguePrice - order.itemsPrice;
        if (specialPriceAdjustment > 0) {
          doc.text('Special Price Adjustment:', 400, y);
          doc.text(`-${formatCurrency(specialPriceAdjustment)}`, 480, y);
          y += 15;
        }
      } else {
        doc.text('Subtotal:', 400, y);
        doc.text(formatCurrency(order.itemsPrice), 480, y);
        y += 15;
      }
      
      // Coupon discount (separate from manual adjustment)
      if (order.discountPrice > 0) {
        doc.text(`Coupon Discount${order.couponCode ? ` (${order.couponCode})` : ''}:`, 400, y);
        doc.text(`-${formatCurrency(order.discountPrice)}`, 480, y);
        y += 15;
      }
      
      // Promotion discount
      if (order.promotionDiscount > 0) {
        doc.text(`Promotion${order.promotionName ? ` (${order.promotionName})` : ''}:`, 400, y);
        doc.text(`-${formatCurrency(order.promotionDiscount)}`, 480, y);
        y += 15;
      }

      doc.text('Shipping:', 400, y);
      doc.text(order.shippingPrice > 0 ? formatCurrency(order.shippingPrice) : 'Free', 480, y);
      y += 15;

      if (order.whatsappCharge > 0) {
        doc.text('WhatsApp Charge:', 400, y);
        doc.text(formatCurrency(order.whatsappCharge), 480, y);
        y += 15;
      }

      y += 10;
      doc.moveTo(400, y).lineTo(550, y).stroke();
      y += 15;

      doc.fontSize(12).font('Helvetica-Bold');
      doc.text('Total:', 400, y);
      doc.text(formatCurrency(order.totalPrice), 480, y);

      // Footer
      doc.fontSize(9).font('Helvetica');
      const footerY = 750;
      doc.text('Thank you for your order!', 50, footerY);
      doc.text('For queries, contact us at support@thegiftshelf.in', 50, footerY + 15);
      doc.text('Visit www.thegiftshelf.in', 50, footerY + 30);

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Generate invoice and return as Buffer
 */
export const generateInvoice = async (order) => {
  try {
    const pdfBuffer = await generateInvoicePDF(order);
    return pdfBuffer;
  } catch (error) {
    console.error('[invoiceService] Failed to generate invoice:', error.message);
    throw new Error('Failed to generate invoice');
  }
};
