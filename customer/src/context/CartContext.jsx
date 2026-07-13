import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import {
  getCartApi,
  addToCartApi,
  updateCartItemApi,
  removeFromCartApi,
  clearCartApi,
  applyCouponApi,
  removeCouponApi,
} from '../api/cartApi.js';
import { useAuth } from './AuthContext.jsx';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState({ items: [] });
  const [isLoading, setIsLoading] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const openDrawer = () => setIsDrawerOpen(true);
  const closeDrawer = () => setIsDrawerOpen(false);

  const refreshCart = useCallback(async () => {
    if (!user) {
      setCart({ items: [] });
      setDiscount(0);
      return;
    }
    setIsLoading(true);
    try {
      const { data } = await getCartApi();
      setCart(data.data.cart);

      // Re-validate a previously applied coupon so the discount amount is
      // always fresh (e.g. after a page reload) — silently drop it if it's
      // no longer valid rather than surfacing an error on plain load.
      if (data.data.cart.couponCode) {
        try {
          const applied = await applyCouponApi(data.data.cart.couponCode);
          setDiscount(applied.data.data.discount);
        } catch (error) {
          setDiscount(0);
        }
      } else {
        setDiscount(0);
      }
    } catch (error) {
      // silently ignore, user may not have a cart yet
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const addItem = async (productId, quantity = 1, options = {}) => {
    const { variantSku = null, customizations = [] } = options;
    const { data } = await addToCartApi({ productId, quantity, variantSku, customizations });
    setCart(data.data.cart);
    toast.success('Added to cart');
    openDrawer();
  };

  const updateItem = async (itemId, quantity) => {
    const { data } = await updateCartItemApi({ itemId, quantity });
    setCart(data.data.cart);
  };

  const removeItem = async (itemId) => {
    const { data } = await removeFromCartApi(itemId);
    setCart(data.data.cart);
    toast.success('Removed from cart');
  };

  const clearCart = async () => {
    const { data } = await clearCartApi();
    setCart(data.data.cart);
    setDiscount(0);
  };

  const applyCoupon = async (code) => {
    const { data } = await applyCouponApi(code);
    setCart(data.data.cart);
    setDiscount(data.data.discount);
    toast.success(`Coupon ${data.data.couponCode} applied`);
    return data.data.discount;
  };

  const removeCoupon = async () => {
    const { data } = await removeCouponApi();
    setCart(data.data.cart);
    setDiscount(0);
    toast.success('Coupon removed');
  };

  const itemCount = cart.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  return (
    <CartContext.Provider
      value={{
        cart,
        isLoading,
        itemCount,
        discount,
        isDrawerOpen,
        openDrawer,
        closeDrawer,
        addItem,
        updateItem,
        removeItem,
        clearCart,
        refreshCart,
        applyCoupon,
        removeCoupon,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};