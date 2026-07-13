import { useNavigate, Link } from 'react-router-dom';
import { HiArrowLeft, HiOutlineShoppingBag } from 'react-icons/hi2';
import { useCart } from '../context/CartContext.jsx';
import CartItem from '../components/cart/CartItem.jsx';
import CartSummary from '../components/cart/CartSummary.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import Button from '../components/common/Button.jsx';
import Loader from '../components/common/Loader.jsx';

const CartPage = () => {
  const { cart, isLoading } = useCart();
  const navigate = useNavigate();

  if (isLoading) return <Loader fullScreen />;

  if (!cart.items || cart.items.length === 0) {
    return (
      <div className="container-tgs py-16">
        <EmptyState
          illustration={
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary-50 text-primary-300">
              <HiOutlineShoppingBag size={44} />
            </div>
          }
          title="Your cart is empty"
          description="Looks like you haven't added anything yet. Explore our collection to find the perfect gift."
          action={<Button onClick={() => navigate('/products')}>Continue Shopping</Button>}
        />
      </div>
    );
  }

  const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="container-tgs py-8 sm:py-12">
      <Link
        to="/products"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-charcoal/60 transition-colors hover:text-primary-600"
      >
        <HiArrowLeft size={16} />
        Continue shopping
      </Link>

      <h1 className="mb-1 font-display text-2xl font-semibold text-charcoal sm:text-3xl">Your Cart</h1>
      <p className="mb-8 text-sm text-charcoal/60">
        {itemCount} {itemCount === 1 ? 'item' : 'items'}
      </p>

      <div className="grid gap-8 md:grid-cols-3 md:items-start md:gap-10">
        <div className="rounded-2xl border border-charcoal/10 bg-white px-5 md:col-span-2">
          {cart.items.map((item) => (
            <CartItem key={item._id || item.product._id} item={item} />
          ))}
        </div>

        <CartSummary items={cart.items} onCheckout={() => navigate('/checkout')} sticky />
      </div>
    </div>
  );
};

export default CartPage;