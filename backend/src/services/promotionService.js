import Promotion from '../models/Promotion.js';

/**
 * Promotion Evaluation Service
 * Handles the logic for evaluating applicable promotions and calculating discounts
 */

class PromotionService {
  /**
   * Evaluate all applicable promotions for a given cart
   */
  static async evaluatePromotions(cartItems, subtotal, userId = null, isNewCustomer = false) {
    const now = new Date();
    
    // Fetch all active promotions
    const activePromotions = await Promotion.find({
      status: 'active',
      isDeleted: { $ne: true },
      $or: [
        { startDate: null },
        { startDate: { $lte: now } },
      ],
      $or: [
        { endDate: null },
        { endDate: { $gte: now } },
      ],
    })
      .sort({ priority: -1, createdAt: -1 })
      .populate('target.categoryIds')
      .populate('target.productIds')
      .populate('freeGiftConfig.giftProductId')
      .populate('bundlePricingConfig.bundleProducts.productId');

    // Filter applicable promotions
    const applicablePromotions = activePromotions.filter((promo) => {
      return this.isPromotionApplicable(promo, cartItems, subtotal, userId, isNewCustomer);
    });

    // Calculate discounts for each applicable promotion
    const evaluatedPromotions = applicablePromotions.map((promo) => {
      return this.calculatePromotionDiscount(promo, cartItems, subtotal);
    });

    // Sort by discount amount (highest first)
    evaluatedPromotions.sort((a, b) => b.discountAmount - a.discountAmount);

    return evaluatedPromotions;
  }

  /**
   * Check if a promotion is applicable to the current cart
   */
  static isPromotionApplicable(promotion, cartItems, subtotal, userId, isNewCustomer) {
    // Check usage limits
    if (promotion.maxUses && promotion.usedCount >= promotion.maxUses) {
      return false;
    }

    // Check eligibility
    const eligibility = promotion.eligibility;
    
    if (eligibility.minOrderValue && subtotal < eligibility.minOrderValue) {
      return false;
    }
    
    if (eligibility.maxOrderValue && subtotal > eligibility.maxOrderValue) {
      return false;
    }

    // Check user type eligibility
    if (userId && eligibility.userTypes.includes('guests')) {
      return false;
    }
    
    if (!userId && (eligibility.userTypes.includes('logged_in') || 
                    eligibility.userTypes.includes('new_customers') || 
                    eligibility.userTypes.includes('returning_customers'))) {
      return false;
    }
    
    if (userId && eligibility.userTypes.includes('new_customers') && !isNewCustomer) {
      return false;
    }
    
    if (userId && eligibility.userTypes.includes('returning_customers') && isNewCustomer) {
      return false;
    }

    // Check target scope
    return this.checkTargetScope(promotion, cartItems);
  }

  /**
   * Check if promotion target scope matches cart items
   */
  static checkTargetScope(promotion, cartItems) {
    const target = promotion.target;

    if (target.scope === 'entire_cart') {
      return true;
    }

    if (target.scope === 'categories') {
      const cartCategoryIds = cartItems.map((item) => item.categoryId).filter(Boolean);
      return cartCategoryIds.some((catId) => 
        target.categoryIds.some((targetCat) => targetCat._id.toString() === catId.toString())
      );
    }

    if (target.scope === 'products') {
      const cartProductIds = cartItems.map((item) => item.productId);
      return cartProductIds.some((prodId) => 
        target.productIds.some((targetProd) => targetProd._id.toString() === prodId.toString())
      );
    }

    if (target.scope === 'collections') {
      // Check if any cart item matches collection tags
      // This would require product tags to be loaded in cartItems
      // For now, return true if collection tags are defined
      return target.collectionTags && target.collectionTags.length > 0;
    }

    return false;
  }

  /**
   * Calculate discount amount for a promotion
   */
  static calculatePromotionDiscount(promotion, cartItems, subtotal) {
    let discountAmount = 0;
    let appliedItems = [];
    let freeGift = null;
    let freeShipping = false;

    switch (promotion.type) {
      case 'buy_more_save_more':
        const bmsmResult = this.calculateBuyMoreSaveMore(promotion, cartItems, subtotal);
        discountAmount = bmsmResult.discountAmount;
        appliedItems = bmsmResult.appliedItems;
        break;

      case 'flat_discount':
      case 'percentage_discount':
        const discountResult = this.calculateDiscount(promotion, cartItems, subtotal);
        discountAmount = discountResult.discountAmount;
        appliedItems = discountResult.appliedItems;
        break;

      case 'buy_x_get_y':
        const bxyResult = this.calculateBuyXGetY(promotion, cartItems);
        discountAmount = bxyResult.discountAmount;
        appliedItems = bxyResult.appliedItems;
        break;

      case 'free_shipping':
        freeShipping = this.calculateFreeShipping(promotion, subtotal);
        break;

      case 'free_gift':
        const giftResult = this.calculateFreeGift(promotion, subtotal);
        freeGift = giftResult.freeGift;
        break;

      case 'bundle_pricing':
        const bundleResult = this.calculateBundlePricing(promotion, cartItems);
        discountAmount = bundleResult.discountAmount;
        appliedItems = bundleResult.appliedItems;
        break;

      case 'category_discount':
      case 'collection_discount':
        const catResult = this.calculateCategoryDiscount(promotion, cartItems);
        discountAmount = catResult.discountAmount;
        appliedItems = catResult.appliedItems;
        break;

      case 'first_order_offer':
        const firstOrderResult = this.calculateDiscount(promotion, cartItems, subtotal);
        discountAmount = firstOrderResult.discountAmount;
        appliedItems = firstOrderResult.appliedItems;
        break;

      case 'festival_offer':
        const festivalResult = this.calculateDiscount(promotion, cartItems, subtotal);
        discountAmount = festivalResult.discountAmount;
        appliedItems = festivalResult.appliedItems;
        break;

      case 'custom_rule':
        // Custom rules would need specific implementation
        // For now, return 0 discount
        break;
    }

    return {
      promotionId: promotion._id,
      promotionName: promotion.name,
      promotionType: promotion.type,
      discountAmount: Math.round(discountAmount * 100) / 100,
      appliedItems,
      freeGift,
      freeShipping,
      badgeText: promotion.badgeText,
    };
  }

