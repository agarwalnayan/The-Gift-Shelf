import { useState, useEffect } from 'react';
import { HiOutlineTag, HiOutlineXMark, HiOutlineCheck } from 'react-icons/hi2';
import { getActiveCouponsApi, validateCouponApi } from '../../api/couponApi.js';

const CouponSelector = ({ selectedCoupon, onCouponSelect, onCouponRemove, catalogueValue }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchCoupons();
    }
  }, [isOpen]);

  const fetchCoupons = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await getActiveCouponsApi();
      setCoupons(data.data.coupons || []);
    } catch (err) {
      setError('Failed to load coupons');
      setCoupons([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCouponSelect = async (coupon) => {
    setValidating(true);
    setError('');
    try {
      // Validate coupon against current catalogue value
      const { data } = await validateCouponApi(coupon.code, catalogueValue);
      const discount = data.data.discount;
      
      onCouponSelect({
        code: coupon.code,
        type: coupon.type,
        value: coupon.value,
        discount: discount,
        minOrderValue: coupon.minOrderValue,
        maxDiscount: coupon.maxDiscount,
        expiresAt: coupon.expiresAt
      });
      
      setIsOpen(false);
      setSearchTerm('');
    } catch (err) {
      setError(err.response?.data?.message || 'Coupon is not valid for this order');
    } finally {
      setValidating(false);
    }
  };

  const handleRemove = () => {
    onCouponRemove();
    setError('');
  };

  const filteredCoupons = coupons.filter(coupon => 
    coupon.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    coupon.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDiscount = (coupon) => {
    if (coupon.type === 'percentage') {
      return `${coupon.value}% OFF`;
    } else {
      return `₹${coupon.value} OFF`;
    }
  };

  const getValidityStatus = (coupon) => {
    if (!coupon.isActive) return 'Inactive';
    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) return 'Expired';
    if (coupon.minOrderValue > catalogueValue) return `Min ₹${coupon.minOrderValue}`;
    return 'Valid';
  };

  if (selectedCoupon) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <HiOutlineTag className="text-green-600" size={20} />
            <div>
              <div className="font-semibold text-green-800">{selectedCoupon.code}</div>
              <div className="text-sm text-green-700">Discount: ₹{selectedCoupon.discount.toFixed(2)}</div>
            </div>
          </div>
          <button
            type="button"
            onClick={handleRemove}
            className="text-green-600 hover:text-red-600 transition-colors"
          >
            <HiOutlineXMark size={20} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-3 rounded-xl border border-ink/20 px-4 py-3 outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-left"
      >
        <div className="flex items-center gap-3">
          <HiOutlineTag className="text-ink/40" size={20} />
          <span className="text-ink/70">Select Coupon / Promotion</span>
        </div>
        <span className="text-ink/40 text-sm">▼</span>
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute z-20 w-full mt-2 bg-white border border-ink/10 rounded-xl shadow-xl max-h-96 overflow-y-auto">
            <div className="p-3 border-b border-ink/10">
              <input
                type="text"
                placeholder="Search coupons..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-ink/20 px-3 py-2 outline-none text-sm focus:border-primary-500"
              />
            </div>
            
            {error && (
              <div className="p-3 bg-red-50 text-red-600 text-sm">
                {error}
              </div>
            )}

            {loading ? (
              <div className="p-4 text-center text-sm text-ink/50">Loading coupons...</div>
            ) : filteredCoupons.length === 0 ? (
              <div className="p-4 text-center text-sm text-ink/50">
                {searchTerm ? 'No coupons found' : 'No active coupons available'}
              </div>
            ) : (
              <div className="p-2">
                {filteredCoupons.map(coupon => (
                  <button
                    key={coupon._id}
                    type="button"
                    onClick={() => handleCouponSelect(coupon)}
                    disabled={validating}
                    className="w-full flex items-center justify-between p-3 hover:bg-ink/5 rounded-lg cursor-pointer border-b border-ink/5 last:border-0 text-left disabled:opacity-50"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-ink">{coupon.code}</span>
                        <span className="text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded">
                          {formatDiscount(coupon)}
                        </span>
                      </div>
                      <div className="text-xs text-ink/60 mt-1">
                        Min order: ₹{coupon.minOrderValue}
                        {coupon.maxDiscount && ` • Max discount: ₹${coupon.maxDiscount}`}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        getValidityStatus(coupon) === 'Valid' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {getValidityStatus(coupon)}
                      </span>
                      <HiOutlineCheck className="text-primary-600" size={16} />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default CouponSelector;