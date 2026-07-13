import { useNavigate } from 'react-router-dom';
import { HiXMark, HiOutlineShoppingBag } from 'react-icons/hi2';
import { useCart } from '../../context/CartContext.jsx';
import { useMarketing } from '../../context/MarketingContext.jsx';
import CartItem from './CartItem.jsx';
import FreeShippingBar from './FreeShippingBar.jsx';
import CouponInput from './CouponInput.jsx';
import CrossSellProducts from './CrossSellProducts.jsx';
import Button from '../common/Button.jsx';

const CartDrawer = () => {
    const { cart, isDrawerOpen, closeDrawer, discount } = useCart();
    const { commerce } = useMarketing();
    const navigate = useNavigate();
    const items = cart.items || [];

    const subtotal = items.reduce((sum, item) => {
        const unitPrice = item.priceAtAddition + (item.customizationPrice || 0);
        return sum + unitPrice * item.quantity;
    }, 0);

    const discountedSubtotal = Math.max(0, subtotal - discount);
    const shippingThreshold = commerce?.freeShippingThreshold ?? 999;
    const shippingCharge = commerce?.shippingCharge ?? 49;
    const shipping = discountedSubtotal >= shippingThreshold ? 0 : shippingCharge;
    const total = Number((discountedSubtotal + shipping).toFixed(2));

    const personalizedCount = items.filter((item) => item.customizations?.length > 0).length;
    const productIds = items.map((item) => item.product?._id).filter(Boolean);

    const goToCheckout = () => {
        closeDrawer();
        navigate('/checkout');
    };

    const goToCart = () => {
        closeDrawer();
        navigate('/cart');
    };

    return (
        <>
            <div
                className={`fixed inset-0 z-50 bg-charcoal/40 transition-opacity duration-300 ${isDrawerOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
                    }`}
                onClick={closeDrawer}
                aria-hidden="true"
            />

            <aside
                className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-md transform flex-col bg-cream shadow-2xl transition-transform duration-300 ease-out ${isDrawerOpen ? 'translate-x-0' : 'translate-x-full'
                    }`}
                role="dialog"
                aria-modal="true"
                aria-label="Shopping cart"
            >
                <div className="flex items-center justify-between border-b border-charcoal/10 px-5 py-4 sm:px-6">
                    <h2 className="font-display text-lg font-semibold text-charcoal">
                        Your Bag {items.length > 0 && <span className="text-charcoal/40">({items.length})</span>}
                    </h2>
                    <button
                        onClick={closeDrawer}
                        className="flex h-9 w-9 items-center justify-center rounded-full text-charcoal/60 transition-colors hover:bg-charcoal/5"
                        aria-label="Close cart"
                    >
                        <HiXMark size={22} />
                    </button>
                </div>

                {items.length === 0 ? (
                    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-50 text-primary-400">
                            <HiOutlineShoppingBag size={28} />
                        </div>
                        <div>
                            <p className="font-display text-lg font-semibold text-charcoal">Your bag is empty</p>
                            <p className="mt-1 text-sm text-charcoal/60">Add something thoughtful to get started.</p>
                        </div>
                        <Button onClick={goToCart}>Continue Shopping</Button>
                    </div>
                ) : (
                    <>
                        <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6">
                            <FreeShippingBar subtotal={discountedSubtotal} />

                            {personalizedCount > 0 && (
                                <p className="mt-3 text-xs font-medium text-primary-700">
                                    {personalizedCount} {personalizedCount === 1 ? 'item is' : 'items are'} personalized ✨
                                </p>
                            )}

                            <div className="mt-5 divide-y divide-charcoal/10">
                                {items.map((item) => (
                                    <CartItem key={item._id || item.product._id} item={item} compact />
                                ))}
                            </div>

                            <div className="mt-6 border-t border-charcoal/10 pt-5">
                                <CouponInput couponCode={cart.couponCode} />
                            </div>

                            <div className="mt-6 border-t border-charcoal/10 pt-5">
                                <CrossSellProducts excludeProductIds={productIds} limit={2} compact />
                            </div>
                        </div>

                        <div className="border-t border-charcoal/10 bg-white px-5 py-5 sm:px-6">
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between text-charcoal/70">
                                    <span>Subtotal</span>
                                    <span>₹{subtotal.toFixed(2)}</span>
                                </div>
                                {discount > 0 && (
                                    <div className="flex justify-between text-green-600">
                                        <span>Discount</span>
                                        <span>-₹{discount.toFixed(2)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-charcoal/70">
                                    <span>Shipping</span>
                                    <span>{shipping === 0 ? 'Free' : `₹${shipping}`}</span>
                                </div>
                                <div className="flex justify-between border-t border-charcoal/10 pt-2 text-base font-semibold text-charcoal">
                                    <span>Total</span>
                                    <span>₹{total.toFixed(2)}</span>
                                </div>
                            </div>

                            <Button onClick={goToCheckout} className="mt-4 w-full">
                                Checkout
                            </Button>
                            <button
                                onClick={goToCart}
                                className="mt-3 w-full text-center text-sm font-medium text-charcoal/60 transition-colors hover:text-primary-600"
                            >
                                View full cart
                            </button>
                        </div>
                    </>
                )}
            </aside>
        </>
    );
};

export default CartDrawer;