  /**
   * Calculate Buy More Save More discount
   */
  static calculateBuyMoreSaveMore(promotion, cartItems, subtotal) {
    const config = promotion.buyMoreSaveMoreConfig;
    if (!config) return { discountAmount: 0, appliedItems: [] };

    const targetItems = this.getTargetItems(promotion, cartItems);
    const totalQuantity = targetItems.reduce((sum, item) => sum + item.quantity, 0);

    let discountAmount = 0;
    let appliedItems = [];

    if (config.pricingMethod === 'tier_pricing' && config.tiers.length > 0) {
      // Find applicable tier
      const applicableTier = [...config.tiers]
        .sort((a, b) => b.minQuantity - a.minQuantity)
        .find((tier) => totalQuantity >= tier.minQuantity);

      if (applicableTier) {
        const targetSubtotal = targetItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        if (applicableTier.discountType === 'flat') {
          discountAmount = applicableTier.discountValue;
        } else if (applicableTier.discountType === 'percentage') {
          discountAmount = (targetSubtotal * applicableTier.discountValue) / 100;
        } else if (applicableTier.discountType === 'fixed_price') {
          discountAmount = targetSubtotal - applicableTier.discountValue;
        }

        appliedItems = targetItems;
      }
    } else if (config.pricingMethod === 'flat_discount' && config.tiers.length > 0) {
      const applicableTier = config.tiers.find((tier) => totalQuantity >= tier.minQuantity);
      if (applicableTier && applicableTier.discountType === 'flat') {
        discountAmount = applicableTier.discountValue;
        appliedItems = targetItems;
      }
    } else if (config.pricingMethod === 'percentage_discount' && config.tiers.length > 0) {
      const applicableTier = config.tiers.find((tier) => totalQuantity >= tier.minQuantity);
      if (applicableTier && applicableTier.discountType === 'percentage') {
        const targetSubtotal = targetItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        discountAmount = (targetSubtotal * applicableTier.discountValue) / 100;
        appliedItems = targetItems;
      }
    } else if (config.pricingMethod === 'fixed_bundle_price' && config.tiers.length > 0) {
      const applicableTier = config.tiers.find((tier) => totalQuantity >= tier.minQuantity);
      if (applicableTier && applicableTier.discountType === 'fixed_price') {
        const targetSubtotal = targetItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        discountAmount = targetSubtotal - applicableTier.discountValue;
        appliedItems = targetItems;
      }
    }

    return { discountAmount: Math.max(0, discountAmount), appliedItems };
  }

  /**
   * Calculate flat/percentage discount
   */
  static calculateDiscount(promotion, cartItems, subtotal) {
    const config = promotion.discountConfig;
    if (!config) return { discountAmount: 0, appliedItems: [] };

    const targetItems = this.getTargetItems(promotion, cartItems);
    const targetSubtotal = targetItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    let discountAmount = 0;

    if (config.discountType === 'flat') {
      discountAmount = config.discountValue;
    } else if (config.discountType === 'percentage') {
      discountAmount = (targetSubtotal * config.discountValue) / 100;
    }

    // Apply max discount limit
    if (config.maxDiscount) {
      discountAmount = Math.min(discountAmount, config.maxDiscount);
    }

    // Discount cannot exceed target subtotal
    discountAmount = Math.min(discountAmount, targetSubtotal);

    return { discountAmount: Math.max(0, discountAmount), appliedItems: targetItems };
  }

