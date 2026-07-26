import { useEffect, useState } from 'react';
import { getApplicablePromotionsApi } from '../../api/promotionApi.js';

const PromotionBadge = ({ productId, categoryId }) => {
  const [promotions, setPromotions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchPromotions = async () => {
      if (!productId) return;
      
      setIsLoading(true);
      try {
        const { data } = await getApplicablePromotionsApi({ 
          status: 'active',
        });
        
        const applicablePromotions = data.data.promotions.filter(promo => {
          // Check if promotion applies to this product
          if (promo.target.scope === 'entire_cart') return true;
          if (promo.target.scope === 'products') {
            return promo.target.productIds.some(p => p._id === productId);
          }
          if (promo.target.scope === 'categories' && categoryId) {
            return promo.target.categoryIds.some(c => c._id === categoryId);
          }
          return false;
        });

        setPromotions(applicablePromotions.slice(0, 3)); // Show max 3 promotions
      } catch (error) {
        console.error('Failed to fetch promotions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPromotions();
  }, [productId, categoryId]);

  if (isLoading || promotions.length === 0) return null;

  return (
    <div className="space-y-2">
      {promotions.map((promo) => (
        <div
          key={promo._id}
          className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700"
        >
          {promo.badgeText && <span className="font-semibold">{promo.badgeText}</span>}
          {!promo.badgeText && (
            <span>
              {promo.type === 'flat_discount' && 'Flat Discount'}
              {promo.type === 'percentage_discount' && 'Percentage Off'}
              {promo.type === 'buy_more_save_more' && 'Buy More Save More'}
              {promo.type === 'category_discount' && 'Category Offer'}
              {promo.type === 'collection_discount' && 'Collection Offer'}
            </span>
          )}
        </div>
      ))}
    </div>
  );
};

export default PromotionBadge;
