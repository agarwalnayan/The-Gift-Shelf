const PromotionRibbon = ({ promotion, compact = false }) => {
  if (!promotion) return null;

  const getDisplayText = (promo) => {
    // If custom badgeText is set, use it
    if (promo.badgeText) return promo.badgeText;

    // Otherwise, generate customer-friendly text from promotion data
    const { type, discountValue, discountUnit, buyMoreTiers, name } = promo;

    if (type === 'flat_discount') {
      const value = discountUnit === 'percentage' ? `${discountValue}%` : `₹${discountValue}`;
      return `Save ${value}`;
    }

    if (type === 'percentage_discount') {
      return `${discountValue}% off`;
    }

    if (type === 'buy_more_save_more' && buyMoreTiers?.length > 0) {
      const firstTier = buyMoreTiers[0];
      const buyQty = firstTier.buyQuantity;
      const saveValue = firstTier.discountUnit === 'percentage' 
        ? `${firstTier.discountValue}%` 
        : `₹${firstTier.discountValue}`;
      return `Buy ${buyQty} save ${saveValue}`;
    }

    if (type === 'category_discount') {
      const value = discountUnit === 'percentage' ? `${discountValue}%` : `₹${discountValue}`;
      return `${value} off`;
    }

    if (type === 'collection_discount') {
      const value = discountUnit === 'percentage' ? `${discountValue}%` : `₹${discountValue}`;
      return `${value} off`;
    }

    // Never show generic "Offer" - use promotion name or meaningful fallback
    if (name && name !== 'Offer' && name !== 'Special Offer') {
      return name;
    }

    // Last resort: don't show ribbon if we can't communicate benefit
    return null;
  };

  const displayText = getDisplayText(promotion);

  // Don't render if we can't communicate a clear benefit
  if (!displayText) return null;

  return (
    <div
      className={`absolute left-2 top-2 inline-flex items-center rounded-lg px-2 py-0.5 text-[10px] font-medium shadow-lg backdrop-blur-md sm:left-3 sm:top-3 sm:px-2.5 sm:py-1 sm:text-xs ${
        compact ? 'left-1.5 top-1.5 px-1.5 py-0.5 text-[9px]' : ''
      }`}
      style={{
        backgroundColor: promotion.backgroundColor || '#B85C38',
        color: promotion.textColor || '#FFFFFF',
      }}
    >
      {promotion.icon && <span className="mr-1">{promotion.icon}</span>}
      {displayText}
    </div>
  );
};

export default PromotionRibbon;
