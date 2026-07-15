import { HiOutlineTicket, HiOutlineCheckCircle, HiOutlineClock } from 'react-icons/hi2';

const CouponsPage = () => {
  const availableCoupons = [
    {
      code: 'LAUNCH20',
      discount: 'Flat 20% OFF',
      description: 'Get flat 20% discount on all orders',
      status: 'active',
      expiry: 'Limited time offer'
    }
  ];

  const usedCoupons = [];

  return (
    <div className="container-tgs py-12">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-semibold text-charcoal sm:text-4xl">Coupons</h1>
        <p className="mt-2 text-sm text-charcoal/60">View and manage your available coupons</p>
      </div>

      <div className="space-y-8">
        <div>
          <h2 className="mb-4 font-display text-lg font-semibold text-charcoal">Available Coupons</h2>
          {availableCoupons.length === 0 ? (
            <div className="rounded-2xl bg-white p-12 text-center shadow-sm">
              <p className="text-lg font-medium text-charcoal">No available coupons</p>
              <p className="mt-2 text-sm text-charcoal/60">Check back later for new offers</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {availableCoupons.map((coupon, index) => (
                <div key={index} className="rounded-2xl border-2 border-primary-200 bg-primary-50 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-100 text-primary-600">
                      <HiOutlineTicket size={24} />
                    </div>
                    <span className="flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                      <HiOutlineCheckCircle size={14} />
                      Active
                    </span>
                  </div>
                  <div className="mb-4">
                    <p className="font-display text-2xl font-bold text-charcoal">{coupon.code}</p>
                    <p className="mt-1 text-lg font-semibold text-primary-600">{coupon.discount}</p>
                  </div>
                  <p className="text-sm text-charcoal/60 mb-3">{coupon.description}</p>
                  <div className="flex items-center gap-1 text-xs text-charcoal/50">
                    <HiOutlineClock size={14} />
                    {coupon.expiry}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <h2 className="mb-4 font-display text-lg font-semibold text-charcoal">Used Coupons</h2>
          {usedCoupons.length === 0 ? (
            <div className="rounded-2xl bg-white p-12 text-center shadow-sm">
              <p className="text-lg font-medium text-charcoal">No used coupons</p>
              <p className="mt-2 text-sm text-charcoal/60">Coupons you've used will appear here</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {usedCoupons.map((coupon, index) => (
                <div key={index} className="rounded-2xl border border-charcoal/10 bg-white p-6 opacity-60">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-charcoal/5 text-charcoal/40">
                      <HiOutlineTicket size={24} />
                    </div>
                    <span className="rounded-full bg-charcoal/100 px-3 py-1 text-xs font-medium text-charcoal/60">
                      Used
                    </span>
                  </div>
                  <div className="mb-4">
                    <p className="font-display text-2xl font-bold text-charcoal">{coupon.code}</p>
                    <p className="mt-1 text-lg font-semibold text-charcoal/60">{coupon.discount}</p>
                  </div>
                  <p className="text-sm text-charcoal/60">{coupon.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CouponsPage;
