import { Link } from 'react-router-dom';
import { HiOutlineHeart } from 'react-icons/hi2';
import { useAuth } from '../../context/AuthContext.jsx';
import { toggleWishlistApi } from '../../api/authApi.js';
import toast from 'react-hot-toast';

const ProductCard = ({ product }) => {
  const { user } = useAuth();
  const finalPrice = product.discountPrice > 0 ? product.discountPrice : product.price;
  const hasDiscount = product.discountPrice > 0 && product.discountPrice < product.price;

  const handleWishlist = async (event) => {
    event.preventDefault();
    if (!user) {
      toast.error('Please sign in to save items');
      return;
    }
    await toggleWishlistApi(product._id);
    toast.success('Wishlist updated');
  };

  return (
    <Link to={`/products/${product.slug}`} className="group block">
      <div className="relative aspect-square overflow-hidden rounded-2xl bg-white">
        <img
          src={product.images?.[0]?.url}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <button
          onClick={handleWishlist}
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-charcoal/70 transition-colors hover:text-primary-600"
          aria-label="Add to wishlist"
        >
          <HiOutlineHeart size={18} />
        </button>
        {hasDiscount && (
          <span className="absolute left-3 top-3 rounded-full bg-primary-600 px-3 py-1 text-xs font-semibold text-cream">
            Sale
          </span>
        )}
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
