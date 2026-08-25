import { useMemo } from 'react';

const OrderSummary = ({ orderItems, catalogueValue, manualSellingPrice, couponDiscount, shippingPrice, agreedPrice }) => {
  const customerSavings = useMemo(() => {
    return catalogueValue - manualSellingPrice;
  }, [catalogueValue, manualSellingPrice]);

  const finalAmount = useMemo(() => {
    return agreedPrice || (manualSellingPrice - couponDiscount + shippingPrice);
  }, [agreedPrice, manualSellingPrice, couponDiscount, shippingPrice]);

  return (
    <div className="bg-white p-6 rounded-2xl border border-ink/10 shadow-sm space-y-4">
      <h3 className="text-lg font-semibold text-ink">Order Summary</h3>
      
      {/* Order Items */}
      <div className="space-y-2 border-b border-ink/10 pb-4">
        {orderItems.map((item, index) => (
          <div key={index} className="flex justify-between text-sm">
            <span className="text-ink/70">
              {item.name} × {item.quantity}
              {item.customizations && item.customizations.length > 0 && (
                <span className="block text-xs text-ink/50">
                  {item.customizations.map(c => c.label).join(', ')}
                </span>
              )}
            </span>
            <span className="text-ink font-medium">₹{(item.price * item.quantity).toFixed(2)}</span>
          </div>
        ))}
      </div>

      {/* Commercial Breakdown */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-ink/70">Catalogue Value</span>
          <span className="text-ink font-medium">₹{catalogueValue.toFixed(2)}</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-ink/70">Manual Selling Price</span>
          <span className="text-ink font-medium">₹{manualSellingPrice.toFixed(2)}</span>
        </div>

        {customerSavings > 0 && (
          <div className="flex justify-between items-center">
            <span className="text-green-600 font-medium">Customer Saves</span>
            <span className="text-green-600 font-semibold">₹{customerSavings.toFixed(2)}</span>
          </div>
        )}

        {couponDiscount > 0 && (
          <div className="flex justify-between items-center">
            <span className="text-ink/70">Coupon Discount</span>
            <span className="text-red-500 font-medium">-₹{couponDiscount.toFixed(2)}</span>
          </div>
        )}

        <div className="flex justify-between items-center">
          <span className="text-ink/70">Shipping</span>
          <span className="text-ink font-medium">
            {shippingPrice === 0 ? 'Free' : `₹${shippingPrice.toFixed(2)}`}
          </span>
        </div>

        <div className="border-t border-ink/10 pt-3">
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold text-ink">Final Amount</span>
            <span className="text-lg font-bold text-primary-600">₹{finalAmount.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;