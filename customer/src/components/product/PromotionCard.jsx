const PromotionCard = ({ promotion }) => {
  if (!promotion) return null;

  const { type, buyMoreTiers, discountValue, discountUnit, badgeText, icon, description, name } = promotion;

  const formatDiscount = (value, unit) => {
    return unit === 'percentage' ? `${value}%` : `₹${value}`;
  };

  const getOfferText = () => {
    if (badgeText) return badgeText;

    if (type === 'flat_discount') {
      return `Save ${formatDiscount(discountValue, discountUnit)}`;
    }

    if (type === 'percentage_discount') {
      return `${discountValue}% off`;
    }

    if (type === 'buy_more_save_more' && buyMoreTiers?.length > 0) {
      const firstTier = buyMoreTiers[0];
      return `Buy ${firstTier.buyQuantity} → Save ${formatDiscount(firstTier.discountValue, firstTier.discountUnit)}`;
    }

    return name || 'Special offer';
  };

  const getTiers = () => {
    if (type === 'buy_more_save_more' && buyMoreTiers?.length > 0) {
      return buyMoreTiers.map((tier) => ({
        label: `Buy ${tier.buyQuantity}`,
        value: `Save ${formatDiscount(tier.discountValue, tier.discountUnit)}`,
      }));
    }
    return null;
  };

  const tiers = getTiers();
  const offerText = getOfferText();
  const promotionTitle = name || 'Special offer';

  return (
    <div className="rounded-xl border border-[#F0D8CC] bg-[#FFF8F4] p-4 shadow-md sm:p-5">
      <div className="flex items-start gap-3">
        {icon && (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#B85C38] text-white sm:h-10 sm:w-10">
            <span className="text-base sm:text-lg">{icon}</span>
          </div>
        )}
        <div className="flex-1 space-y-2">
          <h3 className="text-sm font-medium text-[#B85C38]">
            {promotionTitle}
          </h3>
          
          {tiers && tiers.length > 0 ? (
            <div className="mt-2 space-y-1.5">
              {tiers.map((tier, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <span className="text-charcoal/70">{tier.label}</span>
                  <span className="font-medium text-[#B85C38]">{tier.value}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-base font-medium text-charcoal">{offerText}</p>
          )}
          
          {description && (
            <p className="text-sm text-charcoal/60">{description}</p>
          )}

          <div className="mt-2 flex items-center gap-1.5 text-xs text-charcoal/50">
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Applied automatically
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromotionCard;
