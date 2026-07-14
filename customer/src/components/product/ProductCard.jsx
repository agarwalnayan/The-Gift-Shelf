import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HiHeart, HiOutlineHeart, HiOutlineShoppingBag } from 'react-icons/hi2';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext.jsx';
import { useCart } from '../../context/CartContext.jsx';
import { toggleWishlistApi } from '../../api/authApi.js';

const ProductCard = ({ product }) => {
  const { user, setUser } = useAuth();
  const { addItem } = useCart();
  const navigate = useNavigate();
  const [isTogglingWishlist, setIsTogglingWishlist] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const finalPrice = product.discountPrice > 0 ? product.discountPrice : product.price;
  const hasDiscount = product.discountPrice > 0 && product.discountPrice < product.price;

  const isWishlisted = (user?.wishlist || []).some(
    (id) => (typeof id === 'string' ? id : id?.toString()) === product._id
  );

  // Anything that needs the customer to make a choice on the product page
  // (a variant, or a required personalization field) can't be safely quick
  // added — send them to "Shop Now" instead so they can complete it there.
  const needsProductPage =
    (product.variants?.length ?? 0) > 0 ||
    (product.customizationOptions || []).some((option) => option.isEnabled && option.isRequired);

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

  const handleQuickAdd = async (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (needsProductPage) {
      navigate(`/products/${product.slug}`);
      return;
    }

    if (isAddingToCart) return;
    setIsAddingToCart(true);
    try {
      await addItem(product._id, 1);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add to cart');
    } finally {
      setIsAddingToCart(false);
    }
  };

  return (
    <Link to={`/products/${product.slug}`} className="group block min-w-0">
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl bg-white shadow-sm transition-shadow duration-300 group-hover:shadow-xl">
        <img
          src={product.images?.[0]?.url}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
        />

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-charcoal/40 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        <button
          onClick={handleWishlist}
          disabled={isTogglingWishlist}
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-charcoal/70 shadow-sm transition-all duration-300 hover:scale-110 hover:text-primary-600"
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          {isWishlisted ? <HiHeart size={18} className="text-primary-600" /> : <HiOutlineHeart size={18} />}
        </button>

        {hasDiscount && (
          <span className="absolute left-3 top-3 rounded-full bg-primary-600 px-3 py-1 text-xs font-semibold text-cream">
            Sale
          </span>
        )}

        <div className="absolute inset-x-0 bottom-0 translate-y-full opacity-0 transition-all duration-300 ease-out group-hover:translate-y-0 group-hover:opacity-100">
          <button
            onClick={handleQuickAdd}
            disabled={isAddingToCart}
            className="flex w-full items-center justify-center gap-1.5 bg-charcoal/90 px-3 py-2.5 text-xs font-semibold uppercase tracking-wide text-cream backdrop-blur transition-colors hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-70 sm:text-sm"
          >
            <HiOutlineShoppingBag size={16} />
            {needsProductPage ? 'Shop Now' : isAddingToCart ? 'Adding…' : 'Quick Add to Cart'}
          </button>
        </div>
      </div>

      <div className="mt-3">
        <h3 className="truncate text-sm font-medium text-charcoal">{product.name}</h3>
        <div className="mt-1 flex items-center gap-2">
          <span className="text-sm font-semibold text-charcoal">₹{finalPrice}</span>
          {hasDiscount && <span className="text-xs text-charcoal/40 line-through">₹{product.price}</span>}
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;