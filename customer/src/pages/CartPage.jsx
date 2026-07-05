import { useNavigate } from 'react-router-dom';
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
          title="Your cart is empty"
          description="Looks like you haven't added anything yet."
          action={<Button onClick={() => navigate('/products')}>Continue Shopping</Button>}
        />
      </div>
    );
  }

  return (
    <div className="container-tgs py-12">
      <h1 className="mb-8 font-display text-3xl font-semibold text-charcoal">Your Cart</h1>

      <div className="grid gap-10 md:grid-cols-3">
        <div className="md:col-span-2">
          {cart.items.map((item) => (
            <CartItem key={item.product._id} item={item} />
          ))}
        </div>

        <div>
          <CartSummary items={cart.items} onCheckout={() => navigate('/checkout')} />
        </div>
      </div>
    </div>
  );
};

export default CartPage;
