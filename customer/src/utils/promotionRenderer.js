/**
 * Promotion Renderer
 * Translates backend promotion data into customer-facing benefit text.
 * Never exposes internal promotion names, campaign names, or admin terminology.
 */

const formatDiscount = (value, unit) => {
  if (unit === 'percentage') return `${value}%`;
  return `₹${value}`;
};

const normalizeTiers = (promotion) => {
  if (!promotion || promotion.type !== 'buy_more_save_more') return [];

  const config = promotion.buyMoreSaveMoreConfig;
  const tiers = config?.tiers || promotion.tiers || [];
  if (!tiers || tiers.length === 0) return [];

  return tiers
    .map((tier) => {
      const discountType = tier.discountType || 'flat';
      const discountValue = tier.discountValue ?? 0;
      const minQuantity = tier.minQuantity || tier.buyQuantity || 1;

      const discountLabel =
        discountType === 'percentage'
          ? `${discountValue}% off`
          : `Save ₹${discountValue}`;

      return {
        minQuantity,
        discountType,
        discountValue,
        label: `Buy ${minQuantity}`,
        value: discountLabel,
      };
    })
    .sort((a, b) => a.minQuantity - b.minQuantity);
};

const getBuyXGetY = (promotion) => {
  if (!promotion || promotion.type !== 'buy_x_get_y') return null;
  const config = promotion.buyXGetYConfig;
  if (!config) return null;
  return {
    buyQuantity: config.buyQuantity,
    getQuantity: config.getQuantity,
  };
};

const getBundleInfo = (promotion) => {
  if (!promotion || promotion.type !== 'bundle_pricing') return null;
  const config = promotion.bundlePricingConfig;
  if (!config || !config.bundleProducts) return null;
  return {
    bundlePrice: config.bundlePrice,
    productCount: config.bundleProducts.length,
  };
};

const getFreeGiftInfo = (promotion) => {
  if (!promotion || promotion.type !== 'free_gift') return null;
  const config = promotion.freeGiftConfig;
  if (!config) return null;
  return {
    giftName: config.giftProductId?.name || '',
    minOrderValue: config.minOrderValue || 0,
  };
};

const getFreeShippingInfo = (promotion) => {
  if (!promotion || promotion.type !== 'free_shipping') return null;
  const config = promotion.freeShippingConfig;
  if (!config) return null;
  return {
    minOrderValue: config.minOrderValue,
  };
};

/**
 * Single-line benefit for product cards and compact UI.
 * Shows only the first actionable benefit — no backend terminology.
 */
export const renderProductCardBenefit = (promotion) => {
  if (!promotion) return null;

  if (promotion.badgeText) {
    return promotion.badgeText;
  }

  const { type } = promotion;

  switch (type) {
    case 'flat_discount': {
      const config = promotion.discountConfig;
      if (!config) return null;
      return `Save ${formatDiscount(config.discountValue, config.discountType)}`;
    }
    case 'percentage_discount': {
      const config = promotion.discountConfig;
      if (!config) return null;
      return `Save ${config.discountValue}%`;
    }
    case 'buy_more_save_more': {
      const tiers = normalizeTiers(promotion);
      if (tiers.length === 0) return null;
      const first = tiers[0];
      return `Buy ${first.minQuantity} • Save ${formatDiscount(first.discountValue, first.discountType)}`;
    }
    case 'category_discount':
    case 'collection_discount': {
      const config = promotion.discountConfig || promotion.categoryDiscountConfig;
      if (!config) return null;
      return `Save ${formatDiscount(config.discountValue, config.discountType)} on this gift`;
    }
    case 'free_shipping':
      return 'Free shipping';
    case 'free_gift': {
      const info = getFreeGiftInfo(promotion);
      if (info?.giftName) return `Free ${info.giftName}`;
      return 'Free gift';
    }
    case 'buy_x_get_y': {
      const info = getBuyXGetY(promotion);
      if (!info) return null;
      if (info.buyQuantity === 1 && info.getQuantity === 1) return 'Buy 1 get 1 free';
      return `Buy ${info.buyQuantity} get ${info.getQuantity} free`;
    }
    case 'bundle_pricing': {
      const info = getBundleInfo(promotion);
      if (!info) return null;
      return `Save on this bundle`;
    }
    case 'first_order_offer': {
      const config = promotion.firstOrderConfig;
      if (!config) return null;
      return `Save ${formatDiscount(config.discountValue, config.discountType)} on your first order`;
    }
    case 'festival_offer': {
      const config = promotion.festivalConfig;
      if (!config) return null;
      return `Save ${formatDiscount(config.discountValue, config.discountType)}`;
    }
    default:
      return null;
  }
};

