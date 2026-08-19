import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HiHeart, HiOutlineHeart, HiOutlineShoppingBag } from 'react-icons/hi2';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext.jsx';
import { toggleWishlistApi } from '../../api/authApi.js';
import PromotionRibbon from './PromotionRibbon.jsx';
import BadgeChip from './BadgeChip.jsx';

const ProductCard = ({ product, compact = false }) => {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [isTogglingWishlist, setIsTogglingWishlist] = useState(false);

  const finalPrice = product.discountPrice > 0 ? product.discountPrice : product.price;
  const hasDiscount = product.discountPrice > 0 && product.discountPrice < product.price;

  // Get highest priority promotion and badge
  const topPromotion = (product.promotions || [])
    .filter(p => p.isActive !== false)
    .sort((a, b) => (b.priority || 0) - (a.priority || 0))[0];

  const topBadge = (product.badges || [])
    .filter(b => b.active)
    .sort((a, b) => (b.priority || 0) - (a.priority || 0))[0];

  // Priority: Promotion first, then Badge (only show one)
  const showPromotion = topPromotion;
  const showBadge = !showPromotion && topBadge;

  const isWishlisted = (user?.wishlist || []).some(
    (id) => (typeof id === 'string' ? id : id?.toString()) === product._id
  );

  const handleWishlist = async (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (!user) {
      toast.error('Please sign in to save items');
      return;
    }
    if (isTogglingWishlist) return;

    setIsTogglingWishlist(true);
    try {
      const { data } = await toggleWishlistApi(product._id);
      setUser((prev) => ({ ...prev, wishlist: data.data.wishlist }));
      toast.success(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update wishlist');
    } finally {
      setIsTogglingWishlist(false);
    }
  };

  const handleQuickAdd = (event) => {
    event.preventDefault();
    event.stopPropagation();
    navigate(`/products/${product.slug}`);
  };

  return (
    <Link to={`/products/${product.slug}`} className="group block min-w-0">
      <div className={`relative w-full overflow-hidden rounded-2xl bg-white shadow-sm transition-shadow duration-200 group-hover:shadow-lg ${compact ? 'aspect-[3/4]' : 'aspect-[4/5]'}`}>
        <img
          src={product.images?.[0]?.url}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-200 ease-out group-hover:scale-105"
        />

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-charcoal/50 via-charcoal/10 to-transparent opacity-100 transition-opacity duration-200 md:opacity-0 md:group-hover:opacity-100" />

        <button
          onClick={handleWishlist}
          disabled={isTogglingWishlist}
          className={`absolute z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-charcoal/70 shadow-sm transition-all duration-200 hover:scale-110 hover:text-primary-600 ${compact ? 'right-2 top-2' : 'right-3 top-3'}`}
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          {isWishlisted ? <HiHeart size={16} className="text-primary-600" /> : <HiOutlineHeart size={16} />}
        </button>

        {showPromotion && <PromotionRibbon promotion={showPromotion} compact={compact} />}
        {showBadge && <BadgeChip badge={showBadge} compact={compact} />}

        <div className="absolute inset-x-0 bottom-0 z-10 translate-y-0 opacity-100 transition-all duration-200 ease-out md:translate-y-full md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100">
          <button
            onClick={handleQuickAdd}
            className={`flex w-full items-center justify-center gap-1.5 bg-charcoal/90 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-cream backdrop-blur transition-colors duration-200 hover:bg-primary-700 ${compact ? 'py-1.5 text-[10px]' : 'py-2.5 sm:text-sm'}`}
          >
            <HiOutlineShoppingBag size={14} />
            View Gift
          </button>
        </div>
      </div>

      <div className={compact ? 'mt-2' : 'mt-3'}>
        <h3 className={`truncate font-medium text-charcoal ${compact ? 'text-xs' : 'text-sm'}`}>{product.name}</h3>
        <div className="mt-1 flex items-center gap-2">
          <span className={`font-semibold text-charcoal ${compact ? 'text-xs' : 'text-sm'}`}>₹{finalPrice}</span>
          {hasDiscount && <span className={`text-charcoal/40 line-through ${compact ? 'text-[10px]' : 'text-xs'}`}>₹{product.price}</span>}
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;