  /**
   * Calculate Buy X Get Y discount
   */
  static calculateBuyXGetY(promotion, cartItems) {
    const config = promotion.buyXGetYConfig;
    if (!config) return { discountAmount: 0, appliedItems: [] };

    const buyItems = this.getTargetItems(promotion, cartItems);
    const buyQuantity = buyItems.reduce((sum, item) => sum + item.quantity, 0);

    if (buyQuantity < config.buyQuantity) {
      return { discountAmount: 0, appliedItems: [] };
    }

    // Calculate how many free items they get
    const freeGroups = Math.floor(buyQuantity / config.buyQuantity);
    const freeQuantity = freeGroups * config.getQuantity;

    let discountAmount = 0;
    let appliedItems = [];

    if (config.getProductsFree) {
      // Find the cheapest items to make free
      const sortedItems = [...buyItems].sort((a, b) => a.price - b.price);
      let remainingFree = freeQuantity;

      for (const item of sortedItems) {
        if (remainingFree <= 0) break;

        const freeFromThisItem = Math.min(item.quantity, remainingFree);
        discountAmount += freeFromThisItem * item.price;
        appliedItems.push({ ...item, quantity: freeFromThisItem });
        remainingFree -= freeFromThisItem;
      }
    }

    return { discountAmount: Math.max(0, discountAmount), appliedItems };
  }

  /**
   * Calculate free shipping eligibility
   */
  static calculateFreeShipping(promotion, subtotal) {
    const config = promotion.freeShippingConfig;
    if (!config) return false;

    return subtotal >= config.minOrderValue;
  }

  /**
   * Calculate free gift eligibility
   */
  static calculateFreeGift(promotion, subtotal) {
    const config = promotion.freeGiftConfig;
    if (!config) return { freeGift: null };

    if (subtotal < config.minOrderValue) {
      return { freeGift: null };
    }

    return {
      freeGift: {
        productId: config.giftProductId,
        maxGiftsPerOrder: config.maxGiftsPerOrder,
      },
    };
  }

  /**
   * Calculate bundle pricing discount
   */
  static calculateBundlePricing(promotion, cartItems) {
    const config = promotion.bundlePricingConfig;
    if (!config || !config.bundleProducts || config.bundleProducts.length === 0) {
      return { discountAmount: 0, appliedItems: [] };
    }

    // Check if all bundle products are in cart with required quantities
    let bundleComplete = true;
    let bundleSubtotal = 0;
    let appliedItems = [];

    for (const bundleProduct of config.bundleProducts) {
      const cartItem = cartItems.find(
        (item) => item.productId === bundleProduct.productId._id.toString()
      );

      if (!cartItem || cartItem.quantity < bundleProduct.quantity) {
        bundleComplete = false;
        break;
      }

      bundleSubtotal += cartItem.price * bundleProduct.quantity;
      appliedItems.push({ ...cartItem, quantity: bundleProduct.quantity });
    }

    if (!bundleComplete) {
      return { discountAmount: 0, appliedItems: [] };
    }

    const discountAmount = bundleSubtotal - config.bundlePrice;

    return { discountAmount: Math.max(0, discountAmount), appliedItems };
  }

  /**
   * Calculate category/collection discount
   */
  static calculateCategoryDiscount(promotion, cartItems) {
    const config = promotion.categoryDiscountConfig;
    if (!config) return { discountAmount: 0, appliedItems: [] };

    const targetItems = this.getTargetItems(promotion, cartItems);
    const targetSubtotal = targetItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    let discountAmount = 0;

    if (config.discountType === 'flat') {
      discountAmount = config.discountValue;
    } else if (config.discountType === 'percentage') {
      discountAmount = (targetSubtotal * config.discountValue) / 100;
    }

    // Apply max discount limit
    if (config.maxDiscount) {
      discountAmount = Math.min(discountAmount, config.maxDiscount);
    }

    // Discount cannot exceed target subtotal
    discountAmount = Math.min(discountAmount, targetSubtotal);

    return { discountAmount: Math.max(0, discountAmount), appliedItems: targetItems };
  }

  /**
   * Get items that match the promotion target scope
   */
  static getTargetItems(promotion, cartItems) {
    const target = promotion.target;

    if (target.scope === 'entire_cart') {
      return cartItems;
    }

    if (target.scope === 'categories') {
      return cartItems.filter((item) => {
        if (!item.categoryId) return false;
        return target.categoryIds.some((cat) => cat._id.toString() === item.categoryId.toString());
      });
    }

    if (target.scope === 'products') {
      return cartItems.filter((item) => {
        return target.productIds.some((prod) => prod._id.toString() === item.productId.toString());
      });
    }

    if (target.scope === 'collections') {
      // Would need to check product tags against collection tags
      // For now, return all items if collection tags are defined
      return target.collectionTags && target.collectionTags.length > 0 ? cartItems : [];
    }

    return cartItems;
  }

  /**
   * Get the best applicable promotion for a cart
   */
  static async getBestPromotion(cartItems, subtotal, userId = null, isNewCustomer = false) {
    const evaluatedPromotions = await this.evaluatePromotions(cartItems, subtotal, userId, isNewCustomer);
    
    if (evaluatedPromotions.length === 0) {
      return null;
    }

    // Return the promotion with highest discount
    return evaluatedPromotions[0];
  }
}

export default PromotionService;
