import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HiHeart, HiOutlineHeart, HiOutlineShoppingBag } from 'react-icons/hi2';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext.jsx';
import { toggleWishlistApi } from '../../api/authApi.js';

const ProductCard = ({ product, compact = false }) => {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [isTogglingWishlist, setIsTogglingWishlist] = useState(false);

  const finalPrice = product.discountPrice > 0 ? product.discountPrice : product.price;
  const hasDiscount = product.discountPrice > 0 && product.discountPrice < product.price;

  // Get and sort badges and promotions by priority
  const sortedBadges = (product.badges || [])
    .filter(b => b.active)
    .sort((a, b) => (b.priority || 0) - (a.priority || 0))
    .slice(0, 2);

  const sortedPromotions = (product.promotions || [])
    .filter(p => p.isActive !== false)
    .sort((a, b) => (b.priority || 0) - (a.priority || 0))
    .slice(0, 2);

  // Combine: promotions first, then badges
  const allLabels = [...sortedPromotions, ...sortedBadges];

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

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-charcoal/40 via-transparent to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100" />

        <button
          onClick={handleWishlist}
          disabled={isTogglingWishlist}
          className={`absolute flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-charcoal/70 shadow-sm transition-all duration-200 hover:scale-110 hover:text-primary-600 ${compact ? 'right-2 top-2' : 'right-3 top-3'}`}
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          {isWishlisted ? <HiHeart size={16} className="text-primary-600" /> : <HiOutlineHeart size={16} />}
        </button>

        {/* Badge and Promotion Labels */}
        {allLabels.length > 0 && (
          <div className={`absolute left-2 top-2 flex flex-col gap-1 ${compact ? 'left-2 top-2' : 'left-3 top-3'}`}>
            {allLabels.map((label) => (
              <span
                key={label._id}
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                  compact ? 'text-[10px]' : ''
                }`}
                style={{
                  backgroundColor: label.backgroundColor || '#F59E0B',
                  color: label.textColor || '#FFFFFF',
                }}
              >
                {label.icon && <span className="mr-1">{label.icon}</span>}
                {label.badgeText}
              </span>
            ))}
          </div>
        )}

        <div className="absolute inset-x-0 bottom-0 translate-y-full opacity-0 transition-all duration-200 ease-out group-hover:translate-y-0 group-hover:opacity-100">
          <button
            onClick={handleQuickAdd}
            className={`flex w-full items-center justify-center gap-1.5 bg-charcoal/90 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-cream backdrop-blur transition-colors duration-200 hover:bg-primary-700 ${compact ? 'py-1.5 text-[10px]' : 'py-2.5 sm:text-sm'}`}
          >
            <HiOutlineShoppingBag size={14} />
            Shop Now
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