/**
 * Main renderer — kept for backward compatibility with existing components.
 * Now uses normalized data so it no longer depends on legacy field names.
 */
export const renderPromotionBenefit = (promotion) => {
  return renderProductCardBenefit(promotion);
};

/**
 * Promotion title — used in headers.
 */
export const renderPromotionTitle = (promotion) => {
  return renderProductCardBenefit(promotion) || 'Special offer';
};

/**
 * Returns normalized tier list for buy_more_save_more promotions.
 * Each tier: { minQuantity, discountType, discountValue, label, value }
 */
export const getPromotionTiers = (promotion) => {
  if (!promotion || promotion.type !== 'buy_more_save_more') return null;
  return normalizeTiers(promotion);
};

/**
 * Calculates tier progress for the cart.
 *
 * @param {Array} tiers - normalized tier list
 * @param {number} cartQuantity - total quantity of relevant items in cart
 * @returns {{ unlockedIndex: number, nextIndex: number, progress: number }}
 */
export const getTierProgress = (tiers, cartQuantity) => {
  if (!tiers || tiers.length === 0) {
    return { unlockedIndex: -1, nextIndex: 0, progress: 0 };
  }

  let unlockedIndex = -1;
  for (let i = tiers.length - 1; i >= 0; i--) {
    if (cartQuantity >= tiers[i].minQuantity) {
      unlockedIndex = i;
      break;
    }
  }

  const nextIndex = unlockedIndex + 1 < tiers.length ? unlockedIndex + 1 : -1;
  const maxQuantity = tiers[tiers.length - 1].minQuantity;
  const currentTarget = unlockedIndex >= 0 ? tiers[unlockedIndex].minQuantity : 0;
  const nextTarget = nextIndex >= 0 ? tiers[nextIndex].minQuantity : maxQuantity;
  const progress = nextIndex >= 0
    ? Math.min(100, ((cartQuantity - currentTarget) / (nextTarget - currentTarget)) * 100)
    : 100;

  return { unlockedIndex, nextIndex, progress };
};

/**
 * Dynamic progress message for the cart drawer / cart summary.
 *
 * @param {Object} promotion - evaluated promotion object from API
 * @param {number} cartQuantity - total item quantity in cart
 * @param {number} promotionDiscount - discount amount applied
 * @returns {string|null}
 */
export const renderCartProgressMessage = (promotion, cartQuantity, promotionDiscount) => {
  if (!promotion) return null;

  const { type } = promotion;

  if (type === 'buy_more_save_more') {
    const tiers = normalizeTiers(promotion);
    if (tiers.length === 0) return null;

    const { unlockedIndex, nextIndex } = getTierProgress(tiers, cartQuantity);

    if (unlockedIndex >= 0) {
      const unlocked = tiers[unlockedIndex];
      return `You saved ${formatDiscount(unlocked.discountValue, unlocked.discountType)} on this order`;
    }

    if (nextIndex >= 0) {
      const next = tiers[nextIndex];
      const needed = next.minQuantity - cartQuantity;
      return `Add ${needed} more gift${needed > 1 ? 's' : ''} to save ${formatDiscount(next.discountValue, next.discountType)}`;
    }

    return null;
  }

  if (promotionDiscount > 0) {
    return `You saved ₹${Math.round(promotionDiscount)} on this order`;
  }

  return renderProductCardBenefit(promotion);
};

/**
 * PDP tier data with status indicators for the Product Detail Page.
 *
 * @param {Object} promotion
 * @param {number} cartQuantity - quantity of this product in cart (or relevant items)
 * @returns {Array|null} Array of { ...tier, isUnlocked, isNext, isMostPopular }
 */
export const getPDPTierStatuses = (promotion, cartQuantity = 0) => {
  const tiers = getPromotionTiers(promotion);
  if (!tiers || tiers.length === 0) return null;

  const { unlockedIndex, nextIndex } = getTierProgress(tiers, cartQuantity);

  return tiers.map((tier, index) => ({
    ...tier,
    isUnlocked: index <= unlockedIndex,
    isNext: index === nextIndex,
    isMostPopular: index === Math.floor(tiers.length / 2),
  }));
};
